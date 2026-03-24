import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { getStudent } from '../utils/auth';

export default function EligibilitySummary() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const student = getStudent();

  useEffect(() => {
    API.get('/companies/eligible')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const skillCount = student?.skills?.length || 0;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Glow effect */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 18px', background: 'var(--brand-success-dim)', borderRadius: 'var(--radius-pill)', marginBottom: '32px', border: '1px solid rgba(16,217,160,0.2)' }}>
          <span style={{ fontSize: '0.9rem' }}>✨</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile Analysed</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', letterSpacing: '-0.03em' }}>
          Welcome, {student?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
          Your academic profile has been matched against all available drives
        </p>

        {/* Profile chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">CGPA: {student?.cgpa}</span>
          <span className="badge badge-neutral">{student?.branch}</span>
          <span className="badge badge-neutral">{student?.year} Year</span>
          {student?.backlogs > 0 && <span className="badge badge-error">{student?.backlogs} Backlogs</span>}
          {skillCount > 0 && <span className="badge badge-success">🧠 {skillCount} skills matched</span>}
        </div>

        {/* Main stat card */}
        <div className="card" style={{ padding: '40px', marginBottom: '24px' }}>
          {data ? (
            <>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>You are eligible for</p>
              <div style={{ fontSize: '5.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '8px', background: 'linear-gradient(135deg, #6C63FF, #A78BFA, #10D9A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {data.eligibleCount}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '24px' }}>
                out of <strong style={{ color: 'var(--text-primary)' }}>{data.total}</strong> companies mapped to your profile
              </p>
              <div style={{ height: '6px', background: 'var(--bg-surface-2)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${(data.eligibleCount / data.total) * 100}%`, background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-success))', borderRadius: '3px', transition: 'width 1s ease' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {Math.round((data.eligibleCount / data.total) * 100)}% match rate
              </p>
            </>
          ) : (
            <div style={{ padding: '48px 0', color: 'var(--text-muted)' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--brand-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Running precision matching...
            </div>
          )}
        </div>

        {/* Resume indicator */}
        {student?.resumeUrl ? (
          <div style={{ padding: '14px 20px', background: 'var(--brand-success-dim)', border: '1px solid rgba(16,217,160,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📄</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--brand-success)', fontWeight: 600 }}>Resume uploaded — companies will receive it when you apply</span>
          </div>
        ) : (
          <div style={{ padding: '14px 20px', background: 'var(--brand-warning-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--brand-warning)', fontWeight: 600 }}>No resume detected — you can upload it from dashboard settings</span>
          </div>
        )}

        {data && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
            onClick={() => navigate('/dashboard')}
          >
            View Eligible Companies →
          </button>
        )}
      </div>
    </div>
  );
}
