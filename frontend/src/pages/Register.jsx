import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { setToken, setStudent } from '../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', cgpa: '', branch: 'CSE', year: '3rd', backlogs: '0',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: profile, 2: resume
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleResumeChange = (file) => {
    if (!file) return;
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Only PDF, DOC, or DOCX files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setResumeFile(file);
    setResumePreview(file.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleResumeChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith('@iiitn.ac.in')) {
      return toast.error('Use your IIIT Nagpur institutional email (@iiitn.ac.in)');
    }
    if (!resumeFile) {
      return toast.error('Please upload your resume to continue');
    }

    setLoading(true);
    try {
      // Step 1: Register student account
      const { data } = await API.post('/auth/register', {
        ...form,
        skills: [], // Will be populated from resume
      });
      setToken(data.token);
      setStudent(data.student);

      // Step 2: Upload resume
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const resumeRes = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (resumeRes.data.extractedSkills?.length > 0) {
        setExtractedSkills(resumeRes.data.extractedSkills);
        // Update stored student with skills
        const updatedStudent = { ...data.student, skills: resumeRes.data.extractedSkills, resumeUrl: resumeRes.data.resumeUrl };
        setStudent(updatedStudent);
        toast.success(`Resume parsed! Found ${resumeRes.data.extractedSkills.length} skills ✨`);
      } else {
        const updatedStudent = { ...data.student, resumeUrl: resumeRes.data.resumeUrl };
        setStudent(updatedStudent);
        toast.success('Registration successful!');
      }

      navigate('/eligibility-summary');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const goNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.cgpa) {
      return toast.error('Please fill all required fields');
    }
    if (!form.email.endsWith('@iiitn.ac.in')) {
      return toast.error('Use your IIIT Nagpur institutional email');
    }
    setStep(2);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlaceBridge</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>IIIT Nagpur Placement Platform</p>
        </div>

        <div className="card" style={{ padding: '40px' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 1 ? 'var(--brand-primary)' : 'var(--border-color)', transition: 'var(--transition-slow)' }} />
            <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 2 ? 'var(--brand-primary)' : 'var(--border-color)', transition: 'var(--transition-slow)' }} />
          </div>

          {step === 1 && (
            <>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>Step 1 of 2 — Your Academic Profile</p>

              <form onSubmit={goNext} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label className="input-label">Full Name</label>
                  <input className="input-field" name="name" required placeholder="Rahul Sharma" value={form.name} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label className="input-label">College Email</label>
                  <input className="input-field" type="email" name="email" required placeholder="name@iiitn.ac.in" value={form.email} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label className="input-label">Password</label>
                  <input className="input-field" type="password" name="password" required minLength={6} placeholder="••••••••" value={form.password} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">CGPA</label>
                  <input className="input-field" type="number" step="0.01" name="cgpa" required min={0} max={10} placeholder="8.5" value={form.cgpa} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Branch</label>
                  <select className="input-field" name="branch" value={form.branch} onChange={handleChange}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Year</label>
                  <select className="input-field" name="year" value={form.year} onChange={handleChange}>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Active Backlogs</label>
                  <input className="input-field" type="number" name="backlogs" required min={0} placeholder="0" value={form.backlogs} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: '1/-1', marginTop: '8px', padding: '14px' }}>
                  Continue →
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ← Back
              </button>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Upload Your Resume</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>Step 2 of 2 — We'll extract your skills automatically</p>

              <form onSubmit={handleSubmit}>
                {/* Drop zone */}
                <label
                  htmlFor="resume-upload"
                  className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ marginBottom: '24px', display: 'block', cursor: 'pointer' }}
                >
                  <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files.length > 0) { handleResumeChange(e.target.files[0]) } }} />
                  {resumePreview ? (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
                      <p style={{ color: 'var(--brand-success)', fontWeight: 600, fontSize: '0.9rem' }}>{resumePreview}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📤</div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Drop your resume here</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>PDF, DOC, DOCX — max 5MB</p>
                    </div>
                  )}
                </label>

                <div style={{ padding: '16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    💡 <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong> We extract your technical skills from the resume and use them to match you with relevant companies. Your resume will also be sent to companies when you apply.
                  </p>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading || !resumeFile} style={{ width: '100%', padding: '14px' }}>
                  {loading ? 'Creating account...' : 'Complete Registration 🚀'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
