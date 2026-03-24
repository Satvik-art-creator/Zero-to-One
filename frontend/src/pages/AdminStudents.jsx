import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branches: [], cgpaMin: '', cgpaMax: '', backlogs: 'all' });

  useEffect(() => {
    API.get('/admin/students').then(res => setStudents(res.data.data || []))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const toggleBranch = (b) => {
    setFilters(f => ({
      ...f,
      branches: f.branches.includes(b) ? f.branches.filter(x => x !== b) : [...f.branches, b]
    }));
  };

  const resetFilters = () => setFilters({ branches: [], cgpaMin: '', cgpaMax: '', backlogs: 'all' });

  const filtered = students.filter(s => {
    if (filters.branches.length > 0 && !filters.branches.includes(s.branch)) return false;
    if (filters.cgpaMin && s.cgpa < parseFloat(filters.cgpaMin)) return false;
    if (filters.cgpaMax && s.cgpa > parseFloat(filters.cgpaMax)) return false;
    if (filters.backlogs === 'has' && s.backlogs === 0) return false;
    if (filters.backlogs === 'no' && s.backlogs > 0) return false;
    return true;
  });

  const inputStyle = { padding: '8px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F1F0FF', fontSize: '0.85rem', outline: 'none', width: '80px' };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#F1F0FF' }}>Student Directory</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '20px' }}>Read-only view · {filtered.length} of {students.length} students</p>

      {/* Filters */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Branch:</span>
          {['CSE', 'ECE'].map(b => (
            <button key={b} onClick={() => toggleBranch(b)} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: filters.branches.includes(b) ? '#6C63FF' : 'rgba(255,255,255,0.08)', color: filters.branches.includes(b) ? '#FFF' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>{b}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>CGPA:</span>
          <input type="number" step="0.1" placeholder="Min" value={filters.cgpaMin} onChange={e => setFilters({...filters, cgpaMin: e.target.value})} style={inputStyle} />
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
          <input type="number" step="0.1" placeholder="Max" value={filters.cgpaMax} onChange={e => setFilters({...filters, cgpaMax: e.target.value})} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Backlogs:</span>
          {['all', 'no', 'has'].map(v => (
            <button key={v} onClick={() => setFilters({...filters, backlogs: v})} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: filters.backlogs === v ? '#6C63FF' : 'rgba(255,255,255,0.08)', color: filters.backlogs === v ? '#FFF' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>{v === 'all' ? 'All' : v === 'no' ? 'No Backlogs' : 'Has Backlogs'}</button>
          ))}
        </div>
        <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#6C63FF', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Reset ✕</button>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Name', 'Email', 'Branch', 'CGPA', 'Backlogs', 'Skills', 'Apps', 'Resume'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, color: '#F1F0FF' }}>{s.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{s.email}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{s.branch}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, color: '#F1F0FF' }}>{s.cgpa}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: s.backlogs === 0 ? '#10D9A0' : '#F87171', fontWeight: 600, fontSize: '0.85rem' }}>{s.backlogs}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.skills?.join(', ')}>{s.skills?.join(', ') || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{s.applicationCount || 0}</td>
                <td style={{ padding: '12px 16px' }}>
                  {s.resumeUrl ? (
                    <a href={`http://localhost:5000${s.resumeUrl}`} target="_blank" rel="noreferrer" style={{ color: '#6C63FF', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>View</a>
                  ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.3)' }}>No students match filters</div>
        )}
      </div>
    </div>
  );
}
