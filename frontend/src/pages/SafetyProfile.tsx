import { motion } from 'framer-motion';
import { Award, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PageShell, CountUp, StaggerCard } from '../components/ui/shared';
import { useSafeRouteStore } from '../store/safeRouteStore';

const LEVELS = ['Recruit', 'Sentinel', 'Guardian', 'Elite Guardian'] as const;
const BADGES = [
  { id: 'night-owl', name: 'Night Owl', desc: '5 safe night journeys' },
  { id: 'sentinel-builder', name: 'Sentinel Builder', desc: '5 contacts linked' },
  { id: 'path-master', name: 'Path Master', desc: '10 routes logged' },
];

export default function SafetyProfile() {
  const { userProfile, routeHistory, journeyStats, achievements } = useSafeRouteStore();
  const levelIdx = Math.min(3, Math.floor(routeHistory.length / 3));
  const level = LEVELS[levelIdx];

  return (
    <PageShell className="p-4 md:p-8 max-w-4xl mx-auto pb-28 page-enter">
      <div className="flex items-center gap-6 mb-8">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
        >
          <Shield size={40} className="text-primary" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-heading text-primary">{userProfile?.name ?? 'Guardian'}</h1>
          <p className="text-primary font-bold">{level}</p>
          <p className="text-xs text-textMuted">{userProfile?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StaggerCard index={0} className="glass-panel p-4 rounded-2xl text-center">
          <div className="text-2xl font-bold text-primary"><CountUp value={routeHistory.length} /></div>
          <div className="text-xs text-textMuted">Safe journeys</div>
        </StaggerCard>
        <StaggerCard index={1} className="glass-panel p-4 rounded-2xl text-center">
          <div className="text-2xl font-bold text-safe"><CountUp value={Math.round(journeyStats.distanceKm)} /> km</div>
          <div className="text-xs text-textMuted">Distance</div>
        </StaggerCard>
        <StaggerCard index={2} className="glass-panel p-4 rounded-2xl text-center">
          <div className="text-2xl font-bold text-warning"><CountUp value={journeyStats.zonesCrossed} /></div>
          <div className="text-xs text-textMuted">Zones</div>
        </StaggerCard>
      </div>

      <h2 className="font-bold text-primary mb-4 flex items-center gap-2"><Award size={20} /> Guardian Achievements</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {BADGES.map((b, i) => {
          const unlocked = achievements.includes(b.id) || (b.id === 'path-master' && routeHistory.length >= 10);
          return (
            <StaggerCard
              key={b.id}
              index={i}
              className={`glass-panel p-4 rounded-2xl text-center ${unlocked ? 'border-primary/40' : 'opacity-50'}`}
            >
              <motion.div animate={unlocked ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
                <Award className={`mx-auto mb-2 ${unlocked ? 'text-primary' : 'text-textMuted'}`} size={32} />
              </motion.div>
              <div className="font-bold text-sm">{b.name}</div>
              <div className="text-xs text-textMuted">{b.desc}</div>
            </StaggerCard>
          );
        })}
      </div>

      <h2 className="font-bold text-primary mb-4 flex items-center gap-2 mt-8">Advanced Analytics</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-3xl border border-primary/20">
          <h3 className="text-sm text-textMuted mb-4">Route Safety Scores</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeHistory.slice(0, 5).map((r, i) => ({ name: `R${i+1}`, score: r.score }))}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                <Bar dataKey="score" fill="#00ffb2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl border border-primary/20">
          <h3 className="text-sm text-textMuted mb-4">Commute Stress Levels (Biometric)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { time: '18:00', stress: 40 },
                { time: '18:15', stress: 45 },
                { time: '18:30', stress: 85 },
                { time: '18:45', stress: 55 },
                { time: '19:00', stress: 30 }
              ]}>
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                <Line type="monotone" dataKey="stress" stroke="#ff3366" strokeWidth={3} dot={{r: 4, fill: '#ff3366'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
