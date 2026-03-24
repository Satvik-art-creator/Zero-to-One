import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent, removeToken } from '../utils/auth';
import AdminOverview from './AdminOverview';
import AdminCompanies from './AdminCompanies';
import AdminApplications from './AdminApplications';
import AdminStudents from './AdminStudents';
import AdminAnnouncements from './AdminAnnouncements';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'companies', label: 'Companies', icon: '🏢' },
  { key: 'applications', label: 'Applications', icon: '📋' },
  { key: 'students', label: 'Students', icon: '🎓' },
  { key: 'announcements', label: 'Announcements', icon: '📢' },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const student = getStudent();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { removeToken(); navigate('/'); };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'companies': return <AdminCompanies />;
      case 'applications': return <AdminApplications />;
      case 'students': return <AdminStudents />;
      case 'announcements': return <AdminAnnouncements />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFB', color: '#111827', fontFamily: 'var(--font-body, "Inter", sans-serif)' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .admin-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 20px; border-radius: 12px; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: #4B5563; transition: all 0.2s ease; border: none; background: none; width: 100%; text-align: left; position: relative; }
        .admin-nav-item:hover { color: #111827; background: #F3F4F6; }
        .admin-nav-item.active { color: #6C63FF; font-weight: 700; background: rgba(108,99,255,0.08); }
        .admin-nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #6C63FF; border-radius: 0 4px 4px 0; }
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed !important; z-index: 100; transform: translateX(-100%); transition: transform 0.3s ease; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-overlay { display: block !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        width: '240px', minHeight: '100vh', background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB', display: 'flex',
        flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display, "Inter", sans-serif)', background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlaceBridge</span>
          </div>
          <span style={{ display: 'inline-block', marginTop: '6px', padding: '3px 8px', background: 'rgba(16,217,160,0.12)', color: '#10D9A0', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em' }}>ADMIN PANEL</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}>
              <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center', filter: activeTab === item.key ? 'none' : 'grayscale(100%) opacity(0.6)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin Info */}
        <div style={{ padding: '16px 16px 20px', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#FFF', flexShrink: 0 }}>
              {student?.name?.[0] || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student?.name || 'Admin'}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background='rgba(239, 68, 68, 0.1)'} onMouseOut={e => e.target.style.background='rgba(239, 68, 68, 0.05)'}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile Header */}
        <div style={{ display: 'none', padding: '12px 20px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#111827', fontSize: '1.1rem' }}>☰</button>
          <span style={{ fontSize: '1rem', fontWeight: 700, background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlaceBridge Admin</span>
          <div style={{ width: '36px' }} />
        </div>

        <div style={{ padding: '32px 36px', animation: 'fadeIn 0.3s ease' }}>
          {renderTab()}
        </div>
      </main>
    </div>
  );
}
