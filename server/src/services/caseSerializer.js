import { DIFFICULTY_RULES, INTERROGATION_LIMITS } from '../constants/gameRules.js';

/**
 * AI Mystery Room — Player-Safe Serializer (Zero-Leakage Enforcement)
 * Explicitly sanitizes case objects to guarantee that culpritId, solution,
 * and internal evidence mappings are NEVER transmitted to client in active states.
 */

export function toPlayerSafeCase(caseDoc) {
  if (!caseDoc) return null;

  const raw = typeof caseDoc.toObject === 'function' ? caseDoc.toObject() : caseDoc;
  const discoveredSet = new Set(raw.discoveredClueIds || []);
  const maxHints = DIFFICULTY_RULES[raw.difficulty]?.maxHints || 3;
  const maxInterrogations = INTERROGATION_LIMITS[raw.difficulty] || 8;
  const rawInterrogations = raw.interrogations || [];

  const safeCase = {
    id: raw._id ? raw._id.toString() : raw.id,
    title: raw.title,
    difficulty: raw.difficulty,
    premise: raw.premise,
    story: raw.story,
    suspects: (raw.suspects || []).map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      background: s.background,
      motive: s.motive,
      alibi: s.alibi,
    })),
    clues: (raw.clues || []).map((c) => {
      const isDiscovered = discoveredSet.has(c.id);
      return {
        id: c.id,
        title: c.title,
        description: isDiscovered ? c.description : null,
        discovered: isDiscovered,
      };
    }),
    hints: (raw.hints || []).slice(0, raw.hintsUsed || 0).map((h) => ({
      id: h.id,
      text: h.text,
    })),
    interrogations: rawInterrogations.map((entry) => ({
      interactionId: entry.interactionId,
      suspectId: entry.suspectId,
      category: entry.category || 'general',
      question: entry.question,
      answer: entry.answer,
      createdAt: entry.createdAt,
    })),
    progress: {
      discoveredClueCount: discoveredSet.size,
      totalClues: (raw.clues || []).length,
      hintsUsed: raw.hintsUsed || 0,
      maxHints: maxHints,
      interrogationsUsed: rawInterrogations.length,
      maxInterrogations: maxInterrogations,
      remainingInterrogations: Math.max(0, maxInterrogations - rawInterrogations.length),
      status: raw.status || 'active',
    },
    boardState: toPlayerSafeBoard(raw),
  };

  // Explicit safety assertions: ensure zero leakage
  delete safeCase.culpritId;
  delete safeCase.solution;
  delete safeCase.evidenceMapping;

  return safeCase;
}

export function toPlayerSafeBoard(caseDoc) {
  if (!caseDoc) return { nodes: [], edges: [] };
  const raw = typeof caseDoc.toObject === 'function' ? caseDoc.toObject() : caseDoc;
  const discoveredSet = new Set(raw.discoveredClueIds || []);
  const rawBoard = raw.boardState || { nodes: [], edges: [] };

  const safeNodes = (rawBoard.nodes || []).filter((node) => {
    if (node.type === 'clue') {
      return discoveredSet.has(node.id);
    }
    return true;
  });
  const safeNodeIdSet = new Set(safeNodes.map((n) => n.id));
  const safeEdges = (rawBoard.edges || []).filter(
    (edge) => safeNodeIdSet.has(edge.source) && safeNodeIdSet.has(edge.target)
  );

  return {
    nodes: safeNodes,
    edges: safeEdges,
  };
}

export function toCaseResult(caseDoc) {
  if (!caseDoc) return null;

  const raw = typeof caseDoc.toObject === 'function' ? caseDoc.toObject() : caseDoc;
  const culprit = (raw.suspects || []).find((s) => s.id === raw.culpritId);

  return {
    caseId: raw._id ? raw._id.toString() : raw.id,
    difficulty: raw.difficulty,
    verdict: raw.isCorrect ? 'correct' : 'incorrect',
    culpritId: raw.culpritId,
    culpritName: culprit ? culprit.name : 'Unknown Culprit',
    solution: raw.solution,
    accusedSuspectId: raw.accusationSuspectId,
    score: raw.score || 0,
    scoreBreakdown: raw.scoreBreakdown || null,
  };
}
