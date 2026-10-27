import { DIFFICULTY_RULES, SCORING_POINTS } from '../constants/gameRules.js';

/**
 * AI Mystery Room — Authoritative Backend Scoring Engine
 * Computes scores strictly based on server-verified facts and SPEC.md Section 4.
 */
export function calculateScore({ difficulty, isCorrect, cluesCount = 0, hintsCount = 0 }) {
  const rules = DIFFICULTY_RULES[difficulty];
  if (!rules) {
    throw new Error(`Invalid difficulty level: "${difficulty}"`);
  }

  const basePoints = isCorrect ? rules.basePoints : 0;
  const cluesBonus = isCorrect ? cluesCount * SCORING_POINTS.CLUE_DISCOVERY : 0;
  const hintsPenalty = isCorrect ? hintsCount * SCORING_POINTS.HINT_PENALTY : 0;

  let finalScore = 0;
  if (isCorrect) {
    finalScore = Math.max(
      SCORING_POINTS.MINIMUM_SCORE,
      basePoints + cluesBonus - hintsPenalty
    );
  }

  return {
    difficulty,
    isCorrect,
    basePoints,
    cluesBonus,
    cluesCount,
    hintsPenalty,
    hintsCount,
    finalScore,
  };
}
