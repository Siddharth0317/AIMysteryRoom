import test from 'node:test';
import assert from 'node:assert';
import {
  createCaseSchema,
  accuseSchema,
  generatedCaseSchema,
} from '../src/validators/caseSchemas.js';

test('Zod Validation: createCaseSchema validates premise and difficulty', () => {
  // Valid input
  const valid = createCaseSchema.parse({
    premise: 'A quantum vault has suffered an anomalous outage.',
    difficulty: 'medium',
  });
  assert.strictEqual(valid.difficulty, 'medium');

  // Empty / whitespace premise rejection
  assert.throws(() => {
    createCaseSchema.parse({ premise: '   ', difficulty: 'easy' });
  }, /Premise cannot be empty/);

  // Premise > 500 characters rejection
  assert.throws(() => {
    createCaseSchema.parse({ premise: 'a'.repeat(501), difficulty: 'easy' });
  }, /Premise must not exceed 500 characters/);

  // Invalid difficulty enum rejection
  assert.throws(() => {
    createCaseSchema.parse({ premise: 'Valid premise', difficulty: 'nightmare' });
  }, /Difficulty must be one of/);
});

test('Zod Validation: accuseSchema enforces non-empty suspect ID', () => {
  const valid = accuseSchema.parse({ suspectId: 'suspect_1' });
  assert.strictEqual(valid.suspectId, 'suspect_1');

  assert.throws(() => {
    accuseSchema.parse({ suspectId: '  ' });
  }, /Suspect ID cannot be empty/);
});

test('Zod Validation: generatedCaseSchema validates exact counts per difficulty', () => {
  const validMediumCase = {
    title: 'The Cyber Heist',
    story: 'Narrative description of the incident.',
    difficulty: 'medium',
    suspects: [
      { id: 's1', name: 'N1', role: 'R1', background: 'B1', motive: 'M1', alibi: 'A1' },
      { id: 's2', name: 'N2', role: 'R2', background: 'B2', motive: 'M2', alibi: 'A2' },
      { id: 's3', name: 'N3', role: 'R3', background: 'B3', motive: 'M3', alibi: 'A3' },
      { id: 's4', name: 'N4', role: 'R4', background: 'B4', motive: 'M4', alibi: 'A4' },
    ],
    clues: [
      { id: 'c1', title: 'T1', description: 'D1' },
      { id: 'c2', title: 'T2', description: 'D2' },
      { id: 'c3', title: 'T3', description: 'D3' },
      { id: 'c4', title: 'T4', description: 'D4' },
      { id: 'c5', title: 'T5', description: 'D5' },
      { id: 'c6', title: 'T6', description: 'D6' },
      { id: 'c7', title: 'T7', description: 'D7' },
    ],
    hints: [
      { id: 'h1', text: 'H1' },
      { id: 'h2', text: 'H2' },
      { id: 'h3', text: 'H3' },
    ],
    culpritId: 's1',
    solution: 'The culprit is s1.',
  };

  // Valid medium case (4 suspects, 7 clues, 3 hints)
  assert.doesNotThrow(() => {
    generatedCaseSchema.parse(validMediumCase);
  });

  // Invalid suspect count for medium (expects 4, got 3)
  const invalidCountCase = {
    ...validMediumCase,
    suspects: validMediumCase.suspects.slice(0, 3),
  };
  assert.throws(() => {
    generatedCaseSchema.parse(invalidCountCase);
  }, /Expected exactly 4 suspects for medium difficulty/);

  // Culprit referencing non-existent suspect
  const invalidCulpritCase = {
    ...validMediumCase,
    culpritId: 's_ghost',
  };
  assert.throws(() => {
    generatedCaseSchema.parse(invalidCulpritCase);
  }, /s_ghost/);
});
