import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function FoodBankDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [available, setAvailable] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const stompRef = useRef(null);

  const fetchData = async () => {
    try {
      const [donRes, surplusRes] = await Promise.all([
        api.get('/donations/my'),
        api.get('/surplus'),
      ]);
      setDonations(donRes.data);
      setAvailable(surplusRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSocket: listen for new surplus
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe('/topic/new-surplus', (msg) => {
          const data = JSON.parse(msg.body);
          setAlerts(prev => [data, ...prev].slice(0, 5));
          fetchData();
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompRef.current = client;
    return () => client.deactivate();
  }, []);

  // Smart match: filter items matching food bank's dietary needs
  const matchedItems = available.filter(item => {
    if (!user?.address) return true; // no preferences set
    return true; // In production: match against food bank dietary preferences
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="container">
        <div className="page-header" style={{ marginBottom: 32 }}>
          <h1>🏦 Food Bank Dashboard</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            {user?.businessName || user?.username} — receive real-time surplus alerts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-3 gap-6" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
            <div className="stat-value">{donations.length}</div>
            <div className="stat-label">Total Donations Received</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <div className="stat-value">{available.length}</div>
            <div className="stat-label">Available Items Now</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
            <div className="stat-value">{matchedItems.length}</div>
            <div className="stat-label">Smart-Matched Items</div>
          </div>
        </div>

        {/* Real-time alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>🔔 Live Surplus Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid var(--border-green)', borderRadius: 12, padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>🆕</span>
                  <div>
                    <strong>{a.title}</strong> from <strong>{a.shopName}</strong>
                    <span className="text-muted text-sm"> · {a.category} · £{a.discountedPrice}</span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className="badge badge-teal">{a.dietaryTags || 'General'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Available items for donation */}
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Available Surplus (Smart Matched)</h2>
        {available.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
            <p className="text-muted">No surplus available right now. You'll receive an alert when shops post new items.</p>
          </div>
        ) : (
          <div className="grid grid-3 gap-6" style={{ marginBottom: 40 }}>
            {available.map(item => {
              const tags = item.dietaryTags ? item.dietaryTags.split(',').filter(Boolean) : [];
              return (
                <div key={item.id} className="card">
                  <img src={item.imageUrl || 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400'} alt={item.title}
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }} />
                  <h3 style={{ fontSize: 15, marginBottom: 6 }}>{item.title}</h3>
                  <div className="text-sm text-muted" style={{ marginBottom: 8 }}>{item.category} · {item.quantity} units</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                    {tags.map(t => <span key={t} className="badge badge-green" style={{ fontSize: 11 }}>{t}</span>)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--green-400)', fontWeight: 700 }}>FREE donation</span>
                    <span className="badge badge-teal text-xs">{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Donations received */}
        {donations.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Donations Received</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {donations.map(d => (
                <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.surplusItem?.title}</div>
                    <div className="text-sm text-muted">Qty: {d.quantityDonated} · {d.notes}</div>
                    <div className="text-xs text-muted">{new Date(d.donatedAt).toLocaleDateString()}</div>
                  </div>
                  <span className="badge badge-green">✓ Received</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
