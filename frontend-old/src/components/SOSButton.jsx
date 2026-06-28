import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { ShieldAlert, X } from 'lucide-react';
import axios from 'axios';

export default function SOSButton() {
  const { sosStatus, setSosStatus, userLocation } = useContext(AppContext);
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [exploded, setExploded] = useState(false);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const PRESS_DURATION = 1500;

  useEffect(() => {
    if (isPressing && pressProgress < 100) {
      let start = performance.now();
      const animate = (time) => {
        const elapsed = time - start;
        const progress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
        setPressProgress(progress);
        if (progress < 100) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          triggerSOS();
        }
      };
      animRef.current = requestAnimationFrame(animate);
    } else if (!isPressing && !sosStatus) {
      setPressProgress(0);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPressing]);

  const triggerSOS = async () => {
    setIsPressing(false);
    setExploded(true);
    setTimeout(() => {
      setSosStatus(true);
    }, 300); // Wait for explosion animation

    try {
      await axios.post('http://localhost:8000/sos/trigger', { location: userLocation });
    } catch (e) {
      console.error(e);
    }
  };

  const cancelSOS = async () => {
    setSosStatus(false);
    setExploded(false);
    setPressProgress(0);
    try {
      await axios.post('http://localhost:8000/sos/cancel');
    } catch (e) {
      console.error(e);
    }
  };

  if (sosStatus) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'var(--danger)', zIndex: 99999, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        animation: 'fadeIn 0.3s ease'
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulseHuge { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        `}</style>
        <ShieldAlert size={100} style={{ animation: 'pulseHuge 1s infinite' }} />
        <h1 style={{ fontSize: '48px', margin: '24px 0 12px', letterSpacing: '4px' }}>SOS ACTIVE</h1>
        <p style={{ fontSize: '20px', textAlign: 'center', maxWidth: '400px', marginBottom: '40px' }}>
          Live location and audio are being broadcasted to your emergency contacts.
        </p>
        <button onClick={cancelSOS} style={{
          background: '#fff', color: 'var(--danger)', border: 'none', padding: '16px 40px',
          borderRadius: '30px', fontSize: '18px', fontWeight: 700, cursor: 'pointer'
        }}>
          Cancel Alert
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sos-container { position: fixed; bottom: 24px; right: 24px; zIndex: 5000; display: flex; align-items: center; justify-content: center; width: 100px; height: 100px; }
        .sos-ring { position: absolute; border-radius: 50%; background: var(--danger); animation: sosRing 2.5s infinite ease-out; pointer-events: none; }
        .sos-ring-1 { width: 80px; height: 80px; opacity: 0.2; animation-delay: 0s; }
        .sos-ring-2 { width: 100px; height: 100px; opacity: 0.1; animation-delay: 1s; }
        @keyframes sosRing { 0% { transform: scale(0.6); opacity: 0.3; } 100% { transform: scale(1.4); opacity: 0; } }
        .sos-btn { 
          position: relative; width: 60px; height: 60px; border-radius: 50%; background: var(--danger); 
          color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; 
          font-size: 20px; letter-spacing: 2px; cursor: pointer; user-select: none; z-index: 10;
          box-shadow: 0 4px 15px rgba(255, 77, 109, 0.5); border: none; outline: none;
          transition: transform 0.1s;
        }
        .sos-btn:active { transform: scale(0.95); }
        .sos-explode {
          position: fixed; bottom: 54px; right: 54px; width: 2px; height: 2px; background: var(--danger);
          border-radius: 50%; z-index: 99998; pointer-events: none;
          animation: explodeAnim 0.3s cubic-bezier(0.85, 0, 0.15, 1) forwards;
        }
        @keyframes explodeAnim { from { transform: scale(1); } to { transform: scale(2000); } }
      `}</style>
      
      <div className="sos-container">
        {!isPressing && !exploded && (
          <>
            <div className="sos-ring sos-ring-1"></div>
            <div className="sos-ring sos-ring-2"></div>
          </>
        )}
        
        {isPressing && (
          <svg style={{ position: 'absolute', width: 80, height: 80, pointerEvents: 'none', zIndex: 5, transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="34" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
            <circle cx="40" cy="40" r="34" fill="transparent" stroke="#fff" strokeWidth="6"
                    strokeDasharray={213.6} strokeDashoffset={213.6 - (pressProgress / 100) * 213.6} />
          </svg>
        )}

        <button 
          className="sos-btn"
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
          onTouchStart={(e) => { e.preventDefault(); setIsPressing(true); }}
          onTouchEnd={(e) => { e.preventDefault(); setIsPressing(false); }}
        >
          SOS
        </button>
      </div>

      {exploded && <div className="sos-explode"></div>}
    </>
  );
}
