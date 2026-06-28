import React, { useState } from 'react';
import axios from 'axios';
import { X, Check, CheckCircle2 } from 'lucide-react';

export default function ReportPin({ isOpen, coordinates, onClose }) {
  const [category, setCategory] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    { id: 'lighting', icon: '💡', label: 'Poor Lighting' },
    { id: 'harassment', icon: '⚠️', label: 'Harassment' },
    { id: 'isolated', icon: '🚶‍♀️', label: 'Isolated Area' },
    { id: 'cctv', icon: '📹', label: 'No CCTV' },
    { id: 'blocked', icon: '🚧', label: 'Blocked Path' },
    { id: 'network', icon: '📵', label: 'No Network' }
  ];

  const handleClose = () => {
    setCategory(null);
    setSeverity(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!category || !severity) return;
    setSuccess(true);
    try {
      await axios.post('http://localhost:8000/report', {
        type: category,
        severity: severity,
        location: coordinates
      });
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      setTimeout(() => handleClose(), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .report-scrim { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 5999; animation: fadeIn 0.3s ease forwards; }
        .report-sheet {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%) translateY(100%);
          width: 100vw; max-width: 600px; max-height: 90vh; overflow-y: auto; z-index: 6000;
          background: rgba(10, 14, 26, 0.95); backdrop-filter: blur(24px);
          border-top: 1px solid var(--glass-border); border-left: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);
          border-radius: 32px 32px 0 0; padding: 24px;
          animation: slideUpSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes slideUpSpring { to { transform: translateX(-50%) translateY(0); } }
        
        .cat-card { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 16px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
        .cat-card:hover { transform: scale(1.05); border-color: var(--primary); }
        .cat-card:hover .cat-emoji { animation: bounceEmoji 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .cat-card.selected { background: rgba(13,115,119,0.2); border-color: var(--primary); transform: scale(1.05); }
        @keyframes bounceEmoji { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        
        .sev-pill { flex: 1; padding: 12px; border-radius: 20px; border: 1px solid var(--glass-border); text-align: center; font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-muted); }
        .sev-pill.low.selected { background: var(--safe); color: #fff; border-color: var(--safe); }
        .sev-pill.medium.selected { background: var(--warning); color: #fff; border-color: var(--warning); }
        .sev-pill.high.selected { background: var(--danger); color: #fff; border-color: var(--danger); }
        
        .slide-up-content { animation: slideUpFade 0.4s ease forwards; opacity: 0; transform: translateY(20px); }
        
        .check-draw circle { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 1s ease forwards; }
        .check-draw path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 1s ease forwards 0.3s; }
      `}</style>

      <div className="report-scrim" onClick={handleClose} />
      
      <div className="report-sheet">
        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 24px' }} />
        
        {!success ? (
          <div style={{ animation: 'fadeOut 0.3s forwards', animationPlayState: success ? 'running' : 'paused' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Report Incident</h2>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Your report is completely anonymous and helps keep the community safe.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
              {categories.map(cat => (
                <div key={cat.id} className={`cat-card ${category === cat.id ? 'selected' : ''}`} onClick={() => setCategory(cat.id)}>
                  {category === cat.id && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--primary)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bounceIn 0.3s ease' }}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  <div className="cat-emoji" style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{cat.label}</div>
                </div>
              ))}
            </div>

            {category && (
              <div className="slide-up-content">
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Severity Level</h3>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                  <div className={`sev-pill low ${severity === 'low' ? 'selected' : ''}`} onClick={() => setSeverity('low')}>Low</div>
                  <div className={`sev-pill medium ${severity === 'medium' ? 'selected' : ''}`} onClick={() => setSeverity('medium')}>Medium</div>
                  <div className={`sev-pill high ${severity === 'high' ? 'selected' : ''}`} onClick={() => setSeverity('high')}>High</div>
                </div>

                <button onClick={handleSubmit} disabled={!severity} className="shimmer-btn ripple" style={{
                  width: '100%', background: 'linear-gradient(90deg, var(--primary), #11999e)', color: '#fff',
                  border: 'none', padding: '16px', borderRadius: '30px', fontSize: '18px', fontWeight: 700,
                  cursor: severity ? 'pointer' : 'not-allowed', opacity: severity ? 1 : 0.5, transition: 'all 0.3s'
                }}>
                  Submit Anonymously
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', animation: 'fadeIn 0.5s ease forwards' }}>
            <svg className="check-draw" width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="54" stroke="var(--safe)" strokeWidth="8" />
              <path d="M35 60L52 77L85 44" stroke="var(--safe)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 style={{ fontSize: '28px', marginTop: '24px', marginBottom: '12px', color: 'var(--safe)' }}>Report Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Thank you for keeping the community safe.</p>
          </div>
        )}
      </div>
    </>
  );
}
