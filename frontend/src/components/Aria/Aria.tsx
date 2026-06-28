import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Map, ShieldAlert, VolumeX, Mic, MicOff } from 'lucide-react';
import { getClaudeResponse, type ChatMessage } from '../../services/claude';
import { useSafeRouteStore } from '../../store/safeRouteStore';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import { Link } from 'react-router-dom';

const QUICK = [
  { label: 'Scan zone', prompt: 'Scan my current zone and give a safety report.' },
  { label: 'Crowd intel', prompt: "What's the crowd doing near me?" },
  { label: 'Escape route', prompt: 'Plan my escape route from my current location.' },
  { label: 'Check-in 30m', prompt: 'Check on me in 30 minutes.' },
];

function TypingBubble({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const t = setInterval(() => {
      setShown(text.slice(0, ++i));
      if (i >= text.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [text]);
  return <span>{shown}</span>;
}

export default function Aria() {
  const { ariaOnboarded, setAriaOnboarded, hasOnboarded, ariaWhisperMode, toggleAriaWhisper } = useSafeRouteStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "I'm ARIA — your AI Guardian. Ask me to scan zones, read crowd intel, or plan escape routes." },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { isListening, startListening, speak } = useVoiceCommand((text) => {
    void send(text);
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (hasOnboarded && !ariaOnboarded) {
      setIsOpen(true);
      setMessages([{ role: 'assistant', content: 'Shield online. Tap Map for zone pre-scan. GUARDIAN PULSE is bottom-right.' }]);
      setAriaOnboarded(true);
    }
  }, [hasOnboarded, ariaOnboarded, setAriaOnboarded]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput('');
    const next = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(next);
    setIsTyping(true);
    let reply = await getClaudeResponse(next);
    if (userMsg.toLowerCase().includes('whisper')) {
      toggleAriaWhisper();
      reply = 'Whisper mode enabled — alerts will be silent/haptic only.';
    }
    if (userMsg.toLowerCase().includes('30 min')) {
      reply = 'Check-in scheduled in 30 minutes. I will prompt you to confirm you are safe.';
    }
    setMessages([...next, { role: 'assistant', content: reply }]);
    setIsTyping(false);
    if (!useSafeRouteStore.getState().ariaWhisperMode) {
      speak(reply);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-glow"
        animate={{ boxShadow: ['0 0 20px rgba(0,255,178,0.3)', '0 0 32px rgba(0,255,178,0.6)', '0 0 20px rgba(0,255,178,0.3)'] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <motion.div
          className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        >
          {isOpen ? <X size={24} className="text-background" /> : (
            <span className="w-8 h-8 rounded-full bg-background/30 border border-primary/50" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, originX: 0, originY: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 sm:left-6 sm:w-[400px] z-50 max-h-[70vh] glass-panel rounded-2xl flex flex-col overflow-hidden border border-primary/30"
          >
            <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-primary font-bold">ARIA</h3>
                <span className="text-xs text-safe">Your AI Guardian {ariaWhisperMode && '· Whisper'}</span>
              </div>
              <button type="button" onClick={toggleAriaWhisper} className="p-2 rounded-full hover:bg-white/10" title="Whisper mode">
                <VolumeX size={18} className={ariaWhisperMode ? 'text-warning' : 'text-textMuted'} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' ? 'bg-primary text-background' : 'bg-white/10 border border-primary/10'
                    }`}
                  >
                    {m.role === 'assistant' && i === messages.length - 1 && !isTyping ? (
                      <TypingBubble text={m.content} />
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <p className="text-textMuted text-xs animate-pulse">ARIA analyzing…</p>}
              <div ref={endRef} />
            </div>

            <div className="p-2 flex flex-wrap gap-1 border-t border-white/5">
              {QUICK.map((q) => (
                <button key={q.label} type="button" onClick={() => void send(q.prompt)} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  {q.label}
                </button>
              ))}
              <Link to="/map" className="text-xs px-2 py-1 rounded-full bg-white/5 flex items-center gap-1">
                <Map size={10} /> Map
              </Link>
              <button type="button" onClick={() => void send('How does GUARDIAN PULSE work?')} className="text-xs px-2 py-1 rounded-full bg-white/5">
                <ShieldAlert size={10} /> SOS
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="p-3 flex items-center gap-2 border-t border-primary/10"
            >
              <button
                type="button"
                onClick={startListening}
                className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                  isListening ? 'bg-danger text-white animate-pulse' : 'bg-white/5 text-textMuted hover:bg-white/10'
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask ARIA…"}
                className="flex-1 bg-background/80 border border-primary/20 rounded-full px-4 py-2 text-sm outline-none focus:border-primary"
              />
              <button type="submit" disabled={!input.trim() || isTyping} className="bg-primary text-background w-10 h-10 rounded-full flex items-center justify-center btn-glow disabled:opacity-40">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
