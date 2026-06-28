import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle2 } from 'lucide-react';

export default function CrowdPulse({ isOpen, onClose, zoneId }) {
  const [activeCount, setActiveCount] = useState(23);
  const [confirmed, setConfirmed] = useState(false);
  const [showPop, setShowPop] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleConfirm = () => {
    setConfirmed(true);
    setActiveCount(prev => prev + 1);
    setShowPop(true);
    setTimeout(() => setShowPop(false), 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .bottom-sheet {
          position: fixed; bottom: 0; left: 0; width: 100vw; z-index: 6000;
          background: rgba(10, 14, 26, 0.95); backdrop-filter: blur(24px);
          border-top: 1px solid var(--glass-border); border-radius: 30px 30px 0 0;
          padding: 32px 24px; box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
          animation: slideUpSheet 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          max-height: 85vh; overflow-y: auto;
        }
        @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .scrim { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 5999; animation: fadeIn 0.3s ease; }
        
        .audio-bar { width: 4px; background: var(--primary); border-radius: 2px; display: inline-block; margin: 0 2px; animation: eq 1s ease-in-out infinite alternate; }
        .audio-bar:nth-child(2) { animation-delay: 0.2s; }
        .audio-bar:nth-child(3) { animation-delay: 0.4s; }
        .audio-bar:nth-child(4) { animation-delay: 0.1s; }
        @keyframes eq { 0% { height: 4px; } 100% { height: 16px; } }
        
        @keyframes popUp { 0% { transform: scale(0.5) translateY(10px); opacity: 0; } 50% { transform: scale(1.2) translateY(-10px); opacity: 1; } 100% { transform: scale(1) translateY(-20px); opacity: 0; } }
        .plus-one-pop { position: absolute; color: var(--safe); font-weight: 800; font-size: 24px; animation: popUp 1s ease forwards; top: -10px; right: -20px; text-shadow: 0 0 10px rgba(46,204,113,0.5); }
      `}</style>
      
      <div className="scrim" onClick={onClose} />
      <div className="bottom-sheet">
        <div style={{ width: '40px', height: '4px', background: 'var(--glass-border)', borderRadius: '2px', margin: '0 auto 24px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Users size={28} color="var(--primary)" />
            <h2 style={{ fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Live Crowd Safety
              <div style={{ width: 8, height: 8, background: 'var(--safe)', borderRadius: '50%', animation: 'breathe 1.5s infinite' }} />
            </h2>
          </div>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ fontSize: '64px', fontFamily: 'Clash Display', fontWeight: 700, color: '#fff', lineHeight: 1, transition: 'all 0.3s' }}>
              {activeCount}
            </div>
            {showPop && <div className="plus-one-pop">+1</div>}
          </div>
          <div style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 600 }}>women active nearby</div>
        </div>

        <button onClick={handleConfirm} disabled={confirmed} className={!confirmed ? "shimmer-btn ripple" : ""} style={{
          width: '100%', maxWidth: '400px', margin: '0 auto 40px', display: 'flex',
          background: confirmed ? 'rgba(46, 204, 113, 0.1)' : 'var(--primary)',
          color: confirmed ? 'var(--safe)' : '#fff',
          border: confirmed ? '1px solid var(--safe)' : 'none',
          padding: '18px', borderRadius: '30px', fontSize: '18px', fontWeight: 700,
          alignItems: 'center', justifyContent: 'center', gap: '12px',
          cursor: confirmed ? 'default' : 'pointer', transition: 'all 0.3s'
        }}>
          {confirmed ? <><CheckCircle2 size={24} /> You've confirmed this area</> : 'Mark as Safe Right Now'}
        </button>
        
        {confirmed && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginTop: '-24px', marginBottom: '32px', animation: 'fadeIn 0.3s' }}>
            Your confirmation expires in 29:59
          </div>
        )}

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nearby Activity Zones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { n: 'Indiranagar Metro Station', c: 45, lvl: 'High' },
              { n: '100ft Road Cafes', c: 32, lvl: 'High' },
              { n: 'Koramangala 12th Main', c: 18, lvl: 'Medium' },
              { n: 'Domlur Bus Stand', c: 8, lvl: 'Low' },
              { n: 'HAL 2nd Stage Park', c: 2, lvl: 'Empty' }
            ].map((z, i) => (
              <div key={i} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px' }}>
                <div style={{ fontWeight: 600 }}>{z.n}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{z.c} active</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '16px', width: '30px', opacity: z.c > 10 ? 1 : 0.3 }}>
                    <div className="audio-bar" style={{ background: z.lvl === 'High' ? 'var(--safe)' : z.lvl === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }} />
                    <div className="audio-bar" style={{ background: z.lvl === 'High' ? 'var(--safe)' : z.lvl === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }} />
                    <div className="audio-bar" style={{ background: z.lvl === 'High' ? 'var(--safe)' : z.lvl === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }} />
                    <div className="audio-bar" style={{ background: z.lvl === 'High' ? 'var(--safe)' : z.lvl === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
