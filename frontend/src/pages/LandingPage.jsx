import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

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

        {/* Dashboard Mockup Component */}
        <div className="surface-card" style={{ width: '100%', maxWidth: '900px', padding: '32px', textAlign: 'left', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FCA5A5' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FDBA74' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#D8B4FE' }}></div>
            </div>
            <div className="badge badge-neutral" style={{ background: '#F3F2EE', fontSize: '0.65rem' }}>PLACEBRIDGE DASHBOARD</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="surface-card-alt">
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Active Apps</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>12</p>
            </div>
            <div className="surface-card-alt" style={{ background: 'var(--brand-primary)', color: 'white' }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Next Interview</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1, color: 'white' }}>Tomorrow</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div className="surface-card-alt" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎨</div>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Design Lead</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Meta / Menlo Park</p>
                  </div>
                </div>
                <span className="badge badge-primary">Interviewing</span>
             </div>
             <div className="surface-card-alt" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;/&gt;</div>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Frontend Engineer</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Stripe / Remote</p>
                  </div>
                </div>
                <span className="badge badge-neutral">Applied</span>
             </div>
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
    </div>
  );
}
