import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

const STATUS_COLORS = { Applied: '#9CA3AF', Shortlisted: '#60A5FA', Selected: '#10D9A0', Rejected: '#F87171' };

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 172800) return 'Yesterday';
  return `${Math.floor(s/86400)}d ago`;
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      API.get('/admin/overview'),
      API.get('/admin/activity-feed'),
      API.get('/admin/companies'),
      API.get('/admin/applications'),
    ]).then(([ovRes, feedRes, compRes, appRes]) => {
      setStats(ovRes.data.data);
      setFeed(feedRes.data.data || []);
      setCompanies(compRes.data.data || []);
      setApps(appRes.data.data || []);
    }).catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Upcoming drives (next 14 days)
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86400000);
  const upcoming = companies.filter(c => {
    if (!c.driveDate || c.driveDate === 'TBD') return false;
    const d = new Date(c.driveDate);
    return d >= now && d <= in14;
  }).sort((a, b) => new Date(a.driveDate) - new Date(b.driveDate)).slice(0, 6);

  const getUrgency = (date) => {
    const d = new Date(date);
    const diff = Math.floor((d - now) / 86400000);
    if (diff === 0) return { label: 'Today', color: '#F87171' };
    if (diff === 1) return { label: 'Tomorrow', color: '#F59E0B' };
    if (diff <= 7) return { label: 'This Week', color: '#FACC15' };
    return { label: `${diff}d`, color: '#6B7280' };
  };

  // Selected students
  const selected = apps.filter(a => a.status === 'Selected').map(a => ({
    name: a.student?.name, branch: a.student?.branch, cgpa: a.student?.cgpa,
    company: a.company?.name, ctc: a.company?.ctc, date: a.updatedAt,
  }));

  const exportCSV = () => {
    const rows = [['Name','Branch','CGPA','Company','CTC (LPA)','Date'], ...selected.map(s => [s.name, s.branch, s.cgpa, s.company, s.ctc, new Date(s.date).toLocaleDateString()])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'selected_students.csv'; a.click();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#F1F0FF' }}>Overview</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Placement season at a glance</p>
        </div>
        <button onClick={fetchData} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>🔄 Refresh</button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Companies', value: stats?.totalCompanies || 0, icon: '🏢', color: '#6C63FF' },
          { label: 'Students Placed', value: stats?.studentsPlaced || 0, icon: '🎓', color: '#10D9A0' },
          { label: 'Drives This Month', value: stats?.drivesThisMonth || 0, icon: '📅', color: '#F59E0B' },
          { label: 'Total Applicants', value: stats?.totalApplicants || 0, icon: '📋', color: '#60A5FA' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{s.label}</p>
                <p style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Upcoming Drives */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F0FF', marginBottom: '16px' }}>📅 Upcoming Drives</h3>
          {upcoming.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontStyle: 'italic' }}>No drives scheduled in the next 14 days.</p>
          ) : upcoming.map(c => {
            const u = getUrgency(c.driveDate);
            return (
              <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {c.logo ? <img src={c.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} /> : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6C63FF' }}>{c.name?.[0]}</span>}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F0FF', margin: 0 }}>{c.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{new Date(c.driveDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, background: `${u.color}20`, color: u.color }}>{u.label}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{c.applicantCount || 0} apps</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Feed */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', maxHeight: '400px', overflow: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F0FF', marginBottom: '16px' }}>🔔 Activity Feed</h3>
          {feed.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontStyle: 'italic' }}>No recent activity.</p>
          ) : feed.map(a => (
            <div key={a._id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[a.status] || '#6B7280', marginTop: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.82rem', color: '#F1F0FF', margin: 0 }}>
                  <strong>{a.student?.name || 'Student'}</strong> — <span style={{ color: STATUS_COLORS[a.status] }}>{a.status}</span> {a.company?.name ? `for ${a.company.name}` : ''}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{timeAgo(a.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Students */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F0FF' }}>🏆 Selected Students ({selected.length})</h3>
          {selected.length > 0 && <button onClick={exportCSV} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(16,217,160,0.3)', background: 'rgba(16,217,160,0.1)', color: '#10D9A0', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>📥 Export CSV</button>}
        </div>
        {selected.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontStyle: 'italic' }}>No students selected yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Name', 'Branch', 'CGPA', 'Company', 'CTC', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selected.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#F1F0FF' }}>{s.name || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{s.branch || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#F1F0FF' }}>{s.cgpa || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#10D9A0', fontWeight: 600 }}>{s.company || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#FACC15', fontWeight: 600 }}>{s.ctc ? `${s.ctc} LPA` : '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
