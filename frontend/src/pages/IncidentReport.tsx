import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Clock } from 'lucide-react';
import { PageShell, ActivateButton } from '../components/ui/shared';

type ReportType = 'harassment' | 'suspicious' | 'roadblock';

export default function IncidentReport() {
  const [type, setType] = useState<ReportType>('suspicious');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expiresIn, setExpiresIn] = useState(7200);

  const handleSubmit = () => {
    setSubmitted(true);
    const t = setInterval(() => setExpiresIn((s) => (s <= 0 ? (clearInterval(t), 0) : s - 1)), 1000);
  };

  const mins = Math.floor(expiresIn / 60);

  return (
    <PageShell className="p-4 md:p-8 max-w-lg mx-auto pb-28 page-enter">
      <h1 className="text-3xl font-heading text-primary mb-2 flex items-center gap-2">
        <FileWarning /> Incident Report
      </h1>
      <p className="text-textMuted text-sm mb-8">Community-sourced safety · expires in 2 hours</p>

      {!submitted ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['harassment', 'suspicious', 'roadblock'] as ReportType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-full text-sm capitalize ${
                  type === t ? 'bg-primary/20 text-primary border border-primary' : 'bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what you observed…"
            className="w-full h-32 bg-white/5 border border-primary/20 rounded-xl p-3 text-sm outline-none focus:border-primary"
          />
          <ActivateButton onClick={handleSubmit} disabled={!note.trim()}>
            Submit to Map
          </ActivateButton>
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel rounded-3xl p-8 text-center border border-safe/30">
          <FileWarning className="text-safe mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-safe mb-2">Report Live on Map</h2>
          <p className="text-sm text-textMuted mb-4">Others can upvote to confirm.</p>
          <div className="flex items-center justify-center gap-2 text-warning text-sm">
            <Clock size={16} />
            Expires in {mins}m {expiresIn % 60}s
          </div>
        </motion.div>
      )}
    </PageShell>
  );
}
