# AI Mystery Room 🕵️‍♂️⚡

An AI-powered mystery investigation game built with a **Cyber Noir / Cyberpunk Hacker Terminal** user interface. Detectives act as investigators tasked with uncovering the truth behind dynamically generated cases synthesized by the Google Gemini API.

---

## 🚀 Technology Stack

- **Frontend:** React (v18), Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons.
- **Backend:** Node.js, Express, Mongoose ODM, Google Gemini API (`@google/genai` v2.31.0), Zod.
- **Database:** MongoDB (MongoDB Atlas or Local MongoDB / in-memory fallback).
- **Validation:** Zod schemas for all client inputs and Gemini structured JSON outputs.
- **Testing:** Node.js native test runner (`node --test`), Supertest.
- **Design Theme:** High-contrast Cyberpunk / Sci-Fi Hacker Terminal with CRT scanlines, neon accents, interactive murder board, and forensic telemetry.

---

## 📁 Repository Structure

```text
AIMysteryRoom/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/                # Axios API client (casesApi.js)
│   │   ├── components/         # Modular Cyberpunk UI components
│   │   │   ├── common/         # CyberButton, TerminalPanel, StatusBadge, etc.
│   │   │   ├── layout/         # AppShell, TopNav, SettingsModal, AgentProfileModal, NavMenuModal
│   │   │   └── mystery/        # SuspectCard, ClueCard, HintTerminal, AccusationModal, ScoreBreakdown
│   │   ├── pages/              # Home, CreateMystery, InvestigationRoom, Accusation, Results, NotFound
│   │   ├── utils/              # Mock engine & localStorage archive manager
│   │   ├── App.jsx             # React Router canonical routes & state management
│   │   └── index.css           # Tailwind base, utilities & scanline shaders
│   ├── vercel.json             # Vercel SPA routing rewrite configuration
│   ├── package.json            # Client scripts & dependencies
│   └── vite.config.js          # Vite bundler config
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # DB & environment configuration
│   │   ├── constants/          # Difficulty rules, point values, error codes
│   │   ├── controllers/        # Express route controllers (caseController.js)
│   │   ├── middleware/         # Centralized error handler, rate limiter
│   │   ├── models/             # Mongoose schemas (Case.js)
│   │   ├── routes/             # Express API routes (caseRoutes.js)
│   │   ├── services/           # Gemini generation, scoring engine, caseSerializer
│   │   ├── validators/         # Zod schemas (caseSchemas.js)
│   │   ├── app.js              # Express app setup & CORS configuration
│   │   └── server.js           # Entrypoint listener
│   ├── test/                   # Comprehensive automated test suites (29 tests)
│   │   ├── caseApi.test.js     # API integration & edge-case test suite
│   │   ├── geminiService.test.js # GenAI prompt, fence stripping, & failure recovery
│   │   ├── scoring.test.js     # Authoritative scoring formula tests
│   │   ├── validation.test.js  # Zod schema input & output validation
│   │   └── health.test.js      # Health check test
│   └── package.json            # Server scripts & dependencies
│
├── .env.example                # Local environment variables template
├── .env.production.example     # Production environment variables template
├── render.yaml                 # Render backend hosting blueprint
├── SPEC.md                     # Authoritative product & technical specification
├── GEMINI.md                   # Authoritative agent rules & coding conventions
└── README.md                   # Project documentation
```

---

## 🔒 Security Architecture & Zero-Leakage Policy

1. **Server-Held Solutions:**
   - The culprit identity (`culpritId`), forensic evidence mapping (`evidenceMapping`), and crime explanation (`solution`) are generated on the server and stored in the database.
   - The serializer ([`caseSerializer.js`](file:///c:/Projects/AIMysteryRoom/server/src/services/caseSerializer.js)) **strictly strips** all secret fields from all active-case network responses.
   - The results endpoint (`GET /api/cases/:id/result`) rejects requests with `409 CASE_NOT_COMPLETED` until an accusation is formally recorded.
2. **Server-Authoritative Anti-Cheat:**
   - The frontend never calculates or submits final scores or verdicts.
   - Any client-submitted score or verdict in request payloads is ignored. The backend evaluates the accusation, applies base difficulty points, clue bonuses, and hint penalties, and permanently locks the case against replay attacks.
3. **API Key Isolation:**
   - `GEMINI_API_KEY` and `MONGODB_URI` exist exclusively in backend server environments. Neither key is ever exposed in client code or frontend builds.

---

## 🎮 Game Rules & Scoring Engine

| Difficulty | Suspects | Forensic Clues | Max Hints | Base Points |
| :---: | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | **100 pts** |
| **Medium** | 4 | 7 | 3 | **150 pts** |
| **Hard** | 5 | 9 | 3 | **200 pts** |

### Scoring Formula
- **Clue Discovery:** `+5` points per unique clue decrypted (discovery is idempotent; duplicate requests award 0 extra points).
- **Hint Usage:** `-10` points per hint used (capped by difficulty tier limit).
- **Correct Accusation:**
  $$\text{Final Score} = \max(0, \text{Base Points} + (5 \times \text{Clues Discovered}) - (10 \times \text{Hints Used}))$$
- **Incorrect Accusation:**
  $$\text{Final Score} = 0 \quad (\text{Case Failed})$$

---

## ⚙️ Environment Configuration

### Local Development Setup

#### Server Configuration (`server/.env`)
Copy `.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_mystery_room
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

#### Client Configuration (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🛠️ Local Development & Scripts

### 1. Install Dependencies
```bash
# In project root
npm run install:all
```

### 2. Run Applications Locally
```bash
# In terminal 1 (Backend Server)
cd server
npm run dev
# -> Server listening on http://localhost:5000

# In terminal 2 (Frontend Client)
cd client
npm run dev
# -> Vite dev server on http://localhost:5173
```

### 3. Run Automated Tests
```bash
cd server
npm test
```
*Executes all 29 unit, integration, and security tests.*

### 4. Build for Production
```bash
cd client
npm run build
```

---

## 🚀 Production Deployment Guide (Phase 4)

### 1. Database Deployment (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` or the specific IP of your backend host).
3. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ai_mystery_room?retryWrites=true&w=majority`.

### 2. Backend Deployment (Render / Railway)
1. Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Using the included [`render.yaml`](file:///c:/Projects/AIMysteryRoom/render.yaml) or a Web Service setup:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Configure Environment Variables in the host dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<your-mongodb-atlas-uri>`
   - `GEMINI_API_KEY`: `<your-google-gemini-api-key>`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (or comma-separated list of allowed origins)

### 3. Frontend Deployment (Vercel)
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Configure Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com`
4. The included [`vercel.json`](file:///c:/Projects/AIMysteryRoom/client/vercel.json) automatically routes all single-page paths (`/investigation/:caseId`, `/accuse/:caseId`, etc.) to `index.html`.

---

## 🗺️ Execution Roadmap & Phase Status

| Phase | Milestone Description | Status |
| :---: | :--- | :---: |
| **Phase 0** | Scope, Specification & Repository Scaffolding | **COMPLETED** |
| **Phase 1** | Cyberpunk UI Skeleton & Component Inventory | **COMPLETED** |
| **Phase 2** | Express Backend, Mongoose Models & Zod Validation | **COMPLETED** |
| **Phase 3** | Gemini GenAI Integration & Core Gameplay Loop | **COMPLETED** |
| **Phase 4** | Core Hardening, Edge-Case Testing & Deployment | **COMPLETED** |
| **Phase 5** | AI Semantic Consistency Validator & Post-Game Analysis | Next Milestone |
| **Phase 6** | Dynamic Suspect Interrogation & Interactive Evidence Board | Upcoming |
| **Phase 7** | Adaptive Difficulty & Player Leveling | Upcoming |
| **Phase 8** | Polish, Accessibility Auditing & Performance Optimization | Upcoming |
| **Phase 9** | Final QA & Project Delivery | Final Milestone |
