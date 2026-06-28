import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Map as MapIcon, BarChart3, Menu } from 'lucide-react';
import { AppContext } from '../App';

export default function Navbar() {
  const { shadowWalkStatus } = useContext(AppContext);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Map', path: '/map', icon: MapIcon },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
      background: 'rgba(10, 14, 26, 0.7)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
        <Shield size={28} color="var(--primary)" />
        <span style={{ fontFamily: 'Clash Display', fontSize: '24px', fontWeight: 600 }}>SafeRoute</span>
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '20px' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} style={{
              textDecoration: 'none',
              color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: location.pathname === link.path ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.2s'
            }}>
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Shadow Walk Badge */}
        {shadowWalkStatus.active && (
          <div style={{
            background: 'rgba(46, 204, 113, 0.2)', border: '1px solid var(--safe)',
            color: 'var(--safe)', padding: '4px 12px', borderRadius: '20px',
            fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px',
            animation: 'breathe 2s infinite'
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--safe)' }} />
            Shadow Walk Active
          </div>
        )}

        {/* Mobile Menu Icon */}
        <Menu size={24} color="var(--text-main)" style={{ cursor: 'pointer' }} className="mobile-menu-icon" />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-icon { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
