import React, { createContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MapView from './components/MapView';
import HeatmapDashboard from './components/HeatmapDashboard';
import Navbar from './components/Navbar';
import SOSButton from './components/SOSButton';
import AISafetyCopilot from './components/AISafetyCopilot';
import { Shield } from 'lucide-react';

export const AppContext = createContext();

// Page Transition Wrapper
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setDisplayLocation(location);
      setTransitionStage('fadeIn');
    }
  };

  const style = {
    width: '100%', height: '100%',
    transition: transitionStage === 'fadeOut' ? 'opacity 200ms ease, transform 200ms ease' : 'opacity 300ms ease, transform 300ms ease',
    opacity: transitionStage === 'fadeIn' ? 1 : 0,
    transform: transitionStage === 'fadeIn' ? 'translateY(0)' : 'translateY(-10px)',
    willChange: 'opacity, transform'
  };

  // On first render or when fading in, we want it to start from translateY(10px) if we just changed routes
  // But CSS transitions handle this best if we toggle a class, here we use inline styles.
  // Actually, keeping it simple: when fading out, it goes to -10px. When it switches to fadeIn, we reset it to 10px and let it transition to 0.
  // We'll manage this by forcing a reflow or just using CSS keyframes. Let's use simple CSS classes.

  return (
    <div
      style={style}
      onTransitionEnd={handleAnimationEnd}
    >
      {/* We need to render the displayLocation's elements */}
      <Routes location={displayLocation}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/dashboard" element={<HeatmapDashboard />} />
      </Routes>
    </div>
  );
};

// Animated Blobs Background
const BlobBackground = () => (
  <div className="blob-container">
    <div className="blob blob-1"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>
);

// Global Custom Cursor
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(${isHovering ? 1.3 : 1})`;
      }
    };

    const handleMouseOver = (e) => {
      // Check if hovering over interactive element
      const target = e.target;
      if (target.tagName.toLowerCase() === 'button' || target.closest('button') || target.tagName.toLowerCase() === 'a' || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isHovering]);

  return (
    <div ref={cursorRef} style={{
      position: 'fixed', top: -10, left: -10, pointerEvents: 'none', zIndex: 10000,
      transition: 'transform 0.1s ease-out', willChange: 'transform'
    }}>
      <Shield size={20} color={isHovering ? 'var(--danger)' : 'var(--primary)'} style={{ transition: 'color 0.2s' }} />
    </div>
  );
};

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [sosStatus, setSosStatus] = useState(false);
  const [shadowWalkStatus, setShadowWalkStatus] = useState({ active: false, session: null });

  // Global Ripple Effect for Buttons
  useEffect(() => {
    const createRipple = (e) => {
      const button = e.target.closest('button');
      if (button) {
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-circle');
        
        // Remove existing ripples to avoid DOM buildup
        const existingRipple = button.querySelector('.ripple-circle');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        // Button needs relative positioning and hidden overflow for ripple to work
        const computed = window.getComputedStyle(button);
        if (computed.position === 'static') {
          button.style.position = 'relative';
        }
        if (computed.overflow !== 'hidden') {
          button.style.overflow = 'hidden';
        }

        button.appendChild(circle);
        
        setTimeout(() => circle.remove(), 400); // 400ms match CSS
      }
    };

    document.addEventListener('mousedown', createRipple);
    return () => document.removeEventListener('mousedown', createRipple);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setUserLocation({ lat: 12.9716, lng: 77.5946 }) 
      );
    } else {
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  return (
    <AppContext.Provider value={{
      userLocation, setUserLocation,
      activeRoute, setActiveRoute,
      sosStatus, setSosStatus,
      shadowWalkStatus, setShadowWalkStatus
    }}>
      <Router>
        <CustomCursor />
        <BlobBackground />
        <Navbar />
        
        <div style={{ paddingTop: '64px', height: 'calc(100vh - 64px)', width: '100vw', overflowX: 'hidden' }}>
          <PageTransition />
        </div>

        <SOSButton />
        <AISafetyCopilot />
      </Router>
    </AppContext.Provider>
  );
}

export default App;
