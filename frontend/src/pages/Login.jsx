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
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-base)' }}>
      <div className="surface-card" style={{ width: '100%', maxWidth: '420px', padding: '48px', background: '#FFFFFF' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.03em' }}>Sign In</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Access your placement dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="input-group">
            <label className="input-label">College Email</label>
            <input className="input-field" type="email" name="email" required placeholder="name@iiitn.ac.in" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input-field" type="password" name="password" required placeholder="••••••••" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '16px', padding: '16px' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </p>

      </div>
    </div>
  );
}
