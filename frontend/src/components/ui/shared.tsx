import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export function ParticleBackground() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            animation: `float-up ${p.duration}s ${p.delay}s ease-in infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ops-bg relative flex-1 overflow-auto ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,178,0.04)_0%,transparent_65%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Typewriter({ text, speed = 40, className = '' }: { text: string; speed?: number; className?: string }) {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    let i = 0;
    const t = setInterval(() => {
      setOut(text.slice(0, ++i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span className={className}>{out}<span className="animate-pulse text-primary">|</span></span>;
}

export function CountUp({ value, duration = 1200, className = '' }: { value: number; duration?: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span className={className}>{n}</span>;
}

export function SafetyGauge({ score, size = 120 }: { score: number; size?: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#2ED573' : pct >= 45 ? '#FFA502' : '#FF4757';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90 fill-white font-bold"
        style={{ fontSize: size * 0.22, transform: `rotate(90deg)`, transformOrigin: 'center' }}
      >
        {pct}
      </text>
    </svg>
  );
}

export function GlowProgress({ step, total = 5 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-2 flex-1 rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: i < step ? '100%' : '0%' }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            style={{ boxShadow: i < step ? '0 0 12px rgba(0,255,178,0.6)' : undefined }}
          />
        </div>
      ))}
    </div>
  );
}

export function ActivateButton({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [ping, setPing] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setPing(true);
        setTimeout(() => setPing(false), 600);
        onClick?.();
      }}
      disabled={disabled}
      className={`charge-btn relative w-full overflow-hidden bg-primary text-background font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 btn-glow ${className}`}
    >
      <span className="absolute inset-0 charge-bar opacity-0 hover:opacity-30" />
      {ping && (
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-primary"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function StaggerCard({ children, index = 0, className = '' }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ThreatPulseRing({ level }: { level: 'safe' | 'moderate' | 'danger' }) {
  const color = level === 'safe' ? '#2ED573' : level === 'moderate' ? '#FFA502' : '#FF4757';
  return (
    <span className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 3px ${color}55`, animation: 'pulse-slow 2s infinite' }} />
  );
}
