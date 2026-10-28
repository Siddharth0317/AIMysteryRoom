import test from 'node:test';
import assert from 'node:assert';
import {
  buildMysteryPrompt,
  cleanJsonText,
  generateMysteryCase,
} from '../src/services/geminiService.js';

test('Gemini Service: buildMysteryPrompt contains required counts and difficulty constraints', () => {
  const easyPrompt = buildMysteryPrompt('A missing datapad in Neo-Kyoto', 'easy');
  assert.ok(easyPrompt.includes('EXACTLY 3 suspects'));
  assert.ok(easyPrompt.includes('EXACTLY 5 clues'));
  assert.ok(easyPrompt.includes('EXACTLY 2 progressive hints'));

  const hardPrompt = buildMysteryPrompt('A massive grid blackout', 'hard');
  assert.ok(hardPrompt.includes('EXACTLY 5 suspects'));
  assert.ok(hardPrompt.includes('EXACTLY 9 clues'));
  assert.ok(hardPrompt.includes('EXACTLY 3 progressive hints'));
});

test('Gemini Service: cleanJsonText strips markdown fences cleanly', () => {
  const rawWithFences = '```json\n{\n  "title": "Test Case"\n}\n```';
  assert.strictEqual(cleanJsonText(rawWithFences), '{\n  "title": "Test Case"\n}');

  const rawWithoutFences = '{"title": "Test Case"}';
  assert.strictEqual(cleanJsonText(rawWithoutFences), '{"title": "Test Case"}');
});

test('Gemini Service: generateMysteryCase succeeds with valid mock Gemini client', async () => {
  const validEasyResponseJson = JSON.stringify({
    title: 'The Stolen Data Core',
    story: 'At 01:00 AM, the core was removed from terminal 4.',
    difficulty: 'easy',
    suspects: [
      { id: 'suspect_1', name: 'Dr. Anna Vance', role: 'Physicist', background: 'B1', motive: 'M1', alibi: 'A1' },
      { id: 'suspect_2', name: 'Officer Miller', role: 'Security', background: 'B2', motive: 'M2', alibi: 'A2' },
      { id: 'suspect_3', name: 'Kira Valen', role: 'Operator', background: 'B3', motive: 'M3', alibi: 'A3' },
    ],
    clues: [
      { id: 'clue_1', title: 'Laser Burn', description: 'Laser burn on lock' },
      { id: 'clue_2', title: 'Badge Scan', description: 'Scan at 00:58' },
      { id: 'clue_3', title: 'Boot Print', description: 'Boot print in dust' },
      { id: 'clue_4', title: 'Power Spike', description: 'Substation spike' },
      { id: 'clue_5', title: 'Radio Burst', description: 'Transmission log' },
    ],
    hints: [
      { id: 'hint_1', text: 'Check the badge scan records.' },
      { id: 'hint_2', text: 'The laser tool required physics laboratory authorization.' },
    ],
    culpritId: 'suspect_1',
    solution: 'Dr. Anna Vance used her lab laser to breach the canister.',
    evidenceMapping: [{ clueId: 'clue_1', supports: 'Proves laser usage by Dr. Anna Vance' }],
  });

  const mockClient = {
    models: {
      generateContent: async () => ({ text: `\`\`\`json\n${validEasyResponseJson}\n\`\`\`` }),
    },
  };

  const caseData = await generateMysteryCase('A missing core', 'easy', { client: mockClient });
  assert.strictEqual(caseData.title, 'The Stolen Data Core');
  assert.strictEqual(caseData.difficulty, 'easy');
  assert.strictEqual(caseData.suspects.length, 3);
  assert.strictEqual(caseData.clues.length, 5);
  assert.strictEqual(caseData.hints.length, 2);
  assert.strictEqual(caseData.culpritId, 'suspect_1');
});

test('Gemini Service: generateMysteryCase handles malformed JSON safely with 422 error', async () => {
  const mockClient = {
    models: {
      generateContent: async () => ({ text: 'This is not valid JSON at all!' }),
    },
  };

  await assert.rejects(
    () => generateMysteryCase('Invalid json prompt', 'easy', { client: mockClient }),
    (err) => {
      assert.strictEqual(err.statusCode, 422);
      assert.strictEqual(err.code, 'AI_GENERATION_FAILED');
      assert.ok(err.message.includes('malformed') || err.message.includes('validation'));
      return true;
    }
  );
});

test('Gemini Service: generateMysteryCase rejects structural schema violations (wrong suspect count)', async () => {
  const invalidSuspectCountJson = JSON.stringify({
    title: 'Faulty Case',
    story: 'Short narrative',
    difficulty: 'easy',
    suspects: [
      { id: 's1', name: 'S1', role: 'R1', background: 'B1', motive: 'M1', alibi: 'A1' },
      // Missing 2 suspects for Easy
    ],
    clues: [
      { id: 'c1', title: 'C1', description: 'D1' },
      { id: 'c2', title: 'C2', description: 'D2' },
      { id: 'c3', title: 'C3', description: 'D3' },
      { id: 'c4', title: 'C4', description: 'D4' },
      { id: 'c5', title: 'C5', description: 'D5' },
    ],
    hints: [
      { id: 'h1', text: 'H1' },
      { id: 'h2', text: 'H2' },
    ],
    culpritId: 's1',
    solution: 'Solution text',
  });

  const mockClient = {
    models: {
      generateContent: async () => ({ text: invalidSuspectCountJson }),
    },
  };

  await assert.rejects(
    () => generateMysteryCase('Premise', 'easy', { client: mockClient }),
    (err) => {
      assert.strictEqual(err.statusCode, 422);
      assert.strictEqual(err.code, 'AI_GENERATION_FAILED');
      return true;
    }
  );
});

test('Gemini Service: generateMysteryCase rejects missing API key with 502 error', async () => {
  const origKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    await assert.rejects(
      () => generateMysteryCase('Premise', 'medium'),
      (err) => {
        assert.strictEqual(err.statusCode, 502);
        assert.strictEqual(err.code, 'AI_GENERATION_FAILED');
        return true;
      }
    );
  } finally {
    if (origKey) process.env.GEMINI_API_KEY = origKey;
  }
});
