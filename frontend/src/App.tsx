import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSafeRouteStore } from './store/safeRouteStore';
import Home from './components/Home/Home';
import MapView from './components/Map/MapView';
import Dashboard from './components/Dashboard/Dashboard';
import Onboarding from './components/Onboarding/Onboarding';
import SOSButton from './components/SOS/SOSButton';
import Aria from './components/Aria/Aria';
import NavigationBar from './components/NavigationBar';
import ZoneIntelligence from './pages/ZoneIntelligence';
import SentinelNetwork from './pages/SentinelNetwork';
import IncidentReport from './pages/IncidentReport';
import SafetyProfile from './pages/SafetyProfile';
import CalculatorDisguise from './pages/CalculatorDisguise';
import PinPad from './components/Onboarding/PinPad';
import LiveTracker from './pages/LiveTracker';

function AppShell({ children }: { children: React.ReactNode }) {
  const nightMode = useSafeRouteStore((s) => s.nightModeAutoLock);
  return (
    <div className={nightMode ? 'night-ops flex-1 flex flex-col min-h-0' : 'flex-1 flex flex-col min-h-0'}>
      <NavigationBar />
      <div className="flex-1 relative min-h-0 flex flex-col page-enter">{children}</div>
      <SOSButton />
      <Aria />
    </div>
  );
}

function FreshStartRedirect() {
  const navigate = useNavigate();
  const startFromBeginning = useSafeRouteStore((s) => s.startFromBeginning);

  useEffect(() => {
    void startFromBeginning().then(() => navigate('/onboarding', { replace: true }));
  }, [startFromBeginning, navigate]);

  return (
    <div className="w-screen h-screen ops-bg flex flex-col items-center justify-center gap-3">
      <Loader2 size={40} className="text-primary animate-spin" />
      <p className="text-textMuted text-sm">Resetting shield…</p>
    </div>
  );
}

function AppRoutes() {
  const hasOnboarded = useSafeRouteStore((s) => s.hasOnboarded);
  const location = useLocation();

  if (!hasOnboarded) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/start-over" element={<FreshStartRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/track/:id" element={<LiveTracker />} />
      <Route path="/start-over" element={<FreshStartRedirect />} />
      <Route path="/onboarding" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<AppShell><Home /></AppShell>} />
      <Route path="/map" element={<AppShell><MapView /></AppShell>} />
      <Route path="/zone" element={<AppShell><ZoneIntelligence /></AppShell>} />
      <Route path="/sentinels" element={<AppShell><SentinelNetwork /></AppShell>} />
      <Route path="/report" element={<AppShell><IncidentReport /></AppShell>} />
      <Route path="/profile" element={<AppShell><SafetyProfile /></AppShell>} />
      <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
      <Route path="/calculator" element={<CalculatorDisguise />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  const [hydrated, setHydrated] = useState(() => useSafeRouteStore.persist.hasHydrated());
  const [isLocked, setIsLocked] = useState(true);
  const [lockPin, setLockPin] = useState('');
  const [lockMsg, setLockMsg] = useState('');
  const { hasOnboarded, verifyPin, verifyDecoyPin } = useSafeRouteStore();

  useEffect(() => {
    const unsub = useSafeRouteStore.persist.onFinishHydration(() => setHydrated(true));
    if (useSafeRouteStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <div className="w-screen h-screen ops-bg flex flex-col items-center justify-center gap-3">
        <div className="w-48 h-24 rounded-2xl shimmer glass-panel mb-4" />
        <Loader2 size={40} className="text-primary animate-spin" />
        <p className="text-textMuted text-sm">Initializing Guardian systems…</p>
      </div>
    );
  }

  const isTrackingRoute = window.location.pathname.startsWith('/track/');

  // If onboarded, force PIN entry before showing routes (unless it's the external tracking route)
  if (hasOnboarded && isLocked && !isTrackingRoute) {
    const handleUnlock = () => {
      if (lockPin.length !== 4) return;
      if (verifyDecoyPin(lockPin)) {
        // Trigger stealth SOS and go to calculator
        setIsLocked(false);
        window.location.href = '/calculator'; // Force un-SPA navigation to isolate history
        return;
      }
      if (verifyPin(lockPin)) {
        setIsLocked(false);
        return;
      }
      setLockMsg('Incorrect PIN');
      setLockPin('');
    };

    return (
      <div className="w-screen h-screen ops-bg text-textMain flex flex-col items-center justify-center p-6">
        <div className="max-w-xs w-full text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">SafeRoute Locked</h1>
          <p className="text-textMuted mb-8 text-sm">Enter your PIN to continue</p>
          <PinPad 
            value={lockPin} 
            onChange={(v) => { setLockPin(v); setLockMsg(''); }} 
          />
          {lockMsg && <p className="text-danger mt-4 text-sm font-bold">{lockMsg}</p>}
          <button 
            onClick={handleUnlock}
            disabled={lockPin.length !== 4}
            className="w-full mt-6 py-4 rounded-xl bg-primary text-background font-bold disabled:opacity-40"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="w-screen h-screen ops-bg text-textMain flex flex-col overflow-hidden">
        <AppRoutes />
      </div>
    </Router>
  );
}
