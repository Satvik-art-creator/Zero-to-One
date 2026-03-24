import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    productCompanies: 0,
    highPackageCompanies: 0,
    totalOpenings: 0
  });
  
  useEffect(() => {
    API.get('/companies/public-stats').then((res) => {
      if (res.data?.success) {
        setStats(res.data.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      
      {/* Header */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>PlaceBridge</h1>
        
        <nav className="desktop-nav" style={{ gap: '32px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <span style={{ color: 'var(--brand-primary)', borderBottom: '2px solid var(--brand-primary)', paddingBottom: '4px' }}>Discover</span>
          <span>Companies</span>
          <span>Advisors</span>
        </nav>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        
        <div className="badge badge-primary" style={{ marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          The Digital Atelier
        </div>

        <h2 style={{ fontSize: '4rem', lineHeight: 1.1, maxWidth: '800px', margin: '0 0 24px 0', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          Simplify Your <br />
          Placement Journey
        </h2>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 0 48px 0', lineHeight: 1.6 }}>
          A curated ecosystem designed to elevate your professional trajectory. Discover placements that match your academic ambition and career rigor at IIIT Nagpur.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '80px' }}>
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem' }} onClick={() => navigate('/register')}>
            Get Started
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }} onClick={() => navigate('/login')}>
            View Demo
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {/* Purple Card: Total Companies */}
          <div style={{ backgroundColor: '#6C63FF', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 20px rgba(108, 99, 255, 0.15)', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>TOTAL COMPANIES</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{stats.totalCompanies}</div>
          </div>
          {/* Gray Card: Product Companies */}
          <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>PRODUCT COMPANIES</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stats.productCompanies}</div>
          </div>
          {/* Gray Card: High Package */}
          <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>HIGH PACKAGE (15+ LPA)</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stats.highPackageCompanies}</div>
          </div>
          {/* Gray Card: Total Openings */}
          <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>TOTAL OPENINGS</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stats.totalOpenings}</div>
          </div>
        </div>

        {/* Footer section matching "Precision Tools" concept can go below */}
        <div style={{ marginTop: '100px', maxWidth: '1000px', width: '100%', textAlign: 'left', paddingBottom: '100px' }}>
          <h3 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Precision Tools</h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '48px' }}>
            Every feature is crafted to remove friction and add clarity to your professional evolution.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div className="surface-card" style={{ padding: '32px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--brand-primary)' }}>🛡️</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Smart</h4>
            </div>
            <div className="surface-card" style={{ padding: '32px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--brand-primary)' }}>🔲</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Unified</h4>
            </div>
            <div className="surface-card" style={{ padding: '32px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--brand-primary)' }}>🔔</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Real-time</h4>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-surface)' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} PlaceBridge by IIIT Nagpur. Empowering technical careers.</p>
      </footer>
    </div>
  );
}
