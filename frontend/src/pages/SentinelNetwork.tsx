import { Link } from 'react-router-dom';
import { Users, Map, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell, StaggerCard } from '../components/ui/shared';
import { useSafeRouteStore } from '../store/safeRouteStore';

export default function SentinelNetwork() {
  const { contacts, updateContact, guardianMode } = useSafeRouteStore();

  return (
    <PageShell className="p-4 md:p-8 max-w-4xl mx-auto pb-28 page-enter">
      <h1 className="text-3xl font-heading text-primary mb-2">Sentinel Network</h1>
      <p className="text-textMuted text-sm mb-6">
        Social safety mesh · Mode: <span className="text-primary capitalize">{guardianMode ?? '—'}</span>
      </p>

      {guardianMode === 'group' && (
        <div className="glass-panel border border-primary/30 rounded-2xl p-4 mb-6 text-sm">
          <Radio className="inline text-primary mr-2" size={18} />
          Group journey active — shared routes & mutual alerts enabled.
        </div>
      )}

      <div className="space-y-4">
        {contacts.map((c, i) => (
          <StaggerCard key={c.id} index={i} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                {c.name.charAt(0)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${
                  c.online ? 'bg-safe shadow-[0_0_8px_#2ED573]' : 'bg-textMuted'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-textMuted">{c.phone}</div>
              <select
                value={c.relationship}
                onChange={(e) => updateContact(c.id, { relationship: e.target.value as typeof c.relationship })}
                className="mt-2 text-xs bg-black border border-primary/20 rounded-lg px-2 py-1 text-white"
              >
                {['Guardian', 'Trusted', 'Emergency Only', 'Friend', 'Partner', 'Other'].map((r) => (
                  <option key={r} value={r} className="bg-gray-900 text-white">{r}</option>
                ))}
              </select>
            </div>
            <div className="text-right text-xs">
              {c.online ? (
                <span className="text-safe font-bold">ONLINE</span>
              ) : (
                <span className="text-textMuted">Offline</span>
              )}
              {c.online && (
                <Link to="/map" className="block mt-2 text-primary hover:underline flex items-center gap-1 justify-end">
                  <Map size={12} /> Live route
                </Link>
              )}
            </div>
          </StaggerCard>
        ))}
      </div>

      {contacts.length === 0 && (
        <p className="text-textMuted text-center py-12">Link sentinels during onboarding or in Command Center.</p>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 glass-panel p-4 rounded-2xl text-sm text-textMuted flex gap-2">
        <Users size={18} className="text-primary shrink-0" />
        Shared route view shows active sentinels on your map when they opt in.
      </motion.div>
    </PageShell>
  );
}
