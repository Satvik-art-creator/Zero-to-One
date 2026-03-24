/**
 * PlaceBridge — Prep Resources Engine
 * Orchestrates: Groq AI call → validate → fallback → registry lookup → URL construction
 */

const Groq = require('groq-sdk');
const resourceRegistry = require('../data/resourceRegistry');
const resourceFallbackMap = require('../data/resourceFallbackMap');

// ── Groq client (initialised lazily to avoid crash if key is missing) ──
let groqClient = null;
function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// ── In-memory cache: key → { data, expires } ──
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// ── Build trimmed registry list for Groq (save tokens) ──
function getTrimmedRegistryList() {
  return Object.values(resourceRegistry)
    .map((r) => `${r.id}: ${r.title} (${r.platform}, ${r.type})`)
    .join('\n');
}

// ── Compute skill gap ──
function computeSkillGap(studentSkills, companySkills) {
  const studentLower = (studentSkills || []).map((s) => s.toLowerCase().trim());
  const companyLower = (companySkills || []).map((s) => s.toLowerCase().trim());

  const matched = companyLower.filter((s) => studentLower.includes(s));
  const missing = companyLower.filter((s) => !studentLower.includes(s));

  return { matched, missing };
}

// ── Construct Glassdoor dynamic URL ──
function resolveUrl(resource, companyName) {
  if (resource.isDynamic && resource.url.includes('{companyName}')) {
    const slug = (companyName || 'company').replace(/\s+/g, '-');
    return resource.url.replace('{companyName}', slug);
  }
  return resource.url;
}

// ── Call Groq for AI recommendations ──
async function getGroqRecommendations(skillGap, company, registryList) {
  const client = getGroqClient();
  if (!client) return null;

  const systemPrompt = `You are a placement preparation advisor for engineering students. You must only use resource IDs from the provided list. Never invent new IDs. Return only valid JSON, no explanation, no markdown.`;

  const userPrompt = `A student is preparing for a placement drive at "${company.name}".

Company details:
- Type: ${company.companyType}
- Tier: ${company.tier}
- Evaluation process: ${(company.evaluationProcess || []).join(' → ')}

Student's skill gaps (skills they are MISSING for this company):
${skillGap.missing.length > 0 ? skillGap.missing.join(', ') : 'None identified'}

Available resource IDs (ONLY use these IDs):
${registryList}

Return a JSON array of 5–8 recommendation objects. Each object must have:
- "resourceId": an exact ID from the list above
- "priority": "high" or "medium" or "low"
- "reason": one sentence explaining why this resource matters for this student
- "focusArea": what specifically to focus on within this resource

Sort by priority (high first). Return ONLY the JSON array, nothing else.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Parse JSON — handle markdown code fences if Groq wraps them
    let jsonStr = content;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const recommendations = JSON.parse(jsonStr);
    if (!Array.isArray(recommendations)) return null;

    // Validate: only keep IDs that exist in registry
    const validated = recommendations.filter(
      (r) => r.resourceId && resourceRegistry[r.resourceId]
    );

    return validated.length > 0 ? validated : null;
  } catch (err) {
    console.error('Groq prep resources error:', err.message);
    return null;
  }
}

// ── Fallback: static map-based recommendations ──
function getFallbackRecommendations(skillGap, companyType) {
  const idSet = new Set();

  // By missing skills
  for (const skill of skillGap.missing) {
    const skillLower = skill.toLowerCase();
    const ids = resourceFallbackMap.bySkill[skillLower] || [];
    ids.forEach((id) => idSet.add(id));
  }

  // By company type
  const typeIds = resourceFallbackMap.byCompanyType[companyType] || [];
  typeIds.forEach((id) => idSet.add(id));

  // Cap at 6, validate against registry
  const validIds = [...idSet].filter((id) => resourceRegistry[id]).slice(0, 6);

  return validIds.map((id) => ({
    resourceId: id,
    priority: 'medium',
    reason: 'Recommended based on your skill gap for this company type.',
    focusArea: '',
  }));
}

// ── Main engine function ──
async function getRecommendedResources(student, company) {
  const cacheKey = `${student._id}_${company._id}_prep`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 1. Compute skill gap
  const skillGap = computeSkillGap(student.skills, company.requiredSkills);

  // 2. Try Groq
  const registryList = getTrimmedRegistryList();
  let recommendations = await getGroqRecommendations(skillGap, company, registryList);
  let source = 'ai';

  // 3. Fallback if Groq failed
  if (!recommendations || recommendations.length === 0) {
    recommendations = getFallbackRecommendations(skillGap, company.companyType);
    source = 'fallback';
  }

  // 4. Cap at 8 recommendations
  recommendations = recommendations.slice(0, 8);

  // Priority sort: high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort(
    (a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1)
  );

  // 5. Resolve full resource objects from registry
  const resources = recommendations
    .map((rec) => {
      const registryEntry = resourceRegistry[rec.resourceId];
      if (!registryEntry) return null;
      return {
        id: registryEntry.id,
        platform: registryEntry.platform,
        title: registryEntry.title,
        url: resolveUrl(registryEntry, company.name),
        type: registryEntry.type,
        difficulty: registryEntry.difficulty,
        estimatedTime: registryEntry.estimatedTime,
        priority: rec.priority,
        reason: rec.reason,
        focusArea: rec.focusArea || '',
      };
    })
    .filter(Boolean);

  const result = {
    companyName: company.name,
    skillGap: skillGap.missing,
    matchedSkills: skillGap.matched,
    source,
    resources,
  };

  setCache(cacheKey, result);
  return result;
}

module.exports = { getRecommendedResources, computeSkillGap };
