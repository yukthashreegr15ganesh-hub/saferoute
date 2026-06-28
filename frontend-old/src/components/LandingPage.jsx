import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Eye, Bell, Navigation, Users, ArrowRight } from 'lucide-react';

// Reusable Counter Hook for Intersection Observer
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const element = ref.current;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(step);
          }
        };
        animationFrame = window.requestAnimationFrame(step);
        observer.unobserve(element);
      }
    }, { threshold: 0.5 });

    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [end, duration]);

  return [ref, count];
};

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Custom hook usage for stats
  const [routesRef, routesCount] = useCounter(12450);
  const [incidentsRef, incidentsCount] = useCounter(890);
  const [protectedRef, protectedCount] = useCounter(45200);

  const features = [
    { icon: Navigation, title: 'Safe Routing', desc: 'Finds the safest path based on lighting, crowd density, and historical data.' },
    { icon: MapPin, title: 'Safe Spots', desc: 'Instantly locate nearby 24/7 shops, hospitals, and police stations.' },
    { icon: Eye, title: 'Shadow Walk', desc: 'Share your live location with trusted contacts until you reach your destination.' },
    { icon: Bell, title: 'SOS Alerts', desc: 'One-tap emergency alerts sent directly to your contacts.' },
    { icon: Users, title: 'Crowd Pulse', desc: 'Real-time community confirmations of safe and active areas.' },
    { icon: Shield, title: 'AI Copilot', desc: 'Get contextual safety advice based on your current location and time.' }
  ];

  // Particle generation
  const particles = Array.from({ length: 30 }).map((_, i) => (
    <div key={i} style={{
      position: 'absolute',
      width: '2px', height: '2px', background: 'var(--primary)',
      opacity: 0.2, borderRadius: '50%',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `floatUp ${10 + Math.random() * 10}s infinite linear`,
      animationDelay: `-${Math.random() * 10}s`
    }} />
  ));

  // Intersection observer for fade-ins
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Particle Field CSS */}
      <style>{`
        @keyframes floatUp {
          from { transform: translateY(100vh); opacity: 0; }
          50% { opacity: 0.2; }
          to { transform: translateY(-20vh); opacity: 0; }
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes wordReveal {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .word { opacity: 0; animation: wordReveal 0.4s ease forwards; display: inline-block; margin-right: 8px; }
        
        .scroll-reveal { opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .scroll-reveal.is-visible { opacity: 1; transform: translateY(0); }
        
        .feat-card:hover .feat-icon-bg { background: rgba(13, 115, 119, 0.2) !important; }
        .feat-card:hover .feat-icon { color: var(--primary) !important; }
        .feat-card:hover .feat-arrow { transform: translateX(0) !important; opacity: 1 !important; }
        
        .stat-card:hover { transform: translateY(-6px); border-color: var(--primary); }
        
        #how-it-works-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
        #how-it-works-line.is-visible { animation: drawLine 2s ease forwards; }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
      `}</style>

      {/* Hero Section */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '100px 0 120px', overflow: 'hidden' }}>
        {particles}

        {/* CSS Clip-Path Shield */}
        <div style={{
          width: '120px', height: '120px', margin: '0 auto 40px',
          background: 'var(--danger)',
          clipPath: 'polygon(50% 0%, 100% 20%, 100% 60%, 50% 100%, 0% 60%, 0% 20%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 30px rgba(13,115,119,0.6), 0 0 40px rgba(255, 77, 109, 0.4)',
          animation: 'breathe 3s infinite',
          position: 'relative'
        }}>
           <Shield size={60} color="#fff" />
        </div>
        
        <h1 style={{ fontSize: '56px', marginBottom: '24px', lineHeight: 1.2, fontWeight: 700 }}>
          <div style={{ overflow: 'hidden' }}>
            {['Google', 'Maps', 'shows', 'the', 'fastest', 'route.'].map((w, i) => (
              <span key={i} className="word" style={{ animationDelay: `${i * 0.1}s` }}>{w}</span>
            ))}
          </div>
          <div style={{ color: 'var(--primary)', overflow: 'hidden' }}>
            {['We', 'show', 'the', 'safest', 'one.'].map((w, i) => (
              <span key={i} className="word" style={{ animationDelay: `${(i + 6) * 0.1}s` }}>{w}</span>
            ))}
            <span style={{ animation: 'blink 1s step-end infinite', marginLeft: '4px', opacity: 0, animationDelay: '1.2s', animationFillMode: 'forwards' }}>|</span>
          </div>
        </h1>
        
        <p style={{ 
          color: 'var(--text-muted)', fontSize: '20px', maxWidth: '600px', margin: '0 auto 40px',
          opacity: 0, animation: 'fadeSlideUp 0.6s ease forwards', animationDelay: '0.8s'
        }}>
          Navigate your city with confidence. Real-time crowd data, AI-powered safety scoring, and instant SOS alerts.
        </p>
        
        <div style={{ opacity: 0, animation: 'bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', animationDelay: '1.2s' }}>
          <button className="shimmer-btn cta-glow ripple" onClick={() => navigate('/map')} style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            padding: '18px 48px', fontSize: '18px', fontWeight: 600, borderRadius: '30px',
            display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto'
          }}>
            Find Safe Route <Navigation size={20} />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '120px' }}>
        {[
          { label: 'Routes Mapped', val: routesCount, ref: routesRef, icon: '🗺️' },
          { label: 'Incidents Avoided', val: incidentsCount, ref: incidentsRef, icon: '🚫' },
          { label: 'Women Protected', val: protectedCount, ref: protectedRef, icon: '🛡️' }
        ].map((stat, i) => (
          <div key={i} ref={stat.ref} className="glass-card stat-card scroll-reveal" style={{ textAlign: 'center', padding: '32px', transition: 'all 250ms' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>{stat.icon}</div>
            <div style={{ fontSize: '48px', fontFamily: 'Clash Display', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
              {stat.val.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: '120px' }}>
        <h2 className="scroll-reveal" style={{ textAlign: 'center', fontSize: '40px', marginBottom: '60px' }}>Comprehensive Protection</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feat, i) => (
            <div key={i} className="glass-card feat-card scroll-reveal" style={{ 
              transitionDelay: `${i * 100}ms`, borderRadius: '24px', padding: '32px',
              borderLeft: '1px solid var(--glass-border)', transition: 'all 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="feat-icon-bg" style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                  transition: 'background 0.3s'
                }}>
                  <feat.icon className="feat-icon" size={28} color="var(--text-muted)" style={{ transition: 'color 0.3s' }} />
                </div>
                <ArrowRight className="feat-arrow" size={20} color="var(--primary)" style={{ opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.3s' }} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: '120px', position: 'relative' }}>
        <h2 className="scroll-reveal" style={{ textAlign: 'center', fontSize: '40px', marginBottom: '80px' }}>How It Works</h2>
        
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto' }}>
          {/* Animated Line */}
          <svg width="100%" height="4" style={{ position: 'absolute', top: '24px', left: 0, zIndex: -1 }}>
            <line id="how-it-works-line" className="scroll-reveal" x1="0" y1="2" x2="100%" y2="2" stroke="var(--primary)" strokeWidth="2" strokeDasharray="10, 10" />
          </svg>

          {[
            { num: 1, title: "Search Destination", desc: "Enter where you need to go." },
            { num: 2, title: "Review AI Routes", desc: "Compare safety scores and conditions." },
            { num: 3, title: "Navigate Safely", desc: "Walk with active shadow tracking." }
          ].map((step, i) => (
            <div key={i} className="scroll-reveal" style={{ textAlign: 'center', width: '200px', background: 'var(--bg-color)', transitionDelay: `${i * 200}ms` }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-color)',
                border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '20px', fontWeight: 700, color: 'var(--primary)'
              }}>
                {step.num}
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{step.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '60px', 
        color: 'var(--text-muted)', paddingBottom: '60px', position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: -1, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />
        <Shield size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px' }}>SafeRoute</h3>
        <p style={{ margin: '0 0 16px 0' }}>Built for 70 crore women.</p>
        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px' }}>GitHub Repository</a>
      </footer>
    </div>
  );
}
