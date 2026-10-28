import test from 'node:test';
import assert from 'node:assert';
import {
  runDeterministicChecks,
  validateMysteryCase,
} from '../src/services/caseValidationService.js';
import { generateMysteryCase } from '../src/services/geminiService.js';

// Base valid Easy case fixture
function createValidEasyCase() {
  return {
    title: 'The Silent Core Theft',
    story: 'At 02:00 AM, a proprietary core was stolen from the high-security vault.',
    difficulty: 'easy',
    suspects: [
      { id: 'suspect_1', name: 'Dr. Anna Vance', role: 'Chief Scientist', background: 'B1', motive: 'M1', alibi: 'Claims she was in the cryo-lab.' },
      { id: 'suspect_2', name: 'Commander Miller', role: 'Security Chief', background: 'B2', motive: 'M2', alibi: 'Claims he was patrolling sector 3.' },
      { id: 'suspect_3', name: 'Jax Cole', role: 'Technician', background: 'B3', motive: 'M3', alibi: 'Claims he was off-duty.' },
    ],
    clues: [
      { id: 'clue_1', title: 'Cryo Badge Log', description: 'Badge scan reveals Dr. Anna Vance left the cryo-lab at 01:55 AM.' },
      { id: 'clue_2', title: 'Security Footage', description: 'Camera footage shows a figure in a lab coat near the vault.' },
      { id: 'clue_3', title: 'Glove Fibers', description: 'Synthetic fibers matching lab issue gloves found on vault handle.' },
      { id: 'clue_4', title: 'Power Surge', description: 'Brief substation power surge recorded at 02:05 AM.' },
      { id: 'clue_5', title: 'Datapad Fragment', description: 'Encrypted transfer logs showing research data upload.' },
    ],
    hints: [
      { id: 'hint_1', text: 'Compare the badge departure timestamps against stated alibis.' },
      { id: 'hint_2', text: 'The perpetrator wore attire specific to research staff.' },
    ],
    culpritId: 'suspect_1',
    solution: 'Dr. Anna Vance used her scientist credentials to bypass the security seals and steal the core.',
    evidenceMapping: [
      { clueId: 'clue_1', supports: 'Disproves Dr. Anna Vance alibi' },
      { clueId: 'clue_2', supports: 'Identifies lab coat worn by Dr. Anna Vance' },
      { clueId: 'clue_3', supports: 'Corroborates lab gloves used by Dr. Anna Vance' },
    ],
  };
}

test('Consistency Validator: Valid case passes all consistency dimensions', async () => {
  const validCase = createValidEasyCase();
  const report = await validateMysteryCase(validCase, { enableSemanticReview: false });

  assert.strictEqual(report.valid, true);
  assert.strictEqual(report.checks.structure, true);
  assert.strictEqual(report.checks.references, true);
  assert.strictEqual(report.checks.timeline, true);
  assert.strictEqual(report.checks.evidenceSufficiency, true);
  assert.strictEqual(report.checks.difficulty, true);
  assert.strictEqual(report.checks.solutionLeakage, true);
  assert.strictEqual(report.issues.length, 0);
});

test('Consistency Validator: Detects missing culprit suspect reference', () => {
  const caseData = createValidEasyCase();
  caseData.culpritId = 'suspect_ghost_99'; // Non-existent suspect

  const report = runDeterministicChecks(caseData);
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.checks.references, false);
  assert.ok(report.issues.some((issue) => issue.includes('does not reference an existing suspect')));
});

test('Consistency Validator: Detects unknown clue ID in evidenceMapping', () => {
  const caseData = createValidEasyCase();
  caseData.evidenceMapping.push({ clueId: 'clue_unknown_404', supports: 'Invalid clue reference' });

  const report = runDeterministicChecks(caseData);
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.checks.references, false);
  assert.ok(report.issues.some((issue) => issue.includes('references non-existent clueId')));
});

test('Consistency Validator: Detects contradictory clues exonerating the culprit', () => {
  const caseData = createValidEasyCase();
  // Clue 4 contradicts the case by asserting an impossible alibi / complete exoneration for the culprit
  caseData.clues[3].description = 'Biometric scanner logs confirm Dr. Anna Vance was conclusively ruled out and off-site.';

  const report = runDeterministicChecks(caseData);
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.checks.evidenceSufficiency, false);
  assert.ok(report.issues.some((issue) => issue.includes('exoneration contradiction')));
});

test('Consistency Validator: Detects solution failing to mention intended culprit', () => {
  const caseData = createValidEasyCase();
  // Solution describes a completely different suspect or event without mentioning Dr. Vance
  caseData.solution = 'An unidentified mercenary broke in through the ventilation shaft and escaped.';

  const report = runDeterministicChecks(caseData);
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.checks.evidenceSufficiency, false);
  assert.ok(report.issues.some((issue) => issue.includes('Solution does not clearly identify or explain')));
});

test('Consistency Validator: Detects solution leakage in player-facing clues', () => {
  const caseData = createValidEasyCase();
  // Clue 2 leaks the answer to the player
  caseData.clues[1].description = 'The security guard confessed that the culprit is Dr. Anna Vance.';

  const report = runDeterministicChecks(caseData);
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.checks.solutionLeakage, false);
  assert.ok(report.issues.some((issue) => issue.includes('explicit solution leakage')));
});

test('Consistency Validator: Detects duplicate suspect and clue identifiers', () => {
  const caseData = createValidEasyCase();
  caseData.suspects[1].id = 'suspect_1'; // Duplicate ID

  const report = runDeterministicChecks(caseData);
  assert.strictEqual(report.valid, false);
  assert.strictEqual(report.checks.structure, false);
  assert.ok(report.issues.some((issue) => issue.includes('Duplicate suspect ID')));
});

test('Consistency Validator: Bounded repair retry loop repairs invalid generation', async () => {
  let callCount = 0;
  const invalidCase = createValidEasyCase();
  invalidCase.solution = 'An unknown rogue AI stole the core.'; // Fails culprit check

  const validCase = createValidEasyCase(); // Repaired on attempt 2

  const mockClient = {
    models: {
      generateContent: async () => {
        callCount++;
        if (callCount === 1) {
          return { text: JSON.stringify(invalidCase) };
        }
        return { text: JSON.stringify(validCase) };
      },
    },
  };

  const result = await generateMysteryCase('A high-tech heist', 'easy', {
    client: mockClient,
    enableSemanticReview: false,
  });

  assert.strictEqual(callCount, 2, 'Should attempt repair retry on failure');
  assert.strictEqual(result.culpritId, 'suspect_1');
  assert.strictEqual(result.validationReport.repairAttempted, true);
  assert.strictEqual(result.validationReport.valid, true);
});

test('Consistency Validator: Reaches retry exhaustion and throws safe 422 AppError', async () => {
  let callCount = 0;
  const perpetuallyInvalidCase = createValidEasyCase();
  perpetuallyInvalidCase.culpritId = 'suspect_nonexistent';

  const mockClient = {
    models: {
      generateContent: async () => {
        callCount++;
        return { text: JSON.stringify(perpetuallyInvalidCase) };
      },
    },
  };

  await assert.rejects(
    () =>
      generateMysteryCase('Impossible heist', 'easy', {
        client: mockClient,
        maxAttempts: 2,
        enableSemanticReview: false,
      }),
    (err) => {
      assert.strictEqual(err.statusCode, 422);
      assert.strictEqual(err.code, 'AI_GENERATION_FAILED');
      assert.ok(err.message.includes('consistency validation after retries'));
      return true;
    }
  );

  assert.strictEqual(callCount, 2, 'Must exhaust exactly bounded max attempts');
});
