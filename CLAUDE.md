# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Malaysian scam detection web app that analyzes messages, URLs, and images for fraudulent content. Uses Google Gemini AI (messages/translation) and OpenAI GPT-4o mini (links/images) combined with rule-based pattern matching and emotional manipulation scoring.

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
npm test -- --watchAll=false
```

## Architecture

```
Frontend (React 18, CRA)          Backend (Express, port 5000)
  src/App.jsx                  →    server/index.js
  src/context/AuthContext.jsx  →    Firebase Auth + Firestore
  src/translations.js          →    server/scam_database.js
  src/firebase.js              →    Gemini AI + OpenAI
```

### Auth Flow

Firebase Auth (email/password + Google OAuth) via `src/context/AuthContext.jsx`. `App.jsx` gates all content behind `useAuth()` — unauthenticated users see `AuthPage`. On first login, `hasSeenOnboarding_{uid}` localStorage key triggers the `Onboarding` modal.

### Frontend State

All state lives in `App.jsx`: `activePage`, `scanResult`, `scanHistory`, `lang`, `showOnboarding`. The `t(key, params)` helper reads from `src/translations.js`. `handleScan()` receives results from any input component, stamps a timestamp, and pushes to history + navigates to results page.

### Backend Detection Pipeline (`server/index.js`)

Each scan runs these stages in order:
1. Whitelist check (`checkOfficalWhitelist`) — 50+ official Malaysian domains
2. Pattern match (`checkAgainstDatabase`) — 14 scam categories in `scam_database.js`
3. Domain reputation via AbuseIPDB API (falls back to local rules)
4. Rule-based scoring (`calculateScamScore`) — 0–100 point scale, 15 indicator types
5. Emotional manipulation scoring (`analyzeEmotionalManipulation`) — fear/greed/urgency/desperation
6. Malaysian phone number validation (`analyzePhoneNumbers`)
7. URL extraction from messages (`extractUrlsFromMessage`) + quick scan (`quickScanUrl`)
8. AI analysis — **Gemini** for messages/translation, **OpenAI GPT-4o mini** for links/images (with Gemini fallback)
9. Confidence boosting from combined signals

### AI Routing

- **Messages**: Always Gemini (`gemini-2.5-flash`)
- **Links**: OpenAI GPT-4o mini → falls back to Gemini on error
- **Images**: OpenAI GPT-4o mini (vision) → falls back to Gemini Vision
- **Translation**: Always Gemini

### API Endpoints

All at `http://localhost:5000`:

| Endpoint | Purpose |
|---|---|
| `POST /api/scan-message` | Analyze SMS/chat message |
| `POST /api/scan-link` | Analyze URL |
| `POST /api/scan-image` | Analyze screenshot |
| `POST /api/translate-result` | Translate results to target language |
| `POST /api/save-report` | Persist report to Firestore |
| `POST /api/feedback` | Submit detection feedback |
| `GET /api/reports` | List saved reports |
| `GET /api/statistics` | Aggregated stats |
| `GET /api/health` | Health check |

## Environment Variables

Local development — `.env` at project root + `firebaseKey.json` (excluded from git):

```
GEMINI_API_KEY=...
OPENAI_API_KEY=...
PORT=5000
```

Production (Render) — Firebase credentials are split into individual env vars instead of a file. `server/index.js` detects `FIREBASE_PROJECT_ID` and builds the credential object; otherwise falls back to `firebaseKey.json`. The `buildPrivateKey()` function at the top of `server/index.js` normalizes the private key regardless of how it was pasted.

## Deployment

- **Frontend**: Netlify — auto-deploys on push to `main`. Config in `netlify.toml` (SPA redirect rule).
- **Backend**: Render — auto-deploys on push to `main`. Config in `render.yaml` (start: `node server/index.js`, port 10000). Env vars set in Render dashboard.

## Key Conventions

- **Multi-language**: All user-facing strings must be added to `src/translations.js` for all 4 languages (en, ms, zh, ta). Never hardcode display text in components.
- **Scan modes**: "auto" selects depth based on risk signals; "fast" = 1-2 sentence analysis; "deep" = full detailed analysis. Passed as `aiModel` in request body.
- **Scam database**: Add new patterns to the appropriate category in `server/scam_database.js`. Use anchored regex (`(?:\/|$)`) for domain patterns to prevent false matches.
- **Brand impersonation**: `quickScanUrl()` in `server/index.js` contains the brand list. Add new brands there — each entry needs a `name` regex and an `official` domain regex.
- **CSS**: Global design tokens in `src/styles/variables.css`. Component styles are co-located in `src/components/` or `src/styles/`.
