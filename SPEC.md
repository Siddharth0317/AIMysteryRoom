# AI Mystery Room — Product & Technical Specification

**Project name:** AI Mystery Room  
**Document:** `SPEC.md`  
**Status:** Implementation blueprint  
**Primary experience:** AI-generated detective mystery game  
**Visual direction:** Cyberpunk / Sci-Fi Hacker Terminal  
**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Node.js + Express  
**Database:** MongoDB + Mongoose  
**AI provider:** Google Gemini API

---

## 1. Project Overview

AI Mystery Room is an AI-powered web application in which a player creates and solves a mystery generated with the Gemini API. The player enters a premise, selects a difficulty, investigates suspects, discovers clues, requests hints, and submits an accusation. After the accusation, the application reveals the verdict, culprit, explanation, and final score.

The experience should feel like a detective operating inside a futuristic cyber-investigation terminal. The interface may use neon accents, dark panels, terminal-inspired labels, subtle grid or scan-line textures, and restrained glitch effects. The visual styling must not make the game difficult to read or use.

### 1.1 Problem Statement

Traditional mystery games often rely on a fixed set of cases. AI Mystery Room aims to offer replayable investigations by generating new cases from user-provided premises and difficulty settings while maintaining a coherent solution and fair scoring.

### 1.2 Goals

- Let a player generate a mystery at Easy, Medium, or Hard difficulty.
- Provide a complete flow from case creation through investigation and accusation to results.
- Generate structured mystery content with Gemini.
- Ensure clues and the solution are logically consistent.
- Keep the culprit and solution private on the server until the accusation is submitted.
- Track clue discovery and hint usage.
- Calculate and validate scores on the backend.
- Provide responsive, accessible UI in a Cyberpunk / Sci-Fi Hacker Terminal theme.
- Deploy a working production application and document the source code.

### 1.3 Out of Scope for the Initial Version

Unless separately approved, the first version does not require:
- User registration or login.
- Multiplayer or shared investigations.
- Public leaderboards.
- Payments or subscriptions.
- Real-time chat between players.
- An administrator dashboard.
- A guarantee that every AI-generated mystery is perfect without validation.

---

## 2. Target Users and User Experience

### 2.1 Target Users

People who enjoy detective stories, puzzles, escape rooms, interactive fiction, and AI-generated games.

### 2.2 UX Principles

1. **Immersive:** The app should resemble a futuristic investigation terminal.
2. **Clear:** Users should always understand their current case, discovered clues, available hints, and next action.
3. **Fair:** The game must not reveal the answer before an accusation.
4. **Responsive:** Core actions must work on mobile, tablet, and desktop.
5. **Resilient:** Loading, empty, invalid, and API-failure states must be clearly communicated.
6. **Accessible:** Text contrast, keyboard navigation, focus indicators, and reduced-motion preferences must be supported.

### 2.3 Primary User Journey

1. User opens the Home page.
2. User selects **Initialize Case** / **Create Mystery**.
3. User enters a premise and selects a difficulty.
4. Frontend sends the request to the backend.
5. Backend generates, validates, and stores the case using Gemini and MongoDB.
6. User enters the Investigation Room.
7. User reviews the story and suspects.
8. User discovers clues and optionally requests hints.
9. User proceeds to the Accusation screen.
10. User selects a suspect and submits the accusation.
11. Backend evaluates the accusation and calculates the score.
12. Results page displays the verdict, culprit, explanation, and score.
13. User can start a new mystery.

---

## 3. Functional Requirements

### FR-01: Home Page

Display:
- Product name and short description.
- Primary **Initialize Case** button.
- Brief instructions for playing.
- A small status or decorative terminal panel that does not pretend to show live system data unless it is real.

Actions:
- Clicking the primary button opens the Create Mystery page.
- Navigation must work by mouse, keyboard, and touch.

### FR-02: Create Mystery

Inputs:
- **Mystery premise:** required text input or textarea.
- **Difficulty:** one of `easy`, `medium`, or `hard`.
- **Generate Mystery:** submits the form.

Validation:
- Trim leading and trailing whitespace.
- Reject an empty premise.
- Set a documented maximum length, recommended 500 characters.
- Validate difficulty against the allowed enum.
- Disable repeated submission while a request is in progress.

States:
- Idle.
- Generating.
- Success.
- Validation error.
- AI/provider error.
- Network/server error.

On success, navigate to the new case's Investigation Room using the case ID returned by the backend. Do not store or pass the secret culprit or solution to the frontend.

### FR-03: Investigation Room

Display:
- Case title, difficulty, and story.
- Suspect cards with player-safe information.
- Clue list with discovered/undiscovered state.
- Hint action and remaining hint count.
- Discovered-clue count and current score estimate, if shown.
- Progress indicator.
- Action to proceed to accusation.

Suspect cards may include:
- Name.
- Public background.
- Motive or relevant public information.
- Alibi or other information that is intended to be visible.

Clues:
- Each clue has a stable ID, title, player-visible description, and discovery state.
- A clue must not be marked discovered solely by a frontend-only change.
- The backend must verify the clue belongs to the requested case.
- Repeated discovery requests must not award duplicate points.

Hints:
- A hint request must be validated on the backend.
- A player cannot use more hints than the difficulty allows.
- Repeated or concurrent requests must not bypass the hint limit or apply duplicate deductions.
- Only reveal a hint intended for the current stage of the investigation.

### FR-04: Accusation

Display:
- A list of suspects.
- A clear selection state.
- A confirmation action before final submission, if appropriate.
- A warning that the accusation completes the case.

Rules:
- Require a valid suspect ID.
- Confirm that the suspect belongs to this case.
- A case can be accused only while active.
- Once an accusation is accepted, the case is completed and cannot be scored again.
- Do not accept a client-supplied culprit ID, verdict, or score.

### FR-05: Results

Display:
- Verdict: correct or incorrect.
- Culprit's identity.
- Solution explanation.
- Score breakdown.
- Difficulty.
- Clues discovered and hints used.
- **Play Again** / **Initialize New Case** action.

The results endpoint must only reveal the solution after a valid accusation has completed the case. If a case is already completed, the authorized result may be retrieved again.

### FR-06: Error and Empty States

Provide useful messages for:
- Empty premise.
- Invalid difficulty.
- Case not found.
- Invalid clue or suspect ID.
- Case already completed.
- Hint limit reached.
- Gemini timeout or invalid response.
- Database unavailable.
- Rate limit exceeded.
- General network/server failure.

Do not display stack traces, API keys, database connection strings, or raw internal errors to the user.

---

## 4. Difficulty Rules and Scoring

### 4.1 Required Case Counts

| Difficulty | Suspects | Clues | Hints | Base points for a correct accusation |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

The backend must validate these counts before saving a generated case. If the AI response does not satisfy the requirements, retry a limited number of times or return a safe error. Do not save malformed cases.

### 4.2 Scoring Rules

- Correct accusation: award the base points for the selected difficulty.
- Each unique clue discovered: `+5` points.
- Each hint successfully used: `-10` points.
- Minimum final score: `0`.

Recommended formula:

`finalScore = max(0, basePoints + (uniqueCluesDiscovered * 5) - (hintsUsed * 10))`

The source requirements specify base points for a correct accusation. For an incorrect accusation, the specification for the first version should award **0 base points**, while clue and hint adjustments may be calculated only if the product owner confirms that partial scores should be retained. Recommended simple rule: if the accusation is incorrect, final score is `0`; if correct, use the formula above. Implement this consistently and document it in the UI.

All scoring must happen on the backend using persisted progress. Never accept a score calculated by the browser.

### 4.3 Idempotency and Abuse Prevention

- Discovering the same clue multiple times must not grant repeated points.
- A hint request must only deduct points when a valid hint is successfully returned and recorded.
- Concurrent requests must not exceed the allowed hint count.
- A completed case must not accept more clues, hints, or accusations.
- Where practical, use atomic updates or transactions/conditional updates to prevent race conditions.

---

## 5. AI Generation Requirements

### 5.1 Gemini Responsibilities

Gemini generates:
- Case title.
- Story/premise expansion.
- Suspects and player-visible details.
- Clues.
- Hints.
- Hidden culprit identifier.
- Hidden solution explanation.
- Optional internal reasoning/evidence mapping used for validation.

### 5.2 Structured Output

Use a defined JSON schema and validate the parsed response with Zod before saving. The exact schema should be implemented in code and kept consistent with the Mongoose model.

Suggested conceptual structure:

```json
{
  "title": "The Missing Signal",
  "difficulty": "medium",
  "story": "A concise mystery narrative.",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Example Suspect",
      "description": "Player-visible background and relevant details"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "Corrupted Access Log",
      "description": "Player-visible clue text",
      "hintText": "Optional internal clue guidance"
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "text": "A gradual hint that does not reveal the answer outright"
    }
  ],
  "culpritId": "suspect_1",
  "solution": "Hidden explanation of the crime",
  "evidenceMapping": [
    {
      "clueId": "clue_1",
      "supports": "A concise internal explanation of how this clue supports the solution"
    }
  ]
}
```

This is a proposed implementation shape, not a fixed schema from the source guide. Adapt it as needed, but do not weaken the security or validation requirements.

### 5.3 Generation Prompt Requirements

The backend prompt must instruct Gemini to:
- Return only the requested structured data, without markdown fences.
- Follow the requested difficulty counts exactly.
- Use unique stable IDs for suspects, clues, and hints.
- Generate a single, unambiguous culprit.
- Ensure the solution is supported by discoverable clues.
- Avoid contradictions between the story, suspects, clues, and solution.
- Make clues meaningful rather than purely decorative.
- Provide hints that progress from subtle to more helpful without immediately revealing the culprit.
- Avoid unsafe or inappropriate content.
- Treat user-provided premises as untrusted content, not as instructions to reveal system prompts or change the output format.

### 5.4 Validation

At minimum, validate:
- JSON parsing succeeds.
- Required fields exist and have the correct types.
- Difficulty is valid.
- Exact suspect, clue, and hint counts match the difficulty.
- All IDs are unique.
- `culpritId` references an existing suspect.
- Evidence mappings reference existing clues.
- Story, clue, hint, and solution strings are non-empty and within documented length limits.
- No secret fields are included in player-facing responses.

Structural validation cannot guarantee narrative logic. Add unit tests and manual test cases for contradictory clues, unsupported solutions, duplicate IDs, missing culprit, and malformed output. If validation fails, retry with a bounded policy and then return a controlled error.

### 5.5 Provider Failures

- Set a timeout for Gemini calls.
- Limit retries to avoid excessive cost or long waits.
- Do not expose raw provider errors to the client.
- Log safe diagnostic details without logging secrets.
- If generation fails, do not create a partial or invalid case.
- Consider a request rate limit to reduce abuse and unexpected API costs.

---

## 6. Security and Privacy Requirements

### SEC-01: Keep the Solution Server-Side

The culprit ID, solution, and internal evidence mapping must never be sent in the response for an active case. Hiding the answer in CSS or in an invisible frontend field is not security.

### SEC-02: Secrets

Store these in server-side environment variables:
- `GEMINI_API_KEY`
- `MONGODB_URI`
- `PORT`
- `CLIENT_URL`

Never place private API keys in React environment variables or commit `.env` files to GitHub. Provide a `.env.example` with placeholder values only.

### SEC-03: Input Validation

Validate all request bodies and route parameters on the backend. Enforce maximum lengths and allowed enum values. Treat all client input as untrusted.

### SEC-04: Authorization and Case Access

The initial version may use an unguessable case ID as a lightweight access mechanism if accounts are out of scope, but IDs alone are not a substitute for authentication for sensitive data. Avoid exposing hidden solution fields through any endpoint. If user accounts are added later, associate cases with owners and enforce authorization on every route.

### SEC-05: API Protection

- Configure CORS to allow the deployed frontend origin and local development origin.
- Use rate limiting for case generation and hint endpoints.
- Apply request size limits.
- Use safe error responses.
- Avoid leaking database IDs or internal fields unnecessarily.
- Do not allow repeated accusation submissions to change a completed result.

### SEC-06: Data Integrity

The backend owns the canonical case status, discovered clues, hint count, accusation, verdict, and score. The frontend may display state but must not be the source of truth.

---

## 7. Backend API Contract

Use JSON for request and response bodies. Keep naming consistent between API handlers, validation schemas, database fields, and frontend types.

### 7.1 Create Case

**`POST /api/cases`**

Request:
```json
{
  "premise": "A secure research archive has been breached.",
  "difficulty": "medium"
}
```

Success response (player-safe fields only):
```json
{
  "case": {
    "id": "case_id",
    "title": "The Silent Breach",
    "difficulty": "medium",
    "story": "Player-visible story...",
    "suspects": [],
    "clues": [
      {
        "id": "clue_1",
        "title": "Access Log",
        "description": "Clue description",
        "discovered": false
      }
    ],
    "progress": {
      "discoveredClueCount": 0,
      "hintsUsed": 0,
      "status": "active"
    }
  }
}
```

Do not include `culpritId`, `solution`, or hidden evidence mapping in this response.

### 7.2 Retrieve Active Case

**`GET /api/cases/:id`**

Return the player-safe active case and progress. Do not expose the solution while the case is active.

### 7.3 Discover a Clue

**`POST /api/cases/:id/clues/:clueId/discover`**

Request body can be empty.

Behavior:
- Validate case and clue.
- Reject if the case is completed.
- Mark the clue discovered once.
- Return the clue text and updated progress.
- Do not duplicate score for a clue already discovered.

### 7.4 Request a Hint

**`POST /api/cases/:id/hints`**

Behavior:
- Validate that the case is active.
- Check the difficulty-based hint limit.
- Select the next available hint using a deterministic order or documented policy.
- Record hint usage and deduct points according to the scoring rules.
- Return the hint text and updated progress.
- Do not return the hidden solution.

### 7.5 Submit an Accusation

**`POST /api/cases/:id/accuse`**

Request:
```json
{
  "suspectId": "suspect_2"
}
```

Behavior:
- Validate the case is active.
- Validate the suspect belongs to the case.
- Compare the submitted suspect with the server-side culprit ID.
- Store the accusation and verdict.
- Calculate the final score on the backend.
- Mark the case completed.
- Return the verdict, result, explanation, and score only after the accusation is accepted.

### 7.6 Retrieve Result

**`GET /api/cases/:id/result`**

- If the case is active, return a suitable response such as `409 CASE_NOT_COMPLETED` without revealing the solution.
- If completed, return the saved result and score.
- Repeated result retrieval must not recalculate or modify the score.

### 7.7 Standard Error Shape

Use a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please provide a valid mystery premise."
  }
}
```

Suggested status codes:
- `400` invalid request.
- `404` case or clue not found.
- `409` case already completed or hint limit reached.
- `422` AI response failed schema validation after bounded retries.
- `429` rate limit exceeded.
- `500` unexpected server error.
- `502` upstream AI provider failure.
- `503` database or service temporarily unavailable.

Do not return stack traces or secrets in error responses.

---

## 8. Database Design

Use Mongoose schemas with timestamps.

### 8.1 Case Model

Suggested fields:
- `title`: string, required.
- `premise`: string, required.
- `story`: string, required.
- `difficulty`: enum `easy | medium | hard`.
- `suspects`: array of suspect objects with unique IDs and player-visible information.
- `clues`: array of clue objects with unique IDs, titles, descriptions, and discovery state or separate progress records.
- `hints`: array of hint objects.
- `culpritId`: string, required and server-only in API serialization.
- `solution`: string, required and server-only in API serialization.
- `evidenceMapping`: internal validation/explanation data, server-only.
- `discoveredClueIds`: array of unique clue IDs.
- `usedHintIds` or `hintsUsed`: persisted hint usage.
- `accusationSuspectId`: optional string.
- `isCorrect`: optional boolean.
- `score`: number, default `0`.
- `status`: enum `active | completed`.
- `createdAt`, `updatedAt`: timestamps.

Add indexes where useful, especially on status and creation time if listing/history features are added. Do not create extra user-facing history features unless needed.

### 8.2 Serialization

Create explicit DTO/serializer functions for active-case and completed-result responses. Do not rely only on frontend conventions to hide secret fields. Test that active-case responses do not contain secret fields anywhere in nested objects.

---

## 9. Frontend UI and Design System

### 9.1 Theme: Cyberpunk / Sci-Fi Hacker Terminal

The UI should feel like a high-tech cyber investigation console—not a generic admin dashboard.

**Visual keywords:** neon, dark, tactical, terminal, holographic, cyber investigation, restrained glitch, high-contrast panels.

#### Color tokens

Use these as initial design tokens and adjust consistently:
- Background: `#070A12` (near-black blue).
- Secondary background: `#0D1322`.
- Panel background: `#111B2E`.
- Neon cyan: `#35F2FF`.
- Neon magenta: `#FF3DF2`.
- Electric green: `#A3FF12`.
- Warning amber: `#FFC857`.
- Error red: `#FF4D6D`.
- Main text: `#EAF2FF`.
- Muted text: `#8EA3BD`.
- Borders: cyan or slate at low opacity.

Use cyan for primary actions and active states, magenta for secondary accents, green for confirmed discoveries, amber for warnings, and red for errors. Do not use every accent at full intensity on every component.

#### Typography

- Use a readable sans-serif for body text.
- Use a monospace font for IDs, system labels, timestamps, progress indicators, and terminal snippets.
- Headings may use a futuristic display face, but must remain readable.
- Avoid long blocks of body copy in all caps.

#### Surfaces and effects

- Dark panels with thin borders.
- Restrained cyan glow on primary actions and active elements.
- Subtle grid, scan-line, or circuit texture in selected areas only.
- Small uppercase metadata labels such as `CASE STATUS`, `THREAT LEVEL`, or `EVIDENCE LOG`.
- Short transition animations for panel changes and clue discovery.
- Optional typing animation for decorative terminal output, but essential content must not be delayed by it.

Avoid excessive glitch effects, flashing content, constant motion, or low-contrast neon text. Respect `prefers-reduced-motion`.

### 9.2 Layout

**Desktop**
- Centered content with a maximum width around 1200–1400px.
- Top navigation with brand mark, current page, and case status.
- Investigation room can use a three-column layout: case/story panel, suspect panel, evidence/hints panel.
- Keep the primary action visible without requiring excessive scrolling.

**Tablet**
- Use two columns where space allows.
- Move secondary panels below the main story when necessary.

**Mobile**
- Single-column layout.
- Stack suspect cards and clues.
- Use large touch targets.
- Keep hint and accusation actions easy to find.
- Prevent horizontal scrolling.
- Avoid tiny terminal text.

### 9.3 Component Inventory

Create reusable components, for example:
- `AppShell`
- `TopNav`
- `TerminalPanel`
- `SectionHeader`
- `PrimaryButton`
- `DifficultySelector`
- `PremiseForm`
- `LoadingTerminal`
- `CaseHeader`
- `SuspectCard`
- `ClueCard`
- `HintPanel`
- `ProgressMeter`
- `ScoreBadge`
- `AccusationDialog`
- `VerdictPanel`
- `ErrorBanner`
- `EmptyState`
- `ConfirmDialog`

Use consistent component variants rather than styling every page independently.

### 9.4 Page-Specific Art Direction

**Home**
- Strong title, concise tagline, and prominent `INITIALIZE CASE` button.
- Abstract city-grid or circuit motif as background decoration.
- A small faux-terminal introduction can set the mood.
- Do not make decorative status text look like real security monitoring.

**Create Mystery**
- Styled like a case initialization form.
- Premise field resembles a command input but remains a normal accessible textarea.
- Difficulty options appear as three distinct selectable cards.
- Show validation feedback next to the relevant field.

**Investigation Room**
- Present the story in a readable briefing panel.
- Suspect cards should have clear names, motives/backgrounds, and selection/inspection affordances.
- Clues should look like evidence records with status labels such as `LOCKED` and `DECRYPTED` only when those labels accurately describe the game state.
- Use progress bars or counters for clues and hints.
- Clearly distinguish available, discovered, and unavailable actions.

**Accusation**
- Use a high-focus confirmation panel.
- Show the selected suspect clearly.
- Warn that submitting completes the case.
- Do not reveal whether a suspect is correct until the server responds.

**Results**
- Use a clear verdict banner.
- Present culprit, explanation, evidence recap, and score breakdown.
- Use color and iconography in addition to color to distinguish correct and incorrect outcomes.
- Offer a clear restart action.

### 9.5 Accessibility

- Maintain WCAG-friendly text contrast, especially for neon text on dark backgrounds.
- All controls must have accessible names.
- All form fields must have labels.
- Keyboard focus must be visible.
- Use semantic headings and buttons.
- Announce important async state changes to assistive technology where appropriate.
- Do not rely on color alone to convey clue status or verdict.
- Honor reduced-motion settings.
- Ensure modals manage focus correctly.

---

## 10. Suggested Project Structure

```text
ai-mystery-room/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── cases.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AppShell.jsx
│   │   │   ├── TerminalPanel.jsx
│   │   │   ├── SuspectCard.jsx
│   │   │   ├── ClueCard.jsx
│   │   │   ├── HintPanel.jsx
│   │   │   └── ErrorBanner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateMystery.jsx
│   │   │   ├── InvestigationRoom.jsx
│   │   │   ├── Accusation.jsx
│   │   │   └── Results.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── caseController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   └── Case.js
│   │   ├── routes/
│   │   │   └── caseRoutes.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   ├── scoringService.js
│   │   │   └── caseValidationService.js
│   │   ├── validators/
│   │   │   └── caseSchemas.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── SPEC.md
├── README.md
└── .gitignore
```

This structure is a recommendation; it can be simplified as long as responsibilities remain clear.

---

## 11. Environment and Setup

### 11.1 Frontend Setup

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom axios
```

Install and configure Tailwind CSS using the version-compatible setup instructions for the selected Tailwind version.

### 11.2 Backend Setup

```bash
mkdir server
cd server
npm init -y
npm install express cors dotenv mongoose @google/genai zod
npm install --save-dev nodemon
```

### 11.3 Environment Variables

Backend `.env` example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Frontend may use a public backend base URL variable, for example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Only public configuration belongs in frontend environment variables. Never put the Gemini API key or MongoDB URI in the frontend.

Add `.env` to `.gitignore`. Commit `.env.example` with placeholder values, not real credentials.

---

## 12. Testing Strategy

### 12.1 Unit Tests

Test:
- Difficulty configuration and required counts.
- Score calculation.
- Minimum score of zero.
- Clue discovery idempotency.
- Hint limits.
- Case status transitions.
- Schema validation.
- Culprit ID references a real suspect.
- Player-safe serialization removes secret fields.

### 12.2 API/Integration Tests

Test:
- Successful case creation.
- Invalid premise and difficulty.
- Gemini invalid JSON.
- Gemini timeout or provider failure.
- Database connection failure.
- Missing case ID.
- Missing or invalid clue ID.
- Hint limit reached.
- Repeated clue discovery.
- Accusation with unknown suspect.
- Accusation after case completion.
- Result retrieval before accusation.
- Result retrieval after completion.
- Score cannot be modified by client input.

### 12.3 Manual End-to-End Test

For each difficulty:
1. Generate a case.
2. Confirm the expected number of suspects, clues, and hints.
3. Discover several clues.
4. Request hints up to the limit.
5. Verify repeated clue discovery does not grant extra points.
6. Inspect active-case API responses and confirm the solution is absent.
7. Submit an accusation.
8. Verify verdict, explanation, and score.
9. Refresh the results page and verify the result remains consistent.
10. Start a new case.

Repeat the end-to-end flow on the deployed production site.

---

## 13. Deployment Requirements

The source guide recommends:
- MongoDB Atlas for the hosted database.
- A suitable hosting provider for the Express backend.
- Vercel for the React frontend.

Deployment checklist:
- Set production environment variables on the hosting providers.
- Configure backend CORS for the production frontend origin.
- Configure the frontend API base URL to point to the deployed backend.
- Ensure the database accepts connections from the backend host.
- Never commit secrets.
- Test all API endpoints in production.
- Test the full game on the public website.
- Verify that the culprit is not exposed in active-case network responses.
- Include the live URL and repository URL in the submission.

---

## 14. Acceptance Criteria

The project is complete when all of the following are true:

### Product
- [ ] Users can generate cases at all three difficulty levels.
- [ ] Every difficulty produces the required number of suspects, clues, and hints.
- [ ] Users can investigate, discover clues, and request hints.
- [ ] Users can submit an accusation.
- [ ] Results show the correct verdict, culprit, explanation, and score.
- [ ] Users can start another mystery.

### AI and Data
- [ ] Gemini output is parsed and validated before storage.
- [ ] Invalid or inconsistent structural output is handled safely.
- [ ] The culprit and solution are never included in active-case responses.
- [ ] The database stores progress and completed results consistently.

### Scoring and Security
- [ ] Backend calculates the score.
- [ ] Repeated clue discovery does not award duplicate points.
- [ ] Hint usage cannot exceed the difficulty limit.
- [ ] Completed cases cannot be scored or accused again.
- [ ] API keys and database credentials are not exposed.
- [ ] Client-supplied score or verdict values are ignored.

### UI
- [ ] Cyberpunk / Sci-Fi Hacker Terminal theme is consistent across all pages.
- [ ] Layout is responsive.
- [ ] Loading, empty, and error states exist.
- [ ] Keyboard navigation and visible focus states work.
- [ ] Reduced-motion preferences are respected.
- [ ] Text remains readable against dark/neon surfaces.

### Delivery
- [ ] `SPEC.md` is complete.
- [ ] Source code is pushed to GitHub.
- [ ] Application is deployed.
- [ ] Complete production flow has been tested.
- [ ] At least one mystery has been created and solved on the deployed website.
- [ ] Submission form has been completed before the applicable deadline.

---

## 15. Implementation Order

Build and test incrementally in this order:

1. Finalize this specification and confirm API response shapes.
2. Create the repository and frontend/backend folder structure.
3. Build the design system and page skeletons using mock data.
4. Implement the Express server and MongoDB connection.
5. Implement the Mongoose case model and Zod validation schemas.
6. Implement Gemini generation and bounded failure handling.
7. Implement player-safe case serialization.
8. Implement clue discovery and hint usage.
9. Implement accusation, verdict, and backend scoring.
10. Connect React to the APIs.
11. Add loading, error, and empty states.
12. Run unit, integration, and end-to-end tests.
13. Deploy database, backend, and frontend.
14. Test security and complete gameplay on production.
15. Push final source code and submit the live website.

Do not build the entire application in one unreviewed code-generation step. Implement one feature at a time, run it, test it, and then proceed.

---

## 16. Source-Guide Constraints and Implementation Decisions

The supplied build guide explicitly requires:
- `SPEC.md` before implementation.
- React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, and Gemini API.
- Five primary pages: Home, Create Mystery, Investigation Room, Accusation, Results.
- Six suggested API endpoints for case creation, retrieval, clue discovery, hints, accusation, and results.
- Easy/Medium/Hard case counts and scoring rules.
- Server-side protection of the culprit and solution.
- Testing, deployment, GitHub source code, live website, and submission.

This specification adds implementation detail to make those requirements actionable. The Cyberpunk / Sci-Fi Hacker Terminal theme, color tokens, component inventory, proposed JSON shape, folder structure, error schema, and detailed test cases are design and engineering recommendations rather than exact requirements stated by the guide.



## 17. Advanced Features — Extended Scope

This section extends the core project without replacing the original requirements. The five priority enhancements are: AI consistency validation, suspect interrogation, an interactive evidence board, adaptive difficulty, and post-game AI analysis. Implement them only after the core end-to-end game is stable. They should use the same stack and design system already specified.

### 17.1 Feature Priority and Release Policy

| Feature | Priority | Recommended phase | Core dependency | MVP fallback |
|---|---|---|---|---|
| AI mystery consistency validator | P0 for advanced release | Phase 2 | Validated case generation | Reject malformed cases and regenerate once |
| Suspect interrogation | P1 | Phase 2 | Suspects and private server-side solution | Fixed question categories with deterministic response rules |
| Interactive evidence board | P1 | Phase 2 | Discovered clues and suspect list | Filterable evidence list if graph layout is delayed |
| Adaptive difficulty | P2 | Phase 3 | Reliable progress and event tracking | Rule-based adjustments; no extra model call required |
| Post-game AI analysis | P1 | Phase 2 | Completed case and server-side result | Template-based analysis if Gemini is unavailable |
| Daily mystery / replayability | P2 | Phase 3 | Case creation and history | Curated seed of daily premises |
| Case history and player statistics | P1 | Phase 2 | Player/session identity and completed cases | Local guest session history with server-generated IDs |
| Achievements and XP | P2 | Phase 3 | Trusted event and score records | Small fixed achievement set |
| Timed challenge mode | P2 | Phase 3 | Investigation state and reliable timestamps | Optional client timer backed by server timestamps |
| Shareable case summary | P2 | Phase 3 | Completed result serialization | Share only a redacted result summary, never active solution data |

The P0/P1/P2 labels are implementation recommendations, not requirements stated in the original build guide. The original five-page gameplay flow and required endpoints remain the minimum deliverable.

### 17.2 Advanced Feature A — AI Mystery Consistency Validator

#### Purpose

Generated mysteries must be solvable, internally consistent, and fair. The validator checks the mystery before it becomes available to the player. It must not expose the culprit or solution in public API responses.

#### Validation dimensions

- **Structural completeness:** the case has the required number of suspects, clues, and hints for its difficulty.
- **Reference integrity:** every clue reference points to an existing suspect, location, object, or event; every suspect identifier is unique.
- **Culprit integrity:** the solution identifies exactly one culprit from the suspect list.
- **Timeline integrity:** stated times and event ordering do not contradict one another unless the contradiction is intentionally presented as a clue.
- **Alibi integrity:** alibis and evidence can coexist logically; a false alibi is explainable by the private solution.
- **Evidence sufficiency:** the intended culprit can be distinguished from plausible alternatives using available clues.
- **Red-herring fairness:** misleading clues have a reasonable explanation and do not require arbitrary assumptions to dismiss.
- **Difficulty compliance:** counts and complexity match the selected difficulty.
- **Leakage scan:** player-facing story, clues, hints, and metadata do not accidentally include explicit solution fields or internal answer keys.
- **Safety and quality:** reject empty, malformed, abusive, or irrelevant generated text; apply sensible length limits.

#### Validation pipeline

1. Send the generation request to Gemini with the schema and difficulty constraints.
2. Parse the model response as JSON; do not trust prose surrounding the JSON.
3. Validate the response using Zod or an equivalent strict schema.
4. Run deterministic checks for counts, identifiers, references, enums, and required fields.
5. Run a semantic consistency review. This may be a second Gemini request using a validator prompt that receives the full private case and returns structured findings; it is advisory and must not be treated as infallible.
6. If validation fails, perform at most one controlled regeneration or repair attempt.
7. Re-run all deterministic checks after repair.
8. If the case still fails, return a safe generation error and do not save or serve the invalid case.
9. Persist the validated case, keeping the solution in server-only fields.
10. Record validation status and a sanitized diagnostic code for server logs; do not log API keys or unnecessary user data.

#### Suggested internal result shape

```json
{
  "valid": true,
  "checks": {
    "structure": true,
    "references": true,
    "timeline": true,
    "evidenceSufficiency": true,
    "difficulty": true,
    "solutionLeakage": true
  },
  "issues": [],
  "repairAttempted": false
}
```

This is an internal server contract, not a public endpoint response. Do not return private validator reasoning or the hidden solution to the client.

#### Acceptance criteria

- A malformed or incomplete response cannot be saved as a playable case.
- Required counts match the selected difficulty.
- All clue and suspect references resolve to existing IDs.
- The private solution identifies one valid suspect.
- A failed validation path produces a user-friendly retry message.
- Validator failure never causes the server to fall back to returning an unvalidated raw Gemini response.

### 17.3 Feature B — Suspect Interrogation System

#### Purpose

Let players question suspects during the investigation. Suspects should respond in character, reference only information they could plausibly know, and avoid revealing the culprit directly without sufficient evidence.

#### Player flow

1. The player opens a suspect card in the Investigation Room.
2. The interface shows the suspect's public profile, known alibi, and an interrogation button.
3. The player selects a suggested question category or enters a short free-text question.
4. The frontend submits the suspect ID and question to the backend.
5. The backend checks case ownership/session access, case status, question length, interrogation limits, and whether the suspect exists.
6. The backend constructs a prompt using the suspect's public persona, relevant discovered evidence, and only the private facts needed to keep the response consistent.
7. Gemini returns a short in-character answer in a constrained response shape.
8. The backend validates and sanitizes the answer, stores the interaction if history is enabled, and returns only the player-safe response.
9. The UI adds the exchange to the suspect's interrogation transcript.

#### Suggested question categories

- Alibi and timeline
- Relationship with the victim
- Motive and conflict
- Knowledge of a specific discovered clue
- Location at the time of the incident
- Contradictions between statements

Suggested questions are optional helpers. The player should also be able to type a question within a documented character limit, such as 300 characters.

#### Behavior rules

- Answers must remain consistent with the canonical case facts.
- A suspect must not know facts that have not been established as known to them.
- A suspect may evade, lie, become defensive, or provide incomplete information when this fits the generated character and solution.
- The AI should not improvise new evidence that changes the canonical solution.
- Interrogation must not directly reveal the culprit merely because the player asks “Who did it?”
- Responses should be concise and readable; use a defined maximum length.
- Apply rate limits and a per-case interaction budget to control cost and abuse.
- If Gemini is unavailable, show a retry action or a safe fallback response; do not invent authoritative new case facts.
- Interrogation responses may support reasoning but must not independently change score unless a future scoring rule explicitly defines that behavior.

#### Suggested API

`POST /api/cases/:id/suspects/:suspectId/interrogate`

Request:

```json
{
  "question": "Why did you leave the gallery before midnight?",
  "category": "timeline"
}
```

Response:

```json
{
  "interactionId": "interaction-id",
  "suspectId": "suspect-id",
  "answer": "I left shortly before midnight because...",
  "remainingQuestions": 4
}
```

The IDs and remaining-question field are examples; implement the final names consistently across API, database, and UI. The response must not include hidden suspect instructions, internal model prompts, or the full case solution.

#### Suggested data model

Store interrogation entries as subdocuments or in a separate collection when volume warrants it:

- interaction ID
- case ID
- suspect ID
- normalized question category
- sanitized question
- sanitized answer
- creation timestamp
- optional provider/model metadata for debugging, excluding secrets

Keep a maximum history length or pagination policy to avoid unbounded case documents. Never trust a client-supplied `remainingQuestions` value; compute limits on the server.

#### Acceptance criteria

- The player can question only suspects belonging to the active case.
- Questions are rejected when the case is complete or the limit is reached.
- Answers do not reveal protected solution fields.
- The same canonical facts remain consistent across repeated questioning.
- Errors, timeouts, and rate limits are presented without losing existing investigation progress.

### 17.4 Feature C — Interactive Evidence Board

#### Purpose

Provide a visual workspace where players connect discovered clues to suspects, locations, objects, and timeline events. The board supports reasoning but does not automatically declare the culprit or alter the canonical solution.

#### Main interactions

- Display discovered clues as evidence cards.
- Display suspects as separate nodes/cards.
- Allow the player to connect a clue to one or more suspects, locations, or timeline events.
- Allow connections to be labeled, for example “supports alibi,” “contradicts statement,” “possible motive,” or “unverified.”
- Allow players to add private notes and mark evidence as important.
- Filter by clue type, suspect, location, and connection label.
- Select a node to open a detail panel with the clue description and related discovered evidence.
- Remove or edit player-created connections without changing the original clue data.
- Show an empty state that explains how to begin building the board.
- Provide a list/table fallback for small screens, keyboard users, and situations where graph rendering is unavailable.

#### Information boundaries

- Only discovered clues appear in the player board.
- Undiscovered clues must not be preloaded into hidden frontend state or embedded in HTML.
- The board is a player-created reasoning aid. Connections are not proof and must not be interpreted as authoritative game facts.
- The board must not expose the culprit, private solution, or hidden validator metadata.
- The board does not award clue points for drawing a connection. Clue discovery remains the scoring event defined in Section 4.

#### Suggested UI components

- `EvidenceBoardPage` or an embedded `EvidenceBoardPanel`
- `EvidenceNode`
- `SuspectNode`
- `EvidenceConnection`
- `EvidenceDetailsPanel`
- `BoardToolbar`
- `BoardFilters`
- `PlayerNotesEditor`
- `BoardEmptyState`
- `BoardListFallback`

Use a graph/canvas library only if it is compatible with the project stack and can be kept accessible. A simple CSS-grid or SVG-based implementation is acceptable for the first version. Avoid decorative effects that make node labels difficult to read.

#### Suggested API and persistence

If board state should persist between sessions, add:

- `GET /api/cases/:id/board`
- `PUT /api/cases/:id/board`

Example request body:

```json
{
  "nodes": [
    { "id": "clue-1", "type": "clue", "x": 120, "y": 160, "note": "Check the timestamp" },
    { "id": "suspect-2", "type": "suspect", "x": 380, "y": 170, "note": "Alibi needs verification" }
  ],
  "edges": [
    { "id": "edge-1", "source": "clue-1", "target": "suspect-2", "label": "contradicts statement" }
  ]
}
```

The backend must validate node types, IDs, coordinates, connection labels, note lengths, and maximum node/edge counts. It must verify that clue nodes refer only to clues already discovered and that suspect nodes belong to the case. Do not accept arbitrary MongoDB operators or store unvalidated client objects.

#### Acceptance criteria

- Only discovered evidence can be placed on the board.
- Board state persists when persistence is enabled and can be edited later.
- Board connections never change scoring or reveal the solution.
- A keyboard-accessible list view provides the same core information as the visual board.
- The board works on desktop and mobile, with a usable fallback on narrow screens.

### 17.5 Feature D — Adaptive Difficulty

#### Purpose

Adjust the amount and timing of assistance based on observable player progress, while preserving the original Easy, Medium, and Hard rules and avoiding arbitrary changes to the canonical case.

#### Design principle

Adaptive difficulty should be an assistance layer, not a silent rewrite of difficulty, scoring, clue counts, or culprit. The original difficulty selected at case creation remains the official difficulty for scoring and results. Any adaptation must be transparent and optional.

#### Signals that may be used

- Time spent without discovering a clue
- Number of clues discovered
- Number of hints requested
- Repeated visits to the same evidence card
- Whether the player has opened suspect profiles or timeline information
- Player-selected preference for more guidance or more challenge

Do not infer sensitive traits or make psychological claims about the player. Use only in-game progress signals.

#### Recommended rule-based MVP

Begin with deterministic rules before adding another AI call. Example rules:

- If the player has made no discovery after a configurable inactivity interval, surface a non-revealing prompt suggesting a relevant investigation action.
- If the player has discovered most available clues but has not opened suspect profiles, recommend comparing alibis.
- If the player has used most hints, show a reminder that the remaining hint budget is limited.
- If the player chooses “challenge mode,” hide optional guidance prompts but preserve access to the explicitly available hint system.
- Never automatically spend a hint or deduct points on the player's behalf.

Thresholds should be configurable server-side and tested. Do not hard-code assumptions about how quickly every person should solve a case.

#### Optional AI adaptation

A later version may use Gemini to recommend one of several bounded assistance actions: `suggest_action`, `offer_hint`, `encourage_review`, or `no_action`. The model must not generate new canonical clues or modify the culprit. The backend validates the action against an allowlist and checks hint limits before displaying it. An AI suggestion must not silently count as a purchased/requested hint unless the player explicitly requests a hint through the existing endpoint.

#### Suggested response shape

```json
{
  "mode": "standard",
  "recommendation": {
    "type": "suggest_action",
    "message": "Compare the timeline details across the suspect profiles."
  }
}
```

#### Acceptance criteria

- Official difficulty and scoring remain tied to the selected Easy/Medium/Hard setting.
- Assistance never spends hints without player action.
- The player can dismiss or disable adaptive suggestions.
- No adaptation modifies the canonical solution or invents new evidence.
- Adaptation works without Gemini if the optional AI component fails.

### 17.6 Feature E — Post-Game AI Analysis

#### Purpose

After an accusation has been submitted and the case is complete, provide a learning-oriented debrief explaining which evidence mattered, which reasoning paths were strong or weak, and how the final solution fits the case.

#### Player experience

The Results page should continue to show the verdict, culprit, explanation, and final score required by the core specification. Add an optional “Case Debrief” section after the core result:

- Key evidence supporting the correct solution
- Important contradictions and timeline details
- Why major red herrings were misleading
- A neutral comparison of the player's selected suspect and the actual culprit
- Which discovered clues supported or weakened the player's accusation
- A short “What to notice next time” section
- Optional replay recommendation or a prompt to try a harder difficulty

The debrief should explain the evidence, not claim certainty about the player's thought process. It must not shame the player for an incorrect accusation.

#### Generation rules

- Generate the debrief only after the case is completed and the server has recorded the final accusation and score.
- The server should assemble a minimal input containing the private solution, canonical clues, player-discovered clue IDs, accusation, and score summary.
- Never accept the client as the source of the correct culprit, verdict, score, or canonical explanation.
- Validate the generated response against a structured schema and length limits.
- Ensure each factual claim can be linked to a clue, timeline event, or canonical solution fact.
- If the model invents facts, omits a key contradiction, or fails validation, fall back to the canonical explanation stored with the case.
- Treat the AI debrief as explanatory assistance; it must not modify the stored result or scoring.
- Avoid exposing internal prompts or hidden reasoning traces. Return a concise evidence-based explanation rather than private model reasoning.

#### Suggested API

`GET /api/cases/:id/analysis`

Only available for completed cases. The backend can generate the analysis on first request and cache the validated result, or generate it during completion if latency and provider limits permit. Do not block the core results page indefinitely while waiting for AI analysis.

Example response:

```json
{
  "status": "ready",
  "summary": "The decisive evidence was the mismatch between the recorded time and the suspect's alibi.",
  "keyEvidence": [
    {
      "clueId": "clue-3",
      "title": "Gallery Access Log",
      "explanation": "The timestamp conflicts with the claimed departure time."
    }
  ],
  "redHerrings": [
    {
      "clueId": "clue-5",
      "explanation": "This detail appears suspicious but has a consistent alternative explanation."
    }
  ],
  "nextTimeTip": "Compare independent timestamps before relying on a single alibi."
}
```

This is an illustrative response contract. Keep the exact response shape consistent in the backend types, Zod schema, and frontend.

#### Acceptance criteria

- Analysis is unavailable for active cases.
- Analysis agrees with the canonical solution and stored verdict.
- Each key-evidence item references a valid clue from the case.
- If analysis generation fails, the core Results page still works.
- The analysis cannot alter the score, accusation, or case status.

### 17.7 Feature F — Case History, Statistics, and Achievements

These features increase replay value but should not delay the core deliverable.

#### Case history

- Provide a “My Cases” or “Case Archive” view showing recent cases, selected difficulty, creation date, status, and score when completed.
- Allow the player to reopen an active case and view a completed case's result.
- Do not allow a completed case to be reopened for scoring or accusation changes.
- If the app has no account system, use a documented guest-session strategy. Do not rely on a client-editable user ID as proof of ownership.
- If account authentication is added later, enforce authorization on every case read and write.

#### Statistics

Potential statistics include cases attempted, cases solved, correct-accusation rate, clues discovered, hints used, and best score. Compute statistics from trusted server records. Clearly distinguish averages from totals and handle the no-data state.

#### Achievements / XP

Examples include “First Case Solved,” “No Hints Used,” “Evidence Collector,” and “Hard Case Solved.” Award achievements on the backend based on stored events. Prevent duplicate awards by using stable achievement IDs and idempotent writes. Achievements must not alter the core score formula unless explicitly versioned as a new rule.

### 17.8 Feature G — Daily Mystery, Timed Mode, and Replayability

- A daily mystery may use a server-selected date-based seed so players see the same daily case during the configured day. The canonical solution remains server-side.
- Avoid generating a different “daily” case for each refresh. Cache the generated case and define the reset timezone in configuration.
- Timed mode may record server-side start and completion timestamps. The client timer is display-only and cannot be trusted for score calculations.
- If a time bonus is introduced, define and version the formula before implementation; do not silently modify the base score formula in Section 4.
- Replay mode should create a new case record or a fresh run record. It must not reset an already completed record in place.
- A shareable summary may include premise, difficulty, public story, and result summary only after completion. Do not share private solution data for active cases.

### 17.9 Feature H — UI Enhancements for the Cyberpunk Terminal Theme

The original cyberpunk design system remains authoritative. Advanced interactions should feel like tools within the same investigation terminal, not separate visual products.

- **Interrogation panel:** suspect portrait/initials, status tag, transcript, question composer, category chips, usage counter, and clear loading/error states.
- **Evidence board:** draggable or selectable evidence cards, high-contrast connectors, zoom/reset controls if a graph is used, and a list fallback.
- **Adaptive assistance:** a dismissible “SYSTEM SUGGESTION” panel with a clear explanation that it is optional guidance.
- **Case debrief:** expandable evidence analysis cards with links to relevant discovered clues.
- **History dashboard:** compact case cards with difficulty chips, status, score, and last activity.
- **Achievements:** restrained badge styling; avoid excessive animation, flashing, or constant motion.
- **Shared components:** reuse the existing color tokens, typography, focus states, panel borders, buttons, badges, and spacing system.
- **Motion:** animate state changes only when helpful; honor `prefers-reduced-motion`.
- **Accessibility:** keyboard access to all controls, meaningful labels, visible focus, sufficient contrast, and non-color indicators for state.
- **Responsive behavior:** on mobile, convert side panels into drawers or stacked sections; use a list representation when a graph board is impractical.

### 17.10 Extended API Contract Summary

The original API endpoints remain required. The following are optional additions for advanced releases:

| Method | Endpoint | Purpose | Access / status rule |
|---|---|---|---|
| POST | `/api/cases/:id/suspects/:suspectId/interrogate` | Ask a suspect a question | Active case; validate question budget and suspect membership |
| GET | `/api/cases/:id/board` | Retrieve player's evidence board | Authorized case access; only player-safe data |
| PUT | `/api/cases/:id/board` | Save board layout, notes, and edges | Validate all nodes, references, and size limits |
| GET | `/api/cases/:id/analysis` | Retrieve or generate post-game analysis | Completed case only |
| GET | `/api/cases` | List accessible cases | Return only cases owned by the authenticated/guest session |
| GET | `/api/stats` | Retrieve player statistics | Calculate from trusted server records |
| GET | `/api/achievements` | Retrieve earned achievements | Return only the current player's records |
| GET | `/api/daily-case` | Retrieve the configured daily case | Stable daily case policy; do not expose solution |

Every optional endpoint must use the same error envelope and authorization model as Section 7. Avoid adding endpoints that duplicate an existing action. If a board or analysis feature is not persistent, document that limitation rather than creating a nonfunctional endpoint.

### 17.11 Extended Database Design

The original Case model remains the source of truth for case content, progress, solution, and result. Add optional fields or collections only when the corresponding feature is implemented.

#### Suggested case additions

- `schemaVersion`: version of the generated case schema.
- `validation.status`: `pending`, `passed`, or `failed` internal state.
- `validation.checkedAt`: timestamp of the most recent successful validation.
- `validation.issueCodes`: sanitized internal codes, not private chain-of-thought or raw secret prompts.
- `interrogations`: bounded list of interaction references or a separate collection.
- `boardState`: validated nodes, edges, and notes, if board persistence is enabled.
- `analysis.status`: `not_requested`, `pending`, `ready`, or `failed`.
- `analysis.content`: validated player-facing debrief only; keep private solution fields separate.
- `startedAt` and `completedAt`: server timestamps for timed or history features.
- `runStatus`: active/completed state already defined in the core model should be reused rather than duplicated inconsistently.

#### Suggested separate collections when useful

- `Interrogation`: case ID, suspect ID, question, answer, timestamp, and session/owner ID.
- `PlayerProfile` or `PlayerStats`: only if account/guest identity is implemented robustly.
- `AchievementAward`: owner ID, achievement ID, award timestamp, and idempotency key.
- `DailyCase`: configured date/seed, case ID, and reset timezone.

#### Database rules

- Add indexes for common case history queries, such as owner/session plus creation time, and for unique daily-case keys.
- Apply document size limits and cap transcript/board growth.
- Validate IDs and ownership at the service layer; schema validation alone is not authorization.
- Do not store API keys, raw secrets, or unnecessary personal information in documents.
- Do not persist an unvalidated AI response as trusted canonical content.
- Use schema migrations or a backward-compatible optional-field strategy for older cases.

### 17.12 Observability, Cost, and Failure Handling

- Track counts and latency for generation, validation, interrogation, and analysis requests.
- Track safe error codes and retry counts; do not log secret prompts, API keys, or full private solution payloads in routine logs.
- Set request timeouts and bounded retries. Avoid uncontrolled retry loops that can multiply API costs.
- Set per-session rate limits and configurable per-case AI interaction limits.
- Cache post-game analysis and validated daily cases where appropriate.
- Keep the core game playable if optional AI analysis, interrogation, or adaptive guidance is unavailable.
- Distinguish provider failure, validation failure, rate limiting, not-found, unauthorized, and completed-case errors.
- Add a basic usage/cost budget for development and production, with alerts or graceful limits if available.

### 17.13 Advanced Feature Security Checklist

- All new endpoints verify case access and correct case state.
- Suspect IDs and clue IDs are validated against the case on the server.
- No hidden solution data is serialized into active-case responses, board state, HTML, or browser storage.
- The board API accepts only discovered clue IDs and valid suspect IDs.
- The client cannot set the score, verdict, hint count, question count, achievement award, or completed status.
- AI output is parsed, schema-validated, length-limited, and sanitized before display or storage.
- User-entered questions and notes are treated as untrusted input; render them as text, not executable HTML.
- Apply request size limits, rate limits, and safe error messages.
- Public share links, if implemented, expose only explicitly approved fields and should be unguessable or revocable if they expose private user history.
- Test access attempts using another session's case ID and ensure no data is returned.

### 17.14 Advanced Feature Test Plan

#### Validator tests

- Wrong suspect/clue counts fail validation for the selected difficulty.
- Duplicate IDs and dangling references fail validation.
- Missing culprit or a culprit not in the suspect list fails validation.
- A repair attempt is bounded and validation is rerun after repair.
- A permanently invalid case is not persisted or served.
- The client never receives private validation fields.

#### Interrogation tests

- Unknown suspect IDs return a safe not-found response.
- Questions over the configured limit are rejected.
- Completed cases cannot be interrogated.
- Per-case question limits are enforced server-side.
- A model timeout preserves all existing case progress.
- Responses do not include private prompts or the full solution.

#### Evidence board tests

- Undiscovered clue IDs are rejected.
- Foreign-case suspect IDs are rejected.
- Invalid node types, oversized notes, and excessive edges are rejected.
- Board save/load round-trip preserves valid state.
- Keyboard/list fallback exposes all core board information.
- Board edits do not change score or accusation.

#### Adaptive difficulty tests

- Assistance actions are limited to an allowlist.
- The system never spends a hint automatically.
- The selected difficulty and score formula remain unchanged.
- Dismissing or disabling suggestions is respected.
- Failure of optional adaptation does not block gameplay.

#### Post-game analysis tests

- Active cases cannot retrieve solution analysis.
- Completed-case analysis matches the stored result.
- Invalid clue references in generated analysis are rejected.
- Analysis failure falls back to the canonical explanation.
- Repeated requests use cached validated analysis when configured.
- Analysis cannot change score, verdict, or case status.

#### History and replay tests

- A player sees only cases authorized for their session/account.
- Completed cases remain immutable for accusation/scoring.
- Achievement awards are idempotent.
- Daily-case generation is stable for the configured date and timezone.
- Shareable summaries do not reveal active-case solutions.

---

## 18. Execution Roadmap and Work Phases

Use this phased plan to execute the project without attempting to build every feature simultaneously. The phases are ordered by dependency and risk. The five original pages and required gameplay path are the first delivery priority; advanced features are staged after a stable end-to-end release.

### Phase 0 — Scope, Specification, and Repository Setup

**Goal:** establish an agreed contract before implementation.

**Tasks**
1. Review this `SPEC.md` and mark the core requirements as mandatory and advanced features as staged enhancements.
2. Confirm the deadline year/timezone and submission expectations with the organizer.
3. Create the Git repository and initial README.
4. Create frontend and backend folders according to Section 10.
5. Add `.gitignore`, `.env.example`, and basic project scripts.
6. Decide the case schema and API response contracts before wiring the UI.
7. Create a small task board with owners and status if working as a team.

**Deliverables**
- Reviewed `SPEC.md`
- GitHub repository
- Runnable frontend and backend skeletons
- Environment-variable checklist

**Exit criteria**
- Both apps start locally.
- Secrets are excluded from version control.
- The team agrees on core scope and data contracts.

### Phase 1 — Cyberpunk UI Skeleton and Static UX

**Goal:** implement the visual system and all five required pages using mock data before AI integration.

**Tasks**
1. Configure React, Vite, and Tailwind CSS.
2. Implement the color tokens, typography, buttons, panels, badges, form controls, and responsive layout.
3. Build Home, Create Mystery, Investigation Room, Accusation, and Results pages.
4. Add loading, empty, error, disabled, and success states.
5. Implement navigation and route-level not-found handling.
6. Check contrast, keyboard focus, reduced-motion behavior, and mobile layouts.

**Deliverables**
- Consistent cyberpunk UI system
- Five navigable pages with mock data
- Reusable component library

**Exit criteria**
- A complete mock gameplay path can be clicked through.
- No page is blocked by unfinished API integration.
- The interface remains readable and usable on mobile.

### Phase 2 — Backend Foundation and Database

**Goal:** establish reliable data persistence and a validated API layer.

**Tasks**
1. Configure Express, middleware, environment loading, and centralized error handling.
2. Connect MongoDB and define the Mongoose Case model.
3. Implement Zod schemas for request payloads and generated case structures.
4. Implement the original API routes with placeholder services where necessary.
5. Add case status transitions and player-safe serialization.
6. Add authorization/session checks appropriate to the chosen identity model.
7. Add health-check endpoint and safe logging.

**Deliverables**
- Backend server and database connection
- Core data model and validation layer
- API endpoints returning predictable response shapes

**Exit criteria**
- API integration tests pass against a test database.
- Invalid input is rejected consistently.
- Private solution fields are excluded from active-case responses.

### Phase 3 — Gemini Generation and Core Gameplay

**Goal:** deliver one complete playable mystery using the required AI provider and server-side rules.

**Tasks**
1. Integrate the Gemini SDK using a server-only API key.
2. Build the generation prompt for premise and difficulty.
3. Parse and validate structured output.
4. Implement the deterministic validation checks from Section 5.
5. Save valid cases and return player-safe data.
6. Implement clue discovery with duplicate-discovery protection.
7. Implement hint requests with difficulty-specific limits and score deductions.
8. Implement accusation, correct/incorrect verdict, result storage, and score calculation on the backend.
9. Connect the React UI to the API and remove mock data from the core flow.
10. Test the complete path from creating a mystery through seeing results.

**Deliverables**
- AI-generated cases
- Working investigation and scoring flow
- Core API integration

**Exit criteria**
- At least one case can be created, investigated, accused, and completed end-to-end.
- Difficulty counts and hint limits are enforced.
- Correct accusation score follows the formula in Section 4; incorrect-accusation behavior follows the explicit project decision documented there.
- Provider errors do not crash the server or leak secrets.

### Phase 4 — Core Hardening, Testing, and First Deployment

**Goal:** stabilize the minimum deliverable and deploy it before adding advanced features.

**Tasks**
1. Complete unit, integration, and end-to-end tests from Section 12.
2. Test missing environment variables, malformed AI output, database outage, and timeouts.
3. Test case access boundaries and inspect network responses for solution leakage.
4. Verify score and hint calculations are server-controlled.
5. Deploy MongoDB, backend, and frontend using the deployment requirements in Section 13.
6. Configure production environment variables and CORS correctly.
7. Test the production site from a fresh browser session and at least one mobile viewport.
8. Record known limitations and confirm the submission process.

**Deliverables**
- Stable live core application
- Test evidence and deployment configuration
- Updated README and setup instructions

**Exit criteria**
- The core acceptance criteria in Section 14 pass.
- A real case is playable on the deployed site.
- No critical secret exposure or solution leakage is found.

### Phase 5 — Advanced AI Quality: Consistency Validator and Post-Game Analysis

**Goal:** improve generated-case reliability and the educational value of the final result.

**Tasks**
1. Add the bounded semantic consistency review from Section 17.2 after deterministic checks.
2. Add one controlled repair/regeneration attempt and safe failure handling.
3. Add validator-specific unit and integration tests.
4. Implement post-game analysis from the canonical stored case and trusted result.
5. Validate analysis output and use the canonical explanation as fallback.
6. Cache successful analysis and ensure it cannot change score or verdict.
7. Add a debrief section to the Results page using the existing theme.

**Deliverables**
- Stronger pre-play case validation
- Evidence-linked post-game debrief

**Exit criteria**
- Invalid cases are rejected before play.
- Analysis is only available after completion.
- Optional analysis failure never breaks the core results page.

### Phase 6 — Interrogation and Evidence Board

**Goal:** make the investigation feel interactive and give players a workspace for reasoning.

**Tasks**
1. Add suspect interrogation API and bounded question budgets.
2. Create prompt construction that maintains canonical suspect facts and avoids solution leakage.
3. Build the suspect transcript and question-category UI.
4. Add evidence board components and a keyboard-accessible list fallback.
5. Persist and validate board nodes, edges, and notes if persistence is in scope.
6. Ensure only discovered clues are available to the board.
7. Add API tests for case ownership, suspect membership, clue discovery, limits, and completed-case restrictions.
8. Add loading, retry, empty, and rate-limit states.

**Deliverables**
- Working suspect interrogation
- Evidence board or documented MVP list-based board

**Exit criteria**
- Interrogation answers remain consistent with canonical facts.
- Board state cannot reveal hidden clues or alter scoring.
- All advanced interaction endpoints enforce authorization and limits.

### Phase 7 — Adaptive Difficulty and Player Progress

**Goal:** improve guidance and replay value after the core investigation tools are stable.

**Tasks**
1. Implement rule-based adaptive suggestions using only in-game progress signals.
2. Add dismiss/disable controls and ensure suggestions never consume hints.
3. Add case history and basic statistics if identity/session handling is ready.
4. Add achievements only after server-side event records are reliable.
5. Add daily or timed mode only after reset timezone, timestamps, and scoring rules are documented.
6. Test replay behavior and ensure completed cases remain immutable.

**Deliverables**
- Optional adaptive guidance
- Basic case archive/statistics, followed by optional achievements or modes

**Exit criteria**
- Adaptation never changes official difficulty, canonical clues, or solution.
- Stats and achievements derive from trusted server data.
- Replay and daily-case behavior is deterministic and documented.

### Phase 8 — UX Polish, Performance, and Accessibility

**Goal:** make the live application feel finished and reliable.

**Tasks**
1. Review responsive behavior across the five core pages and all implemented advanced panels.
2. Optimize image/assets and avoid unnecessary client bundle growth.
3. Add clear progress states for generation, validation, and AI interactions.
4. Verify keyboard-only navigation and screen-reader labels for new controls.
5. Respect reduced-motion preferences and remove distracting effects.
6. Review loading performance and network failures on slower connections.
7. Review error copy for clarity and ensure the player can recover without losing progress.

**Deliverables**
- Polished and accessible experience
- Final UI and performance fixes

**Exit criteria**
- No blocking UI or accessibility issues remain in the tested flows.
- Optional features degrade gracefully when services fail.

### Phase 9 — Final QA, Documentation, and Submission

**Goal:** finish a reproducible, demonstrable submission.

**Tasks**
1. Run the full test suite from a clean environment.
2. Test all core and implemented advanced flows on the deployed site.
3. Review security checklist and inspect frontend bundles/network responses for secrets or hidden solutions.
4. Update README with project overview, screenshots, architecture, local setup, environment variables, scripts, API summary, and deployment URLs.
5. Ensure `.env` and private keys are not committed; rotate any key accidentally exposed during development.
6. Add a short demo script and sample case for presentation purposes, without hard-coding the answer into the client.
7. Verify the GitHub repository and live URL are accessible to reviewers.
8. Complete the submission form before the confirmed deadline.

**Deliverables**
- Final GitHub repository
- Live deployed application
- Updated documentation and demo path
- Completed submission

**Exit criteria**
- All applicable acceptance criteria pass.
- A reviewer can open the live site and complete a case.
- Setup and limitations are documented honestly.

### 18.1 Recommended Milestone Order

If time is limited, prioritize in this order:

1. **Must ship:** five core pages, Gemini generation, database persistence, clues, hints, accusation, results, scoring, solution secrecy, deployment.
2. **Best quality improvements:** consistency validator, post-game analysis, tests, error handling.
3. **Best interaction improvements:** suspect interrogation, evidence board.
4. **Replay improvements:** adaptive guidance, history/statistics, achievements, daily/timed modes.
5. **Final polish:** accessibility, performance, documentation, demo, submission.

Do not start Phase 6 or Phase 7 while the core game cannot reliably complete an end-to-end run. If a deadline is close, ship a tested core product with one or two fully implemented advanced features rather than many unfinished feature stubs.

### 18.2 Team Execution and Definition of Done

For a team, assign ownership by workstream rather than letting multiple people edit the same feature without an agreed contract. A practical split is:

- **Frontend/UI owner:** design system, five pages, API integration, interrogation/evidence board UI, accessibility.
- **Backend/API owner:** Express routes, authorization, validation, case lifecycle, score/hint rules.
- **AI/data owner:** Gemini generation, structured output, consistency validation, interrogation prompts, post-game analysis.
- **QA/deployment owner:** test plan, integration tests, environment configuration, deployment, README, final verification.

These are suggested roles and may be combined for a smaller team. All members should review the API and case schema. A feature is done only when its UI, backend logic, validation, failure states, tests, and documentation are complete—not merely when its happy-path screen exists.

### 18.3 Phase Tracking Template

Use this table in a task board or project tracker; update status during execution.

| Phase | Status | Owner | Planned start | Planned finish | Exit criteria verified | Notes / blockers |
|---|---|---|---|---|---|---|
| Phase 0 — Scope and setup | Not started | TBD | TBD | TBD | No | |
| Phase 1 — UI skeleton | Not started | TBD | TBD | TBD | No | |
| Phase 2 — Backend foundation | Not started | TBD | TBD | TBD | No | |
| Phase 3 — Core gameplay | Not started | TBD | TBD | TBD | No | |
| Phase 4 — Hardening and deployment | Not started | TBD | TBD | TBD | No | |
| Phase 5 — Validator and analysis | Not started | TBD | TBD | TBD | No | |
| Phase 6 — Interrogation and board | Not started | TBD | TBD | TBD | No | |
| Phase 7 — Adaptive guidance and progress | Not started | TBD | TBD | TBD | No | |
| Phase 8 — UX polish | Not started | TBD | TBD | TBD | No | |
| Phase 9 — QA and submission | Not started | TBD | TBD | TBD | No | |

---

## 19. Updated Scope Boundary and Final Notes

- Sections 1–16 preserve the original core specification and implementation recommendations.
- Section 17 adds the advanced features and their API, data, security, UI, and testing considerations.
- Section 18 adds an execution roadmap with phased tasks, deliverables, and exit criteria.
- The advanced features are not prerequisites for proving the required core gameplay flow. Implement only the features that can be completed and tested before submission.
- Where this document proposes an optional feature or implementation detail not specified by the original build guide, treat it as a recommendation and make the decision explicit in the project README.
- Keep one canonical scoring formula, one canonical case schema version, and one server-side source of truth for the culprit and final verdict.
