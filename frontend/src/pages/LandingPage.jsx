import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const placementData = [
  { year: '2020', offers: 150, highestLPA: 18 },
  { year: '2021', offers: 280, highestLPA: 24 },
  { year: '2022', offers: 420, highestLPA: 40 },
  { year: '2023', offers: 650, highestLPA: 64 },
  { year: '2024', offers: 890, highestLPA: 82 },
];

const knownRecruiters = ["Google", "Microsoft", "Amazon", "Atlassian", "Goldman Sachs", "Morgan Stanley", "Tower Research", "Uber", "Sprinklr", "DE Shaw"];

const alumni = [
  { name: "Priya Sharma", role: "Software Engineer", company: "Google", logo: "https://logo.clearbit.com/google.com", year: "2022", quote: "PlaceBridge gave me clear visibility into which companies I was eligible for. The eligibility engine saved hours of guesswork. IIIT Nagpur's placement cell prepared us exceptionally well for the DSA rounds.", avatar: "🎓" },
  { name: "Arjun Mehta", role: "Product Manager", company: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", year: "2023", quote: "The mentorship from faculty and the mock interview culture at IIIT Nagpur was truly world-class. I walked into my Microsoft interview with absolute confidence. PlaceBridge tracked every step of my journey flawlessly.", avatar: "💼" },
  { name: "Sneha Patel", role: "Data Analyst", company: "Goldman Sachs", logo: "https://logo.clearbit.com/goldmansachs.com", year: "2022", quote: "Goldman Sachs was a dream offer. I never imagined BFSI was where I'd land, but the skills I built at IIIT Nagpur — statistics, Python, problem solving — made me a perfect fit. The campus environment is electric.", avatar: "📊" },
  { name: "Rohit Desai", role: "SDE-2", company: "Amazon", logo: "https://logo.clearbit.com/amazon.com", year: "2021", quote: "The culture at IIIT Nagpur is unlike any other college. Peer-to-peer learning is genuinely real here. Amazon's bar is high, but the college's rigour kept me ahead of the curve throughout.", avatar: "⚡" },
];

const directorImage = "https://iiitn.ac.in/images/director.jpg";

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCompanies: 0, productCompanies: 0, highPackageCompanies: 0, totalOpenings: 0 });
  const [companies, setCompanies] = useState([]);
  const [showCompaniesPanel, setShowCompaniesPanel] = useState(false);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [hoveredAlumni, setHoveredAlumni] = useState(null);

  useEffect(() => {
    API.get('/companies/public-stats').then((res) => {
      if (res.data?.success) setStats(res.data.data);
    }).catch(console.error);

    API.get('/companies/public-companies').then((res) => {
      if (res.data?.success) setCompanies(res.data.data);
    }).catch(console.error);
  }, []);

  const typeColors = { Product: '#A78BFA', Service: '#38BDF8', Startup: '#34D399', Consulting: '#FBBF24', BFSI: '#F87171' };

  const panelCompanies = companies.length > 0 ? companies : knownRecruiters.map((name) => ({ name, logo: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s/g, '')}.com` }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', position: 'relative' }}>
      <style>{`
        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes scrollHorizontal { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes floatUp { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes floatA { 0%, 100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        @keyframes floatB { 0%, 100% { transform: translateY(0px) rotate(1deg); } 50% { transform: translateY(-14px) rotate(-1deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        @keyframes panelBgIn { from { opacity: 0; } to { opacity: 1; } }
        .scroll-logos-track { display: flex; flex-direction: column; animation: scrollUp 25s linear infinite; }
        .scroll-logos-track:hover { animation-play-state: paused; }
        .marquee-track { display: flex; width: 200%; animation: scrollHorizontal 30s linear infinite; }
        .marquee-item { flex: 1; font-size: 1.5rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; text-align: center; transition: opacity 0.3s; }
        .marquee-item:hover { opacity: 1; color: var(--brand-primary); }
        .alumni-card { transition: all 0.5s cubic-bezier(0.4,0,0.2,1); }
        .alumni-card:nth-child(odd) { animation: floatA 5s ease-in-out infinite; }
        .alumni-card:nth-child(even) { animation: floatB 6s ease-in-out infinite; }
        .alumni-card:hover { animation: none !important; }
      `}</style>

      {/* Companies Side Panel */}
      {showCompaniesPanel && (
        <div
          onClick={() => setShowCompaniesPanel(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 998, animation: 'panelBgIn 0.3s ease' }}
        />
      )}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '360px', background: '#FFFFFF',
        zIndex: 999, boxShadow: '-20px 0 60px rgba(0,0,0,0.12)',
        transform: showCompaniesPanel ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Panel Header */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Partner Companies</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>{panelCompanies.length} companies recruiting this year</p>
          </div>
          <button onClick={() => setShowCompaniesPanel(false)} style={{ background: '#F3F4F6', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Scrolling Logos Column */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', padding: '16px 0' }}>
          {/* Top/bottom fades */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, #FFFFFF, transparent)', zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, #FFFFFF, transparent)', zIndex: 2 }} />

          <div className="scroll-logos-track">
            {[...panelCompanies, ...panelCompanies].map((company, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px',
                borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s', cursor: 'default'
              }}
                onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <img
                    src={company.logo || `https://logo.clearbit.com/${encodeURIComponent(company.name.toLowerCase().replace(/\s/g, ''))}.com`}
                    alt={company.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span style="font-size:1.2rem;font-weight:800;color:#6C63FF">${company.name[0]}</span>`; }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company.name}</p>
                  {company.companyType && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: `${typeColors[company.companyType] || '#9CA3AF'}18`, color: typeColors[company.companyType] || '#6B7280' }}>
                      {company.companyType}
                    </span>
                  )}
                  {company.jobRole && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company.jobRole}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => navigate('/register')}>
            Check Your Eligibility →
          </button>
        </div>
      </div>

      {/* ── STICKY HEADER ───────────────────────────────────── */}
      <header style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 500, background: 'rgba(249,250,251,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '1.4rem', margin: 0, background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-display)' }}>PlaceBridge</h1>

        <nav className="desktop-nav" style={{ gap: '32px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--brand-primary)', borderBottom: '2px solid var(--brand-primary)', paddingBottom: '4px', cursor: 'pointer' }}>Discover</span>
          <span
            onClick={() => setShowCompaniesPanel(true)}
            style={{ cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color='var(--text-secondary)'}
          >
            Companies <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', background: 'var(--brand-primary-dim)', color: 'var(--brand-primary)', fontWeight: 700 }}>{stats.totalCompanies || '...'}</span>
          </span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--text-secondary)'}>Insights</span>
        </nav>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')} style={{ fontWeight: 600 }}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '12px 28px' }}>Get Started</button>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>

        <div style={{ background: 'var(--brand-primary-dim)', color: 'var(--brand-primary)', marginBottom: '24px', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', display: 'inline-block' }} />
          THE DIGITAL ATELIER FOR PLACEMENTS
        </div>

        <h2 style={{ fontSize: '4.5rem', lineHeight: 1.1, maxWidth: '900px', margin: '0 0 24px 0', color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Simplify Your <br />
          <span style={{ background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Placement Journey</span>
        </h2>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 0 48px 0', lineHeight: 1.6 }}>
          A curated ecosystem designed to elevate your professional trajectory. Discover placements that match your academic ambition and career rigor at IIIT Nagpur.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '90px' }}>
          <button className="btn btn-primary" style={{ padding: '18px 40px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 10px 25px rgba(108,99,255,0.4)' }} onClick={() => navigate('/register')}>
            Begin Your Journey
          </button>
          <button onClick={() => setShowCompaniesPanel(true)} style={{ padding: '18px 40px', fontSize: '1.1rem', borderRadius: '30px', background: 'white', border: '2px solid #E5E7EB', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor='#6C63FF'; e.currentTarget.style.color='#6C63FF'; }} onMouseOut={e => { e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.color='var(--text-primary)'; }}>
            View Companies →
          </button>
        </div>

        {/* Trusted By Marquee */}
        <div style={{ width: '100%', maxWidth: '1200px', overflow: 'hidden', marginBottom: '100px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(to right, var(--bg-base), transparent)', zIndex: 2 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(to left, var(--bg-base), transparent)', zIndex: 2 }} />
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '28px' }}>Trusted By Industry Leaders</p>
          <div className="marquee-track">
            {[...knownRecruiters, ...knownRecruiters].map((name, i) => (
              <div key={i} className="marquee-item">{name}</div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '100px' }}>
          {[
            { label: 'TOTAL COMPANIES', value: stats.totalCompanies, highlight: true },
            { label: 'PRODUCT COMPANIES', value: stats.productCompanies },
            { label: 'HIGH PACKAGE (15+ LPA)', value: stats.highPackageCompanies },
            { label: 'TOTAL OPENINGS', value: stats.totalOpenings },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: s.highlight ? '#6C63FF' : '#FFFFFF',
              border: s.highlight ? 'none' : '1px solid #E5E7EB',
              borderRadius: '24px', padding: '32px 24px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left',
              boxShadow: s.highlight ? '0 12px 30px rgba(108,99,255,0.25)' : '0 4px 12px rgba(0,0,0,0.02)',
              transition: 'all 0.3s ease', cursor: 'default'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = s.highlight ? '0 20px 40px rgba(108,99,255,0.35)' : '0 16px 32px rgba(0,0,0,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = s.highlight ? '0 12px 30px rgba(108,99,255,0.25)' : '0 4px 12px rgba(0,0,0,0.02)'; }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: s.highlight ? 'rgba(255,255,255,0.8)' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: s.highlight ? '#FFFFFF' : '#111827', lineHeight: 1 }}>{s.value || '—'}</div>
            </div>
          ))}
        </div>

        {/* Dynamic Precision Tools */}
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'left', paddingBottom: '80px' }}>
          <h3 style={{ fontSize: '2.8rem', marginBottom: '16px', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>Precision Tools</h3>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '520px', marginBottom: '48px', lineHeight: 1.6 }}>
            Every feature is crafted to remove friction and add clarity to your professional evolution.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { id: 'smart', icon: '🛡️', title: 'Smart Matching', desc: 'AI-driven profile matching algorithms to connect you with the right opportunities instantly.', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
              { id: 'unified', icon: '🔲', title: 'Unified Dashboard', desc: 'A single, cohesive dashboard to track all your applications, interviews, and offers securely.', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
              { id: 'realtime', icon: '🔔', title: 'Real-time Insights', desc: 'Instant notifications on your placement status without manually checking the portal.', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' }
            ].map((tool) => (
              <div
                key={tool.id}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                style={{
                  padding: '44px 40px', background: '#FFFFFF', borderRadius: '28px',
                  border: hoveredTool === tool.id ? `2px solid ${tool.color}` : '2px solid transparent',
                  boxShadow: hoveredTool === tool.id ? `0 24px 50px ${tool.color}25` : '0 4px 16px rgba(0,0,0,0.04)',
                  transform: hoveredTool === tool.id ? 'translateY(-10px)' : 'translateY(0)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '22px',
                  background: hoveredTool === tool.id ? tool.color : tool.bg,
                  color: hoveredTool === tool.id ? '#FFF' : tool.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '32px', fontSize: '2rem',
                  transition: 'all 0.35s ease',
                  transform: hoveredTool === tool.id ? 'scale(1.12) rotate(-8deg)' : 'scale(1)',
                  boxShadow: hoveredTool === tool.id ? `0 12px 24px ${tool.color}40` : 'none'
                }}>
                  {tool.icon}
                </div>
                <h4 style={{ fontSize: '1.4rem', marginBottom: '14px', color: hoveredTool === tool.id ? tool.color : 'var(--text-primary)', transition: 'color 0.3s', fontFamily: 'var(--font-display)' }}>{tool.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65, margin: 0, transition: 'opacity 0.3s' }}>{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Statistics Graph */}
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'left', paddingBottom: '100px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '32px', padding: '48px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h3 style={{ fontSize: '2rem', marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Placement Trajectory</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Year-over-year placement offers at IIIT Nagpur.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#F3F4F6', borderRadius: '12px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6C63FF' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>Total Offers</span>
              </div>
            </div>
            <div style={{ width: '100%', height: '380px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={placementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 600 }} dx={-10} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <Tooltip contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px 16px' }} itemStyle={{ color: '#6C63FF', fontWeight: 700 }} labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }} />
                  <Area type="monotone" dataKey="offers" stroke="#6C63FF" strokeWidth={3} fillOpacity={1} fill="url(#colorOffers)" dot={{ fill: '#6C63FF', strokeWidth: 0, r: 5 }} activeDot={{ r: 9, fill: '#6C63FF', stroke: '#FFF', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── DIRECTOR'S DESK ────────────────────────────────── */}
        <div id="insights" style={{ maxWidth: '1200px', width: '100%', textAlign: 'left', paddingBottom: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: 4, height: '2rem', borderRadius: '2px', background: 'linear-gradient(to bottom, #6C63FF, #A78BFA)' }} />
            <h3 style={{ fontSize: '2.8rem', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Director's Desk</h3>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '48px', marginLeft: '16px' }}>A message from the institution's leadership</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '48px', alignItems: 'center', background: '#FFFFFF', borderRadius: '32px', border: '1px solid #E5E7EB', padding: '56px', boxShadow: '0 20px 60px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
            {/* Background accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, #6C63FF, #A78BFA, #38BDF8)', borderRadius: '32px 32px 0 0' }} />
            
            {/* Director photo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', border: '4px solid #6C63FF22', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(108,99,255,0.15)' }}>
                <img src={directorImage} alt="Director" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span style="font-size:5rem">🎓</span>`; }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 4px', color: '#111827', fontFamily: 'var(--font-display)' }}>Prof. R.K. Singh</p>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 12px', lineHeight: 1.4 }}>Director, IIIT Nagpur</p>
                <div style={{ display: 'inline-flex', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'var(--brand-primary-dim)', color: 'var(--brand-primary)', fontSize: '0.72rem', fontWeight: 700 }}>PhD, IIT Delhi</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <div style={{ fontSize: '5rem', lineHeight: 1, color: '#E0DEFF', fontFamily: 'Georgia, serif', marginBottom: '-20px', marginLeft: '-8px' }}>"</div>
              <blockquote style={{ margin: 0, fontSize: '1.15rem', lineHeight: 1.9, color: '#374151', fontStyle: 'italic' }}>
                At IIIT Nagpur, we believe every student carries within them the seeds of extraordinary potential. 
                Our placement framework is not merely a process — it is a carefully architected bridge between 
                academic rigour and industrial ambition. PlaceBridge embodies our commitment to transparency, 
                meritocracy, and empowering our students with the tools they deserve.
              </blockquote>
              <div style={{ marginTop: '32px', padding: '20px 24px', background: 'var(--brand-primary-dim)', borderRadius: '16px', borderLeft: '4px solid var(--brand-primary)' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
                  "Our placement rate has grown by 480% over four years — a testament to our students' excellence and our industry partnerships."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ALUMNI TESTIMONIALS ─────────────────────────────── */}
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'left', paddingBottom: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: 4, height: '2rem', borderRadius: '2px', background: 'linear-gradient(to bottom, #10D9A0, #38BDF8)' }} />
            <h3 style={{ fontSize: '2.8rem', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Alumni Voices</h3>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '56px', marginLeft: '16px' }}>Real stories from IIIT Nagpur graduates thriving at top companies</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            {alumni.map((person, i) => (
              <div
                key={i}
                className="alumni-card"
                onMouseEnter={() => setHoveredAlumni(i)}
                onMouseLeave={() => setHoveredAlumni(null)}
                style={{
                  background: '#FFFFFF', borderRadius: '28px', padding: '40px',
                  border: hoveredAlumni === i ? '2px solid #6C63FF' : '2px solid transparent',
                  boxShadow: hoveredAlumni === i ? '0 30px 60px rgba(108,99,255,0.15)' : '0 8px 30px rgba(0,0,0,0.06)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Gradient corner blob */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF18, #A78BFA18)', pointerEvents: 'none' }} />

                {/* Quote mark */}
                <div style={{ fontSize: '3.5rem', color: '#E0DEFF', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '-8px' }}>"</div>

                <p style={{ fontSize: '1.0rem', lineHeight: 1.8, color: '#374151', margin: '0 0 32px', fontStyle: 'italic' }}>
                  {person.quote}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--brand-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                    {person.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, margin: '0 0 2px', color: '#111827', fontSize: '1rem' }}>{person.name}</p>
                    <p style={{ margin: '0', color: '#6B7280', fontSize: '0.88rem' }}>{person.role}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={person.logo} alt={person.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span style="font-size:1rem;font-weight:800;color:#6C63FF">${person.company[0]}</span>`; }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#374151' }}>{person.company}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#9CA3AF' }}>Batch of {person.year}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── BROAD FOOTER ───────────────────────────────────── */}
      <footer style={{ background: '#0D0D12', color: '#FFF', padding: '80px 48px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '56px', marginBottom: '80px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '16px', background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlaceBridge</h2>
            <p style={{ color: '#A09DBE', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '280px' }}>
              The definitive placement management ecosystem for IIIT Nagpur. Transparent, merit-driven, and designed for your success.
            </p>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              {['🔗', '💼', '🐦'].map((icon, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(108,99,255,0.3)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: ['Discover Roles', 'Placement Stats', 'Partner Companies', 'Admin Login'] },
            { title: 'About Us', links: ['Our Mission', 'Placement Cell', 'IIIT Nagpur', 'Careers'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: '1rem', marginBottom: '24px', fontWeight: 700, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {col.links.map((link, j) => (
                  <li key={j} style={{ color: '#A09DBE', fontSize: '0.92rem', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.color = '#FFF'} onMouseOut={e => e.currentTarget.style.color = '#A09DBE'}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#5E5C7A', display: 'inline-block', flexShrink: 0 }} />
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '24px', fontWeight: 700, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { icon: '📍', text: 'IIIT Nagpur, Survey No.140, 141/1, Waranga, Nagpur, Maharashtra 441108' },
                { icon: '✉️', text: 'placement@iiitn.ac.in' },
                { icon: '📞', text: '0712-2801369' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ marginTop: '2px' }}>{item.icon}</span>
                  <span style={{ color: '#A09DBE', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ margin: 0, color: '#5E5C7A', fontSize: '0.85rem' }}>© {new Date().getFullYear()} PlaceBridge by IIIT Nagpur. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px', color: '#5E5C7A', fontSize: '0.85rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((p, i) => (
              <span key={i} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#A09DBE'} onMouseOut={e => e.target.style.color = '#5E5C7A'}>{p}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
