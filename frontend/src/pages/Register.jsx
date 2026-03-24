import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { setToken, setStudent } from '../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', cgpa: '', branch: 'CSE', year: '3rd', backlogs: '0', skills: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
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
    if (!form.email.endsWith('@iiitn.ac.in') && !form.email.endsWith('@tnp.iiitn.ac.in')) {
      return toast.error('Use your IIIT Nagpur institutional email (@iiitn.ac.in or @tnp.iiitn.ac.in)');
    }
    if (!resumeFile) {
      return toast.error('Please upload your resume to continue');
    }

    setLoading(true);
    try {
      // Step 1: Register student account
      const { data } = await API.post('/auth/register', {
        ...form,
      });
      setToken(data.token);
      setStudent(data.student);

      // Step 2: Upload resume
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const resumeRes = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (resumeRes.data.skills) {
        const finalSkills = resumeRes.data.skills;
        // Update stored student with merged skills
        const updatedStudent = { ...data.student, skills: finalSkills, resumeUrl: resumeRes.data.resumeUrl };
        setStudent(updatedStudent);

        // Show warning if document validation failed
        if (resumeRes.data.warning) {
          toast.error(resumeRes.data.warning, { duration: 6000 });
        }

        if (resumeRes.data.extractedSkills?.length > 0) {
          const method = resumeRes.data.extractionMethod === 'ai' ? '🤖 AI' : '🔍 Keyword';
          toast.success(`Resume parsed! ${method} extracted ${resumeRes.data.extractedSkills.length} skills ✨`);
        } else {
          toast.success('Registration successful! Skills saved.');
        }
      } else {
        const updatedStudent = { ...data.student, resumeUrl: resumeRes.data.resumeUrl };
        setStudent(updatedStudent);
        if (resumeRes.data.warning) {
          toast.error(resumeRes.data.warning, { duration: 6000 });
        }
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
    if (!form.email.endsWith('@iiitn.ac.in') && !form.email.endsWith('@tnp.iiitn.ac.in')) {
      return toast.error('Use your IIIT Nagpur institutional email');
    }
    setStep(2);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', 
    borderRadius: '10px', color: '#111827', fontSize: '0.92rem', outline: 'none', transition: 'all 0.2s'
  };

  const labelStyle = { 
    fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', 
    letterSpacing: '0.05em', marginBottom: '6px', display: 'block' 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: 'var(--font-body)' }}>
      {/* LEFT PANE - DARK */}
      <div className="desktop-block" style={{ 
        flex: 1, 
        backgroundColor: '#0D0D12', 
        padding: '60px 80px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>PlaceBridge</span>
        </div>

        {/* Center Content */}
        <div style={{ zIndex: 1, marginTop: '-10vh' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '4px 12px', 
            background: 'rgba(167, 139, 250, 0.15)', 
            color: '#A78BFA', 
            borderRadius: '20px', 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em', 
            marginBottom: '24px' 
          }}>
            THE DIGITAL ATELIER
          </div>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.1, color: '#FFFFFF', marginBottom: '20px', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Begin your placement<br/>journey today.
          </h1>
          <p style={{ color: '#A09DBE', fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px' }}>
            Create your profile, check eligibility, and discover curated placements tailored to your trajectory.
          </p>

          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '24px', height: '4px', background: '#6C63FF', borderRadius: '2px' }} />
              <span style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Curated Match</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.4 }}>
              <div style={{ width: '24px', height: '4px', background: '#5E5C7A', borderRadius: '2px' }} />
              <span style={{ color: '#A09DBE', fontSize: '0.9rem' }}>Advisor Review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.4 }}>
              <div style={{ width: '24px', height: '4px', background: '#5E5C7A', borderRadius: '2px' }} />
              <span style={{ color: '#A09DBE', fontSize: '0.9rem' }}>Placement Secured</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ color: '#5E5C7A', fontSize: '0.8rem' }}>
          © 2024 PlaceBridge
        </div>
      </div>

      {/* RIGHT PANE - LIGHT */}
      <div style={{ 
        flex: 1.2, 
        backgroundColor: '#FCFCFD', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px' 
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>Create Account</h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Join PlaceBridge via your IIITN email.</p>
          </div>

          {step === 1 ? (
            <form onSubmit={goNext} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name</label>
                <input 
                  type="text" name="name" required placeholder="John Doe" 
                  value={form.name} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>College Email</label>
                <input 
                  type="email" name="email" required placeholder="name@iiitn.ac.in" 
                  value={form.email} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Password</label>
                <input 
                  type="password" name="password" required placeholder="••••••••" 
                  value={form.password} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              
              <div>
                <label style={labelStyle}>CGPA</label>
                <input 
                  type="number" step="0.01" name="cgpa" required placeholder="8.5" 
                  value={form.cgpa} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div>
                <label style={labelStyle}>Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} style={inputStyle}>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <select name="year" value={form.year} onChange={handleChange} style={inputStyle}>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Active Backlogs</label>
                <input 
                  type="number" name="backlogs" required placeholder="0" 
                  value={form.backlogs} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Skills (Comma Separated)</label>
                <input 
                  type="text" name="skills" placeholder="React, Node.js, Python, DSA" 
                  value={form.skills} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  gridColumn: '1 / -1', marginTop: '12px', padding: '14px', background: '#5A52E5', 
                  color: '#FFFFFF', border: 'none', borderRadius: '999px', fontSize: '0.95rem', 
                  fontWeight: 600, cursor: 'pointer' 
                }}
              >
                Continue
              </button>
            </form>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <button 
                onClick={() => setStep(1)} 
                style={{ 
                  background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', 
                  fontSize: '0.85rem', marginBottom: '20px', padding: 0, fontWeight: 500 
                }}
              >
                ← Back to profile
              </button>
              
              <h3 style={{ fontSize: '1.2rem', color: '#111827', marginBottom: '24px' }}>Upload Resume</h3>
              
              <div 
                className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{ 
                  border: '2px dashed #E5E7EB', borderRadius: '16px', padding: '48px 32px', 
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: '#FFFFFF'
                }}
              >
                <input type="file" ref={fileRef} accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleResumeChange(e.target.files[0])} />
                
                {resumePreview ? (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📄</div>
                    <p style={{ color: '#059669', fontWeight: 600, fontSize: '1rem' }}>{resumePreview}</p>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px' }}>Click or drag to replace</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>📤</div>
                    <p style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Click to upload or drag and drop</p>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>PDF, DOCX (Max 5MB)</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '32px' }}>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || !resumeFile}
                  style={{ 
                    width: '100%', padding: '14px', background: '#5A52E5', color: '#FFFFFF', 
                    border: 'none', borderRadius: '999px', fontSize: '0.95rem', fontWeight: 600, 
                    cursor: 'pointer', opacity: (loading || !resumeFile) ? 0.7 : 1 
                  }}
                >
                  {loading ? 'Creating account...' : 'Complete Account Setup'}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6B7280' }}>
            Already have an account? <Link to="/login" style={{ color: '#5A52E5', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
