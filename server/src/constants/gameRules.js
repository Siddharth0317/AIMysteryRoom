/**
 * AI Mystery Room — Game Constants & Rule Engine Specifications
 * Authoritative constants as defined in SPEC.md Section 4 & 7
 */

export const DIFFICULTY_RULES = {
  easy: {
    suspectCount: 3,
    clueCount: 5,
    maxHints: 2,
    basePoints: 100,
  },
  medium: {
    suspectCount: 4,
    clueCount: 7,
    maxHints: 3,
    basePoints: 150,
  },
  hard: {
    suspectCount: 5,
    clueCount: 9,
    maxHints: 3,
    basePoints: 200,
  },
};

export const SCORING_POINTS = {
  CLUE_DISCOVERY: 5,
  HINT_PENALTY: 10,
  MINIMUM_SCORE: 0,
};

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CASE_NOT_FOUND: 'CASE_NOT_FOUND',
  CLUE_NOT_FOUND: 'CLUE_NOT_FOUND',
  SUSPECT_NOT_FOUND: 'SUSPECT_NOT_FOUND',
  CASE_COMPLETED: 'CASE_COMPLETED',
  CASE_NOT_COMPLETED: 'CASE_NOT_COMPLETED',
  HINT_LIMIT_REACHED: 'HINT_LIMIT_REACHED',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
