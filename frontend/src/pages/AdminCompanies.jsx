import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

const TYPE_COLORS = { Product: '#A78BFA', Service: '#38BDF8', Startup: '#34D399', Consulting: '#FBBF24', BFSI: '#F87171' };

const EMPTY_FORM = {
  name: '', jobRole: '', package: '', ctc: '', location: '', driveDate: '',
  minCGPA: 7.0, backlogPolicy: false, allowedBranches: ['CSE', 'ECE'],
  requiredSkills: '', description: '', website: '', logo: '', companyType: 'Service',
  tier: 'Tier 2', evaluationProcess: '', openings: '', bond: '',
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterTier, setFilterTier] = useState('All');
  const [sortCol, setSortCol] = useState('driveDate');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    API.get('/admin/companies').then(res => setCompanies(res.data.data || []))
      .catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (confirmDelete) {
      const t = setTimeout(() => setConfirmDelete(null), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmDelete]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ ...c, requiredSkills: c.requiredSkills?.join(', ') || '', allowedBranches: c.allowedBranches || ['CSE', 'ECE'], evaluationProcess: c.evaluationProcess?.join('\n') || '', openings: c.openings || '', bond: c.bond || '' });
    setEditingId(c._id); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, ctc: parseFloat(form.ctc) || 0, minCGPA: parseFloat(form.minCGPA) || 0, openings: parseInt(form.openings) || null, requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean), evaluationProcess: form.evaluationProcess.split('\n').map(s => s.trim()).filter(Boolean), allowedBranches: typeof form.allowedBranches === 'string' ? form.allowedBranches.split(',').map(s => s.trim()) : form.allowedBranches, bond: form.bond || null, logo: form.logo || '' };
      if (editingId) {
        const res = await API.put(`/admin/companies/${editingId}`, payload);
        setCompanies(prev => prev.map(c => c._id === editingId ? { ...res.data.data, applicantCount: c.applicantCount } : c));
        toast.success('Company updated!');
      } else {
        const res = await API.post('/admin/companies', payload);
        setCompanies(prev => [...prev, { ...res.data.data, applicantCount: 0 }]);
        toast.success('Company added!');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    try {
      await API.delete(`/admin/companies/${id}`);
      setCompanies(prev => prev.filter(c => c._id !== id));
      toast.success('Company deleted');
    } catch { toast.error('Delete failed'); }
    setConfirmDelete(null);
  };

  const handleSort = (col) => { setSortDir(sortCol === col && sortDir === 'asc' ? 'desc' : 'asc'); setSortCol(col); };

  const filtered = companies.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'All' && c.companyType !== filterType) return false;
    if (filterTier !== 'All' && c.tier !== filterTier) return false;
    return true;
  }).sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (sortCol === 'ctc' || sortCol === 'minCGPA') { va = Number(va) || 0; vb = Number(vb) || 0; }
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F1F0FF', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px', display: 'block' };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: '#F1F0FF' }}>Companies</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{companies.length} companies total</p>
        </div>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: '#6C63FF', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>+ Add Company</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search companies..." style={{ ...inputStyle, maxWidth: '280px' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: '130px' }}>
          <option value="All" style={{ background: '#1A1A2E' }}>All Types</option>
          {['Product', 'Service', 'Startup', 'Consulting', 'BFSI'].map(t => <option key={t} value={t} style={{ background: '#1A1A2E' }}>{t}</option>)}
        </select>
        <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: '130px' }}>
          <option value="All" style={{ background: '#1A1A2E' }}>All Tiers</option>
          {['Tier 1', 'Tier 2', 'Tier 3', 'Service-Based', 'Startup'].map(t => <option key={t} value={t} style={{ background: '#1A1A2E' }}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {[{k:'name',l:'Company'},{k:'companyType',l:'Type'},{k:'tier',l:'Tier'},{k:'ctc',l:'Package'},{k:'minCGPA',l:'Min CGPA'},{k:'driveDate',l:'Drive Date'},{k:'openings',l:'Openings'},{k:'backlogPolicy',l:'Backlogs'},{k:'applicantCount',l:'Apps'},{k:'actions',l:'Actions'}].map(h => (
                <th key={h.k} onClick={() => h.k !== 'actions' && handleSort(h.k)} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: h.k !== 'actions' ? 'pointer' : 'default', userSelect: 'none' }}>
                  {h.l} {sortCol === h.k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const isUpcoming = c.driveDate && c.driveDate !== 'TBD' && (new Date(c.driveDate) - new Date()) / 86400000 <= 7 && (new Date(c.driveDate) - new Date()) >= 0;
              return (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {c.logo && <img src={c.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain', background: '#fff', borderRadius: '4px' }} onError={e => e.target.style.display='none'} />}
                      <strong style={{ color: '#F1F0FF', fontSize: '0.88rem' }}>{c.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: `${TYPE_COLORS[c.companyType] || '#6B7280'}20`, color: TYPE_COLORS[c.companyType] || '#6B7280' }}>{c.companyType}</span></td>
                  <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>{c.tier}</span></td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#10D9A0' }}>{c.ctc ? `${c.ctc} LPA` : c.package}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#F1F0FF' }}>{c.minCGPA}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: isUpcoming ? '#F59E0B' : 'rgba(255,255,255,0.5)' }}>{c.driveDate && c.driveDate !== 'TBD' ? new Date(c.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{c.openings || '—'}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ color: c.backlogPolicy ? '#10D9A0' : '#F87171', fontSize: '0.82rem', fontWeight: 600 }}>{c.backlogPolicy ? '✓ Allowed' : '✗ No'}</span></td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{c.applicantCount || 0}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(c)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.1)', color: '#A78BFA', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(c._id, c.name)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,80,80,0.4)', background: confirmDelete === c._id ? 'rgba(255,80,80,0.3)' : 'rgba(255,80,80,0.1)', color: '#ff5050', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{confirmDelete === c._id ? 'Confirm?' : 'Delete'}</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.3)' }}>No companies match</div>}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div onClick={e => e.target === e.currentTarget && setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#F1F0FF' }}>{editingId ? 'Edit Company' : 'Add New Company'}</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Fill in the details below</p>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div><label style={labelStyle}>Company Name *</label><input style={inputStyle} name="name" required value={form.name} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Job Role *</label><input style={inputStyle} name="jobRole" required value={form.jobRole} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Package (display)</label><input style={inputStyle} name="package" placeholder="e.g. 12-18 LPA" value={form.package} onChange={handleChange} /></div>
              <div><label style={labelStyle}>CTC (numeric LPA) *</label><input style={inputStyle} type="number" step="0.1" name="ctc" required value={form.ctc} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Logo URL</label><input style={inputStyle} name="logo" value={form.logo} onChange={handleChange} placeholder="https://logo.clearbit.com/..." /></div>
              <div><label style={labelStyle}>Website</label><input style={inputStyle} name="website" value={form.website} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Location</label><input style={inputStyle} name="location" value={form.location} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Drive Date</label><input style={inputStyle} type="date" name="driveDate" value={form.driveDate} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Company Type *</label>
                <select style={inputStyle} name="companyType" value={form.companyType} onChange={handleChange}>
                  {['Product', 'Service', 'Startup', 'Consulting', 'BFSI'].map(t => <option key={t} value={t} style={{background:'#1A1A2E'}}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Tier *</label>
                <select style={inputStyle} name="tier" value={form.tier} onChange={handleChange}>
                  {['Tier 1', 'Tier 2', 'Tier 3', 'Service-Based', 'Startup'].map(t => <option key={t} value={t} style={{background:'#1A1A2E'}}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Min CGPA *</label><input style={inputStyle} type="number" step="0.1" min="0" max="10" name="minCGPA" required value={form.minCGPA} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Openings</label><input style={inputStyle} type="number" name="openings" value={form.openings} onChange={handleChange} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Required Skills (comma-separated)</label><input style={inputStyle} name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="DSA, Java, Python" /><p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Students need at least 1 matching skill. Skills are matched case-insensitively.</p></div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Allowed Branches</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['CSE', 'ECE', 'ME', 'Civil', 'EE'].map(b => (
                    <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                      <input type="checkbox" checked={form.allowedBranches?.includes(b)} onChange={e => setForm(f => ({ ...f, allowedBranches: e.target.checked ? [...(f.allowedBranches || []), b] : (f.allowedBranches || []).filter(x => x !== b) }))} style={{ accentColor: '#6C63FF' }} /> {b}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Evaluation Process (one step per line)</label><textarea style={{...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6}} name="evaluationProcess" value={form.evaluationProcess} onChange={handleChange} placeholder={"Online Test\nTechnical Interview\nHR Round"} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Description</label><textarea style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} name="description" value={form.description} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Bond</label><input style={inputStyle} name="bond" value={form.bond} onChange={handleChange} placeholder="e.g. 2 years" /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
                <input type="checkbox" name="backlogPolicy" checked={form.backlogPolicy} onChange={handleChange} style={{ accentColor: '#6C63FF' }} />
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Allow students with backlogs</label>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: '#6C63FF', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : editingId ? 'Update Company' : 'Add Company'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
