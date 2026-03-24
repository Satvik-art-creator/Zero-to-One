import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { removeToken, getStudent } from '../utils/auth';

// ─── Company Type Config ────────────────────────────────────────────────
const TYPE_CONFIG = {
  Product: { color: '#A78BFA', badge: 'badge-product', icon: '🏗️' },
  Service: { color: '#38BDF8', badge: 'badge-service', icon: '🔧' },
  Startup: { color: '#34D399', badge: 'badge-startup', icon: '🚀' },
  Consulting: { color: '#FBBF24', badge: 'badge-consulting', icon: '📊' },
  BFSI: { color: '#F87171', badge: 'badge-bfsi', icon: '🏦' },
};
const TIER_BADGE = {
  'Tier 1': 'badge-tier1',
  'Tier 2': 'badge-tier2',
  'Tier 3': 'badge-tier3',
  'Service-Based': 'badge-service',
  'Startup': 'badge-startup',
};
const STATUS_COLORS = {
  Applied: { bg: 'var(--brand-info-dim)', color: 'var(--brand-info)' },
  Shortlisted: { bg: 'var(--brand-warning-dim)', color: 'var(--brand-warning)' },
  Selected: { bg: 'var(--brand-success-dim)', color: 'var(--brand-success)' },
  Rejected: { bg: 'var(--brand-error-dim)', color: 'var(--brand-error)' },
};

function getCtcNum(company) {
  return typeof company.ctc === 'number' ? company.ctc : parseFloat(company.package) || 0;
}

// ─── Company Detail Modal ────────────────────────────────────────────────
function CompanyModal({ company, onClose, onApply, applied, applying }) {
  const typeConf = TYPE_CONFIG[company.companyType] || TYPE_CONFIG.Service;
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: `${typeConf.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: `1px solid ${typeConf.color}30`, overflow: 'hidden' }}>
                {company.logo ? (
                  <>
                    <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <span style={{ display: 'none' }}>{typeConf.icon}</span>
                  </>
                ) : (
                  <span>{typeConf.icon}</span>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{company.name}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${typeConf.badge}`}>{company.companyType}</span>
                  <span className={`badge ${TIER_BADGE[company.tier] || 'badge-neutral'}`}>{company.tier}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem', padding: '4px', lineHeight: 1 }}>✕</button>
          </div>

          {/* Key stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Package', value: company.package, icon: '💰', color: '#10D9A0' },
              { label: 'Role', value: company.jobRole, icon: '💼', color: '#6C63FF' },
              { label: 'Location', value: company.location, icon: '📍', color: '#F59E0B' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ padding: '14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1rem', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* More info row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Min CGPA', value: `${company.minCGPA}+` },
              { label: 'Backlogs Ok', value: company.backlogPolicy ? '✅ Allowed' : '❌ None' },
              { label: 'Drive Date', value: company.driveDate !== 'TBD' ? new Date(company.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {company.description && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>About the Company</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{company.description}</p>
            </div>
          )}

          {/* Evaluation Process */}
          {company.evaluationProcess?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>Evaluation Process</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {company.evaluationProcess.map((step, i) => (
                  <div key={i} className="eval-step">
                    <div className="eval-step-num">{i + 1}</div>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingTop: '3px' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>Required Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {company.requiredSkills.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          {/* Branches, Openings, Bond */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {company.allowedBranches.map((b) => (
              <span key={b} className="badge badge-neutral">{b}</span>
            ))}
            {company.openings && <span className="badge badge-info">{company.openings} openings</span>}
            {company.bond && <span className="badge badge-warning">Bond: {company.bond}</span>}
            {company.website && <a href={company.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>🌐 Company Website ↗</a>}
          </div>

          {/* Eligibility status bar */}
          {company.eligible ? (
            <div style={{ padding: '12px 16px', background: 'var(--brand-success-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,217,160,0.2)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem' }}>✅</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--brand-success)', fontWeight: 600 }}>You are eligible for this company</span>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', background: 'var(--brand-error-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', marginTop: '2px' }}>🔒</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--brand-error)', fontWeight: 600 }}>You don't meet the eligibility criteria:</span>
                {company.ineligibleReasons?.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--brand-error)', fontSize: '0.8rem', opacity: 0.9 }}>
                    {company.ineligibleReasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {applied ? (
              <div className="btn btn-success" style={{ flex: 1, cursor: 'default' }}>✅ Applied — Resume Sent</div>
            ) : company.eligible ? (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onApply(company._id)} disabled={applying}>
                {applying ? 'Applying...' : '🚀 Apply & Send Resume'}
              </button>
            ) : (
              <div className="btn btn-secondary" style={{ flex: 1, cursor: 'not-allowed', opacity: 0.6 }}>Not Eligible</div>
            )}
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const student = getStudent();
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [applying, setApplying] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterMinPkg, setFilterMinPkg] = useState('');
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get('/companies/eligible'),
      API.get('/applications/mine'),
    ]).then(([compRes, appRes]) => {
      setCompanies(compRes.data.companies || []);
      setApplications(appRes.data.data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load dashboard');
      setLoading(false);
    });
  }, []);

  const hasApplied = (companyId) =>
    applications.some((a) => (a.company?._id || a.company) === companyId);

  const handleApply = async (companyId) => {
    setApplying(true);
    try {
      const { data } = await API.post('/applications', { companyId });
      setApplications((prev) => [...prev, { ...data.data, company: companies.find((c) => c._id === companyId) }]);
      toast.success('✅ Application submitted! Resume sent to company.');
      if (selectedCompany?._id === companyId) setSelectedCompany((c) => ({ ...c }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const handleLogout = () => { removeToken(); navigate('/'); };

  // Unique job roles for filter
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(companies.map((c) => c.jobRole))];
    return roles.slice(0, 8);
  }, [companies]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (showOnlyEligible && !c.eligible) return false;
      if (filterType !== 'all' && c.companyType !== filterType) return false;
      if (filterMinPkg && getCtcNum(c) < parseFloat(filterMinPkg)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.jobRole.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [companies, showOnlyEligible, filterType, filterMinPkg, search]);

  const eligibleCount = companies.filter((c) => c.eligible).length;
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--brand-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <header style={{ padding: '0 40px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlaceBridge</span>
          <nav className="desktop-nav" style={{ display: 'flex', gap: '4px' }}>
            {['discover', 'applied'].concat(student?.role === 'admin' ? ['admin'] : []).map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'admin') navigate('/admin'); }} style={{ background: activeTab === tab ? 'var(--brand-primary-dim)' : 'none', border: 'none', borderRadius: 'var(--radius-pill)', padding: '7px 16px', fontSize: '0.85rem', fontWeight: 600, color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize', transition: 'var(--transition)' }}>
                {tab === 'discover' ? '🔍 Discover' : tab === 'applied' ? '📋 My Applications' : '⚙️ Admin'}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="desktop-block" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{student?.name}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student?.branch} · {student?.cgpa} CGPA {student?.resumeUrl ? '· 📄 Resume ✓' : ''}</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '0.82rem' }} onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Eligible Companies', value: eligibleCount, sub: `of ${companies.length} total`, color: 'var(--brand-primary)', icon: '✅' },
            { label: 'Applications Sent', value: appliedCount, sub: 'resume delivered', color: 'var(--brand-info)', icon: '🚀' },
            { label: 'Shortlisted', value: shortlistedCount, sub: 'awaiting next round', color: 'var(--brand-warning)', icon: '⭐' },
          ].map(({ label, value, sub, color, icon }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</p>
                  <p style={{ fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1, marginBottom: '4px' }}>{value}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Resume alert if not uploaded */}
        {!student?.resumeUrl && (
          <div style={{ padding: '16px 20px', background: 'var(--brand-warning-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-lg)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--brand-warning)', fontSize: '0.9rem', marginBottom: '2px' }}>No Resume Uploaded</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Upload your resume so companies can receive it when you apply. Without a resume, eligibility matching may be limited.</p>
            </div>
          </div>
        )}

        {/* ─── DISCOVER TAB ─────────────────────────────────────────────── */}
        {activeTab === 'discover' && (
          <>
            {/* Filter bar */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: '24px' }}>
              {/* Search */}
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
                <input
                  className="input-field"
                  placeholder="Search companies or roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              {/* Filter chips row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company Type:</span>
                {['all', 'Product', 'Service', 'Startup', 'Consulting', 'BFSI'].map((t) => (
                  <button key={t} onClick={() => setFilterType(t)} className={`filter-chip ${filterType === t ? 'active' : ''}`}>{t === 'all' ? 'All' : t}</button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Min Package:</span>
                  <input className="input-field" type="number" placeholder="e.g. 10" value={filterMinPkg} onChange={(e) => setFilterMinPkg(e.target.value)} style={{ width: '100px', padding: '7px 12px', fontSize: '0.85rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LPA</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={showOnlyEligible} onChange={(e) => setShowOnlyEligible(e.target.checked)} style={{ accentColor: 'var(--brand-primary)' }} />
                  Eligible only
                </label>
                {(search || filterType !== 'all' || filterMinPkg || showOnlyEligible) && (
                  <button onClick={() => { setSearch(''); setFilterType('all'); setFilterMinPkg(''); setShowOnlyEligible(false); }} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    Clear filters ✕
                  </button>
                )}
              </div>

              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredCompanies.length}</strong> companies · <strong style={{ color: 'var(--brand-success)' }}>{filteredCompanies.filter((c) => c.eligible).length}</strong> eligible
                </p>
              </div>
            </div>

            {/* Company cards grid */}
            {filteredCompanies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No companies match your filters</p>
                <button onClick={() => { setSearch(''); setFilterType('all'); setFilterMinPkg(''); setShowOnlyEligible(false); }} className="btn btn-secondary" style={{ marginTop: '16px' }}>Clear Filters</button>
              </div>
            ) : (
              <div className="bento-grid">
                {filteredCompanies.map((company) => {
                  const typeConf = TYPE_CONFIG[company.companyType] || TYPE_CONFIG.Service;
                  const applied = hasApplied(company._id);
                  const ctcNum = getCtcNum(company);
                  return (
                    <div key={company._id} className="card" style={{ padding: '24px', cursor: 'pointer', opacity: company.eligible ? 1 : 0.6 }} onClick={() => setSelectedCompany(company)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${typeConf.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: `1px solid ${typeConf.color}25`, overflow: 'hidden' }}>
                            {company.logo ? (
                              <>
                                <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                <span style={{ display: 'none' }}>{typeConf.icon}</span>
                              </>
                            ) : (
                              <span>{typeConf.icon}</span>
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '3px' }}>{company.name}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{company.jobRole}</p>
                          </div>
                        </div>
                        {applied ? (
                          <span className="badge badge-success">Applied ✓</span>
                        ) : company.eligible ? (
                          <span className="badge badge-primary">Eligible</span>
                        ) : (
                          <span className="badge badge-neutral">Not Eligible</span>
                        )}
                      </div>

                      {/* Package highlight */}
                      <div style={{ padding: '10px 14px', background: ctcNum >= 15 ? 'rgba(250,204,21,0.08)' : 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: `1px solid ${ctcNum >= 15 ? 'rgba(250,204,21,0.15)' : 'var(--border-color)'}` }}>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Package</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: ctcNum >= 15 ? '#FACC15' : 'var(--brand-success)' }}>{company.package}</p>
                      </div>

                      {/* Details row */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>📍 {company.location.split('/')[0].trim()}</span>
                        <span>·</span>
                        <span>📅 {company.driveDate !== 'TBD' ? new Date(company.driveDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                        <span>·</span>
                        <span>CGPA {company.minCGPA}+</span>
                      </div>

                      {/* Type + eval preview */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className={`badge ${typeConf.badge}`} style={{ fontSize: '0.65rem' }}>{company.companyType}</span>
                          <span className={`badge ${TIER_BADGE[company.tier] || 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{company.tier}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{company.evaluationProcess?.length || 0} rounds · Click for details</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── APPLIED TAB ─────────────────────────────────────────────── */}
        {activeTab === 'applied' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>My Applications</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Track all your placement applications and their status</p>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>No applications yet</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>Go to Discover tab to apply to eligible companies</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('discover')}>Discover Companies →</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applications.map((app) => {
                  const comp = app.company || {};
                  const statusStyle = STATUS_COLORS[app.status] || STATUS_COLORS.Applied;
                  const typeConf = TYPE_CONFIG[comp.companyType] || TYPE_CONFIG.Service;
                  return (
                    <div key={app._id} className="card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${typeConf.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', overflow: 'hidden' }}>
                            {comp.logo ? (
                              <>
                                <img src={comp.logo} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                <span style={{ display: 'none' }}>{typeConf.icon}</span>
                              </>
                            ) : (
                              <span>{typeConf.icon}</span>
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{comp.name || 'Company'}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {comp.jobRole} · {comp.package}
                              {app.appliedAt && ` · Applied ${new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {/* Resume sent indicator */}
                          {app.resumeUrl ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--brand-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              📄 Resume sent
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No resume</span>
                          )}
                          {/* Status badge */}
                          <span style={{ padding: '5px 14px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, letterSpacing: '0.04em' }}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      {/* Admin note */}
                      {app.adminNote && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--brand-info-dim)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--brand-info)' }}>
                          💬 {app.adminNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onApply={handleApply}
          applied={hasApplied(selectedCompany._id)}
          applying={applying}
        />
      )}
    </div>
  );
}
