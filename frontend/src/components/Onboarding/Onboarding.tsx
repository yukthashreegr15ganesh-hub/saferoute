import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Moon, Users, User, Sparkles } from 'lucide-react';
import { useSafeRouteStore, type GuardianMode } from '../../store/safeRouteStore';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts';
import PinPad from './PinPad';
import ContactForm from './ContactForm';
import {
  ParticleBackground,
  GlowProgress,
  Typewriter,
  ActivateButton,
} from '../ui/shared';

const MODES: { id: GuardianMode; label: string; icon: typeof User; desc: string }[] = [
  { id: 'solo', label: 'Solo Traveler', icon: User, desc: 'Optimized solo path intelligence' },
  { id: 'night', label: 'Night Commuter', icon: Moon, desc: 'Enhanced night corridor scanning' },
  { id: 'group', label: 'Group Journey', icon: Users, desc: 'Shared sentinel alerts & routes' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { setPin, setUserProfile, setGuardianMode, userProfile, completeOnboarding, setPermission } =
    useSafeRouteStore();
  const { contacts, add, remove, canProceed } = useEmergencyContacts();
  const [pinPhase, setPinPhase] = useState<'create' | 'confirm'>('create');
  const [draftPin, setDraftPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedMode, setSelectedMode] = useState<GuardianMode | null>(null);
  const [perms, setPerms] = useState({ loc: false, mic: false, notif: false });

  const displayStep = step === 0 ? (introDone ? 1 : 0) : step;
  const progressStep = introDone ? step : 0;

  const handleIntroComplete = () => {
    setIntroDone(true);
    setStep(1);
  };

  const handleIdentity = () => {
    setUserProfile({ name: name.trim(), phone: phone.trim(), guardianLevel: 'Recruit' });
    setStep(2);
  };

  const handlePinContinue = () => {
    if (pinPhase === 'create') {
      if (draftPin.length !== 4) return;
      setPinError('');
      setConfirmPin('');
      setPinPhase('confirm');
      return;
    }
    if (confirmPin !== draftPin) {
      setPinError('Passphrases do not match.');
      setConfirmPin('');
      return;
    }
    setPin(draftPin);
    setStep(3);
  };

  const handleMode = () => {
    if (!selectedMode) return;
    setGuardianMode(selectedMode);
    setStep(4);
  };

  const handleFinish = () => {
    setPermission('location', perms.loc);
    setPermission('microphone', perms.mic);
    setPermission('notifications', perms.notif);
    completeOnboarding();
  };

  return (
    <div className="min-h-screen ops-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute top-6 left-6 flex items-center gap-2 text-primary font-heading text-xl font-bold z-20">
        <Shield size={28} className="text-primary" />
        SafeRoute
      </div>

      <div className="w-full max-w-md relative z-10">
        {displayStep > 0 && <GlowProgress step={progressStep} total={5} />}

        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-primary/20">
          <AnimatePresence mode="wait">
            {step === 0 && !introDone && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
                  className="w-28 h-28 mx-auto mb-6 relative"
                >
                  <Shield size={80} className="text-primary mx-auto drop-shadow-glow" />
                  <motion.span
                    className="absolute -top-1 -right-1 text-warning"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Sparkles size={24} />
                  </motion.span>
                </motion.div>
                <h2 className="text-2xl mb-4 text-primary font-heading">Your Guardian in Every Journey</h2>
                <p className="text-textMuted text-sm mb-8 min-h-[1.5rem]">
                  <Typewriter text="Initializing shield protocols…" speed={35} />
                </p>
                <ActivateButton onClick={handleIntroComplete}>Begin Activation</ActivateButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <h2 className="text-2xl mb-1 text-primary">Identity Protocol</h2>
                <p className="text-textMuted mb-6 text-sm">Register your guardian profile.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-primary/80 mb-1 uppercase tracking-wider">Your Identity, Guardian</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-primary/20 rounded-xl p-3 outline-none focus:border-primary focus:shadow-glow-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-primary/80 mb-1 uppercase tracking-wider">Your Signal Frequency</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-primary/20 rounded-xl p-3 outline-none focus:border-primary"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <ActivateButton onClick={handleIdentity} disabled={!name.trim() || !phone.trim()}>
                    Activate Shield →
                  </ActivateButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <h2 className="text-2xl mb-1">Set Your SOS Passphrase</h2>
                <p className="text-textMuted mb-4 text-sm">
                  {pinPhase === 'create' ? '4-digit PIN or voice keyword backup.' : 'Confirm your passphrase.'}
                </p>
                <PinPad
                  value={pinPhase === 'create' ? draftPin : confirmPin}
                  onChange={(v) => {
                    setPinError('');
                    if (pinPhase === 'create') setDraftPin(v);
                    else setConfirmPin(v);
                  }}
                />
                {pinError && <p className="text-danger text-sm text-center mb-2">{pinError}</p>}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-white/10">
                    Back
                  </button>
                  <ActivateButton
                    onClick={handlePinContinue}
                    disabled={(pinPhase === 'create' ? draftPin : confirmPin).length !== 4}
                    className="flex-[2]"
                  >
                    Continue <ChevronRight size={18} />
                  </ActivateButton>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <h2 className="text-2xl mb-1">Choose Your Guardian Mode</h2>
                <p className="text-textMuted mb-4 text-sm">Tailors crowd intel & route scoring.</p>
                <div className="space-y-3">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    const sel = selectedMode === m.id;
                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        whileHover={{ scale: 1.02, rotateX: 4 }}
                        onClick={() => setSelectedMode(m.id)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                          sel ? 'border-primary bg-primary/10 shadow-glow-sm' : 'border-white/10 bg-white/5'
                        }`}
                        style={{ perspective: 600 }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={sel ? 'text-primary' : 'text-textMuted'} size={28} />
                          <div>
                            <div className="font-bold">{m.label}</div>
                            <div className="text-xs text-textMuted">{m.desc}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <ActivateButton onClick={handleMode} disabled={!selectedMode}>
                    Continue <ChevronRight size={18} />
                  </ActivateButton>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <h2 className="text-2xl mb-1">Link Your Sentinels</h2>
                <p className="text-textMuted mb-4 text-sm">2–5 emergency contacts receive your signal.</p>
                <ContactForm contacts={contacts} onAdd={add} onRemove={remove} />
                <ActivateButton onClick={() => setStep(5)} disabled={!canProceed} className="mt-6">
                  {contacts.length < 2 ? `Add ${2 - contacts.length} more` : 'Continue'} <ChevronRight size={18} />
                </ActivateButton>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="s5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.8 }}
                  className="w-32 h-32 mx-auto mb-6 relative"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      style={{ left: '50%', top: '50%' }}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos((i / 12) * Math.PI * 2) * 60,
                        y: Math.sin((i / 12) * Math.PI * 2) * 60,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  ))}
                  <Shield size={64} className="text-primary mx-auto relative z-10" />
                </motion.div>
                <h2 className="text-3xl text-primary mb-2">Your Shield is Ready</h2>
                <p className="text-textMuted mb-6 text-sm">
                  Welcome, {(userProfile?.name || name).split(' ')[0]}! Guardian mode active.
                </p>
                <div className="space-y-2 mb-6 text-left text-sm">
                  {['location', 'mic', 'notif'].map((k) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer glass-panel p-3 rounded-xl">
                      <input
                        type="checkbox"
                        checked={k === 'location' ? perms.loc : k === 'mic' ? perms.mic : perms.notif}
                        onChange={() =>
                          setPerms((p) =>
                            k === 'location' ? { ...p, loc: !p.loc } : k === 'mic' ? { ...p, mic: !p.mic } : { ...p, notif: !p.notif }
                          )
                        }
                        className="accent-primary"
                      />
                      <span>{k === 'location' ? 'Location' : k === 'mic' ? 'Microphone' : 'Notifications'}</span>
                    </label>
                  ))}
                </div>
                <ActivateButton onClick={handleFinish} disabled={!perms.loc}>
                  Enter Command Center <ChevronRight size={18} />
                </ActivateButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
