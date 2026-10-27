import test from 'node:test';
import assert from 'node:assert';
import { toPlayerSafeCase, toCaseResult } from '../src/services/caseSerializer.js';

const mockRawCase = {
  id: 'case_test_123',
  title: 'Vault 7 Breach',
  difficulty: 'medium',
  premise: 'High security breach',
  story: 'Detailed criminal story narrative',
  suspects: [
    { id: 'suspect_1', name: 'Dr. Vance', role: 'Cryptographer', background: 'B1', motive: 'M1', alibi: 'A1' },
    { id: 'suspect_2', name: 'Vex Cross', role: 'Architect', background: 'B2', motive: 'M2', alibi: 'A2' },
  ],
  clues: [
    { id: 'clue_1', title: 'Terminal Log', description: 'Real secret description 1' },
    { id: 'clue_2', title: 'Coolant Residue', description: 'Real secret description 2' },
  ],
  hints: [
    { id: 'hint_1', text: 'Hint 1 text' },
    { id: 'hint_2', text: 'Hint 2 text' },
  ],
  culpritId: 'suspect_1',
  solution: 'Top secret solution: Dr. Vance bypassed security with stolen keys.',
  evidenceMapping: [{ clueId: 'clue_1', supports: 'Proves presence' }],
  discoveredClueIds: ['clue_1'],
  hintsUsed: 1,
  status: 'active',
  score: 0,
};

test('Zero-Leakage Policy: toPlayerSafeCase strips all secret solution fields', () => {
  const safe = toPlayerSafeCase(mockRawCase);

  // Culprit, solution, and internal evidence mapping must NEVER be present
  assert.strictEqual(safe.culpritId, undefined, 'culpritId must be omitted');
  assert.strictEqual(safe.solution, undefined, 'solution must be omitted');
  assert.strictEqual(safe.evidenceMapping, undefined, 'evidenceMapping must be omitted');

  // Verify undiscovered clues hide their description
  const discoveredClue = safe.clues.find(c => c.id === 'clue_1');
  const undiscoveredClue = safe.clues.find(c => c.id === 'clue_2');

  assert.strictEqual(discoveredClue.discovered, true);
  assert.strictEqual(discoveredClue.description, 'Real secret description 1');

  assert.strictEqual(undiscoveredClue.discovered, false);
  assert.strictEqual(undiscoveredClue.description, null, 'Undiscovered clue description must be null');

  // Verify hints array only reveals used hints
  assert.strictEqual(safe.hints.length, 1);
  assert.strictEqual(safe.hints[0].id, 'hint_1');

  // Verify progress indicators
  assert.strictEqual(safe.progress.discoveredClueCount, 1);
  assert.strictEqual(safe.progress.totalClues, 2);
  assert.strictEqual(safe.progress.hintsUsed, 1);
  assert.strictEqual(safe.progress.maxHints, 3);
});

test('Case Result Serializer: toCaseResult provides verified resolution and culprit identity', () => {
  const completedCase = {
    ...mockRawCase,
    status: 'completed',
    isCorrect: true,
    accusationSuspectId: 'suspect_1',
    score: 145,
    scoreBreakdown: { finalScore: 145, isCorrect: true },
  };

  const result = toCaseResult(completedCase);

  assert.strictEqual(result.verdict, 'correct');
  assert.strictEqual(result.culpritId, 'suspect_1');
  assert.strictEqual(result.culpritName, 'Dr. Vance');
  assert.strictEqual(result.solution, 'Top secret solution: Dr. Vance bypassed security with stolen keys.');
  assert.strictEqual(result.score, 145);
});
