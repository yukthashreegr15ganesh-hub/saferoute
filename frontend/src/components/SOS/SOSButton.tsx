import { useState, useEffect, useRef } from 'react';
import { Radio, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeRouteStore } from '../../store/safeRouteStore';
import { useLocation } from '../../hooks/useLocation';
import { useSOS } from '../../hooks/useSOS';
import { sendPushNotification } from '../../services/notifications';
import PinPad from '../Onboarding/PinPad';

export default function SOSButton() {
  const { location } = useLocation();
  const { verifyPin, pin } = useSafeRouteStore();
  const { sosActive, sosStealth, triggerSOS, deactivateSOS } = useSOS(location);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSentFlash, setShowSentFlash] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [deactivatePin, setDeactivatePin] = useState('');
  const [pinError, setPinError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastTap, setLastTap] = useState(0);
  const [stealthGlow, setStealthGlow] = useState(false);

  const cancelCountdown = () => {
    setShowConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const fireInstant = () => {
    setShowSentFlash(true);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    void triggerSOS(false);
    setTimeout(() => setShowSentFlash(false), 2500);
  };

  const requestDeactivate = () => {
    if (!pin) {
      setPinError('Set passphrase in Command Center.');
      setShowPinModal(true);
      return;
    }
    setDeactivatePin('');
    setPinError('');
    setShowPinModal(true);
  };

  const confirmDeactivate = () => {
    if (deactivatePin.length !== 4) return;
    if (!verifyPin(deactivatePin)) {
      setPinError('Incorrect passphrase.');
      setDeactivatePin('');
      return;
    }
    setShowPinModal(false);
    void deactivateSOS();
  };

  const handlePointerDown = () => {
    if (sosActive) return;
    const now = Date.now();
    if (now - lastTap < 350) {
      if (timerRef.current) clearInterval(timerRef.current);
      setShowConfirm(false);
      fireInstant();
      return;
    }
    setLastTap(now);
    holdTimerRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setShowConfirm(false);
      setStealthGlow(true);
      void triggerSOS(true);
      setTimeout(() => setStealthGlow(false), 2000);
    }, 2000);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (sosActive || showConfirm) return;
    setTimeout(() => {
      if (!sosActive) {
        setShowConfirm(true);
        setCountdown(5);
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              void triggerSOS(false);
              setShowConfirm(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 300);
  };

  useEffect(() => {
    if (sosActive) {
      if (sosStealth) {
        sendPushNotification('System Update', 'Background sync complete.'); // Stealth disguise
      } else {
        sendPushNotification('GUARDIAN SOS ACTIVE', 'Broadcasting live location to emergency contacts and nearby sentinels!');
      }
    }
  }, [sosActive, sosStealth]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    },
    []
  );

  const ringPct = ((5 - countdown) / 5) * 100;

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <motion.button
          type="button"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`relative w-[4.5rem] h-[4.5rem] rounded-full flex flex-col items-center justify-center text-white shadow-danger font-bold text-[9px] tracking-wider ${
            stealthGlow || sosStealth
              ? 'bg-gradient-to-br from-warning to-amber-700'
              : sosActive
                ? 'bg-danger'
                : 'bg-gradient-to-br from-danger to-red-900'
          }`}
          style={{ boxShadow: sosActive ? '0 0 30px rgba(255,71,87,0.7)' : undefined }}
        >
          <Radio size={22} />
          <span className="mt-0.5">PULSE</span>
        </motion.button>
        <p className="text-[10px] text-textMuted text-center mt-1 w-20">GUARDIAN</p>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel border border-danger/40 rounded-3xl p-8 max-w-sm w-full text-center">
              <p className="text-sm text-textMuted mb-4">Sending your signal to Sentinels…</p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#FF4757"
                    strokeWidth="6"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 * (1 - ringPct / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-danger">{countdown}</span>
              </div>
              <p className="text-xs text-textMuted mb-6">Double-tap · instant · Hold 2s · Stealth</p>
              <button type="button" onClick={cancelCountdown} className="w-full py-3 rounded-xl border border-white/10 font-bold">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSentFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] bg-danger/40 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 2, 3], opacity: [0.8, 0.3, 0] }}
              className="absolute w-32 h-32 rounded-full border-4 border-white"
            />
            <motion.h2
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl md:text-3xl font-black text-white text-center px-4 z-10"
            >
              SIGNAL SENT — SENTINELS NOTIFIED
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sosActive && !sosStealth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[40] pointer-events-none">
            <div className="absolute inset-0 border-[6px] border-danger/40 animate-pulse rounded-lg" />
            <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto bg-danger text-white pl-6 pr-3 py-2 rounded-full font-bold flex items-center gap-4 shadow-danger">
              GUARDIAN PULSE ACTIVE
              <button type="button" onClick={requestDeactivate} className="bg-white/20 hover:bg-white/30 transition p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 p-4">
            <div className="glass-panel rounded-3xl p-6 max-w-[320px] w-full mx-auto">
              <h2 className="text-xl font-bold text-center mb-6 text-primary">Enter PIN to Cancel</h2>
              <PinPad value={deactivatePin} onChange={(v) => { setPinError(''); setDeactivatePin(v); }} />
              {pinError && <p className="text-danger text-sm text-center mt-2">{pinError}</p>}
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-3 rounded-xl border border-white/10">Back</button>
                <button type="button" onClick={confirmDeactivate} disabled={deactivatePin.length !== 4} className="flex-1 py-3 rounded-xl bg-primary text-background font-bold disabled:opacity-40">
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
