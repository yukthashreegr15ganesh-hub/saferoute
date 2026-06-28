import React, { useState, useEffect, useContext } from 'react';
import { X, Navigation, Building2, MapPin, Loader2 } from 'lucide-react';
import { AppContext } from '../App';
import axios from 'axios';

export default function SafeSpotFinder({ isOpen, onClose }) {
  const { userLocation } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('All');
  const [spots, setSpots] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Hospital', label: '🏥 Hospital' },
    { id: 'Police', label: '👮 Police' },
    { id: 'Shop', label: '🏪 Shop' },
    { id: 'Transit', label: '🚇 Transit' }
  ];

  useEffect(() => {
    if (isOpen && userLocation) {
      axios.get(`http://localhost:8000/safe-spots?lat=${userLocation.lat}&lng=${userLocation.lng}`)
        .then(res => {
          // Add some mock variations
          const expanded = res.data.map((s, i) => ({
            ...s,
            type: ['Hospital', 'Police', 'Shop', 'Transit'][i % 4],
            distance: `${(0.2 + (i * 0.3)).toFixed(1)} km`,
            walkTime: `${3 + (i * 4)} min walk`,
            isOpen: Math.random() > 0.2 // 80% open
          }));
          setSpots(expanded);
        })
        .catch(console.error);
    }
  }, [isOpen, userLocation]);

  const filteredSpots = activeTab === 'All' ? spots : spots.filter(s => s.type === activeTab);

  const handleNavigate = (id) => {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      // In a real app, this would trigger MapView to flyTo and draw a green dotted line
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 64, right: 0, width: '360px', height: 'calc(100vh - 64px)',
      background: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(24px)', zIndex: 4000,
      borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .tab-btn { flex: 1; padding: 12px 4px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; position: relative; transition: color 0.3s; white-space: nowrap; }
        .tab-btn.active { color: #fff; font-weight: 600; }
        .spot-card { animation: slideLeftFade 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; transform: translateX(20px); }
        @keyframes slideLeftFade { to { opacity: 1; transform: translateX(0); } }
      `}</style>
      
      <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '20px', margin: 0 }}>Safe Spots</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      <div style={{ position: 'relative', display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map((t, i) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
        {/* Animated Underline */}
        <div style={{
          position: 'absolute', bottom: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px 3px 0 0',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          width: `${100 / tabs.length}%`,
          left: `${(tabs.findIndex(t => t.id === activeTab)) * (100 / tabs.length)}%`
        }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredSpots.map((spot, i) => (
          <div key={spot.id} className="glass-card spot-card" style={{ padding: '20px', animationDelay: `${i * 80}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 4px', maxWidth: '200px' }}>{spot.name}</h3>
              <div style={{
                background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px',
                fontSize: '12px', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--glass-border)'
              }}>
                {spot.distance}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: spot.isOpen ? 'var(--safe)' : 'var(--danger)' }} />
                <span style={{ color: spot.isOpen ? 'var(--safe)' : 'var(--danger)', fontWeight: 600 }}>{spot.isOpen ? 'Open Now' : 'Closed'}</span>
              </div>
              <span>•</span>
              <span>{spot.walkTime}</span>
            </div>

            <button onClick={() => handleNavigate(spot.id)} className="shimmer-btn ripple" style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)',
              padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
            }} onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
               onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}>
              {loadingId === spot.id ? <Loader2 size={16} className="shield-spinner" /> : <><Navigation size={16} /> Navigate Here</>}
            </button>
          </div>
        ))}
        {filteredSpots.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
            No spots found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
