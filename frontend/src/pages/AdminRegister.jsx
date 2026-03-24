import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { setToken, setStudent } from '../utils/auth';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith('@tnp.iiitn.ac.in')) {
      return toast.error('Admin registration requires a TNP email (@tnp.iiitn.ac.in)');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const { data } = await API.post('/admin-auth/register', form);
      setToken(data.token);
      setStudent(data.student);
      toast.success('Admin account created! Welcome to PlaceBridge 🛡️');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB',
    borderRadius: '12px', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s'
  };

  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase',
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
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>PlaceBridge</span>
          <span style={{ marginLeft: '12px', padding: '4px 12px', background: 'rgba(108,99,255,0.2)', color: '#A78BFA', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN</span>
        </div>

        <div style={{ zIndex: 1, marginTop: '-10vh' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(16,217,160,0.15)',
            color: '#10D9A0',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '24px'
          }}>
            TNP COORDINATOR PORTAL
          </div>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.1, color: '#FFFFFF', marginBottom: '20px', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Join the placement<br/>management team.
          </h1>
          <p style={{ color: '#A09DBE', fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px' }}>
            Create your TNP coordinator account to manage companies, applications, and placement drives.
          </p>

          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '24px', height: '4px', background: '#10D9A0', borderRadius: '2px' }} />
              <span style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Company Management</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.4 }}>
              <div style={{ width: '24px', height: '4px', background: '#5E5C7A', borderRadius: '2px' }} />
              <span style={{ color: '#A09DBE', fontSize: '0.9rem' }}>Application Tracking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.4 }}>
              <div style={{ width: '24px', height: '4px', background: '#5E5C7A', borderRadius: '2px' }} />
              <span style={{ color: '#A09DBE', fontSize: '0.9rem' }}>Placement Analytics</span>
            </div>
          </div>
        </div>

        <div style={{ color: '#5E5C7A', fontSize: '0.8rem' }}>
          © 2024 PlaceBridge · TNP Cell, IIIT Nagpur
        </div>
      </div>

      {/* RIGHT PANE - LIGHT */}
      <div style={{
        flex: 1,
        backgroundColor: '#FCFCFD',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>Create Admin Account</h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Register with your TNP email to access the admin panel.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" name="name" required placeholder="Dr. TNP Coordinator"
                value={form.name} onChange={handleChange} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label style={labelStyle}>TNP Email</label>
              <input
                type="email" name="email" required placeholder="name@tnp.iiitn.ac.in"
                value={form.email} onChange={handleChange} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '6px' }}>Must use your official TNP email (@tnp.iiitn.ac.in)</p>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" name="password" required placeholder="••••••••" minLength={6}
                value={form.password} onChange={handleChange} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '6px' }}>Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '12px', width: '100%', padding: '14px', background: '#5A52E5', color: '#FFFFFF',
                border: 'none', borderRadius: '999px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { if(!loading) e.target.style.background = '#4F46E5' }}
              onMouseOut={(e) => { if(!loading) e.target.style.background = '#5A52E5' }}
            >
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6B7280' }}>
            Already have an admin account? <Link to="/admin/login" style={{ color: '#5A52E5', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.82rem', color: '#9CA3AF' }}>
            <Link to="/register" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Student Registration</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
