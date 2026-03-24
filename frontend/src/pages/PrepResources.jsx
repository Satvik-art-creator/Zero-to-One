import React, { useState, useMemo } from 'react';
import API from '../api/axios';

// ── Platform icon config (colored letter icons) ──
const PLATFORM_ICONS = {
  LeetCode: { letter: 'L', bg: '#FFA11640', color: '#FFA116', border: '#FFA11625' },
  GeeksforGeeks: { letter: 'G', bg: '#2F8D4640', color: '#2F8D46', border: '#2F8D4625' },
  GitHub: { letter: 'G', bg: '#f0f6fc', color: '#24292f', border: '#d0d7de' },
  YouTube: { letter: 'Y', bg: '#FF000018', color: '#FF0000', border: '#FF000015' },
  Glassdoor: { letter: 'G', bg: '#0caa4140', color: '#0caa41', border: '#0caa4125' },
  Unstop: { letter: 'U', bg: '#1C3FE140', color: '#1C3FE1', border: '#1C3FE125' },
  AmbitionBox: { letter: 'A', bg: '#E8491D40', color: '#E8491D', border: '#E8491D25' },
};

// ── Type badge color config ──
const TYPE_COLORS = {
  'DSA Practice': { bg: '#A78BFA20', color: '#A78BFA' },
  'Concept Learning': { bg: '#38BDF820', color: '#38BDF8' },
  'System Design': { bg: '#2DD4BF20', color: '#2DD4BF' },
  'Interview Prep': { bg: '#FB923C20', color: '#FB923C' },
  'Company Research': { bg: '#9CA3AF20', color: '#9CA3AF' },
};

// ── Priority badge config ──
const PRIORITY_CONFIG = {
  high: { label: '🔴 Must Do', bg: '#F8717120', color: '#F87171' },
  medium: { label: '🟡 Recommended', bg: '#FBBF2420', color: '#FBBF24' },
  low: { label: '⚪ Optional', bg: '#9CA3AF20', color: '#9CA3AF' },
};

// ── Static General Placement Library data ──
const GENERAL_LIBRARY = [
  {
    label: '🧮 DSA Foundations',
    resources: [
      { id: 'yt-striver-a2z', platform: 'YouTube', title: "Striver's A2Z DSA Sheet", url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz' },
      { id: 'yt-neetcode-150', platform: 'YouTube', title: 'NeetCode 150 Roadmap', url: 'https://www.youtube.com/c/NeetCode' },
      { id: 'lc-top-150', platform: 'LeetCode', title: 'Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/' },
    ],
  },
  {
    label: '📚 Core CS Concepts',
    resources: [
      { id: 'gfg-dbms', platform: 'GeeksforGeeks', title: 'DBMS Fundamentals', url: 'https://www.geeksforgeeks.org/dbms/' },
      { id: 'gfg-os', platform: 'GeeksforGeeks', title: 'Operating Systems', url: 'https://www.geeksforgeeks.org/operating-systems/' },
      { id: 'gfg-cn', platform: 'GeeksforGeeks', title: 'Computer Networks', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/' },
      { id: 'gfg-oop', platform: 'GeeksforGeeks', title: 'OOP Concepts', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/' },
    ],
  },
  {
    label: '🏗️ System Design',
    resources: [
      { id: 'sdp-github', platform: 'GitHub', title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
      { id: 'yt-techdummies-sd', platform: 'YouTube', title: 'TechDummies SD Playlist', url: 'https://www.youtube.com/playlist?list=PLkQkbY7JNJu8sR0gNFj_PJg4Y5mlfBrO' },
      { id: 'grokking-free', platform: 'GitHub', title: 'Grokking SD (Free)', url: 'https://github.com/sharanyaa/grok_sdi_educative' },
    ],
  },
  {
    label: '🔍 Company Research',
    resources: [
      { id: 'glassdoor-interviews', platform: 'Glassdoor', title: 'Interview Experiences', url: 'https://www.glassdoor.co.in/Interview/' },
      { id: 'unstop-challenges', platform: 'Unstop', title: 'Challenges & Hackathons', url: 'https://unstop.com/' },
      { id: 'ambitionbox-reviews', platform: 'AmbitionBox', title: 'Company Reviews', url: 'https://www.ambitionbox.com/' },
    ],
  },
];

// ── Loading Skeleton ──
function ResourceSkeleton() {
  return (
    <div className="prep-resources-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="resource-card skeleton-card">
          <div className="skeleton-line" style={{ width: '60%', height: 16, marginBottom: 12 }} />
          <div className="skeleton-line" style={{ width: '80%', height: 12, marginBottom: 8 }} />
          <div className="skeleton-line" style={{ width: '40%', height: 12, marginBottom: 20 }} />
          <div className="skeleton-line" style={{ width: '100%', height: 36 }} />
        </div>
      ))}
    </div>
  );
}

// ── Resource Card ──
function ResourceCard({ resource }) {
  const platformIcon = PLATFORM_ICONS[resource.platform] || { letter: resource.platform[0], bg: '#6C63FF20', color: '#6C63FF', border: '#6C63FF25' };
  const typeColor = TYPE_COLORS[resource.type] || TYPE_COLORS['Concept Learning'];
  const priorityConf = PRIORITY_CONFIG[resource.priority] || PRIORITY_CONFIG.medium;

  return (
    <div className="resource-card">
      {/* Header: platform icon + title */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        <div className="platform-icon" style={{ background: platformIcon.bg, color: platformIcon.color, border: `1px solid ${platformIcon.border}` }}>
          {platformIcon.letter}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, lineHeight: 1.3 }}>{resource.title}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{resource.platform}</p>
        </div>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className="type-badge" style={{ background: typeColor.bg, color: typeColor.color }}>{resource.type}</span>
        <span className="priority-badge" style={{ background: priorityConf.bg, color: priorityConf.color }}>{priorityConf.label}</span>
      </div>

      {/* Difficulty + Time */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {resource.difficulty && resource.difficulty !== 'N/A' && <span>📊 {resource.difficulty}</span>}
        {resource.estimatedTime && <span>⏱️ {resource.estimatedTime}</span>}
      </div>

      {/* AI Reason */}
      {resource.reason && (
        <p className="ai-reason">💡 {resource.reason}</p>
      )}

      {/* Focus Area */}
      {resource.focusArea && (
        <p className="ai-focus">🎯 {resource.focusArea}</p>
      )}

      {/* CTA */}
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-cta-btn">
        Open Resource →
      </a>
    </div>
  );
}

// ── Compact card for General Library ──
function CompactResourceCard({ resource }) {
  const platformIcon = PLATFORM_ICONS[resource.platform] || { letter: resource.platform[0], bg: '#6C63FF20', color: '#6C63FF', border: '#6C63FF25' };

  return (
    <div className="compact-resource-card">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div className="platform-icon-sm" style={{ background: platformIcon.bg, color: platformIcon.color, border: `1px solid ${platformIcon.border}` }}>
          {platformIcon.letter}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.title}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{resource.platform}</p>
        </div>
      </div>
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="compact-cta-btn">
        Open →
      </a>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── PrepResources Main Component ──
// ══════════════════════════════════════════════════════════════
export default function PrepResources({ student, companies }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resourceData, setResourceData] = useState(null);
  const [error, setError] = useState(null);

  // ── Filter to only eligible companies, sort by drive date ──
  const eligibleCompanies = useMemo(() => {
    return (companies || [])
      .filter((c) => c.eligible)
      .sort((a, b) => {
        if (a.driveDate === 'TBD') return 1;
        if (b.driveDate === 'TBD') return -1;
        return new Date(a.driveDate) - new Date(b.driveDate);
      });
  }, [companies]);

  // ── Handle company selection ──
  const handleCompanySelect = async (companyId) => {
    setSelectedCompanyId(companyId);
    if (!companyId) {
      setResourceData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/student/company/${companyId}/prep-resources`);
      setResourceData(data);
    } catch (err) {
      console.error('Failed to fetch prep resources:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  // ── No resume uploaded ──
  if (!student?.resumeUrl && (!student?.skills || student.skills.length === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-warning-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>📄</div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Upload Your Resume First</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 24px' }}>
          We need your resume to extract your skills and compute skill gaps for personalized prep recommendations.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Go to your profile or use the resume upload feature, then come back here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Section Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Prep Resources</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          AI-powered preparation recommendations tailored to your skill gaps
        </p>
      </div>

      {/* ═══════════ Section A — Company-Specific Resources ═══════════ */}
      <div className="prep-section-card" style={{ marginBottom: 32 }}>
        {/* Company Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Prepare for which company?
          </label>
          <select
            className="input-field"
            value={selectedCompanyId}
            onChange={(e) => handleCompanySelect(e.target.value)}
            style={{ maxWidth: 400, cursor: 'pointer' }}
            id="prep-company-selector"
          >
            <option value="">Select a company...</option>
            {eligibleCompanies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.jobRole} ({c.driveDate !== 'TBD' ? new Date(c.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'})
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && <ResourceSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div style={{ padding: '16px 20px', background: 'var(--brand-error-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 16 }}>
            <p style={{ color: 'var(--brand-error)', fontSize: '0.88rem' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Resource results */}
        {resourceData && !loading && (
          <>
            {/* Fallback Info Note */}
            {resourceData.source === 'fallback' && (
              <div className="fallback-note">
                <span className="fallback-icon" title="Personalized recommendations are temporarily unavailable. Showing standard resources.">ℹ️</span>
                <span>Personalized recommendations are temporarily unavailable. Showing standard resources.</span>
              </div>
            )}

            {/* Skill Gap Summary Bar */}
            <div className="skill-gap-bar">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                Skill Gap Analysis for {resourceData.companyName}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(resourceData.matchedSkills || []).map((skill) => (
                  <span key={`match-${skill}`} className="skill-pill skill-pill-green">✓ {skill}</span>
                ))}
                {(resourceData.skillGap || []).map((skill) => (
                  <span key={`gap-${skill}`} className="skill-pill skill-pill-red">✗ {skill}</span>
                ))}
                {(resourceData.matchedSkills || []).length === 0 && (resourceData.skillGap || []).length === 0 && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No skill data available.</span>
                )}
              </div>
            </div>

            {/* Resource Cards Grid */}
            {resourceData.resources && resourceData.resources.length > 0 ? (
              <div className="prep-resources-grid">
                {resourceData.resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No specific resources found for this company.</p>
              </div>
            )}
          </>
        )}

        {/* Empty state when no company selected */}
        {!selectedCompanyId && !loading && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.5 }}>🎯</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select a company above to get personalized prep resources</p>
          </div>
        )}
      </div>

      {/* ═══════════ Section B — General Placement Library ═══════════ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: '1.2rem' }}>📖</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>General Placement Prep</h3>
        </div>

        {GENERAL_LIBRARY.map((section) => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>{section.label}</p>
            <div className="general-library-row">
              {section.resources.map((resource) => (
                <CompactResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
