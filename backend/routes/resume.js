const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = req.user.id + '-' + Date.now() + path.extname(file.originalname);
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

// ── Groq client (lazy init) ──
let groqClient = null;
function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    const Groq = require('groq-sdk');
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// ── Known tech skills for FALLBACK extraction ──
const KNOWN_SKILLS = [
  'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c++', 'c#', 'c',
  'go', 'golang', 'rust', 'swift', 'kotlin', 'ruby', 'php', 'scala',
  'react', 'reactjs', 'react.js', 'angular', 'vue', 'vuejs', 'next.js', 'nextjs',
  'node.js', 'nodejs', 'express', 'expressjs', 'fastapi', 'django', 'flask',
  'spring', 'spring boot', 'springboot', 'hibernate',
  'html', 'css', 'tailwind', 'bootstrap', 'sass', 'scss',
  'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'sql', 'nosql',
  'graphql', 'rest', 'restful', 'grpc',
  'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'git', 'github', 'ci/cd',
  'linux', 'bash', 'shell', 'nginx', 'terraform',
  'dsa', 'data structures', 'algorithms', 'system design', 'microservices',
  'distributed systems', 'cloud', 'devops', 'ml', 'machine learning', 'deep learning',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'opencv',
  'spark', 'kafka', 'rabbitmq', 'elasticsearch',
  'oops', 'oop', 'object oriented', 'dbms', 'os', 'networking basics',
  'communication', 'problem solving', 'logical reasoning', 'analytics',
  'basic web development', 'basic programming', 'cloud basics', 'cloud computing',
  'system design basics',
];

// ── Fallback: keyword-based extraction ──
function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
    if (regex.test(lower)) {
      const canonical = skill
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      found.add(canonical);
    }
  }
  const highValue = [...found].filter((s) =>
    !['C', 'Go'].includes(s) || found.size <= 3
  );
  return highValue.length > 0 ? highValue : [...found];
}

// ── Groq AI: smart skill extraction + resume validation ──
async function groqAnalyzeResume(text) {
  const client = getGroqClient();
  if (!client) return null;

  // Truncate to ~3000 chars to save tokens
  const truncated = text.substring(0, 3000);

  const systemPrompt = `You are a resume parser for a college placement platform. Analyze the document text and return ONLY valid JSON, no markdown, no explanation.`;

  const userPrompt = `Analyze this document text and return a JSON object with exactly these fields:

1. "isResume": boolean — true if this looks like a resume/CV, false if it's some other document (essay, assignment, random file)
2. "skills": string array — extracted technical skills, programming languages, frameworks, tools, and relevant soft skills found in the document. Use proper capitalization (e.g., "React", "Node.js", "Python", "Machine Learning", "Docker"). Only include skills actually mentioned.
3. "confidence": "high" or "medium" or "low" — how confident you are in the extraction

Document text:
"""
${truncated}
"""

Return ONLY the JSON object. Example: {"isResume": true, "skills": ["Python", "React", "Docker"], "confidence": "high"}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 400,
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Handle markdown code fences
    let jsonStr = content;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonStr);

    // Validate structure
    if (typeof result.isResume !== 'boolean' || !Array.isArray(result.skills)) {
      return null;
    }

    return result;
  } catch (err) {
    console.error('Groq resume analysis error:', err.message);
    return null;
  }
}

// POST /api/resume/upload
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    let extractedSkills = [];
    let warning = null;
    let extractionMethod = 'none';
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Try PDF parsing
    if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(buffer);
        const resumeText = pdfData.text || '';

        if (resumeText.trim().length < 50) {
          warning = 'The uploaded PDF appears to have very little text. Make sure it is not a scanned image.';
        } else {
          // Try Groq AI extraction first
          const groqResult = await groqAnalyzeResume(resumeText);

          if (groqResult) {
            extractedSkills = groqResult.skills || [];
            extractionMethod = 'ai';

            // Warn if not a resume
            if (!groqResult.isResume) {
              warning = 'This document does not appear to be a resume. Skills may not be extracted accurately. Please upload your actual resume for best results.';
            }
          } else {
            // Fallback to keyword extraction
            extractedSkills = extractSkillsFromText(resumeText);
            extractionMethod = 'keyword';
          }
        }
      } catch (pdfErr) {
        console.warn('PDF parse failed:', pdfErr.message);
        warning = 'Could not read the PDF content. Skills were not extracted automatically.';
        extractedSkills = [];
      }
    } else {
      // .doc/.docx — can't parse, note it
      warning = 'Skill extraction is only supported for PDF files. Please upload a PDF resume for automatic skill detection.';
    }

    // Relative URL for frontend
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Get existing student to merge skills
    const student = await Student.findById(req.user.id);
    const existingSkills = student.skills || [];
    const mergedSkills = [...new Set([...existingSkills, ...extractedSkills])];

    // Update student record
    await Student.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl,
        resumeOriginalName: req.file.originalname,
        skills: mergedSkills,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: warning
        ? 'Resume uploaded with a notice.'
        : 'Resume uploaded and skills extracted successfully!',
      resumeUrl,
      resumeOriginalName: req.file.originalname,
      skills: mergedSkills,
      extractedSkills,
      extractionMethod,
      warning: warning || null,
    });
  } catch (err) {
    console.error('Resume upload error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
  }
});

// GET /api/resume/me — get current student's resume info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('resumeUrl resumeOriginalName skills');
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
