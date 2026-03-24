import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { setToken, setStudent } from '../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', cgpa: '', branch: 'CSE', year: '3rd', backlogs: '0', skills: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith('@iiitn.ac.in')) {
      return toast.error('Use your IIIT Nagpur institutional email (@iiitn.ac.in)');
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      setToken(data.token);
      setStudent(data.student);
      toast.success('Registration successful!');
      navigate('/eligibility-summary');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-base)' }}>
      <div className="surface-card" style={{ width: '100%', maxWidth: '540px', padding: '48px', background: '#FFFFFF' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.03em' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Join PlaceBridge via your IIITN email</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
          
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Full Name</label>
            <input className="input-field" name="name" required placeholder="John Doe" onChange={handleChange} />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">College Email</label>
            <input className="input-field" type="email" name="email" required placeholder="name@iiitn.ac.in" onChange={handleChange} />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Password</label>
            <input className="input-field" type="password" name="password" required minLength={6} placeholder="••••••••" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">CGPA</label>
            <input className="input-field" type="number" step="0.01" name="cgpa" required min={0} max={10} placeholder="8.5" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Branch</label>
            <select className="input-field" name="branch" value={form.branch} onChange={handleChange} style={{ appearance: 'none' }}>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Year</label>
            <select className="input-field" name="year" value={form.year} onChange={handleChange} style={{ appearance: 'none' }}>
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

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Skills (comma separated)</label>
            <input className="input-field" name="skills" required placeholder="React, Node.js, Python, DSA" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ gridColumn: '1 / -1', marginTop: '24px', padding: '16px' }}>
            {loading ? 'Registering...' : 'Get Started'}
          </button>

        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in here</Link>
        </p>

      </div>
    </div>
  );
}
