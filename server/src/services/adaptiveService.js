import { DIFFICULTY_RULES } from '../constants/gameRules.js';

/**
 * AI Mystery Room — Adaptive Difficulty Engine (SPEC.md Section 17.5)
 * Evaluates observable in-game progress signals to provide rule-based assistance.
 * Never spends hints automatically, modifies canonical solution, or changes score formula.
 */
export function evaluateAdaptiveAssistance(caseDoc, { challengeMode = false } = {}) {
  if (challengeMode) {
    return {
      mode: 'challenge',
      recommendation: null,
      message: 'Challenge mode active. Tactical copilot suggestions are disabled.',
    };
  }

  const difficulty = caseDoc.difficulty || 'medium';
  const rules = DIFFICULTY_RULES[difficulty] || { clueCount: 5, maxHints: 3 };
  const totalClues = (caseDoc.clues || []).length || rules.clueCount;
  const discoveredClues = (caseDoc.discoveredClueIds || []).length;
  const hintsUsed = caseDoc.hintsUsed || 0;
  const maxHints = rules.maxHints;
  const interrogationsUsed = (caseDoc.interrogations || []).length;
  const boardEdgesCount = (caseDoc.boardState?.edges || []).length;

  // Signal Rule 1: No forensic clues decrypted yet
  if (discoveredClues === 0) {
    return {
      mode: 'standard',
      recommendation: {
        type: 'suggest_action',
        message: 'Decrypt the first forensic evidence files in the Case Files terminal to establish initial crime scene facts.',
      },
    };
  }

  // Signal Rule 2: Tactical hints exhausted
  if (hintsUsed >= maxHints) {
    return {
      mode: 'standard',
      recommendation: {
        type: 'encourage_review',
        message: 'Tactical hint budget has been exhausted. Focus on cross-referencing discovered clues on the Evidence Board.',
      },
    };
  }

  // Signal Rule 3: Clues discovered but zero suspect interrogations
  if (discoveredClues >= 2 && interrogationsUsed === 0) {
    return {
      mode: 'standard',
      recommendation: {
        type: 'suggest_action',
        message: 'Forensic evidence is accumulating. Interrogate suspects to cross-examine their stated alibis against physical telemetry.',
      },
    };
  }

  // Signal Rule 4: Clues discovered but zero theories mapped on the board
  if (discoveredClues >= 3 && boardEdgesCount === 0) {
    return {
      mode: 'standard',
      recommendation: {
        type: 'suggest_action',
        message: 'You have decrypted multiple clues. Map your working theories on the Neural Evidence Board to isolate contradictions.',
      },
    };
  }

  // Signal Rule 5: Zero hints used and less than halfway through clues
  if (hintsUsed === 0 && discoveredClues < Math.ceil(totalClues / 2)) {
    return {
      mode: 'standard',
      recommendation: {
        type: 'offer_hint',
        message: 'Tactical hint guidance is available in the terminal if you need assistance filtering potential suspects.',
      },
    };
  }

  // Signal Rule 6: Default steady progress directive
  return {
    mode: 'standard',
    recommendation: {
      type: 'encourage_review',
      message: 'Review suspect timelines against physical evidence before issuing the final accusation warrant.',
    },
  };
}
