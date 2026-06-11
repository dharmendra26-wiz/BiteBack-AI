import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const roles = [
  { value: 'CUSTOMER', label: '👤 Customer', desc: 'Buy discounted surplus food' },
  { value: 'SHOP', label: '🏪 Shop Owner', desc: 'List and sell your surplus items' },
  { value: 'FOOD_BANK', label: '🏦 Food Bank', desc: 'Receive surplus food donations' },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    role: params.get('role') || 'CUSTOMER',
    businessName: '', address: '', phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Welcome to Vesta AI 🌿');
      const role = result.data.role;
      if (role === 'SHOP') navigate('/shop/dashboard');
      else if (role === 'FOOD_BANK') navigate('/foodbank/dashboard');
      else navigate('/browse');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <h1 style={{ fontSize: 28 }}>Create your account</h1>
          </div>

          {/* Role selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {roles.map(r => (
              <button key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)',
                  border: form.role === r.value ? '2px solid var(--green-500)' : '1px solid rgba(255,255,255,0.1)',
                  background: form.role === r.value ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                  color: form.role === r.value ? 'var(--green-400)' : 'var(--gray-400)',
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                <span>{r.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="input" required placeholder="johndoe"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" required placeholder="you@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" required minLength={6} placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {(form.role === 'SHOP' || form.role === 'FOOD_BANK') && (
              <>
                <div className="form-group">
                  <label className="form-label">{form.role === 'SHOP' ? 'Business Name' : 'Food Bank Name'}</label>
                  <input className="input" placeholder="e.g. Green Valley Bakery"
                    value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="input" placeholder="e.g. 12 Maple Street, London"
                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="input" placeholder="+44 20 1234 5678"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--green-400)' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
