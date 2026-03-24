import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

const STATUS_COLORS = { Applied: { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }, Shortlisted: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' }, Selected: { bg: 'rgba(16,217,160,0.15)', color: '#10D9A0' }, Rejected: { bg: 'rgba(248,113,113,0.15)', color: '#F87171' } };

export default function AdminApplications() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [apps, setApps] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalApp, setModalApp] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([API.get('/admin/companies'), API.get('/admin/applications')])
      .then(([compRes, appRes]) => {
        setCompanies(compRes.data.data || []);
        setAllApps(appRes.data.data || []);
      }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      setApps(allApps.filter(a => (a.company?._id || a.company) === selectedCompany));
    } else {
      setApps(allApps);
    }
  }, [selectedCompany, allApps]);

  const filteredApps = statusFilter === 'All' ? apps : apps.filter(a => a.status === statusFilter);
  const counts = { Applied: 0, Shortlisted: 0, Selected: 0, Rejected: 0 };
  apps.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
  const total = apps.length;

  const openModal = (app) => { setModalApp(app); setModalStatus(app.status); setModalNote(app.adminNote || ''); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.patch(`/admin/applications/${modalApp._id}/status`, { status: modalStatus, adminNote: modalNote });
      setAllApps(prev => prev.map(a => a._id === modalApp._id ? { ...a, status: data.data.status, adminNote: data.data.adminNote } : a));
      toast.success(`Status → ${modalStatus}`);
      setModalApp(null);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const getSkillMatch = (app) => {
    if (!app.student?.skills || !app.company?.requiredSkills) return '—';
    const matched = app.student.skills.filter(s => app.company.requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase())).length;
    return `${matched} / ${app.company.requiredSkills.length}`;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#F1F0FF' }}>Applications</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '20px' }}>{allApps.length} total across all companies</p>

      {/* Company Selector */}
      <div style={{ marginBottom: '20px' }}>
        <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F1F0FF', fontSize: '0.9rem', outline: 'none', minWidth: '300px' }}>
          <option value="" style={{ background: '#1A1A2E' }}>All Companies</option>
          {companies.sort((a,b) => a.name.localeCompare(b.name)).map(c => <option key={c._id} value={c._id} style={{ background: '#1A1A2E' }}>{c.name}</option>)}
        </select>
      </div>

      {/* Funnel Bar */}
      {selectedCompany && total > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '4px', height: '36px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
            {['Applied', 'Shortlisted', 'Selected'].map(s => {
              const w = total > 0 ? (counts[s] / total * 100) : 0;
              if (w === 0) return null;
              return <div key={s} style={{ width: `${w}%`, background: STATUS_COLORS[s].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#FFF', minWidth: '40px', transition: 'width 0.3s' }}>{counts[s]}</div>;
            })}
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.78rem' }}>
            {['Applied', 'Shortlisted', 'Selected'].map(s => (
              <span key={s} style={{ color: STATUS_COLORS[s].color, fontWeight: 600 }}>{s}: {counts[s]} ({total > 0 ? Math.round(counts[s]/total*100) : 0}%)</span>
            ))}
            <span style={{ color: STATUS_COLORS.Rejected.color, fontWeight: 600 }}>Rejected: {counts.Rejected}</span>
          </div>
        </div>
      )}

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: statusFilter === s ? (s === 'All' ? '#6C63FF' : STATUS_COLORS[s]?.bg) : 'rgba(255,255,255,0.06)', color: statusFilter === s ? (s === 'All' ? '#FFF' : STATUS_COLORS[s]?.color) : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
            {s} {s !== 'All' ? `(${counts[s] || 0})` : `(${apps.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Student', 'Branch', 'CGPA', 'Skills Match', 'Applied On', 'Status', 'Note', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredApps.map(app => {
              const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Applied;
              return (
                <tr key={app._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '12px 14px', fontSize: '0.88rem', fontWeight: 600, color: '#F1F0FF' }}>{app.student?.name || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{app.student?.branch || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#F1F0FF' }}>{app.student?.cgpa || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{getSkillMatch(app)}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{app.status}</span></td>
                  <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.adminNote || ''}>{app.adminNote || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => openModal(app)} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.1)', color: '#A78BFA', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Update</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredApps.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.3)' }}>No applications found</div>}
      </div>

      {/* Status Update Modal */}
      {modalApp && (
        <div onClick={e => e.target === e.currentTarget && setModalApp(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#F1F0FF' }}>Update Status</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>{modalApp.student?.name} · {modalApp.company?.name}</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Status</label>
              <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F1F0FF', fontSize: '0.9rem', outline: 'none' }}>
                {['Applied', 'Shortlisted', 'Selected', 'Rejected'].map(s => <option key={s} value={s} style={{ background: '#1A1A2E' }}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Admin Note <span style={{ float: 'right', fontWeight: 400, textTransform: 'none' }}>{modalNote.length}/300</span></label>
              <textarea value={modalNote} onChange={e => setModalNote(e.target.value.slice(0,300))} placeholder="Optional note..." style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F1F0FF', fontSize: '0.9rem', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '11px', background: '#6C63FF', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setModalApp(null)} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
