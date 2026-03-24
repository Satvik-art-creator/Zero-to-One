import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

const TYPE_COLORS = { 'Drive Update': '#A78BFA', Result: '#10D9A0', Reminder: '#F59E0B', General: '#6B7280' };

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', type: 'General', companyId: '' });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get('/admin/announcements'),
      API.get('/admin/companies'),
    ]).then(([annRes, compRes]) => {
      setAnnouncements(annRes.data.data || []);
      setCompanies(compRes.data.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return toast.error('Title and body required');
    if (form.body.length > 500) return toast.error('Body max 500 characters');
    setPosting(true);
    try {
      const payload = { ...form, companyId: form.companyId || null };
      const { data } = await API.post('/admin/announcements', payload);
      setAnnouncements(prev => [data.data, ...prev]);
      setForm({ title: '', body: '', type: 'General', companyId: '' });
      toast.success('Announcement posted!');
    } catch (err) { toast.error('Post failed'); }
    finally { setPosting(false); }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await API.patch(`/admin/announcements/${id}/toggle`);
      setAnnouncements(prev => prev.map(a => a._id === id ? data.data : a));
    } catch { toast.error('Toggle failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/admin/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#111827', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#111827' }}>Announcements</h2>
      <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '28px' }}>Post updates visible on student dashboards</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        {/* Create Form */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#111827' }}>New Announcement</h3>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Title *</label>
              <input style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Goldman Sachs Drive Results" onFocus={e => e.target.style.borderColor='#6C63FF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Body * <span style={{ float: 'right', fontWeight: 400, textTransform: 'none' }}>{form.body.length}/500</span></label>
              <textarea style={{...inputStyle, minHeight: '120px', resize: 'vertical', lineHeight: 1.6}} value={form.body} onChange={e => setForm({...form, body: e.target.value.slice(0,500)})} placeholder="Announcement details..." onFocus={e => e.target.style.borderColor='#6C63FF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Type</label>
                <select style={inputStyle} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {['General', 'Drive Update', 'Result', 'Reminder'].map(t => <option key={t} value={t} style={{background:'#FFFFFF'}}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Company (optional)</label>
                <select style={inputStyle} value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})}>
                  <option value="" style={{background:'#FFFFFF'}}>None</option>
                  {companies.map(c => <option key={c._id} value={c._id} style={{background:'#FFFFFF'}}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={posting} style={{ padding: '12px', background: '#6C63FF', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: posting ? 0.7 : 1, transition: 'all 0.2s' }}>
              {posting ? 'Posting...' : '📢 Post Announcement'}
            </button>
          </form>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '8px' }}>Past Announcements ({announcements.length})</h3>
          {announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</p>
              <p>No announcements yet</p>
            </div>
          ) : announcements.map(a => (
            <div key={a._id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '18px 20px', transition: 'border-color 0.2s', opacity: a.isActive ? 1 : 0.6, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#111827' }}>{a.title}</h4>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, background: `${TYPE_COLORS[a.type] || '#6B7280'}15`, color: TYPE_COLORS[a.type] || '#6B7280' }}>{a.type}</span>
                  {!a.isActive && <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Hidden</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => toggleActive(a._id)} title={a.isActive ? 'Hide' : 'Show'} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: a.isActive ? '#10D9A0' : '#9CA3AF', fontSize: '0.8rem' }}>{a.isActive ? '👁️' : '👁️‍🗨️'}</button>
                  <button onClick={() => handleDelete(a._id)} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: '#EF4444', fontSize: '0.8rem' }}>🗑️</button>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 8px' }}>{a.body}</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: '#9CA3AF' }}>
                {a.companyId?.name && <span>🏢 {a.companyId.name}</span>}
                <span>📅 {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {a.createdBy?.name && <span>👤 {a.createdBy.name}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
