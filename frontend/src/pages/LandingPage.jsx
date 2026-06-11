import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '📷', title: 'AI Inventory Scanner', desc: 'Snap a photo of your leftover shelf. AI auto-identifies items and populates your surplus list.' },
  { icon: '💡', title: 'Smart Markdown Pricing', desc: 'AI suggests the perfect discount based on expiry time, time of day, and sales history.' },
  { icon: '🤝', title: 'Smart Matching', desc: 'Food banks are alerted only when surplus matches their dietary needs. Zero noise.' },
  { icon: '🌍', title: 'Impact Dashboard', desc: 'See exactly how much CO₂ you saved and how many meals you rescued — in real time.' },
];

const stats = [
  { value: '2.4M', label: 'Tonnes food wasted daily in UK' },
  { value: '40%', label: 'of food produced goes to waste' },
  { value: '8.1M', label: 'people food insecure in UK' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '100px 0 80px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)',
        textAlign: 'center',
      }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="badge badge-green" style={{ margin: '0 auto 24px', fontSize: 13 }}>
              🌱 AI-Powered Food Rescue
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
              Turn Surplus Food<br />
              <span className="text-glow">Into Opportunity</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--gray-400)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Vesta AI connects bakeries, cafes, and grocery stores with customers and food banks —
              rescuing surplus food before it becomes waste.
            </p>
            <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/browse" className="btn btn-secondary btn-lg">Browse Surplus Bags</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container grid grid-3 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} className="text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.3 }}>
              <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, var(--green-400), var(--teal-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div className="text-muted text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 36, marginBottom: 48 }}>Everything you need to <span className="text-glow">rescue food</span></h2>
          <div className="grid grid-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} className="card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{f.title}</h3>
                <p className="text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(34,197,94,0.1) 0%, transparent 70%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, marginBottom: 16 }}>Ready to reduce food waste?</h2>
          <p className="text-muted" style={{ marginBottom: 32 }}>Join shops, customers and food banks already making a difference.</p>
          <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <Link to="/register?role=SHOP" className="btn btn-primary btn-lg">I'm a Shop Owner</Link>
            <Link to="/register?role=CUSTOMER" className="btn btn-secondary btn-lg">I'm a Customer</Link>
            <Link to="/register?role=FOOD_BANK" className="btn btn-secondary btn-lg">I'm a Food Bank</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px 0', textAlign: 'center' }}>
        <p className="text-muted text-sm">© 2024 Vesta AI — Making food rescue effortless 🌿</p>
      </footer>
    </div>
  );
}
