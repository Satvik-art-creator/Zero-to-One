import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { getStudent } from '../utils/auth';

const EMPTY_FORM = {
  name: '', jobRole: '', package: '', ctc: '', location: '', driveDate: '',
  minCGPA: 7.0, backlogPolicy: false, allowedBranches: ['CSE', 'ECE'],
  requiredSkills: '', description: '', website: '', logo: '', companyType: 'Service',
  tier: 'Tier 2', evaluationProcess: '', openings: '', bond: '',
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const student = getStudent();
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('companies');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Guard: admin only
  useEffect(() => {
    if (!student || student.role !== 'admin') {
      toast.error('Access denied: Admins only');
      navigate('/dashboard');
    }
  }, [student, navigate]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/companies'),
      API.get('/applications/all'),
    ]).then(([compRes, appRes]) => {
      setCompanies(compRes.data.data || []);
      setApplications(appRes.data.data || []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (company) => {
    setForm({
      ...company,
      requiredSkills: company.requiredSkills?.join(', ') || '',
      allowedBranches: company.allowedBranches || ['CSE', 'ECE'],
      evaluationProcess: company.evaluationProcess?.join('\n') || '',
      openings: company.openings || '',
      bond: company.bond || '',
    });
    setEditingId(company._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        ctc: parseFloat(form.ctc) || 0,
        minCGPA: parseFloat(form.minCGPA) || 0,
        openings: parseInt(form.openings) || null,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        evaluationProcess: form.evaluationProcess.split('\n').map((s) => s.trim()).filter(Boolean),
        allowedBranches: typeof form.allowedBranches === 'string' ? form.allowedBranches.split(',').map(s => s.trim()) : form.allowedBranches,
        bond: form.bond || null,
        logo: form.logo || '',
      };
      if (editingId) {
        const res = await API.put(`/companies/${editingId}`, payload);
        setCompanies((prev) => prev.map((c) => c._id === editingId ? res.data.data : c));
        toast.success('Company updated!');
      } else {
        const res = await API.post('/companies', payload);
        setCompanies((prev) => [...prev, res.data.data]);
        toast.success('Company added!');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      toast.success('Company deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      const res = await API.patch(`/applications/${appId}/status`, { status });
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status: res.data.data.status } : a));
      toast.success(`Status → ${status}`);
    } catch {
      toast.error('Status update failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <header style={{ padding: '0 40px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13,13,18,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlaceBridge</span>
          <span className="badge badge-primary">Admin Panel</span>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[{ key: 'companies', label: '🏢 Companies' }, { key: 'applications', label: '📋 Applications' }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveView(key)} style={{ background: activeView === key ? 'var(--brand-primary-dim)' : 'none', border: 'none', borderRadius: 'var(--radius-pill)', padding: '7px 16px', fontSize: '0.85rem', fontWeight: 600, color: activeView === key ? 'var(--brand-primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <button className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '0.82rem' }} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>
        ) : activeView === 'companies' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Company Management</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{companies.length} companies · Admins can add, edit, or remove</p>
              </div>
              <button className="btn btn-primary" onClick={openAdd}>+ Add Company</button>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th><th>Role</th><th>Package</th><th>Type</th><th>Min CGPA</th><th>Drive Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.logo && <img src={c.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain', background: '#fff', borderRadius: '4px' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                          <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                        </div>
                      </td>
                      <td>{c.jobRole}</td>
                      <td style={{ color: 'var(--brand-success)', fontWeight: 700 }}>{c.package}</td>
                      <td><span className={`badge badge-${c.companyType?.toLowerCase() || 'neutral'}`}>{c.companyType}</span></td>
                      <td>{c.minCGPA}+</td>
                      <td>{c.driveDate !== 'TBD' ? new Date(c.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => handleDelete(c._id, c.name)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>All Applications</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{applications.length} total applications across all students</p>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Email</th><th>CGPA</th><th>Company</th><th>Role</th><th>Applied</th><th>Resume</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td><strong style={{ color: 'var(--text-primary)' }}>{app.student?.name || '—'}</strong></td>
                      <td style={{ fontSize: '0.8rem' }}>{app.student?.email || '—'}</td>
                      <td>{app.student?.cgpa || '—'}</td>
                      <td>{app.company?.name || '—'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{app.company?.jobRole || '—'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        {app.resumeUrl ? (
                          <a href={`http://localhost:5000${app.resumeUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', fontSize: '0.78rem', fontWeight: 600 }}>📄 View</a>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None</span>}
                      </td>
                      <td>
                        <select value={app.status} onChange={(e) => handleStatusUpdate(app._id, e.target.value)} className="input-field" style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}>
                          {['Applied', 'Shortlisted', 'Selected', 'Rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box" style={{ maxWidth: '700px' }}>
            <div style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>{editingId ? 'Edit Company' : 'Add New Company'}</h3>
              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group"><label className="input-label">Company Name *</label><input className="input-field" name="name" required value={form.name} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">Job Role *</label><input className="input-field" name="jobRole" required value={form.jobRole} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">Package (display) *</label><input className="input-field" name="package" required placeholder="e.g. 12 LPA" value={form.package} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">CTC (numeric LPA) *</label><input className="input-field" type="number" step="0.1" name="ctc" required value={form.ctc} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">Location *</label><input className="input-field" name="location" required value={form.location} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">Drive Date</label><input className="input-field" type="date" name="driveDate" value={form.driveDate} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">Min CGPA *</label><input className="input-field" type="number" step="0.1" min="0" max="10" name="minCGPA" required value={form.minCGPA} onChange={handleChange} /></div>
                <div className="input-group"><label className="input-label">Company Type</label>
                  <select className="input-field" name="companyType" value={form.companyType} onChange={handleChange}>
                    {['Product', 'Service', 'Startup', 'Consulting', 'BFSI'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="input-group"><label className="input-label">Tier</label>
                  <select className="input-field" name="tier" value={form.tier} onChange={handleChange}>
                    {['Tier 1', 'Tier 2', 'Tier 3', 'Service-Based', 'Startup'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="input-group"><label className="input-label">Openings</label><input className="input-field" type="number" name="openings" value={form.openings} onChange={handleChange} /></div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}><label className="input-label">Required Skills (comma-separated)</label><input className="input-field" name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="DSA, Java, Python, System Design" /></div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}><label className="input-label">Allowed Branches</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {['CSE', 'ECE'].map((b) => (
                      <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={form.allowedBranches?.includes(b)} onChange={(e) => setForm((f) => ({ ...f, allowedBranches: e.target.checked ? [...(f.allowedBranches || []), b] : (f.allowedBranches || []).filter((x) => x !== b) }))} style={{ accentColor: 'var(--brand-primary)' }} /> {b}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label className="input-label">Evaluation Process (one step per line)</label>
                  <textarea className="input-field" name="evaluationProcess" rows={4} value={form.evaluationProcess} onChange={handleChange} placeholder={"Online Test\nTechnical Interview\nHR Round"} style={{ resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="input-field" name="description" rows={3} value={form.description} onChange={handleChange} style={{ resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <div className="input-group"><label className="input-label">Website</label><input className="input-field" name="website" value={form.website} onChange={handleChange} placeholder="https://careers.company.com" /></div>
                <div className="input-group"><label className="input-label">Logo URL</label><input className="input-field" name="logo" value={form.logo} onChange={handleChange} placeholder="https://logo.clearbit.com/hostname.com" /></div>
                <div className="input-group"><label className="input-label">Bond (if any)</label><input className="input-field" name="bond" value={form.bond} onChange={handleChange} placeholder="e.g. 2 years or leave blank" /></div>
                <div className="input-group" style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="backlogPolicy" id="backlogPolicy" checked={form.backlogPolicy} onChange={handleChange} style={{ accentColor: 'var(--brand-primary)' }} />
                  <label htmlFor="backlogPolicy" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Allow students with backlogs</label>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editingId ? 'Update Company' : 'Add Company'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
