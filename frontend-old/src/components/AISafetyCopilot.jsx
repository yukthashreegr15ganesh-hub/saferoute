import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, X, Send, Navigation, MapPin } from 'lucide-react';

export default function AISafetyCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI Safety Co-Pilot. I can guide you on how to use SafeRoute, find safe spots, or explain safety scores. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "How do I find a safe route?",
    "What is Shadow Walk?",
    "How does the SOS button work?",
    "How do I connect the real Anthropic API?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      // We assume axios is imported at the top, I'll need to make sure. Let me check if axios is imported.
      const res = await window.fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to my brain right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <style>{`
        .copilot-btn {
          position: fixed; bottom: 24px; left: 24px; z-index: 5000;
          width: 56px; height: 56px; border-radius: 50%; border: none;
          background: var(--primary); color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px rgba(13, 115, 119, 0.4);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .copilot-btn:hover { transform: scale(1.1); }
        .copilot-btn.open { background: var(--danger); transform: rotate(45deg); box-shadow: 0 4px 15px rgba(255, 77, 109, 0.4); }
        
        .chat-panel {
          position: fixed; bottom: 90px; left: 24px; width: 380px; height: 600px; max-height: calc(100vh - 120px);
          background: rgba(10, 14, 26, 0.95); backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border); border-radius: 20px; z-index: 4999;
          display: flex; flex-direction: column; overflow: hidden;
          transform-origin: bottom left;
          animation: springUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes springUp { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        
        .msg-bubble {
          max-width: 80%; padding: 12px 16px; border-radius: 16px; margin-bottom: 12px;
          line-height: 1.5; font-size: 14px; animation: slideUpFade 0.3s ease forwards;
        }
        .msg-ai { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); align-self: flex-start; border-bottom-left-radius: 4px; }
        .msg-user { background: var(--primary); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .typing-dot { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; display: inline-block; margin: 0 2px; animation: wave 1.3s linear infinite; }
        .typing-dot:nth-child(2) { animation-delay: -1.1s; }
        .typing-dot:nth-child(3) { animation-delay: -0.9s; }
        @keyframes wave { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
      `}</style>

      <button className={`copilot-btn ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)} title="AI Safety Co-Pilot — Ask me anything">
        {isOpen ? <X size={24} /> : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} />
            <Sparkles size={14} style={{ position: 'absolute', top: -6, right: -10, color: '#F1C40F' }} />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="chat-panel">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Safety Co-Pilot</div>
              <div style={{ fontSize: '12px', color: 'var(--safe)' }}>● Online</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* Suggested Prompts */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px', scrollbarWidth: 'none' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} style={{
                  whiteSpace: 'nowrap', padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                  animation: `fadeSlideUp 0.3s ease forwards ${i * 0.1}s`, opacity: 0
                }} onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }} onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'var(--text-muted)'; }}>
                  {s}
                </button>
              ))}
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.role === 'ai' ? 'msg-ai' : 'msg-user'}`}>
                {m.text.split('\\n').map((line, j) => <div key={j} style={{ marginBottom: j < m.text.split('\\n').length-1 ? '8px' : 0 }}>{line}</div>)}
              </div>
            ))}
            
            {isTyping && (
              <div className="msg-bubble msg-ai" style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about routes, areas..." style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              padding: '12px 16px', borderRadius: '24px', color: '#fff', outline: 'none'
            }} />
            <button type="submit" disabled={!input.trim()} style={{
              width: '44px', height: '44px', borderRadius: '50%', background: input.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.3s'
            }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
