import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { setToken, setStudent } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      setToken(data.token);
      setStudent(data.student);
      toast.success(`Welcome back, ${data.student.name.split(' ')[0]}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
            Your placement<br/>journey starts here.
          </h1>
          <p style={{ color: '#A09DBE', fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px' }}>
            Access your curated eligibility matches and placement dashboard.
          </p>
        </div>

        {/* Footer */}
        <div style={{ color: '#5E5C7A', fontSize: '0.8rem' }}>
          © 2024 PlaceBridge
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
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>Sign In</h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Access your placement dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="name@iiitn.ac.in" 
                onChange={handleChange} 
                style={{
                  width: '100%', padding: '14px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', 
                  borderRadius: '12px', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••" 
                onChange={handleChange} 
                style={{
                  width: '100%', padding: '14px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', 
                  borderRadius: '12px', color: '#111827', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6B7280' }}>
            Don't have an account? <Link to="/register" style={{ color: '#5A52E5', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
