import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const CATEGORIES = ['All', 'Bakery', 'Produce', 'Dairy', 'Deli', 'Beverages', 'Prepared'];

function CountdownBadge({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const isUrgent = new Date(expiresAt) - new Date() < 2 * 3600000;
  return (
    <span className={`badge ${isUrgent ? 'badge-red' : 'badge-orange'}`}>
      ⏰ {timeLeft}
    </span>
  );
}

function SurplusCard({ item, onClaim, user }) {
  const savings = Math.round((1 - item.discountedPrice / item.originalPrice) * 100);
  const tags = item.dietaryTags ? item.dietaryTags.split(',').filter(Boolean) : [];

  return (
    <motion.div className="surplus-card"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}>
      <img src={item.imageUrl || 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400'} alt={item.title} />
      <div className="surplus-card-body">
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <span className="badge badge-teal">{item.category}</span>
          <CountdownBadge expiresAt={item.expiresAt} />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
        <p className="text-muted text-sm" style={{ marginBottom: 10, lineHeight: 1.5 }}>
          {item.description?.slice(0, 80)}{item.description?.length > 80 ? '…' : ''}
        </p>

        <div className="flex gap-2" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
          {tags.map(t => <span key={t} className="badge badge-green" style={{ fontSize: 11 }}>{t}</span>)}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div className="surplus-card-price">
            <span className="original">£{item.originalPrice.toFixed(2)}</span>
            <div className="flex items-center gap-2">
              <span className="discounted">£{item.discountedPrice.toFixed(2)}</span>
              <span className="savings">{savings}% OFF</span>
            </div>
          </div>
          <div className="text-sm text-muted">{item.quantity} left</div>
        </div>

        <button
          onClick={() => onClaim(item)}
          disabled={!user || user.role !== 'CUSTOMER' || item.quantity === 0}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}>
          {!user ? 'Login to Claim' : user.role !== 'CUSTOMER' ? 'Customers Only' : '🛒 Claim This Bag'}
        </button>
      </div>
    </motion.div>
  );
}

export default function BrowsePage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [claimModal, setClaimModal] = useState(null);
  const [qty, setQty] = useState(1);
  const [newAlert, setNewAlert] = useState(null);
  const stompRef = useRef(null);

  const fetchItems = async (cat) => {
    try {
      const params = cat && cat !== 'All' ? { category: cat } : {};
      const { data } = await api.get('/surplus', { params });
      setItems(data);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(category);
  }, [category]);

  // WebSocket for real-time new listings
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe('/topic/new-surplus', (msg) => {
          const data = JSON.parse(msg.body);
          setNewAlert(data);
          fetchItems(category);
          setTimeout(() => setNewAlert(null), 5000);
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompRef.current = client;
    return () => client.deactivate();
  }, []);

  const handleClaim = async () => {
    if (!claimModal) return;
    try {
      await api.post('/claims', { surplusItemId: claimModal.id, quantity: qty });
      toast.success(`🎉 Claimed! Pickup from ${claimModal.shop?.businessName || 'the shop'}`);
      setClaimModal(null);
      fetchItems(category);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Claim failed');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32 }}>Browse Surplus Bags 🛒</h1>
            <p className="text-muted" style={{ marginTop: 4 }}>Rescue food, save money, help the planet</p>
          </div>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time alert */}
        <AnimatePresence>
          {newAlert && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid var(--border-green)', borderRadius: 12, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              🔔 <strong>New listing!</strong> {newAlert.title} from {newAlert.shopName} — £{newAlert.discountedPrice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
            <h3 style={{ marginBottom: 8 }}>No surplus items right now</h3>
            <p className="text-muted">Check back soon — shops post new bags throughout the day!</p>
          </div>
        ) : (
          <div className="grid grid-3 gap-6">
            {items.map(item => (
              <SurplusCard key={item.id} item={item} user={user}
                onClaim={(it) => { setClaimModal(it); setQty(1); }} />
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {claimModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card" style={{ maxWidth: 440, width: '100%' }}>
              <h2 style={{ marginBottom: 4 }}>Claim this bag</h2>
              <p className="text-muted text-sm" style={{ marginBottom: 20 }}>{claimModal.title} — £{claimModal.discountedPrice}</p>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Quantity (max {claimModal.quantity})</label>
                <input className="input" type="number" min={1} max={claimModal.quantity}
                  value={qty} onChange={e => setQty(Math.min(claimModal.quantity, Math.max(1, +e.target.value)))} />
              </div>

              <div style={{ background: 'rgba(34,197,94,0.05)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total</span>
                  <strong className="text-glow">£{(claimModal.discountedPrice * qty).toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-sm" style={{ marginTop: 4 }}>
                  <span className="text-muted">You save</span>
                  <span style={{ color: 'var(--green-400)' }}>£{((claimModal.originalPrice - claimModal.discountedPrice) * qty).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setClaimModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleClaim} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Confirm Claim ✓</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
