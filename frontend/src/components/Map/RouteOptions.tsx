import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield, Clock, Route, ChevronDown } from 'lucide-react';
import type { RouteData } from '../../services/routing';
import { getModeInfo } from '../../services/transportModes';
import { motion } from 'framer-motion';
import { CountUp } from '../ui/shared';

interface RouteOptionsProps {
  routes: RouteData[];
  activeRoute: RouteData | null;
  onSelect: (route: RouteData) => void;
  onStartNav: () => void;
  variant?: 'sidebar' | 'sheet';
  tripLabel?: string;
}

const SAFETY_CHIPS = ['Well-lit streets', 'CCTV coverage', 'Low incident reports', 'Active foot traffic'];

export default function RouteOptions({
  routes,
  activeRoute,
  onSelect,
  onStartNav,
  variant = 'sidebar',
  tripLabel,
}: RouteOptionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const mode = activeRoute?.transportMode ?? routes[0]?.transportMode ?? 'car';
  const modeInfo = getModeInfo(mode);

  return (
    <div className={variant === 'sidebar' ? 'h-full flex flex-col p-5 overflow-y-auto' : 'py-2'}>
      {variant === 'sidebar' && (
        <>
          <h2 className="text-xl font-heading text-primary mb-1 shrink-0">Route Intel</h2>
          {tripLabel && <p className="text-textMuted text-sm mb-3 shrink-0">{tripLabel}</p>}
          <p className="text-xs text-primary/80 mb-4 shrink-0">{modeInfo.description}</p>
        </>
      )}

      <div className="space-y-3">
        {routes.map((route, i) => {
          const isSelected = activeRoute?.id === route.id;
          const isSafe = route.label === 'SAFE';
          const isMod = route.label === 'MODERATE';
          const colorClass = isSafe
            ? 'text-safe bg-safe/10 border-safe/30'
            : isMod
              ? 'text-warning bg-warning/10 border-warning/30'
              : 'text-danger bg-danger/10 border-danger/30';
          const Icon = isSafe ? ShieldCheck : isMod ? Shield : ShieldAlert;
          const expanded = expandedId === route.id;

          return (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(route)}
              className={`p-4 rounded-2xl cursor-pointer border-2 transition-all glass-panel ${
                isSelected ? 'border-primary shadow-glow-sm' : 'border-white/10 hover:border-primary/30'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold flex items-center gap-2">
                    {isSafe && (
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8 }} className="inline-block">
                        <ShieldCheck size={18} className="text-safe" />
                      </motion.span>
                    )}
                    {isSafe ? 'Safest Route' : route.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-primary font-bold">
                    <Clock size={14} />
                    <span className="text-lg">{route.eta}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-textMuted mt-0.5">
                    <Route size={12} />
                    {route.distance}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isSafe ? 'border-safe text-safe' : isMod ? 'border-warning text-warning' : 'border-danger text-danger'
                  }`}
                >
                  <CountUp value={route.score} duration={900} />
                </span>
              </div>

              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border mb-2 ${colorClass}`}>
                <Icon size={12} /> {route.label}
              </div>

              <div className="flex flex-wrap gap-1">
                {route.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-textMuted">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(expanded ? null : route.id);
                }}
                className="text-xs text-primary mt-2 flex items-center gap-1"
              >
                Why this route? <ChevronDown size={12} className={expanded ? 'rotate-180' : ''} />
              </button>

              {expanded && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {SAFETY_CHIPS.map((chip, ci) => (
                    <motion.span
                      key={chip}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.1 }}
                      className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {chip}
                    </motion.span>
                  ))}
                </div>
              )}

              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartNav();
                  }}
                  className="w-full mt-3 bg-primary text-background font-bold py-2.5 rounded-xl text-sm heartbeat btn-glow"
                >
                  Navigate · {route.eta}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
