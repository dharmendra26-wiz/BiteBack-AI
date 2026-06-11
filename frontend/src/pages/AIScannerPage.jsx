import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function AIScannerPage() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [phase, setPhase] = useState('camera'); // camera | scanning | results
  const [results, setResults] = useState([]);
  const [capturedImg, setCapturedImg] = useState(null);
  const [selected, setSelected] = useState([]);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setCapturedImg(imageSrc);
    setPhase('scanning');

    try {
      // Convert base64 data URL to just the base64 string
      const base64 = imageSrc.split(',')[1];
      const { data } = await api.post('/ai/scan', { image: base64, mimeType: 'image/jpeg' });
      setResults(data.items || []);
      setSelected(data.items?.map((_, i) => i) || []);
      setPhase('results');
      if (data.source === 'mock') {
        toast('📝 Demo mode — add Gemini API key for real AI scanning', { icon: 'ℹ️' });
      } else {
        toast.success(`Detected ${data.items.length} item(s)! 🤖`);
      }
    } catch (err) {
      toast.error('Scan failed: ' + (err.response?.data?.error || err.message));
      setPhase('camera');
    }
  }, [webcamRef]);

  const useResults = () => {
    const selectedItems = results.filter((_, i) => selected.includes(i));
    sessionStorage.setItem('scanner_results', JSON.stringify(selectedItems));
    toast.success('Items ready! Creating listings from scanner results…');
    navigate('/shop/dashboard');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header" style={{ marginBottom: 32 }}>
          <h1>📷 AI Inventory Scanner</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Point your camera at leftover shelves. AI will identify items and auto-fill your surplus list.
          </p>
        </div>

        {/* Camera phase */}
        <AnimatePresence mode="wait">
          {phase === 'camera' && (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '2px solid var(--border-green)', position: 'relative' }}>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: '100%', display: 'block' }}
                  videoConstraints={{ facingMode: 'environment' }}
                />
                {/* Scan overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 80%, rgba(0,0,0,0.4))', pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <span className="badge badge-green">🔴 LIVE</span>
                    <span className="badge badge-teal">AI Ready</span>
                  </div>
                  {/* Corner guides */}
                  {['top-left','top-right','bottom-left','bottom-right'].map(p => {
                    const [v, h] = p.split('-');
                    return (
                      <div key={p} style={{
                        position: 'absolute',
                        [v]: 40, [h]: 40,
                        width: 30, height: 30,
                        borderTop: v === 'top' ? '3px solid var(--green-400)' : 'none',
                        borderBottom: v === 'bottom' ? '3px solid var(--green-400)' : 'none',
                        borderLeft: h === 'left' ? '3px solid var(--green-400)' : 'none',
                        borderRight: h === 'right' ? '3px solid var(--green-400)' : 'none',
                      }} />
                    );
                  })}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button onClick={capture} className="btn btn-primary btn-lg" style={{ minWidth: 200, justifyContent: 'center' }}>
                  📸 Scan Shelf
                </button>
                <p className="text-muted text-sm" style={{ marginTop: 12 }}>
                  Allow camera access when prompted. Works best with good lighting.
                </p>
              </div>
            </motion.div>
          )}

          {/* Scanning phase */}
          {phase === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '60px 0' }}>
              {capturedImg && (
                <img src={capturedImg} alt="Captured" style={{ width: '100%', borderRadius: 16, marginBottom: 32, opacity: 0.6 }} />
              )}
              <div className="spinner" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ marginBottom: 8 }}>AI is scanning your shelf…</h3>
              <p className="text-muted">Gemini Vision is identifying food items</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {['Detecting items', 'Estimating quantities', 'Categorising food'].map((s, i) => (
                  <motion.span key={s} className="badge badge-teal"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.6 }}>
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results phase */}
          {phase === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>🎯 Detected {results.length} item(s)</h2>
                <button onClick={() => setPhase('camera')} className="btn btn-ghost btn-sm">Re-scan</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {results.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer',
                      borderColor: selected.includes(i) ? 'var(--green-500)' : 'var(--border-subtle)' }}
                    onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: selected.includes(i) ? 'var(--green-500)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {selected.includes(i) ? '✓' : '○'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div className="text-sm text-muted">{item.category} · Qty ~{item.quantity}</div>
                      {item.dietaryTags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          {item.dietaryTags.map(t => <span key={t} className="badge badge-green" style={{ fontSize: 10 }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--green-400)', fontWeight: 700 }}>~£{item.estimatedValue?.toFixed(2)}</div>
                      <div className="text-xs text-muted">est. value</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPhase('camera')} className="btn btn-ghost" style={{ flex: 1 }}>Discard</button>
                <button onClick={useResults} disabled={selected.length === 0} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Use {selected.length} Selected Items →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
