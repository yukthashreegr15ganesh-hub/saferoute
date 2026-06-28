import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Navigation } from 'lucide-react';

export default function DroneGuardian() {
  const [dispatching, setDispatching] = useState(false);
  const [arrived, setArrived] = useState(false);

  const handleDispatch = () => {
    setDispatching(true);
    setArrived(false);
    
    // Simulate flight time
    setTimeout(() => {
      setDispatching(false);
      setArrived(true);
      
      // Auto dismiss after 15 seconds
      setTimeout(() => setArrived(false), 15000);
    }, 4000);
  };

  return (
    <div className="absolute top-40 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {(dispatching || arrived) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel px-4 py-2 flex items-center gap-3 rounded-full border border-primary/50 shadow-glow-sm bg-black/60"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                {dispatching ? 'Drone Dispatched' : 'Drone In Position'}
              </span>
              <span className="text-xs text-textMain font-mono">
                {dispatching ? 'ETA: 4s' : 'Spotlight & Siren Armed'}
              </span>
            </div>
            {dispatching ? (
              <Navigation size={14} className="text-primary animate-pulse" />
            ) : (
              <Crosshair size={14} className="text-danger animate-pulse" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleDispatch}
        disabled={dispatching || arrived}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
          dispatching || arrived 
            ? 'bg-primary text-background border-2 border-primary/50 opacity-80 cursor-not-allowed' 
            : 'bg-card border border-white/10 text-primary hover:bg-white/5 hover:border-primary/30'
        }`}
        title="Dispatch Drone Guardian"
      >
        <Navigation size={20} className={dispatching ? 'animate-bounce' : ''} />
      </button>

      {/* Full Screen Drone Spotlight Effect */}
      <AnimatePresence>
        {arrived && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(0,0,0,0) 70%)',
              mixBlendMode: 'overlay'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
