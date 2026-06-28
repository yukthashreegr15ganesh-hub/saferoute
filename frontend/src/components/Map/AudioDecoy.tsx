import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, VolumeX } from 'lucide-react';

export default function AudioDecoy() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);

  const toggleDecoy = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setTimer(0);
    } else {
      setIsPlaying(true);
      // Simulate an active call timer
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setTimer(count);
        if (count > 60) {
          clearInterval(interval);
          setIsPlaying(false);
          setTimer(0);
        }
      }, 1000);
      
      // In a real implementation, this would play an HTMLAudioElement here.
      // e.g. new Audio('/decoy_voice.mp3').play();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-24 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel px-4 py-2 flex items-center gap-3 rounded-full border border-primary/50 shadow-glow-sm"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Audio Decoy Active</span>
              <span className="text-xs text-textMain font-mono">{formatTime(timer)}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleDecoy}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isPlaying 
            ? 'bg-danger text-white border-2 border-danger/50 shadow-danger' 
            : 'bg-card border border-white/10 text-primary hover:bg-white/5 hover:border-primary/30'
        }`}
        title="Deepfake Audio Decoy"
      >
        {isPlaying ? <VolumeX size={20} /> : <PhoneCall size={20} />}
      </button>
    </div>
  );
}
