import React, { useContext } from 'react';
import { AppContext } from '../App';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function RouteOptions({ routes, onSelect, onNavigate }) {
  const { activeRoute, setActiveRoute } = useContext(AppContext);

  return (
    <div style={{
      width: '320px', background: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--glass-border)', height: '100%', overflowY: 'auto',
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
      animation: 'slideInLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
    }}>
      <style>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .route-card { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .route-card.selected { transform: scale(1.02); box-shadow: 0 0 20px rgba(13, 115, 119, 0.3); border-color: var(--primary) !important; }
        .route-card:hover:not(.selected) { transform: translateY(-4px); }
      `}</style>
      
      <h2 style={{ fontSize: '24px', margin: 0 }}>Route Options</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', marginTop: 4 }}>Compare safety conditions.</p>

      {routes.map(route => {
        const isSelected = activeRoute?.id === route.id;
        const color = route.label === 'SAFE' ? 'var(--safe)' : route.label === 'MODERATE' ? 'var(--warning)' : 'var(--danger)';
        const Icon = route.label === 'SAFE' ? ShieldCheck : route.label === 'MODERATE' ? Shield : ShieldAlert;

        return (
          <div key={route.id} className={`glass-card route-card ${isSelected ? 'selected' : ''}`} onClick={() => { setActiveRoute(route); onSelect(route); }} style={{
            padding: '20px', cursor: 'pointer', border: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>{route.name}</h3>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{route.eta} • {route.distance}</div>
              </div>
              <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                  <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="transparent" stroke={color} strokeWidth="4"
                    strokeDasharray={125.6} strokeDashoffset={125.6 - (route.score / 100) * 125.6}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 700, color }}>{route.score}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: `${color}22`, color, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon size={14} /> {route.label}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {route.tags.map(tag => {
                const isGood = tag.includes('✓') || tag.includes('Well') || tag.includes('CCTV');
                return (
                  <span key={tag} style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                    padding: '4px 8px', borderRadius: '6px', fontSize: '12px', 
                    color: isGood ? 'var(--safe)' : 'var(--danger)' 
                  }}>
                    {tag}
                  </span>
                )
              })}
            </div>

            {isSelected && (
              <button className="shimmer-btn ripple" onClick={(e) => { e.stopPropagation(); onNavigate(); }} style={{
                width: '100%', padding: '12px', marginTop: '20px', borderRadius: '12px',
                background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600,
                cursor: 'pointer', animation: 'fadeSlideUp 0.3s ease'
              }}>
                Take This Route
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
