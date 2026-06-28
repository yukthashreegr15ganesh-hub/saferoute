import { Volume2, XCircle, ChevronRight, Navigation2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RouteInstruction } from '../../services/routing';

interface VoiceNavProps {
  instruction: RouteInstruction;
  totalDistance: string;
  totalEta: string;
  onNext: () => void;
  onRepeat: () => void;
  onStop: () => void;
}

export default function VoiceNav({ instruction, totalDistance, totalEta, onNext, onRepeat, onStop }: VoiceNavProps) {
  return (
    <>
      {/* Top Banner */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-primary text-background p-6 rounded-3xl shadow-2xl z-40 flex items-center gap-6"
      >
        <div className="bg-background/20 p-4 rounded-2xl shrink-0">
          <Navigation2 size={32} className="text-background" />
        </div>
        
        <div className="flex-1">
          <div className="text-3xl font-heading font-bold mb-1">
            {instruction ? instruction.text : 'Follow the route'}
          </div>
          {instruction && instruction.distance > 0 && (
            <div className="text-lg opacity-90 font-bold">
              in {Math.round(instruction.distance)} meters
            </div>
          )}
        </div>

        <button onClick={onRepeat} className="p-3 bg-background/20 rounded-full hover:bg-background/30 transition-colors">
          <Volume2 size={24} />
        </button>
      </motion.div>

      {/* Bottom ETA Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-[600px] glass-panel rounded-2xl p-4 z-40 flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold text-safe">{totalEta}</div>
            <div className="text-sm text-textMuted">{totalDistance}</div>
          </div>
          
          <button 
            onClick={onNext}
            className="flex items-center gap-1 text-primary text-sm font-bold hover:underline"
          >
            Next Step <ChevronRight size={16} />
          </button>
        </div>

        <button 
          onClick={onStop}
          className="bg-danger/20 text-danger hover:bg-danger hover:text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <XCircle size={18} /> End Route
        </button>
      </motion.div>
    </>
  );
}
