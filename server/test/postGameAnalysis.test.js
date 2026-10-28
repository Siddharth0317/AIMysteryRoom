import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { clearMemoryCases, getCaseById } from '../src/services/caseService.js';
import {
  buildAnalysisPrompt,
  generateDeterministicAnalysis,
} from '../src/services/geminiService.js';
import { postGameAnalysisSchema } from '../src/validators/caseSchemas.js';

test('Feature E: Post-Game AI Analysis Integration and Secrecy', async (t) => {
  clearMemoryCases();

  let caseId;
  let suspect1Id;

  await t.test('Setup: Create active case for post-game analysis testing', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        premise: 'Quantum encryption key wiped from server node Theta.',
        difficulty: 'easy',
      })
      .expect(201);

    caseId = res.body.case.id;
    suspect1Id = res.body.case.suspects[0].id;
    assert.ok(caseId);
    assert.ok(suspect1Id);
  });

  // 1. Rejection on active case
  await t.test('GET /api/cases/:id/analysis rejects active case with 409 CASE_NOT_COMPLETED', async () => {
    const res = await request(app)
      .get(`/api/cases/${caseId}/analysis`)
      .expect(409);

    assert.strictEqual(res.body.error.code, 'CASE_NOT_COMPLETED');
    assert.ok(res.body.error.message.includes('prior to case completion'));
  });

  // 2. Discover clue and complete case by accusation
  await t.test('Discover clue and complete case by accusing suspect', async () => {
    // Discover clue 1
    await request(app)
      .post(`/api/cases/${caseId}/clues/clue_1/discover`)
      .expect(200);

    // Submit accusation
    const accuseRes = await request(app)
      .post(`/api/cases/${caseId}/accuse`)
      .send({ suspectId: suspect1Id })
      .expect(200);

    assert.strictEqual(accuseRes.body.verdict, 'correct');
  });

  // 3. Retrieve Post-Game AI Analysis on completed case
  let firstAnalysis;
  await t.test('GET /api/cases/:id/analysis returns valid structured debrief on completed case', async () => {
    const res = await request(app)
      .get(`/api/cases/${caseId}/analysis`)
      .expect(200);

    assert.ok(res.body.analysis);
    const analysis = res.body.analysis;
    firstAnalysis = analysis;

    assert.strictEqual(analysis.status, 'ready');
    assert.ok(analysis.summary && analysis.summary.length > 0);
    assert.ok(Array.isArray(analysis.keyEvidence));
    assert.ok(analysis.keyEvidence.length >= 1);
    assert.ok(analysis.keyEvidence[0].title);
    assert.ok(analysis.keyEvidence[0].explanation);
    assert.ok(analysis.nextTimeTip);

    // Validate with Zod schema
    const parsed = postGameAnalysisSchema.parse(analysis);
    assert.ok(parsed);
  });

  // 4. Verify clueId references belong to the case
  await t.test('Analysis keyEvidence and redHerrings reference valid clues in case', async () => {
    const caseDoc = await getCaseById(caseId);
    const validClueIds = new Set((caseDoc.clues || []).map((c) => c.id));

    for (const item of firstAnalysis.keyEvidence) {
      assert.ok(
        validClueIds.has(item.clueId),
        `keyEvidence clueId "${item.clueId}" must belong to case`
      );
    }

    for (const item of firstAnalysis.redHerrings || []) {
      assert.ok(
        validClueIds.has(item.clueId),
        `redHerring clueId "${item.clueId}" must belong to case`
      );
    }
  });

  // 5. Caching: Subsequent request returns identical cached analysis
  await t.test('Subsequent GET /api/cases/:id/analysis returns cached analysis', async () => {
    const res = await request(app)
      .get(`/api/cases/${caseId}/analysis`)
      .expect(200);

    assert.deepStrictEqual(res.body.analysis, firstAnalysis);
  });

  // 6. Non-existent case returns 404
  await t.test('GET /api/cases/:id/analysis rejects non-existent case with 404', async () => {
    const res = await request(app)
      .get('/api/cases/case_nonexistent_9999/analysis')
      .expect(404);

    assert.strictEqual(res.body.error.code, 'CASE_NOT_FOUND');
  });

  // 7. Analysis does not alter score, status, or solution
  await t.test('Analysis retrieval preserves case score, status, and solution integrity', async () => {
    const caseDoc = await getCaseById(caseId);
    assert.strictEqual(caseDoc.status, 'completed');
    assert.strictEqual(caseDoc.isCorrect, true);
    assert.ok(caseDoc.score > 0);
  });
});

test('Unit Tests: Post-Game AI Analysis Prompts and Fallbacks', (t) => {
  const mockCaseDoc = {
    title: 'The Cyber-Vault Incursion',
    difficulty: 'easy',
    culpritId: 'suspect_1',
    accusationSuspectId: 'suspect_1',
    isCorrect: true,
    solution: 'Suspect 1 used compromised maintenance credentials to alter ventilation sensor logs.',
    suspects: [
      { id: 'suspect_1', name: 'Kaelen Voss', role: 'Security Architect' },
      { id: 'suspect_2', name: 'Lyra Chen', role: 'Telemetry Lead' },
    ],
    clues: [
      { id: 'clue_1', title: 'Security Override Badge', description: 'Badge found in maintenance airlock' },
      { id: 'clue_2', title: 'Corrupted Sensor Node', description: 'Sensor timestamp altered by 12 minutes' },
    ],
    discoveredClueIds: ['clue_1'],
  };

  t.test('buildAnalysisPrompt includes canonical culprit, solution, and clue inventories', () => {
    const prompt = buildAnalysisPrompt(mockCaseDoc);
    assert.ok(prompt.includes('Kaelen Voss'));
    assert.ok(prompt.includes('CORRECT ACCUSATION'));
    assert.ok(prompt.includes('Security Override Badge'));
    assert.ok(prompt.includes('OUTPUT REQUIREMENTS'));
  });

  t.test('generateDeterministicAnalysis creates schema-compliant structured debrief', () => {
    const debrief = generateDeterministicAnalysis(mockCaseDoc);
    assert.strictEqual(debrief.status, 'ready');
    assert.ok(debrief.summary.includes('Kaelen Voss'));
    assert.strictEqual(debrief.keyEvidence[0].clueId, 'clue_1');
    assert.strictEqual(debrief.redHerrings[0].clueId, 'clue_2');

    // Validates against Zod schema
    const validated = postGameAnalysisSchema.parse(debrief);
    assert.strictEqual(validated.status, 'ready');
  });
});
