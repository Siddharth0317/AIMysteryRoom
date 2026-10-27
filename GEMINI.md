# AI Mystery Room — Agent Development Rules & Instructions

This document defines the persistent instructions, architectural standards, coding conventions, and operational workflows for all AI agents working on the **AI Mystery Room** repository.

Every AI agent working in this codebase **MUST** strictly adhere to the rules outlined below.

---

## 1. Mandatory Compliance with SPEC.md

1. **Source of Truth:** [`SPEC.md`](./SPEC.md) is the immutable, authoritative specification for this project.
2. **No Silent Modifications:** Agents must **never** modify, overwrite, delete, or dilute the requirements in `SPEC.md` unless explicitly instructed by the user.
3. **Specification Alignment:** All implementations must conform strictly to the functional requirements (Section 3), difficulty rules (Section 4), security mandates (Section 6), API contracts (Section 7), and execution phases (Section 18).
4. **Phased Execution:** Implement features step-by-step according to the approved roadmap. Do not attempt to generate or scaffold future phase features out of order.

---

## 2. Technology Stack & Architectural Boundaries

### 2.1 Approved Tech Stack
- **Frontend:** React (v18+), Vite, Tailwind CSS, React Router DOM, Axios.
- **Backend:** Node.js (v18+), Express, Mongoose, Google Gemini API (`@google/genai`), Zod, Cors, Dotenv.
- **Database:** MongoDB (MongoDB Atlas / local Mongoose connection).
- **Validation:** Zod for all client inputs and Gemini structured outputs.
- **Testing:** Vitest / Jest, React Testing Library, Supertest.

### 2.2 System Architecture & Folder Layout
```text
AIMysteryRoom/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/                # Axios API client & endpoint modules
│   │   ├── components/         # Modular, reusable Cyberpunk UI components
│   │   │   ├── common/         # TerminalPanel, CyberButton, StatusBadge, etc.
│   │   │   ├── layout/         # AppShell, TopNav
│   │   │   └── mystery/        # SuspectCard, ClueCard, HintTerminal, AccusationModal
│   │   ├── pages/              # Home, CreateMystery, InvestigationRoom, Accusation, Results
│   │   ├── utils/              # Mock data & formatters
│   │   ├── App.jsx             # React Router route registry
│   │   └── index.css           # Tailwind base, utilities & scanline shaders
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # DB connection & environment verification
│   │   ├── constants/          # Difficulty rules, point constants, error codes
│   │   ├── controllers/        # HTTP controllers
│   │   ├── middleware/         # Error handler, rate limiters, auth/session
│   │   ├── models/             # Mongoose schemas (Case.js)
│   │   ├── routes/             # Express API routes (caseRoutes.js)
│   │   ├── services/           # Business logic: geminiService, scoringService, caseSerializer
│   │   ├── validators/         # Zod schemas (caseSchemas.js)
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Entrypoint listener
├── SPEC.md                     # Authoritative product & technical spec
├── GEMINI.md                   # Agent instructions (this file)
└── AGENTS.md                   # Mirror agent instructions
```

---

## 3. Frontend Coding Conventions

1. **Component Design:**
   - Write clean, functional React components with standard React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
   - Keep components focused and modular. Separate layout, reusable presentation components, and domain-specific mystery panels.
2. **State Management:**
   - Clearly delineate local UI state (form inputs, modal visibility, active tab) from canonical server state (fetched case data, discovered clues, used hints).
   - Never maintain a client-side calculation of the score or verdict as the source of truth.
3. **No Placeholders or Fakes:**
   - Do not display hardcoded "fake" AI responses as if they came from Gemini.
   - When developing UI prior to backend integration (Phase 1), use designated mock data modules clearly located in `client/src/utils/mockCase.js`.
4. **Code Quality:**
   - Use clean ES6+ JavaScript.
   - Avoid deep prop drilling where appropriate; pass clean handlers or context.

---

## 4. Backend Coding Conventions

1. **Layered Architecture:**
   - **Routes:** Map HTTP verbs and paths to controller functions.
   - **Controllers:** Validate inputs via Zod schemas, invoke services, and return standard JSON responses.
   - **Services:** Pure business logic (case generation via Gemini, scoring engine, case serialization).
   - **Models:** Mongoose schemas defining documents, types, and persistence rules.
2. **Asynchronous Handling & Safety:**
   - Always use `async/await` with centralized Express error handling (via next(err) or async wrappers).
   - Prevent race conditions: Use atomic updates (`findOneAndUpdate` with `$addToSet`, `$inc`, and condition checks) for clue discovery and hint usage.
3. **Idempotency:**
   - Clue discovery MUST be idempotent. Requesting discovery for an already discovered clue must not award points again or alter state.
   - Requesting hints must only deduct points and increment count when a valid hint is returned.

---

## 5. API Response and Error-Handling Conventions

### 5.1 Success Responses
All successful responses must return JSON matching the agreed contracts:
- `POST /api/cases` -> `{ "case": PlayerSafeCaseDTO }`
- `GET /api/cases/:id` -> `{ "case": PlayerSafeCaseDTO }`
- `POST /api/cases/:id/clues/:clueId/discover` -> `{ "clue": ClueDTO, "progress": ProgressDTO }`
- `POST /api/cases/:id/hints` -> `{ "hint": HintDTO, "progress": ProgressDTO }`
- `POST /api/cases/:id/accuse` -> `{ "verdict": "correct"|"incorrect", "culpritId": string, "culpritName": string, "solution": string, "score": number, "scoreBreakdown": Object }`
- `GET /api/cases/:id/result` -> Same as accuse response if completed.

### 5.2 Error Response Format
All errors must return a consistent, safe JSON envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly, safe error message without internal stack traces."
  }
}
```

### 5.3 HTTP Status Codes
- `200 OK` / `201 Created`
- `400 Bad Request`: Invalid request payload, missing parameters.
- `404 Not Found`: Case, clue, or suspect does not exist.
- `409 Conflict`: Case already completed, hint limit reached for difficulty.
- `422 Unprocessable Entity`: Gemini output failed structural or count validation after retries.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unexpected server error.
- `502 Bad Gateway`: Upstream Gemini provider failure.

---

## 6. Input Validation Using Zod

1. **Request Body Validation:**
   - All controller endpoints must validate `req.body` and `req.params` with Zod schemas.
   - Premise input: `.trim()`, `.min(1)`, `.max(500)`.
   - Difficulty input: `.enum(["easy", "medium", "hard"])`.
   - Suspect / Clue IDs: Validated as non-empty strings.
2. **Gemini Output Validation:**
   - Gemini generation responses must be parsed as JSON and validated against `CaseGenerationSchema`.
   - Strict validation includes:
     - Exact suspect count (Easy: 3, Medium: 4, Hard: 5).
     - Exact clue count (Easy: 5, Medium: 7, Hard: 9).
     - Exact hint count (Easy: 2, Medium: 3, Hard: 3).
     - Unique IDs for suspects, clues, and hints.
     - `culpritId` references a real suspect in the suspect list.
     - All fields non-empty and within defined length bounds.

---

## 7. Environment Variable and API-Key Security

1. **Secret Isolation:**
   - Server-only secrets: `GEMINI_API_KEY`, `MONGODB_URI`, `PORT`, `CLIENT_URL`.
   - Client public configuration: `VITE_API_BASE_URL` only.
2. **Never Expose Private Keys:**
   - Never inject `GEMINI_API_KEY` or `MONGODB_URI` into the frontend code or `client/.env`.
   - Never commit `.env` files to git. Both `client/.gitignore` and `server/.gitignore` must include `.env`.
   - Provide clean `.env.example` templates with placeholders in both client and server directories.

---

## 8. Backend-Only Scoring and Solution Verification

> [!IMPORTANT]
> **The Zero-Leakage Policy:**
> 1. The solution (`culpritId`, `solution`, `evidenceMapping`) must **NEVER** be sent to the browser while a case is active.
> 2. The client must never receive or calculate the final score or verdict.
> 3. Hiding answers in CSS or in hidden HTML elements is strictly forbidden.

### 8.1 Scoring Rules (Backend-Authoritative)
- **Difficulty Base Points:**
  - Easy: `100` points
  - Medium: `150` points
  - Hard: `200` points
- **Clue Discovery:** `+5` points per unique clue discovered.
- **Hint Usage:** `-10` points per hint used.
- **Score Calculation:**
  - If accusation is **correct**: `finalScore = max(0, basePoints + (uniqueClues * 5) - (hintsUsed * 10))`
  - If accusation is **incorrect**: `finalScore = 0` (case failed)
- **Locking:** Once an accusation is submitted, the case status immediately transitions to `completed`. No further clues, hints, or accusations may be submitted.

---

## 9. Responsive Cyberpunk UI Design

1. **Visual Direction:**
   - High-tech, immersive cyber-investigation terminal.
   - Dark panels, subtle scanline/grid overlays, restrained glowing borders.
   - Tactical monospace badges (`CASE: #409-B`, `DECRYPTED`, `THREAT LEVEL: HIGH`).
2. **Design Tokens:**
   - **Background Dark:** `#070A12` (deep obsidian blue)
   - **Panel Surface:** `#111B2E`
   - **Neon Cyan (Primary):** `#35F2FF`
   - **Neon Magenta (Accent):** `#FF3DF2`
   - **Electric Green (Success/Discovered):** `#A3FF12`
   - **Warning Amber:** `#FFC857`
   - **Error Red:** `#FF4D6D`
   - **Primary Text:** `#EAF2FF`
   - **Muted Text:** `#8EA3BD`
3. **Responsive Rules:**
   - Mobile-first responsive layouts supporting viewports from 320px to 1440px+.
   - No horizontal scrolling on mobile viewports.
   - Investigation Room smoothly transitions from a 3-column desktop grid to stacked mobile panels.

---

## 10. Accessibility and State Handling

1. **Accessibility (a11y):**
   - High-contrast text adhering to WCAG AA guidelines. Avoid low-contrast neon-on-neon text.
   - Visible focus indicators on all interactive elements.
   - Proper keyboard navigation (`Tab`, `Enter`, `Escape`).
   - Semantic HTML tags (`<main>`, `<nav>`, `<section>`, `<article>`, `<button>`).
   - Respect `prefers-reduced-motion` by disabling glitch and pulse animations.
2. **State Management:**
   - **Loading States:** Cyberpunk terminal progress indicators or matrix decoders for async operations.
   - **Empty States:** Clear tactical terminal explanations when no data exists (e.g., zero clues discovered yet).
   - **Error States:** Actionable, high-visibility error banners with clear retry actions.

---

## 11. Testing and Verification Protocols

1. **Automated Test Coverage:**
   - **Unit Tests:** Authoritative scoring rules, zero-score floor, serializer leak prevention, Zod schema validation.
   - **Integration Tests:** Full API lifecycle (`POST /api/cases` -> `GET /api/cases/:id` -> clue discovery -> hint limits -> accusation -> result).
2. **Strict Test Integrity Rule:**
   - **NEVER** state or claim that a test passed unless you have actually executed the test command in the shell and verified its passing output.
   - If tests fail, diagnose the root cause, fix the issue, and rerun the test suite.

---

## 12. Working Conventions & Post-Task Reporting

### 12.1 Rules for Modifying Files
1. **Always Inspect First:** Inspect existing files using `view_file` before making edits or overwrites.
2. **Preserve Integrity:** Never overwrite code blindly. Maintain unrelated existing logic and comments.
3. **No Contract Drift:** Never silently change API schemas or data structures.

### 12.2 Mandatory Post-Task Summary
After implementing any task or step, the agent must output a structured walkthrough report containing:
- **Files Created or Modified:** Clickable markdown file links (`[file.js](file:///path/to/file.js)`).
- **Commands Executed:** Exact shell commands run to build, test, or verify.
- **Tests Passed & Failed:** Actual test runner output and status.
- **Known Limitations:** Any edge cases or pending items.
- **Deviations from SPEC.md:** Any deviations (must be explicitly justified and approved).
