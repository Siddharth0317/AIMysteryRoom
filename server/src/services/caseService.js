import crypto from 'node:crypto';
import { Case } from '../models/Case.js';
import { isDbConnected } from '../config/db.js';
import { DIFFICULTY_RULES, INTERROGATION_LIMITS, ERROR_CODES } from '../constants/gameRules.js';
import { calculateScore } from './scoringService.js';
import { toPlayerSafeCase, toCaseResult, toPlayerSafeBoard } from './caseSerializer.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateMysteryCase, generateInterrogationResponse } from './geminiService.js';

// In-memory fallback repository for test suites or offline development
const memoryCases = new Map();

/**
 * Generates deterministic structured case template for Phase 2 before Gemini integration
 */
function createPhase2Template(premise, difficulty) {
  const rules = DIFFICULTY_RULES[difficulty];
  const caseId = `case_${crypto.randomBytes(6).toString('hex')}`;

  const suspects = Array.from({ length: rules.suspectCount }, (_, i) => ({
    id: `suspect_${i + 1}`,
    name: `Suspect Person of Interest ${i + 1}`,
    role: i === 0 ? 'Lead Quantum Cryptographer' : i === 1 ? 'Chief Security Officer' : i === 2 ? 'Senior Systems Architect' : `Operative ${i + 1}`,
    background: `Subject with clearance access to sector operations during the incident window.`,
    motive: `Personal or financial incentives linked to telemetry records.`,
    alibi: `Claims presence in sector terminal pod ${i + 1} during the critical timeframe.`,
  }));

  const clues = Array.from({ length: rules.clueCount }, (_, i) => ({
    id: `clue_${i + 1}`,
    title: `Forensic Evidence Segment #${i + 1}`,
    description: `Decrypted telemetry records confirming event anomaly #${i + 1} at the crime scene.`,
  }));

  const hints = Array.from({ length: rules.maxHints }, (_, i) => ({
    id: `hint_${i + 1}`,
    text: `Tactical AI Guidance #${i + 1}: Cross-examine alibis against the physical evidence discovered.`,
  }));

  return {
    id: caseId,
    title: premise.length > 40 ? `${premise.slice(0, 40)}...` : premise,
    premise,
    story: `At 02:40 hours, security subroutines logged an unverified breach regarding the following situation: ${premise}`,
    difficulty,
    suspects,
    clues,
    hints,
    culpritId: 'suspect_1',
    solution: `Suspect 1 exploited their administrative clearance to compromise the facility and bypass biometric scanners.`,
    evidenceMapping: clues.map(c => ({ clueId: c.id, supports: `Supports culpability of suspect_1` })),
    discoveredClueIds: [],
    hintsUsed: 0,
    interrogations: [],
    boardState: { nodes: [], edges: [] },
    status: 'active',
    score: 0,
    isCorrect: null,
    accusationSuspectId: null,
    scoreBreakdown: null,
  };
}

export async function createCase({ premise, difficulty, aiClient = null }) {
  const apiKey = process.env.GEMINI_API_KEY;
  let caseData;

  // Use Gemini API if client provided or valid GEMINI_API_KEY exists
  if (aiClient || (apiKey && apiKey !== 'your_gemini_api_key_here')) {
    try {
      const generated = await generateMysteryCase(premise, difficulty, { client: aiClient });
      const caseId = `case_${crypto.randomBytes(6).toString('hex')}`;
      caseData = {
        ...generated,
        id: caseId,
        discoveredClueIds: [],
        hintsUsed: 0,
        interrogations: [],
        boardState: { nodes: [], edges: [] },
        status: 'active',
        score: 0,
        isCorrect: null,
        accusationSuspectId: null,
        scoreBreakdown: null,
      };
    } catch (err) {
      // Re-throw AppErrors from Gemini validation
      if (err instanceof AppError) throw err;
      throw new AppError(`AI Mystery generation failed: ${err.message}`, 502, ERROR_CODES.AI_GENERATION_FAILED);
    }
  } else {
    // Deterministic fallback for test/offline environments without API keys
    caseData = createPhase2Template(premise, difficulty);
  }

  if (isDbConnected()) {
    const newCase = await Case.create(caseData);
    return newCase;
  }

  // Memory fallback
  memoryCases.set(caseData.id, caseData);
  return caseData;
}

export async function getCaseById(id) {
  if (isDbConnected()) {
    const found = await Case.findById(id);
    if (!found) {
      throw new AppError(`Case with ID "${id}" was not found`, 404, ERROR_CODES.CASE_NOT_FOUND);
    }
    return found;
  }

  const found = memoryCases.get(id);
  if (!found) {
    throw new AppError(`Case with ID "${id}" was not found`, 404, ERROR_CODES.CASE_NOT_FOUND);
  }
  return found;
}

export async function discoverClue(caseId, clueId) {
  const caseDoc = await getCaseById(caseId);

  if (caseDoc.status === 'completed') {
    throw new AppError('Cannot discover clues on a completed case.', 409, ERROR_CODES.CASE_COMPLETED);
  }

  const clue = (caseDoc.clues || []).find((c) => c.id === clueId);
  if (!clue) {
    throw new AppError(`Clue "${clueId}" not found in case "${caseId}"`, 404, ERROR_CODES.CLUE_NOT_FOUND);
  }

  // Idempotency: check if already discovered
  const alreadyDiscovered = (caseDoc.discoveredClueIds || []).includes(clueId);

  if (!alreadyDiscovered) {
    if (isDbConnected()) {
      await Case.findByIdAndUpdate(caseId, {
        $addToSet: { discoveredClueIds: clueId },
      });
      caseDoc.discoveredClueIds.push(clueId);
    } else {
      if (!caseDoc.discoveredClueIds) caseDoc.discoveredClueIds = [];
      caseDoc.discoveredClueIds.push(clueId);
      memoryCases.set(caseId, caseDoc);
    }
  }

  const safeCase = toPlayerSafeCase(caseDoc);

  return {
    clue: {
      id: clue.id,
      title: clue.title,
      description: clue.description,
      discovered: true,
    },
    progress: safeCase.progress,
  };
}

export async function requestHint(caseId) {
  const caseDoc = await getCaseById(caseId);

  if (caseDoc.status === 'completed') {
    throw new AppError('Cannot request hints on a completed case.', 409, ERROR_CODES.CASE_COMPLETED);
  }

  const maxHints = DIFFICULTY_RULES[caseDoc.difficulty].maxHints;
  const currentHintsUsed = caseDoc.hintsUsed || 0;

  if (currentHintsUsed >= maxHints) {
    throw new AppError(
      `Hint limit of ${maxHints} reached for ${caseDoc.difficulty} difficulty.`,
      409,
      ERROR_CODES.HINT_LIMIT_REACHED
    );
  }

  const nextHint = (caseDoc.hints || [])[currentHintsUsed];
  if (!nextHint) {
    throw new AppError('No further hints available for this case.', 409, ERROR_CODES.HINT_LIMIT_REACHED);
  }

  const newHintsUsed = currentHintsUsed + 1;

  if (isDbConnected()) {
    await Case.findByIdAndUpdate(caseId, {
      $inc: { hintsUsed: 1 },
    });
    caseDoc.hintsUsed = newHintsUsed;
  } else {
    caseDoc.hintsUsed = newHintsUsed;
    memoryCases.set(caseId, caseDoc);
  }

  const safeCase = toPlayerSafeCase(caseDoc);

  return {
    hint: {
      id: nextHint.id,
      text: nextHint.text,
    },
    progress: safeCase.progress,
  };
}

export async function interrogateSuspect(caseId, suspectId, { question, category = 'general' }, options = {}) {
  const caseDoc = await getCaseById(caseId);

  if (caseDoc.status === 'completed') {
    throw new AppError('Cannot interrogate suspects on a completed case.', 409, ERROR_CODES.CASE_COMPLETED);
  }

  const suspect = (caseDoc.suspects || []).find((s) => s.id === suspectId);
  if (!suspect) {
    throw new AppError(
      `Suspect "${suspectId}" does not belong to this case.`,
      404,
      ERROR_CODES.SUSPECT_NOT_FOUND
    );
  }

  const maxInterrogations = INTERROGATION_LIMITS[caseDoc.difficulty] || 8;
  const currentInterrogations = caseDoc.interrogations || [];
  if (currentInterrogations.length >= maxInterrogations) {
    throw new AppError(
      `Interrogation budget of ${maxInterrogations} questions reached for this case.`,
      409,
      ERROR_CODES.INTERROGATION_LIMIT_REACHED
    );
  }

  let answer;
  try {
    answer = await generateInterrogationResponse(caseDoc, suspectId, question, category, options);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Interrogation terminal communication failed: ${err.message}`,
      502,
      ERROR_CODES.AI_INTERROGATION_FAILED
    );
  }

  const interactionId = `interact_${crypto.randomBytes(6).toString('hex')}`;
  const interaction = {
    interactionId,
    suspectId,
    category: category || 'general',
    question: question.trim(),
    answer,
    createdAt: new Date(),
  };

  if (isDbConnected()) {
    await Case.findByIdAndUpdate(caseId, {
      $push: { interrogations: interaction },
    });
  }

  if (!caseDoc.interrogations) caseDoc.interrogations = [];
  caseDoc.interrogations.push(interaction);
  if (!isDbConnected()) {
    memoryCases.set(caseId, caseDoc);
  }

  const remainingQuestions = Math.max(0, maxInterrogations - caseDoc.interrogations.length);

  return {
    interactionId,
    suspectId,
    answer,
    remainingQuestions,
  };
}

export async function submitAccusation(caseId, suspectId) {
  const caseDoc = await getCaseById(caseId);

  if (caseDoc.status === 'completed') {
    throw new AppError(
      'Case is already completed. Multiple accusations are rejected to protect score integrity.',
      409,
      ERROR_CODES.CASE_COMPLETED
    );
  }

  const suspectExists = (caseDoc.suspects || []).some((s) => s.id === suspectId);
  if (!suspectExists) {
    throw new AppError(
      `Accused suspect "${suspectId}" does not belong to this case.`,
      404,
      ERROR_CODES.SUSPECT_NOT_FOUND
    );
  }

  const isCorrect = caseDoc.culpritId === suspectId;
  const cluesCount = (caseDoc.discoveredClueIds || []).length;
  const hintsCount = caseDoc.hintsUsed || 0;

  const scoreBreakdown = calculateScore({
    difficulty: caseDoc.difficulty,
    isCorrect,
    cluesCount,
    hintsCount,
  });

  const updates = {
    status: 'completed',
    accusationSuspectId: suspectId,
    isCorrect,
    score: scoreBreakdown.finalScore,
    scoreBreakdown,
  };

  if (isDbConnected()) {
    const updated = await Case.findByIdAndUpdate(caseId, updates, { new: true });
    return toCaseResult(updated);
  }

  Object.assign(caseDoc, updates);
  memoryCases.set(caseId, caseDoc);
  return toCaseResult(caseDoc);
}

export async function getCaseResult(caseId) {
  const caseDoc = await getCaseById(caseId);

  if (caseDoc.status !== 'completed') {
    throw new AppError(
      'Case is active. The solution debrief cannot be accessed prior to submitting an accusation.',
      409,
      ERROR_CODES.CASE_NOT_COMPLETED
    );
  }

  return toCaseResult(caseDoc);
}

/**
 * Retrieves player-safe evidence board state (SPEC.md Section 17.4)
 */
export async function getCaseBoard(caseId) {
  const caseDoc = await getCaseById(caseId);
  return {
    board: toPlayerSafeBoard(caseDoc),
  };
}

/**
 * Saves player evidence board state with strict validation:
 * - Only discovered clues can be placed on the board
 * - Suspects must belong to this case
 * - Connections do not modify case score or solution
 */
export async function saveCaseBoard(caseId, { nodes = [], edges = [] }) {
  const caseDoc = await getCaseById(caseId);

  const discoveredClueSet = new Set(caseDoc.discoveredClueIds || []);
  const validSuspectSet = new Set((caseDoc.suspects || []).map((s) => s.id));

  // Validate nodes
  for (const node of nodes) {
    if (node.type === 'clue') {
      if (!discoveredClueSet.has(node.id)) {
        throw new AppError(
          `Undiscovered clue "${node.id}" cannot be placed on evidence board.`,
          400,
          ERROR_CODES.VALIDATION_ERROR
        );
      }
    } else if (node.type === 'suspect') {
      if (!validSuspectSet.has(node.id)) {
        throw new AppError(
          `Foreign suspect "${node.id}" does not belong to this case.`,
          400,
          ERROR_CODES.VALIDATION_ERROR
        );
      }
    }
  }

  // Validate edges
  const validTargetSourceSet = new Set([
    ...nodes.map((n) => n.id),
    ...discoveredClueSet,
    ...validSuspectSet,
  ]);

  for (const edge of edges) {
    if (!validTargetSourceSet.has(edge.source)) {
      throw new AppError(
        `Edge source "${edge.source}" does not reference a valid node on the board.`,
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
    if (!validTargetSourceSet.has(edge.target)) {
      throw new AppError(
        `Edge target "${edge.target}" does not reference a valid node on the board.`,
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  const updatedBoardState = {
    nodes,
    edges,
  };

  if (isDbConnected()) {
    const updated = await Case.findByIdAndUpdate(
      caseId,
      { boardState: updatedBoardState },
      { new: true }
    );
    return {
      board: toPlayerSafeBoard(updated),
    };
  }

  caseDoc.boardState = updatedBoardState;
  memoryCases.set(caseId, caseDoc);

  return {
    board: toPlayerSafeBoard(caseDoc),
  };
}

// Memory cleaner for isolated test runs
export function clearMemoryCases() {
  memoryCases.clear();
}
