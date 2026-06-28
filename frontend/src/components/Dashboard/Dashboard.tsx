import { useState } from 'react';
import { Shield, ShieldAlert, Navigation2, UserCircle, Award, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSafeRouteStore } from '../../store/safeRouteStore';
import PinPad from '../Onboarding/PinPad';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShell, StaggerCard } from '../ui/shared';
import ContactForm from '../Onboarding/ContactForm';

export default function Dashboard() {
  const { 
    userProfile,
    contacts, 
    removeContact, 
    routeHistory, 
    alertHistory, 
    shareLiveLocation, 
    toggleLiveLocation,
    pin,
    setPin,
    verifyPin,
    startFromBeginning,
  } = useSafeRouteStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const [stalkerNet, setStalkerNet] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const [showChangePin, setShowChangePin] = useState(false);
  const [pinPhase, setPinPhase] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const closeChangePin = () => {
    setShowChangePin(false);
    setPinPhase('current');
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setPinMsg('');
  };

  const handleChangePinStep = () => {
    if (pinPhase === 'current') {
      if (!verifyPin(currentPin)) {
        setPinMsg('Current PIN is incorrect.');
        setCurrentPin('');
        return;
      }
      setPinMsg('');
      setPinPhase('new');
      return;
    }
    if (pinPhase === 'new') {
      if (newPin.length !== 4) return;
      setPinMsg('');
      setPinPhase('confirm');
      return;
    }
    if (confirmNewPin !== newPin) {
      setPinMsg('New PINs do not match.');
      setConfirmNewPin('');
      return;
    }
    setPin(newPin);
    closeChangePin();
  };

  const [showDecoyPin, setShowDecoyPin] = useState(false);
  const [decoyPinInput, setDecoyPinInput] = useState('');
  
  const handleSetDecoy = () => {
    if (decoyPinInput.length === 4) {
      useSafeRouteStore.getState().setDecoyPin(decoyPinInput);
      setShowDecoyPin(false);
      setDecoyPinInput('');
    }
  };

  const ticker = [
    'Moderate crowd — MG Road',
    'Safe corridor — Indiranagar',
    'Incident cleared — Silk Board',
  ];

  return (
    <PageShell className="max-w-6xl mx-auto space-y-6 pb-24 p-4 md:p-8 page-enter">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-heading text-primary">Guardian Command Center</h1>
          {userProfile && (
            <p className="text-textMuted mt-1">{userProfile.name} • {userProfile.phone}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowChangePin(true)}
            className="text-sm font-bold text-primary hover:underline"
          >
            Change Passphrase
          </button>
          <button
            type="button"
            onClick={() => setShowDecoyPin(true)}
            className="text-sm font-bold text-danger hover:underline"
          >
            Set Stealth PIN
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-sm font-bold text-warning hover:underline"
          >
            Start from beginning
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <h2 className="text-xl font-bold mb-2">Start over?</h2>
              <p className="text-textMuted text-sm mb-6">
                This clears your profile, PIN, contacts, and history. You will go through setup again.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void startFromBeginning().then(() => {
                      window.location.href = '/onboarding';
                    });
                  }}
                  className="flex-1 py-3 rounded-xl bg-warning text-background font-bold"
                >
                  Yes, reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerCard index={0} className="glass-panel rounded-2xl overflow-hidden mb-6 border border-primary/20">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-xs font-bold text-primary">
          <Radio size={14} /> Threat Intelligence Feed
        </div>
        <motion.div
          animate={{ x: [0, -200] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="flex gap-8 px-4 py-3 whitespace-nowrap text-sm text-textMuted"
        >
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </motion.div>
      </StaggerCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Navigation2 size={20} /> Journey Chronicle
            </h2>
            {routeHistory.length === 0 ? (
              <div className="text-textMuted py-8 text-center">No routes taken yet.</div>
            ) : (
              <div className="space-y-3">
                {routeHistory.slice(0, 5).map((route, i) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white/5 border border-primary/10 p-4 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold">{route.start} <span className="text-textMuted mx-2">→</span> {route.destination}</div>
                      <div className="text-sm text-textMuted">{new Date(route.date).toLocaleDateString()} at {new Date(route.date).toLocaleTimeString()}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`font-bold ${route.score > 80 ? 'text-safe' : route.score > 60 ? 'text-warning' : 'text-danger'}`}>
                        Score: {route.score}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border-danger/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-danger">
              <ShieldAlert size={20} /> Incident Archive
            </h2>
            {alertHistory.length === 0 ? (
              <div className="text-textMuted py-8 text-center">No alerts triggered. You're safe!</div>
            ) : (
              <div className="space-y-3">
                {alertHistory.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      alert.resolved !== false
                        ? 'bg-safe/10 border border-safe/20'
                        : 'bg-danger/10 border border-danger/40 animate-pulse'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="text-danger" />
                      <div>
                        <div className="font-bold text-danger">{alert.type} Alert Triggered</div>
                        <div className="text-sm text-textMuted">{new Date(alert.date).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${
                      alert.resolved !== false ? 'bg-safe text-background' : 'bg-danger text-white'
                    }`}>
                      {alert.resolved !== false ? 'RESOLVED' : 'ACTIVE'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Settings / Toggles */}
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="text-primary" /> Settings
            </h2>
            
            <div className="flex items-center justify-between bg-white/5 border border-primary/10 p-4 rounded-xl cursor-pointer" onClick={toggleLiveLocation}>
              <div>
                <div className="font-bold">Share Live Location</div>
                <div className="text-sm text-textMuted">Always on with contacts</div>
              </div>
              <div className={`w-14 h-7 rounded-full relative ${shareLiveLocation ? 'bg-primary shadow-glow-sm' : 'bg-white/20'}`}>
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg"
                  animate={{ x: shareLiveLocation ? 28 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                />
              </div>
            </div>
            <Link to="/profile" className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline">
              <Award size={16} /> Guardian Achievements
            </Link>
          </div>

          {/* Hardware Simulations Panel */}
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-warning">
              <Radio size={20} /> Hardware Simulations
            </h2>
            
            <div className="flex items-center justify-between bg-white/5 border border-primary/10 p-4 rounded-xl cursor-pointer mb-3" onClick={() => setStalkerNet(!stalkerNet)}>
              <div>
                <div className="font-bold text-sm">Stalker-Net (Bluetooth)</div>
                <div className="text-xs text-textMuted">Detect matching MAC addresses</div>
              </div>
              <div className={`w-14 h-7 rounded-full relative ${stalkerNet ? 'bg-primary shadow-glow-sm' : 'bg-white/20'}`}>
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg"
                  animate={{ x: stalkerNet ? 28 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                />
              </div>
            </div>

            <button 
              onClick={() => alert("CRITICAL: Biometric SOS Triggered (150 BPM spike detected)")} 
              className="w-full py-3 rounded-xl bg-danger/10 text-danger font-bold border border-danger/30 hover:bg-danger hover:text-white transition-all text-sm"
            >
              Simulate 150 BPM HR Spike
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <UserCircle size={20} /> Sentinel Network
              </h2>
              <Link to="/sentinels" className="text-xs text-primary">View all</Link>
            </div>
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="bg-white/5 border border-primary/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                    {c.name.charAt(0)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-card ${c.online ? 'bg-safe' : 'bg-textMuted'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block truncate">{c.name}</span>
                    <span className="text-xs text-textMuted">{c.relationship} • {c.phone}</span>
                  </div>
                  <button onClick={() => removeContact(c.id)} className="text-sm text-danger hover:underline">Remove</button>
                </div>
              ))}
            </div>
            {contacts.length < 5 && !showAddContact && (
              <div className="mt-4 text-center">
                <button onClick={() => setShowAddContact(true)} className="text-sm text-primary font-bold hover:underline">
                  + Add more contacts (max 5)
                </button>
              </div>
            )}

            {showAddContact && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Add Emergency Contact</h3>
                  <button onClick={() => setShowAddContact(false)} className="text-xs text-textMuted hover:text-white">Cancel</button>
                </div>
                <ContactForm 
                  contacts={contacts} 
                  onAdd={(data) => {
                    useSafeRouteStore.getState().addContact(data);
                    setShowAddContact(false);
                  }} 
                  onRemove={removeContact} 
                />
              </div>
            )}
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showChangePin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel rounded-3xl p-6 max-w-sm w-full"
            >
              <h2 className="text-xl font-bold mb-2">
                {pinPhase === 'current' && 'Enter current PIN'}
                {pinPhase === 'new' && 'Enter new PIN'}
                {pinPhase === 'confirm' && 'Confirm new PIN'}
              </h2>
              <PinPad
                value={pinPhase === 'current' ? currentPin : pinPhase === 'new' ? newPin : confirmNewPin}
                onChange={(v) => {
                  setPinMsg('');
                  if (pinPhase === 'current') setCurrentPin(v);
                  else if (pinPhase === 'new') setNewPin(v);
                  else setConfirmNewPin(v);
                }}
              />
              {pinMsg && <p className="text-sm text-danger text-center mb-3">{pinMsg}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={closeChangePin} className="flex-1 py-3 rounded-xl border border-white/10 font-bold">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleChangePinStep}
                  disabled={
                    (pinPhase === 'current' ? currentPin : pinPhase === 'new' ? newPin : confirmNewPin).length !== 4
                  }
                  className="flex-1 py-3 rounded-xl bg-primary text-background font-bold disabled:opacity-50"
                >
                  {pinPhase === 'confirm' ? 'Save' : 'Next'}
                </button>
              </div>
              {!pin && (
                <button
                  type="button"
                  onClick={() => void startFromBeginning().then(() => { window.location.href = '/onboarding'; })}
                  className="w-full mt-4 text-sm text-warning hover:underline"
                >
                  No PIN saved — redo setup
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDecoyPin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel rounded-3xl p-6 max-w-sm w-full"
            >
              <h2 className="text-xl font-bold mb-2 text-danger">Set Stealth PIN</h2>
              <p className="text-xs text-textMuted mb-4">Entering this PIN at startup opens a calculator while secretly broadcasting SOS.</p>
              <PinPad
                value={decoyPinInput}
                onChange={setDecoyPinInput}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDecoyPin(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSetDecoy}
                  disabled={decoyPinInput.length !== 4}
                  className="flex-1 py-3 rounded-xl bg-danger text-white font-bold disabled:opacity-50"
                >
                  Save Stealth PIN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
