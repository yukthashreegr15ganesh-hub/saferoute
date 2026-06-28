import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Eye, ShieldAlert, MapPin, Phone, CheckCircle2 } from 'lucide-react';

export default function ShadowWalkMode({ isOpen, onClose }) {
  const { shadowWalkStatus, setShadowWalkStatus } = useContext(AppContext);
  const [contacts, setContacts] = useState(['', '', '']);
  const [destination, setDestination] = useState('');
  const [timeActive, setTimeActive] = useState(0);
  const [autoAlert, setAutoAlert] = useState(false);

  useEffect(() => {
    let interval;
    if (shadowWalkStatus.active) {
      interval = setInterval(() => {
        setTimeActive(prev => {
          if (prev >= 180 && !autoAlert) setAutoAlert(true); // 3 minutes = 180s
          return prev + 1;
        });
      }, 1000);
    } else {
      setTimeActive(0);
      setAutoAlert(false);
    }
    return () => clearInterval(interval);
  }, [shadowWalkStatus.active, autoAlert]);

  const handleStart = (e) => {
    e.preventDefault();
    if (!destination || !contacts[0]) return;
    setShadowWalkStatus({ active: true, session: { destination, contacts: contacts.filter(c => c) } });
    onClose();
  };

  const handleStop = () => {
    setShadowWalkStatus({ active: false, session: null });
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${h > 0 && m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (shadowWalkStatus.active) {
    return (
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 5000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <style>{`
          .shadow-pill { animation: slideDownBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
          @keyframes slideDownBounce { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .arrive-btn { animation: slideUpBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; animation-delay: 0.5s; opacity: 0; }
          @keyframes slideUpBounce { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
        
        <div className="glass-card shadow-pill" style={{
          background: autoAlert ? 'var(--danger)' : 'rgba(10, 14, 26, 0.9)', 
          border: `1px solid ${autoAlert ? 'var(--danger)' : 'var(--primary)'}`,
          padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: autoAlert ? '0 0 20px rgba(255, 77, 109, 0.4)' : '0 4px 15px rgba(13, 115, 119, 0.3)'
        }}>
          {autoAlert ? <ShieldAlert size={20} color="#fff" style={{ animation: 'pulseHuge 1s infinite' }} /> : (
            <div style={{ position: 'relative', width: 12, height: 12 }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--safe)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, border: '2px solid var(--safe)', borderRadius: '50%', animation: 'pulseRing 1.5s infinite' }}></div>
            </div>
          )}
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '16px' }}>
            {autoAlert ? '⚠️ Auto-alert sent to contacts' : `Shadow Walk Active — ${formatTime(timeActive)}`}
          </div>
        </div>

        <button className="arrive-btn shimmer-btn ripple" onClick={handleStop} style={{
          background: 'var(--safe)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '30px',
          fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(46, 204, 113, 0.4)'
        }}>
          <CheckCircle2 size={24} /> I've Arrived Safely
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(10,14,26,0.6)', backdropFilter: 'blur(4px)', zIndex: 6000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <style>{`
        .input-field { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #fff; padding: 16px 16px 16px 48px; border-radius: 12px; width: 100%; outline: none; transition: all 0.2s; font-size: 16px; }
        .input-field:focus { border-color: var(--primary); background: rgba(13,115,119,0.1); }
        .input-wrapper { position: relative; margin-bottom: 16px; animation: slideUpFade 0.3s ease forwards; opacity: 0; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: color 0.2s; }
        .input-field:focus + .input-icon { color: var(--primary); }
      `}</style>
      <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '32px', position: 'relative', animation: 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(13,115,119,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
            <Eye size={32} />
          </div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Shadow Walk</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Share your live location. If you stop moving for 3 minutes, we'll alert your contacts.</p>
        </div>

        <form onSubmit={handleStart}>
          <div className="input-wrapper" style={{ animationDelay: '0.1s' }}>
            <input type="text" className="input-field" placeholder="Where are you going?" value={destination} onChange={e => setDestination(e.target.value)} required />
            <MapPin size={20} className="input-icon" />
          </div>

          <div style={{ margin: '24px 0 16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-muted)' }}>Emergency Contacts (up to 3)</div>
          
          {contacts.map((c, i) => (
            <div key={i} className="input-wrapper" style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}>
              <input type="tel" className="input-field" placeholder={i === 0 ? "Primary Contact (Required)" : `Contact ${i + 1} (Optional)`} value={c} onChange={e => { const newC = [...contacts]; newC[i] = e.target.value; setContacts(newC); }} required={i === 0} />
              <Phone size={20} className="input-icon" />
            </div>
          ))}

          <button type="submit" className="shimmer-btn ripple" disabled={!destination || !contacts[0]} style={{
            width: '100%', background: 'linear-gradient(90deg, var(--primary), #11999e)', color: '#fff',
            border: 'none', padding: '16px', borderRadius: '30px', fontSize: '18px', fontWeight: 700,
            marginTop: '24px', cursor: (!destination || !contacts[0]) ? 'not-allowed' : 'pointer',
            opacity: (!destination || !contacts[0]) ? 0.5 : 1, transition: 'all 0.3s'
          }}>
            Start Shadow Walk
          </button>
        </form>
      </div>
    </div>
  );
}
