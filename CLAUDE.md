# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Malaysian scam detection web app that analyzes messages, URLs, and images for fraudulent content. Uses Google Gemini AI combined with rule-based pattern matching and emotional manipulation scoring to achieve multi-signal detection.

## Development Commands

**Run both servers simultaneously (required for full functionality):**

```bash
# Terminal 1 — Frontend (port 3000)
npm start

# Terminal 2 — Backend (port 5000)
node server/index.js
```

**Build:**
```bash
npm run build
```

**Test:**
```bash
npm test              # watch mode
npm test -- --watchAll=false  # single run
```

## Architecture

```
Frontend (React 18, CRA)     →    Backend (Express)
  src/App.jsx (routing)      →    server/index.js (1,253 lines)
  src/translations.js        →    server/scam_database.js
  src/components/            →    Firebase Firestore + Gemini AI
```

### Frontend

- **`src/App.jsx`** — top-level state, page routing (Dashboard/Message/Link/Image/History), language state
- **`src/translations.js`** — all UI strings in 4 languages (EN, MS, ZH, TA); add new strings here when adding UI text
- **`src/components/ResultDisplay.jsx`** — largest component (15KB); renders verdict, confidence score, risk indicators, and advice
- **`src/components/AIModelSelector.jsx`** — dropdown for Auto/Fast/Deep scan modes

### Backend

- **`server/index.js`** — all 11 API endpoints + the full multi-stage detection pipeline
- **`server/scam_database.js`** — 14 scam category patterns (parcel, bank, government, investment, romance, job, lottery, phishing, gambling, health, rental, travel, e-commerce, whitelist)

### Detection Pipeline (server/index.js)

Each scan runs through these stages in order:
1. Whitelist check (50+ official Malaysian domains/organizations)
2. Pattern match against scam database categories
3. Domain reputation via AbuseIPDB API (falls back to local rules on failure)
4. Rule-based scoring (0–100 point scale)
5. Emotional manipulation scoring (fear, greed, urgency, desperation triggers)
6. Malaysian phone number validation
7. Gemini AI analysis (mode: auto/fast/deep)
8. Confidence boosting from combined signals

### API Endpoints

All at `http://localhost:5000`:

| Endpoint | Purpose |
|---|---|
| `POST /api/scan-message` | Analyze SMS/chat message |
| `POST /api/scan-link` | Analyze URL |
| `POST /api/scan-image` | Analyze screenshot (Gemini Vision) |
| `POST /api/translate-result` | Translate results to target language |
| `POST /api/save-report` | Persist report to Firestore |
| `POST /api/feedback` | Submit detection feedback |
| `GET /api/reports` | List all saved reports |
| `GET /api/statistics` | System stats |
| `GET /api/health` | Health check |

## Environment Variables

Required in `.env` at project root:

```
GEMINI_API_KEY=...     # Google Gemini AI (used for all AI analysis)
PORT=5000              # Express server port
KIMI_API_KEY=...       # Secondary AI key (optional/fallback)
```

Firebase credentials go in `firebaseKey.json` at project root (excluded from git).

## Key Conventions

- **Multi-language**: All user-facing strings must be added to `src/translations.js` for all 4 languages (en, ms, zh, ta). Never hardcode display text in components.
- **Scan modes**: "auto" selects depth based on risk signals; "fast" = 1-2 sentence analysis; "deep" = full detailed analysis. The mode is passed from frontend to backend in the request body.
- **Scam database**: When adding new scam patterns, add them to the appropriate category object in `server/scam_database.js`. Pattern entries use regex arrays and keyword arrays.
- **AI model**: Currently uses `gemini-2.5-flash`. Model name is set in `server/index.js` — search for `generative-ai` initialization.
- **CORS**: Backend has CORS enabled for all origins in development. Tighten in production.
