import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import { PageShell, CountUp, StaggerCard } from '../components/ui/shared';
import { useLocation } from '../hooks/useLocation';
import { generateCrowdZones, ZONE_COLORS } from '../services/crowdIntel';

const SAFE_ZONES = ['Koramangala 5th Block', 'Indiranagar 100ft', 'Jayanagar 4th', 'Whitefield Main', 'HSR Sector 2'];
const HOTSPOTS = ['MG Road Junction', 'Brigade Rd Event', 'Majestic Hub', 'Silk Board', 'Forum Mall Perimeter'];

export default function ZoneIntelligence() {
  const { location } = useLocation();
  const zones = location ? generateCrowdZones(location) : [];

  return (
    <PageShell className="p-4 md:p-8 max-w-5xl mx-auto pb-28 page-enter">
      <h1 className="text-3xl font-heading text-primary mb-2">Zone Intelligence</h1>
      <p className="text-textMuted text-sm mb-8">Live crowd analytics · city heatmap</p>

      <StaggerCard index={0} className="glass-panel rounded-3xl p-6 mb-6 h-48 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          {zones.map((z, i) => (
            <motion.div
              key={z.id}
              className="absolute rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                width: z.radiusM / 8,
                height: z.radiusM / 8,
                background: ZONE_COLORS[z.level],
                opacity: 0.35,
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
            />
          ))}
        </div>
        <p className="relative z-10 text-sm text-primary font-bold">Animated city heatmap</p>
        <p className="relative z-10 text-xs text-textMuted mt-2">Teal = safe · Amber = moderate · Red = hotspots</p>
      </StaggerCard>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <StaggerCard index={1} className="glass-panel rounded-3xl p-5">
          <h3 className="text-safe font-bold mb-3 flex items-center gap-2"><Shield size={18} /> Top 5 Safest Zones</h3>
          <ol className="space-y-2">
            {SAFE_ZONES.map((z, i) => (
              <motion.li key={z} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex justify-between text-sm">
                <span>{i + 1}. {z}</span>
                <span className="text-safe font-mono"><CountUp value={92 - i * 3} />%</span>
              </motion.li>
            ))}
          </ol>
        </StaggerCard>
        <StaggerCard index={2} className="glass-panel rounded-3xl p-5">
          <h3 className="text-danger font-bold mb-3 flex items-center gap-2"><AlertTriangle size={18} /> Hotspot Areas</h3>
          <ol className="space-y-2">
            {HOTSPOTS.map((z, i) => (
              <motion.li key={z} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  {z}
                </span>
                <span className="text-danger text-xs">HIGH</span>
              </motion.li>
            ))}
          </ol>
        </StaggerCard>
      </div>

      <StaggerCard index={3} className="glass-panel rounded-3xl p-5">
        <h3 className="font-bold text-primary mb-4">Best Time to Travel (hourly)</h3>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 24 }, (_, h) => {
            const score = 40 + Math.sin(h / 3) * 35 + (h >= 22 || h <= 5 ? -15 : 10);
            return (
              <div
                key={h}
                className="flex-1 rounded-t bg-primary/60 hover:bg-primary transition-colors"
                style={{ height: `${score}%`, minHeight: 4 }}
                title={`${h}:00 — ${Math.round(score)}%`}
              />
            );
          })}
        </div>
        <p className="text-xs text-textMuted mt-2 text-center">Safer windows: 10am–4pm · Avoid 9–11pm</p>
      </StaggerCard>
    </PageShell>
  );
}
