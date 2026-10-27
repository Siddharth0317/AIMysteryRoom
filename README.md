# AI Mystery Room 🕵️‍♂️⚡

An AI-powered mystery investigation game built with a **Cyberpunk / Sci-Fi Hacker Terminal** user interface. Players act as investigators tasked with uncovering the truth behind dynamically generated cases created using the Google Gemini API.

---

## 🚀 Technology Stack

- **Frontend:** React (v18), Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons.
- **Backend:** Node.js, Express, Mongoose ODM, Google Gemini API (`@google/genai`), Zod.
- **Database:** MongoDB (MongoDB Atlas or Local MongoDB).
- **Validation:** Zod for all client payloads and Gemini structured JSON outputs.
- **Testing:** Node Native Test Runner, Supertest, Vitest.

---

## 📁 Repository Structure

```text
AIMysteryRoom/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # API client & endpoints
│   │   ├── components/         # Modular Cyberpunk UI components
│   │   ├── pages/              # 5 Core Application Screens
│   │   ├── utils/              # Mock data & helpers
│   │   ├── App.jsx             # Route registry
│   │   ├── main.jsx            # Frontend entrypoint
│   │   └── index.css           # Tailwind base, utilities & scanline shaders
│   ├── .env.example            # Client env template
│   ├── .gitignore              # Client git exclusions
│   ├── index.html              # HTML shell with Google Fonts
│   ├── package.json            # Client dependencies & scripts
│   ├── postcss.config.js       # PostCSS config
│   ├── tailwind.config.js      # Cyberpunk color tokens & glow effects
│   └── vite.config.js          # Vite config
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # DB & environment configuration
│   │   ├── constants/          # Difficulty rules, point values, error codes
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Error handler, rate limiters
│   │   ├── models/             # Mongoose schemas (Case.js)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Gemini generation, scoring, serializer
│   │   ├── validators/         # Zod schemas
│   │   ├── app.js              # Express app setup & middleware
│   │   └── server.js           # Server listener entrypoint
│   ├── test/                   # Integration and unit tests
│   │   └── health.test.js      # Health endpoint test
│   ├── .env.example            # Server env template
│   ├── .gitignore              # Server git exclusions
│   └── package.json            # Server dependencies & scripts
│
├── .env.example                # Root environment template
├── .gitignore                  # Root git exclusions
├── AGENTS.md                   # Agent developer instructions reference
├── GEMINI.md                   # Authoritative agent rules & conventions
├── package.json                # Root lifecycle scripts
├── README.md                   # Project documentation
└── SPEC.md                     # Authoritative product & technical spec
```

---

## ⚙️ Environment Configuration

### Server Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_mystery_room
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

### Client Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

> [!CAUTION]
> **Zero-Leakage Security:**
> Never inject `GEMINI_API_KEY` or `MONGODB_URI` into the frontend environment or commit `.env` files to git.

---

## 🛠️ Local Development & Scripts

### 1. Install Dependencies
```bash
# In project root
npm run install:all
```
Or individually:
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Run the Applications
```bash
# Run backend server (from project root or server/)
npm run server
# -> Server listening on http://localhost:5000

# Run frontend client (from project root or client/)
npm run client
# -> Vite dev server on http://localhost:5173
```

### 3. Run Tests
```bash
npm run test:server
```

---

## 🗺️ Project Roadmap & Phase Status

| Phase | Description | Status |
| :---: | :--- | :---: |
| **Phase 0** | Scope, Specification & Repository Scaffolding | **COMPLETED** |
| **Phase 1** | Cyberpunk UI Skeleton & Static UX (Mock Data) | Up Next |
| **Phase 2** | Backend Foundation & Database Models | Pending |
| **Phase 3** | Gemini Generation & Core Gameplay Wiring | Pending |
| **Phase 4** | Core Hardening, Testing & Deployment | Pending |
| **Phase 5** | AI Consistency Validator & Post-Game Analysis | Optional / Phase 5 |
| **Phase 6** | Suspect Interrogation & Evidence Board | Optional / Phase 6 |
| **Phase 7** | Adaptive Difficulty & Player Progress | Optional / Phase 7 |
| **Phase 8** | Polish, Accessibility & Performance | Optional / Phase 8 |
| **Phase 9** | Final QA & Submission | Final Milestone |
