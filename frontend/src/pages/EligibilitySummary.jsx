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
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-base)' }}>
      <div className="surface-card" style={{ maxWidth: '500px', width: '100%', padding: '48px 40px', textAlign: 'center', background: '#FFFFFF' }}>
        
        <div className="badge badge-primary" style={{ marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Profile Analysed
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '8px', letterSpacing: '-0.03em' }}>
          Welcome, {student?.name.split(' ')[0]}
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
          <span className="badge badge-neutral">CGPA: {student?.cgpa}</span>
          <span className="badge badge-neutral">{student?.branch}</span>
          {student?.backlogs > 0 && <span className="badge badge-error">{student?.backlogs} Backlogs</span>}
        </div>

        {data ? (
          <div className="surface-card-alt" style={{ marginBottom: '40px', background: '#F8F9FA', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '8px' }}>
              Eligible Opportunities
            </p>
            <h1 style={{ fontSize: '4.5rem', margin: '0 0 8px 0', color: 'var(--brand-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {data.eligibleCount}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
              out of {data.total} companies mapped to your profile.
            </p>
          </div>
        ) : (
          <div style={{ padding: '64px 0', color: 'var(--text-muted)' }}>
             Running precision matching...
          </div>
        )}

        {data && (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px' }}
            onClick={() => navigate('/dashboard')}
          >
            Enter Dashboard
          </button>
        )}

      </div>
    </div>
  );
}
