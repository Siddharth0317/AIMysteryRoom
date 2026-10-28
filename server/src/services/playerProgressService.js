import crypto from 'node:crypto';
import { getAllCasesList, getCaseById, createCase } from './caseService.js';
import { toPlayerSafeCaseSummary, toPlayerSafeCase } from './caseSerializer.js';
import { ACHIEVEMENTS } from '../constants/achievements.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/gameRules.js';

/**
 * AI Mystery Room — Player Progress & Statistics Service (SPEC.md Section 17.7 & 17.8)
 */

/**
 * Lists cases for player archive / history
 */
export async function listPlayerCases({ limit = 20, status = 'all' } = {}) {
  const allCases = await getAllCasesList();

  let filtered = allCases;
  if (status && status !== 'all') {
    filtered = allCases.filter((c) => c.status === status);
  }

  const sliced = filtered.slice(0, Number(limit) || 20);
  return {
    cases: sliced.map(toPlayerSafeCaseSummary),
    totalCount: filtered.length,
  };
}

/**
 * Computes authoritative player statistics from server records
 */
export async function getPlayerStats() {
  const allCases = await getAllCasesList();

  const totalCasesAttempted = allCases.length;
  const completedCases = allCases.filter((c) => c.status === 'completed');
  const totalCasesCompleted = completedCases.length;
  const solvedCases = completedCases.filter((c) => c.isCorrect === true);
  const totalCasesSolved = solvedCases.length;

  const winRatePercentage = totalCasesCompleted > 0
    ? Math.round((totalCasesSolved / totalCasesCompleted) * 100)
    : 0;

  let totalCluesDiscovered = 0;
  let totalHintsUsed = 0;
  let totalInterrogations = 0;
  let totalScore = 0;
  let highScore = 0;

  const difficultyBreakdown = {
    easy: { attempted: 0, solved: 0, completed: 0 },
    medium: { attempted: 0, solved: 0, completed: 0 },
    hard: { attempted: 0, solved: 0, completed: 0 },
  };

  for (const c of allCases) {
    const diff = c.difficulty || 'medium';
    if (difficultyBreakdown[diff]) {
      difficultyBreakdown[diff].attempted += 1;
      if (c.status === 'completed') {
        difficultyBreakdown[diff].completed += 1;
        if (c.isCorrect) {
          difficultyBreakdown[diff].solved += 1;
        }
      }
    }

    totalCluesDiscovered += (c.discoveredClueIds || []).length;
    totalHintsUsed += c.hintsUsed || 0;
    totalInterrogations += (c.interrogations || []).length;

    if (c.status === 'completed') {
      const caseScore = c.score || 0;
      totalScore += caseScore;
      if (caseScore > highScore) {
        highScore = caseScore;
      }
    }
  }

  const averageScore = totalCasesCompleted > 0
    ? Math.round(totalScore / totalCasesCompleted)
    : 0;

  return {
    totalCasesAttempted,
    totalCasesCompleted,
    totalCasesSolved,
    winRatePercentage,
    totalCluesDiscovered,
    totalHintsUsed,
    totalInterrogations,
    averageScore,
    highScore,
    difficultyBreakdown,
  };
}

/**
 * Evaluates detective achievements from stored cases
 */
export async function getPlayerAchievements() {
  const allCases = await getAllCasesList();
  const completedCases = allCases.filter((c) => c.status === 'completed');
  const solvedCases = completedCases.filter((c) => c.isCorrect === true);

  // Evaluation conditions
  const unlockedMap = new Map();

  // 1. FIRST_SOLVE: Solved at least 1 case
  if (solvedCases.length >= 1) {
    unlockedMap.set('FIRST_SOLVE', solvedCases[0].createdAt || new Date().toISOString());
  }

  // 2. PERFECT_INVESTIGATION: Solved with 0 hints used
  const zeroHintSolve = solvedCases.find((c) => (c.hintsUsed || 0) === 0);
  if (zeroHintSolve) {
    unlockedMap.set('PERFECT_INVESTIGATION', zeroHintSolve.createdAt || new Date().toISOString());
  }

  // 3. MASTER_SLEUTH: Solved Hard difficulty case
  const hardSolve = solvedCases.find((c) => c.difficulty === 'hard');
  if (hardSolve) {
    unlockedMap.set('MASTER_SLEUTH', hardSolve.createdAt || new Date().toISOString());
  }

  // 4. FORENSIC_SPECIALIST: Decrypted 100% of clues in a single case
  const allCluesCase = allCases.find((c) => {
    const total = (c.clues || []).length;
    const discovered = (c.discoveredClueIds || []).length;
    return total > 0 && discovered === total;
  });
  if (allCluesCase) {
    unlockedMap.set('FORENSIC_SPECIALIST', allCluesCase.createdAt || new Date().toISOString());
  }

  // 5. CROSS_EXAMINER: 3+ interrogations in one case
  const interrogationCase = allCases.find((c) => (c.interrogations || []).length >= 3);
  if (interrogationCase) {
    unlockedMap.set('CROSS_EXAMINER', interrogationCase.createdAt || new Date().toISOString());
  }

  // 6. THEORY_CRAFTER: 3+ hypothesis edges on Evidence Board
  const boardCase = allCases.find((c) => (c.boardState?.edges || []).length >= 3);
  if (boardCase) {
    unlockedMap.set('THEORY_CRAFTER', boardCase.createdAt || new Date().toISOString());
  }

  // 7. VETERAN_INVESTIGATOR: Attempted 5+ cases
  if (allCases.length >= 5) {
    unlockedMap.set('VETERAN_INVESTIGATOR', allCases[4].createdAt || new Date().toISOString());
  }

  const results = ACHIEVEMENTS.map((ach) => {
    const isUnlocked = unlockedMap.has(ach.id);
    return {
      ...ach,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? unlockedMap.get(ach.id) : null,
    };
  });

  const unlockedCount = results.filter((r) => r.unlocked).length;

  return {
    achievements: results,
    unlockedCount,
    totalCount: ACHIEVEMENTS.length,
    completionPercentage: Math.round((unlockedCount / ACHIEVEMENTS.length) * 100),
  };
}

/**
 * Replay mode: Clones an existing case into a fresh active case without mutating the original
 */
export async function replayCase(caseId) {
  const original = await getCaseById(caseId);

  const replayedCase = await createCase({
    premise: `[REPLAY] ${original.premise || original.title}`,
    difficulty: original.difficulty,
  });

  return {
    replayedCaseId: replayedCase.id || (replayedCase._id ? replayedCase._id.toString() : null),
    case: toPlayerSafeCase(replayedCase),
  };
}

/**
 * Daily Mystery Generator (SPEC.md Section 17.8)
 * Returns or generates a deterministic daily mystery seed for the current UTC date.
 */
export async function getOrCreateDailyCase() {
  const todayUtc = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const allCases = await getAllCasesList();

  const existingDaily = allCases.find(
    (c) => c.premise && c.premise.includes(`[DAILY PROTOCOL ${todayUtc}]`)
  );

  if (existingDaily) {
    return {
      dailyDate: todayUtc,
      isExisting: true,
      case: toPlayerSafeCase(existingDaily),
    };
  }

  // Generate standardized daily mystery premise
  const dailyPremise = `[DAILY PROTOCOL ${todayUtc}] Biometric override detected at Global Cyber-Vault Sector 7 during scheduled midnight sync.`;

  const newDailyCase = await createCase({
    premise: dailyPremise,
    difficulty: 'medium',
  });

  return {
    dailyDate: todayUtc,
    isExisting: false,
    case: toPlayerSafeCase(newDailyCase),
  };
}
