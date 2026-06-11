import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api';
import toast from 'react-hot-toast';

export default function ImpactDashboard() {
  const [impact, setImpact] = useState(null);
  const [global, setGlobal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [shopRes, globalRes] = await Promise.all([
          api.get('/impact/shop'),
          api.get('/impact/global'),
        ]);
        setImpact(shopRes.data);
        setGlobal(globalRes.data);
      } catch {
        toast.error('Failed to load impact data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
      <div className="spinner" />
    </div>
  );

  const chartData = impact?.history?.map(r => ({
    date: r.date,
    co2: r.co2Saved,
    meals: r.mealsSaved,
    money: r.moneySaved,
  })) || [];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="container">
        <div className="page-header" style={{ marginBottom: 32 }}>
          <h1>🌍 Impact Dashboard</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            See how much food waste you've prevented and the positive impact you've made.
          </p>
        </div>

        {/* Your impact */}
        <h2 style={{ fontSize: 18, marginBottom: 16, color: 'var(--gray-400)', fontWeight: 500 }}>YOUR IMPACT</h2>
        <div className="grid grid-3 gap-6" style={{ marginBottom: 40 }}>
          {[
            { icon: '🌿', value: `${impact?.co2Saved?.toFixed(1) || 0} kg`, label: 'CO₂ Saved', sub: 'equivalent to driving 60km less' },
            { icon: '🍽️', value: impact?.mealsSaved || 0, label: 'Meals Rescued', sub: 'fed to people in need' },
            { icon: '💚', value: `${Math.round((impact?.co2Saved || 0) * 3)} trees`, label: 'Tree Equivalent', sub: 'carbon offset' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="text-xs text-muted" style={{ marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* CO2 Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 20 }}>CO₂ Saved Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#141f14', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#e2e8e2' }} />
                <Area type="monotone" dataKey="co2" stroke="#22c55e" fill="url(#co2grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Meals chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ marginBottom: 40 }}>
            <h3 style={{ marginBottom: 20 }}>Meals Rescued Per Day</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#141f14', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#e2e8e2' }} />
                <Bar dataKey="meals" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Global impact */}
        <div style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(34,197,94,0.08) 0%, transparent 70%)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>🌐 Platform-Wide Impact</h2>
          <p className="text-muted" style={{ marginBottom: 32 }}>Together, the whole Vesta AI community is making a difference</p>
          <div className="grid grid-2 gap-6" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, var(--green-400), var(--teal-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {global?.co2Saved?.toFixed(0) || 0}kg
              </div>
              <div className="text-muted text-sm">CO₂ saved globally</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, var(--green-400), var(--teal-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {global?.mealsSaved || 0}
              </div>
              <div className="text-muted text-sm">Meals rescued globally</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
