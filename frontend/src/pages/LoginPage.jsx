import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🌿');
      const role = result.data.role;
      if (role === 'SHOP') navigate('/shop/dashboard');
      else if (role === 'FOOD_BANK') navigate('/foodbank/dashboard');
      else navigate('/browse');
    } else {
      toast.error(result.error);
    }
  };

  const quickLogin = async (email) => {
    const result = await login(email, 'demo123');
    if (result.success) {
      toast.success('Demo login! 🌿');
      const role = result.data.role;
      if (role === 'SHOP') navigate('/shop/dashboard');
      else if (role === 'FOOD_BANK') navigate('/foodbank/dashboard');
      else navigate('/browse');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
            <h1 style={{ fontSize: 28 }}>Welcome back</h1>
            <p className="text-muted text-sm" style={{ marginTop: 8 }}>Sign in to your Vesta AI account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="you@email.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider" />

          <div>
            <p className="text-sm text-muted" style={{ textAlign: 'center', marginBottom: 12 }}>Quick demo login</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => quickLogin('shop@demo.com')} className="btn btn-secondary" style={{ justifyContent: 'center' }}>🏪 Shop Demo</button>
              <button onClick={() => quickLogin('customer@demo.com')} className="btn btn-secondary" style={{ justifyContent: 'center' }}>👤 Customer Demo</button>
              <button onClick={() => quickLogin('foodbank@demo.com')} className="btn btn-secondary" style={{ justifyContent: 'center' }}>🏦 Food Bank Demo</button>
            </div>
          </div>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 24 }}>
            No account? <Link to="/register" style={{ color: 'var(--green-400)' }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
