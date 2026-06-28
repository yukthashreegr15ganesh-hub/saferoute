# SafeRoute

Women's safety navigation — safe routes, SOS alerts, voice navigation, and SafeBot assistant.

## Quick start

### Backend
```powershell
cd backend
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your API keys (optional for demo)
uvicorn main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
copy .env.example .env
# Add VITE_ORS_API_KEY and VITE_ANTHROPIC_API_KEY if you have them
npm run dev
```

Open **http://localhost:5173/start-over** to begin onboarding from scratch.

## App flow

1. **Onboarding** — Name, 2–5 emergency contacts, PIN, permissions  
2. **Home** — Quick links to Map and Dashboard  
3. **Map** — Search destination, compare SAFE / MODERATE / DANGER routes, voice nav  
4. **Dashboard** — History, contacts, change PIN, reset app  
5. **SOS** — Single press (3s countdown), double-tap (instant), hold 3s (stealth)  
6. **SafeBot** — Bottom-left assistant (Claude or smart fallback)

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_ORS_API_KEY` | frontend `.env` | OpenRouteService routing |
| `VITE_ANTHROPIC_API_KEY` | frontend `.env` | SafeBot (browser) |
| `VITE_API_URL` | frontend `.env` | Backend URL (default `http://localhost:8000`) |
| `ANTHROPIC_API_KEY` | backend `.env` | SafeBot via `/chat` |
| `TWILIO_*` | backend `.env` | Real SMS on SOS (mock logs if missing) |

## Reset / start over

- Visit **http://localhost:5173/start-over**  
- Or Dashboard → **Start from beginning**
