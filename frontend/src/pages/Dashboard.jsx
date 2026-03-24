import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { removeToken, getStudent } from '../utils/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const student = getStudent();
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('eligible');

  useEffect(() => {
    Promise.all([
      API.get('/companies/eligible'),
      API.get('/applications/mine')
    ]).then(([compRes, appRes]) => {
      setCompanies(compRes.data.companies);
      setApplications(appRes.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    });
  }, []);

  const handleApply = async (companyId) => {
    try {
      const { data } = await API.post('/applications', { companyId });
      toast.success('Application submitted!');
      setApplications([...applications, data.application || data.data]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
  };

  const hasApplied = (companyId) => {
    return applications.some(app => 
      (app.company._id || app.company) === companyId
    );
  };

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      
      {/* Header matching the mockups exactly */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em' }}>PlaceBridge</h1>
        
        <nav className="desktop-nav" style={{ gap: '32px', color: 'var(--text-secondary)', fontWeight: 500 }}>
           <button style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 500, color: activeTab === 'eligible' ? 'var(--brand-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'eligible' ? '2px solid var(--brand-primary)' : 'none', paddingBottom: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('eligible')}>
             Discover
           </button>
           <button style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 500, color: activeTab === 'applied' ? 'var(--brand-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'applied' ? '2px solid var(--brand-primary)' : 'none', paddingBottom: '4px', cursor: 'pointer' }} onClick={() => setActiveTab('applied')}>
             My Apps
           </button>
        </nav>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div className="desktop-block" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{student?.name}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{student?.branch} • {student?.cgpa} CGPA</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        <div className="surface-card" style={{ width: '100%', padding: '40px', background: '#FFFFFF', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FCA5A5' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FDBA74' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#D8B4FE' }}></div>
            </div>
            <div className="badge badge-neutral" style={{ background: '#F3F2EE', fontSize: '0.65rem' }}>PLACEBRIDGE DASHBOARD</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className="surface-card-alt">
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Active Apps</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>{applications.length}</p>
            </div>
            <div className="surface-card-alt" style={{ background: 'var(--brand-primary)', color: 'white' }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Eligible Matches</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1, color: 'white' }}>{companies.length}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {activeTab === 'eligible' && (
              companies.filter(c => !hasApplied(c._id)).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>You have applied to all eligible companies!</div>
              ) : (
                companies.filter(c => !hasApplied(c._id)).map(company => (
                  <div key={company._id} className="surface-card-alt" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                      <div>
                        <p style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{company.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{company.jobRole} / {company.location} / {company.package}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => handleApply(company._id)}>
                      Apply Now
                    </button>
                  </div>
                ))
              )
            )}

            {activeTab === 'applied' && (
              applications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>You haven't applied to any companies yet.</div>
              ) : (
                applications.map(app => {
                  const comp = app.company || {};
                  return (
                    <div key={app._id} className="surface-card-alt" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EEECFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
                        <div>
                          <p style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{comp.name || 'Company'}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{comp.jobRole} / {comp.package}</p>
                        </div>
                      </div>
                      <span className="badge badge-primary">{app.status || 'Applied'}</span>
                    </div>
                  )
                })
              )
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
