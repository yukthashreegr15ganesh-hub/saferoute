import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const getClaudeResponse = async (messages: ChatMessage[]): Promise<string> => {
  const last = messages[messages.length - 1]?.content ?? '';

  try {
    const res = await axios.post<{ response: string }>(
      `${API_URL}/chat`,
      { message: last },
      { timeout: 12000 }
    );
    if (res.data?.response) return res.data.response;
  } catch { /* fallback */ }

  if (ANTHROPIC_API_KEY) {
    try {
      const res = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system:
            'You are ARIA, the AI Guardian for SafeRoute. Be concise (under 3 sentences). Help with zone scans, crowd intel, escape routes, GUARDIAN PULSE SOS, Ghost Walk paths, and sentinel contacts.',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        },
        {
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerously-allow-browser': 'true',
          },
          timeout: 15000,
        }
      );
      return res.data.content[0].text;
    } catch {
      /* mock */
    }
  }

  return mockResponse(last);
};

function mockResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('contact')) return 'Add contacts in Dashboard → Safety Network, or redo setup via Start from beginning. You need at least 2.';
  if (q.includes('sos')) return 'Single press SOS → 3s countdown. Double-tap skips it. Hold 3s for stealth mode. PIN required to cancel.';
  if (q.includes('score') || q.includes('green') || q.includes('red'))
    return 'Green = SAFE (well lit, CCTV). Yellow = MODERATE. Red = DANGER (isolated, poor lighting). Use the 8 PM / 11 PM filter to see night risk.';
  if (q.includes('shadow')) return 'Enable Shadow Walk on the Map. Your live location is shared; if you stop moving 5+ min, contacts get an alert.';
  if (q.includes('route') || q.includes('map')) return 'On Map, search your destination, pick a route card, then Take This Route for voice navigation.';
  return 'I\'m ARIA — your AI Guardian. Ask to scan your zone, read crowd intel, or plan an escape route.';
}
