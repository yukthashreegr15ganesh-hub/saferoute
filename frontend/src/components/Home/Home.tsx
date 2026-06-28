import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, LayoutDashboard, Shield, Navigation2, Users, Sparkles, Moon, Radio } from 'lucide-react';
import { useSafeRouteStore } from '../../store/safeRouteStore';
import { useLocation } from '../../hooks/useLocation';
import { mockSafetyScore } from '../../services/crowdIntel';
import { PageShell, Typewriter, SafetyGauge, CountUp, StaggerCard, ThreatPulseRing } from '../ui/shared';

export default function Home() {
  const { userProfile, contacts, routeHistory, journeyStats, nightModeAutoLock, toggleNightModeAutoLock } =
    useSafeRouteStore();
  const { location } = useLocation();
  const score = location ? mockSafetyScore(location) : 72;
  const threatLevel = score >= 70 ? 'safe' : score >= 45 ? 'moderate' : 'danger';
  const onlineSentinels = contacts.filter((c) => c.online).length;

  return (
    <PageShell className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-28 page-enter">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-wrap items-start gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield size={32} className="text-primary" />
          </div>
          <ThreatPulseRing level={threatLevel} />
        </div>
        <div>
          <h1 className="text-3xl font-heading text-primary">
            {userProfile ? (
              <>
                Hello, <Typewriter text={userProfile.name.split(' ')[0]} speed={80} className="inline" />
              </>
            ) : (
              'Command Center'
            )}
          </h1>
          <p className="text-textMuted text-sm mt-1">Live ops · Zone status {threatLevel.toUpperCase()}</p>
        </div>
        <label className="ml-auto flex items-center gap-2 glass-panel px-4 py-2 rounded-full cursor-pointer text-sm">
          <Moon size={16} className={nightModeAutoLock ? 'text-danger' : 'text-textMuted'} />
          <span>Night Mode Auto-Lock</span>
          <input type="checkbox" checked={nightModeAutoLock} onChange={toggleNightModeAutoLock} className="accent-danger" />
        </label>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StaggerCard index={0} className="glass-panel p-5 rounded-3xl flex flex-col items-center">
          <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Current Zone Safety</p>
          <SafetyGauge score={score} />
        </StaggerCard>
        <StaggerCard index={1} className="glass-panel p-5 rounded-3xl md:col-span-2">
          <h3 className="text-sm text-primary font-bold mb-3 flex items-center gap-2">
            <Sparkles size={16} /> Today&apos;s Safe Journey Stats
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary"><CountUp value={Math.round(journeyStats.distanceKm * 10) / 10} /> km</div>
              <div className="text-xs text-textMuted">Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-safe"><CountUp value={journeyStats.zonesCrossed} /></div>
              <div className="text-xs text-textMuted">Zones crossed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning"><CountUp value={journeyStats.alertsAvoided} /></div>
              <div className="text-xs text-textMuted">Alerts avoided</div>
            </div>
          </div>
        </StaggerCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StaggerCard index={2}>
          <Link to="/map" className="glass-panel p-6 rounded-3xl block btn-glow group h-full">
            <Map className="text-primary mb-3 group-hover:scale-110 transition-transform" size={32} />
            <h2 className="text-xl font-bold mb-1">Zone Navigation</h2>
            <p className="text-sm text-textMuted">Pre-scan crowd intel · compare SAFE paths</p>
          </Link>
        </StaggerCard>
        <StaggerCard index={3}>
          <Link to="/zone" className="glass-panel p-6 rounded-3xl block btn-glow h-full">
            <Radio className="text-primary mb-3" size={32} />
            <h2 className="text-xl font-bold mb-1">Zone Intelligence</h2>
            <p className="text-sm text-textMuted">City heatmap · crowd flow analytics</p>
          </Link>
        </StaggerCard>
      </div>

      <StaggerCard index={4} className="glass-panel rounded-3xl p-6 mb-6">
        <h3 className="font-bold text-primary mb-4">Quick Status</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4">
            <Users className="mx-auto text-safe mb-2 animate-pulse-slow" size={24} />
            <div className="text-2xl font-bold"><CountUp value={contacts.length} /></div>
            <div className="text-xs text-textMuted">Active Sentinels</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <Navigation2 className="mx-auto text-primary mb-2" size={24} />
            <div className="text-2xl font-bold"><CountUp value={routeHistory.length} /></div>
            <div className="text-xs text-textMuted">Path Memory</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <Sparkles className="mx-auto text-warning mb-2" size={24} />
            <div className="text-lg font-bold">ARIA</div>
            <div className="text-xs text-textMuted">AI Guardian · bottom-left</div>
          </div>
        </div>
        <p className="text-xs text-textMuted text-center mt-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          {onlineSentinels} Nearby Sentinels Online
        </p>
      </StaggerCard>

      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard" className="glass-panel px-4 py-2 rounded-full text-sm btn-glow flex items-center gap-2">
          <LayoutDashboard size={16} /> Guardian Command Center
        </Link>
        <Link to="/sentinels" className="glass-panel px-4 py-2 rounded-full text-sm btn-glow">Sentinel Network</Link>
        <Link to="/profile" className="glass-panel px-4 py-2 rounded-full text-sm btn-glow">Safety Profile</Link>
      </div>
    </PageShell>
  );
}
