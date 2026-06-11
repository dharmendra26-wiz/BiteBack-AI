import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';

const CATEGORIES = ['Bakery', 'Produce', 'Dairy', 'Deli', 'Beverages', 'Prepared', 'Other'];
const DIETARY = ['Vegan', 'Vegetarian', 'Gluten-Free', 'High-Protein', 'Dairy-Free', 'Organic', 'Halal'];

function AddListingModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '', description: '', imageUrl: '', originalPrice: '',
    discountedPrice: '', quantity: '', category: 'Bakery',
    dietaryTags: [], expiresAt: '', co2Saved: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [aiPricing, setAiPricing] = useState(null);
  const [gettingPrice, setGettingPrice] = useState(false);

  const getAiPrice = async () => {
    if (!form.originalPrice || !form.expiresAt) {
      toast.error('Fill in original price and expiry first');
      return;
    }
    setGettingPrice(true);
    try {
      const hours = (new Date(form.expiresAt) - new Date()) / 3600000;
      const { data } = await api.post('/ai/price', {
        itemName: form.title || 'Food item',
        category: form.category,
        originalPrice: parseFloat(form.originalPrice),
        quantity: parseInt(form.quantity) || 10,
        hoursUntilExpiry: Math.max(0.5, hours),
        timeOfDay: new Date().getHours(),
      });
      setAiPricing(data);
      setForm(f => ({ ...f, discountedPrice: data.suggestedPrice.toFixed(2) }));
      toast.success('AI price suggestion applied! 🤖');
    } catch {
      toast.error('AI pricing unavailable');
    } finally {
      setGettingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/surplus', { ...form, dietaryTags: form.dietaryTags.join(',') });
      toast.success('Listing created! 🎉');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24, overflowY: 'auto' }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card" style={{ maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: 24 }}>➕ New Surplus Listing</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid grid-2 gap-4">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Title *</label>
              <input className="input" required placeholder="e.g. Artisan Sourdough Loaves"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="textarea" placeholder="Describe the items..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="input" type="number" min={1} required placeholder="e.g. 10"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Original Price (£) *</label>
              <input className="input" type="number" step="0.01" min="0" required placeholder="10.00"
                value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Expires At *</label>
              <input className="input" type="datetime-local" required
                value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>

          {/* AI Price suggestion */}
          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid var(--border-green)', borderRadius: 12, padding: 16 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: aiPricing ? 12 : 0 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>🤖 AI Smart Pricing</div>
                <div className="text-muted text-xs">Let AI suggest the optimal discount</div>
              </div>
              <button type="button" onClick={getAiPrice} className="btn btn-sm btn-secondary" disabled={gettingPrice}>
                {gettingPrice ? 'Thinking…' : 'Get AI Price'}
              </button>
            </div>
            {aiPricing && (
              <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <div className="flex justify-between" style={{ marginBottom: 4 }}>
                  <span className="text-sm text-muted">Suggested Price</span>
                  <span style={{ color: 'var(--green-400)', fontWeight: 700 }}>£{aiPricing.suggestedPrice}</span>
                </div>
                <div className="flex justify-between" style={{ marginBottom: 4 }}>
                  <span className="text-sm text-muted">Discount</span>
                  <span className={`badge ${aiPricing.urgency === 'CRITICAL' ? 'badge-red' : 'badge-orange'}`}>{aiPricing.discountPct}% off</span>
                </div>
                <p className="text-xs text-muted" style={{ marginTop: 6 }}>{aiPricing.reason}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Discounted Price (£) *</label>
            <input className="input" type="number" step="0.01" min="0" required placeholder="4.50"
              value={form.discountedPrice} onChange={e => setForm({ ...form, discountedPrice: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input className="input" type="url" placeholder="https://..."
              value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Dietary Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIETARY.map(tag => (
                <button key={tag} type="button"
                  onClick={() => setForm(f => ({
                    ...f, dietaryTags: f.dietaryTags.includes(tag)
                      ? f.dietaryTags.filter(t => t !== tag)
                      : [...f.dietaryTags, tag]
                  }))}
                  className={`badge ${form.dietaryTags.includes(tag) ? 'badge-green' : 'badge-gray'}`}
                  style={{ cursor: 'pointer' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3" style={{ marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Posting…' : 'Post Listing'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ShopDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [claims, setClaims] = useState([]);

  const fetchData = async () => {
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        api.get('/surplus/my'),
        api.get('/claims/shop'),
      ]);
      setItems(itemsRes.data);
      setClaims(claimsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const available = items.filter(i => i.status === 'AVAILABLE' || i.status === 'PARTIALLY_CLAIMED');
  const totalSaved = items.reduce((acc, i) => acc + (i.co2Saved || 0), 0);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/surplus/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>🏪 Shop Dashboard</h1>
            <p className="text-muted" style={{ marginTop: 4 }}>
              {user?.businessName || user?.username} — manage your surplus listings
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/shop/scanner" className="btn btn-secondary">📷 AI Scanner</Link>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">+ New Listing</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-4 gap-4" style={{ marginBottom: 32 }}>
          {[
            { v: items.length, l: 'Total Listings', icon: '📋' },
            { v: available.length, l: 'Active Now', icon: '✅' },
            { v: claims.length, l: 'Total Claims', icon: '🛒' },
            { v: `${totalSaved.toFixed(1)}kg`, l: 'CO₂ Saved', icon: '🌍' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value">{s.v}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Your Listings</h2>
        {loading ? (
          <div className="flex justify-center" style={{ padding: 60 }}><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h3 style={{ marginBottom: 8 }}>No listings yet</h3>
            <p className="text-muted" style={{ marginBottom: 24 }}>Add your first surplus item to get started</p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ margin: '0 auto' }}>+ Create First Listing</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=100'} alt=""
                  style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <strong>{item.title}</strong>
                    <span className={`badge ${item.status === 'AVAILABLE' ? 'badge-green' : item.status === 'CLAIMED' ? 'badge-teal' : 'badge-orange'}`}>{item.status}</span>
                  </div>
                  <div className="text-sm text-muted">{item.category} · Qty: {item.quantity} · £{item.discountedPrice}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent claims */}
        {claims.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ marginBottom: 16, fontSize: 20 }}>Recent Claims</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {claims.slice(0, 5).map(c => (
                <div key={c.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                  <div>
                    <div className="text-sm"><strong>{c.surplusItem?.title}</strong></div>
                    <div className="text-xs text-muted">by {c.customer?.username} · qty: {c.quantityClaimed}</div>
                  </div>
                  <span className={`badge ${c.status === 'COLLECTED' ? 'badge-green' : c.status === 'CANCELLED' ? 'badge-red' : 'badge-orange'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddListingModal onClose={() => setShowAdd(false)} onSaved={fetchData} />}
      </AnimatePresence>
    </div>
  );
}
