import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function CalculatorDisguise() {
  const [display, setDisplay] = useState('0');

  const append = (val: string) => {
    if (display === '0') setDisplay(val);
    else setDisplay(display + val);
  };

  const calculate = () => {
    try {
      // Intentionally simple eval for a mock calculator
      // eslint-disable-next-line no-eval
      setDisplay(String(eval(display)));
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => setDisplay('0');

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-gray-100 rounded-3xl p-6 shadow-2xl border border-gray-200">
        <div className="w-full bg-white p-4 rounded-xl text-right text-4xl font-light tracking-wider mb-6 shadow-inner overflow-hidden">
          {display}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <button onClick={clear} className="col-span-2 bg-red-100 text-red-600 rounded-2xl py-4 text-xl font-medium active:scale-95 transition-transform">AC</button>
          <button onClick={() => append('/')} className="bg-gray-200 text-gray-700 rounded-2xl py-4 text-xl font-medium active:scale-95 transition-transform">÷</button>
          <button onClick={() => append('*')} className="bg-orange-400 text-white rounded-2xl py-4 text-xl font-medium active:scale-95 transition-transform">×</button>
          
          {[7, 8, 9].map(n => (
            <button key={n} onClick={() => append(String(n))} className="bg-white text-gray-800 rounded-2xl py-4 text-2xl font-medium active:scale-95 transition-transform shadow-sm">{n}</button>
          ))}
          <button onClick={() => append('-')} className="bg-orange-400 text-white rounded-2xl py-4 text-xl font-medium active:scale-95 transition-transform">−</button>
          
          {[4, 5, 6].map(n => (
            <button key={n} onClick={() => append(String(n))} className="bg-white text-gray-800 rounded-2xl py-4 text-2xl font-medium active:scale-95 transition-transform shadow-sm">{n}</button>
          ))}
          <button onClick={() => append('+')} className="bg-orange-400 text-white rounded-2xl py-4 text-xl font-medium active:scale-95 transition-transform">+</button>
          
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => append(String(n))} className="bg-white text-gray-800 rounded-2xl py-4 text-2xl font-medium active:scale-95 transition-transform shadow-sm">{n}</button>
          ))}
          <button onClick={calculate} className="bg-orange-400 text-white rounded-2xl py-4 text-2xl font-medium active:scale-95 transition-transform row-span-2">=</button>
          
          <button onClick={() => append('0')} className="col-span-2 bg-white text-gray-800 rounded-2xl py-4 text-2xl font-medium active:scale-95 transition-transform shadow-sm">0</button>
          <button onClick={() => append('.')} className="bg-white text-gray-800 rounded-2xl py-4 text-2xl font-medium active:scale-95 transition-transform shadow-sm">.</button>
        </div>
      </div>

      {/* Invisible SOS Broadcast indicator for demo purposes */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed bottom-4 text-red-500/20 text-xs flex items-center gap-1"
      >
        <ShieldAlert size={10} /> Broadcasting SOS in background...
      </motion.div>
    </div>
  );
}
