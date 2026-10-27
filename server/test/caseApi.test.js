import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { clearMemoryCases } from '../src/services/caseService.js';

test('API Integration: Full Case Lifecycle and Secrecy Verification', async (t) => {
  clearMemoryCases();
  // 1. Validation rejection on invalid input
  await t.test('POST /api/cases rejects empty premise with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({ premise: '   ', difficulty: 'easy' })
      .expect(400);

    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.message.includes('Premise cannot be empty'));
  });

  // 2. Successful case creation with Zero-Leakage check
  let createdCaseId;
  await t.test('POST /api/cases creates case and enforces Zero-Leakage', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        premise: 'A quantum data storage canister was stolen from Lab Alpha.',
        difficulty: 'easy', // 3 suspects, 5 clues, 2 hints, 100 base pts
      })
      .expect(201);

    assert.ok(res.body.case);
    assert.ok(res.body.case.id);
    assert.strictEqual(res.body.case.difficulty, 'easy');
    assert.strictEqual(res.body.case.suspects.length, 3);
    assert.strictEqual(res.body.case.clues.length, 5);
    assert.strictEqual(res.body.case.progress.maxHints, 2);

    // CRITICAL SECURITY ASSERTION: No solution leakage
    assert.strictEqual(res.body.case.culpritId, undefined, 'culpritId must NOT leak');
    assert.strictEqual(res.body.case.solution, undefined, 'solution must NOT leak');
    assert.strictEqual(res.body.case.evidenceMapping, undefined, 'evidenceMapping must NOT leak');

    createdCaseId = res.body.case.id;
  });

  // 3. GET /api/cases/:id returns active player-safe case
  await t.test('GET /api/cases/:id returns player-safe active case', async () => {
    const res = await request(app)
      .get(`/api/cases/${createdCaseId}`)
      .expect(200);

    assert.strictEqual(res.body.case.id, createdCaseId);
    assert.strictEqual(res.body.case.progress.status, 'active');
    assert.strictEqual(res.body.case.culpritId, undefined);
  });

  // 4. Clue Discovery & Idempotency
  await t.test('POST /api/cases/:id/clues/:clueId/discover is idempotent and awards points once', async () => {
    // First discovery
    const firstRes = await request(app)
      .post(`/api/cases/${createdCaseId}/clues/clue_1/discover`)
      .expect(200);

    assert.strictEqual(firstRes.body.clue.id, 'clue_1');
    assert.strictEqual(firstRes.body.clue.discovered, true);
    assert.strictEqual(firstRes.body.progress.discoveredClueCount, 1);

    // Duplicate discovery attempt (must NOT award duplicate points)
    const secondRes = await request(app)
      .post(`/api/cases/${createdCaseId}/clues/clue_1/discover`)
      .expect(200);

    assert.strictEqual(secondRes.body.progress.discoveredClueCount, 1, 'Count must remain 1');
  });

  // 5. Hint Limits Enforcement
  await t.test('POST /api/cases/:id/hints enforces difficulty limits (Easy = max 2 hints)', async () => {
    // Hint 1
    const h1 = await request(app)
      .post(`/api/cases/${createdCaseId}/hints`)
      .expect(200);
    assert.strictEqual(h1.body.progress.hintsUsed, 1);

    // Hint 2
    const h2 = await request(app)
      .post(`/api/cases/${createdCaseId}/hints`)
      .expect(200);
    assert.strictEqual(h2.body.progress.hintsUsed, 2);

    // Hint 3 (Exceeds limit -> 409 Conflict)
    const h3 = await request(app)
      .post(`/api/cases/${createdCaseId}/hints`)
      .expect(409);
    assert.strictEqual(h3.body.error.code, 'HINT_LIMIT_REACHED');
  });

  // 6. Result endpoint rejects while case is active
  await t.test('GET /api/cases/:id/result rejects active case with 409 CASE_NOT_COMPLETED', async () => {
    const res = await request(app)
      .get(`/api/cases/${createdCaseId}/result`)
      .expect(409);

    assert.strictEqual(res.body.error.code, 'CASE_NOT_COMPLETED');
  });

  // 7. Accusation Submission & Backend Scoring
  await t.test('POST /api/cases/:id/accuse verifies culprit, calculates score, and completes case', async () => {
    // Accuse correct suspect: suspect_1
    // Easy difficulty: Base 100 + (1 clue * 5) - (2 hints * 10) = 100 + 5 - 20 = 85
    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/accuse`)
      .send({ suspectId: 'suspect_1' })
      .expect(200);

    assert.strictEqual(res.body.verdict, 'correct');
    assert.strictEqual(res.body.culpritId, 'suspect_1');
    assert.strictEqual(res.body.score, 85);
    assert.ok(res.body.solution);
  });

  // 8. Completed Case Locking
  await t.test('Completed case locks against further modifications', async () => {
    // Accusing completed case returns 409
    const accuseRes = await request(app)
      .post(`/api/cases/${createdCaseId}/accuse`)
      .send({ suspectId: 'suspect_2' })
      .expect(409);
    assert.strictEqual(accuseRes.body.error.code, 'CASE_COMPLETED');

    // Discovering clue on completed case returns 409
    const clueRes = await request(app)
      .post(`/api/cases/${createdCaseId}/clues/clue_2/discover`)
      .expect(409);
    assert.strictEqual(clueRes.body.error.code, 'CASE_COMPLETED');

    // Result endpoint now returns 200 with verified debrief
    const resultRes = await request(app)
      .get(`/api/cases/${createdCaseId}/result`)
      .expect(200);
    assert.strictEqual(resultRes.body.verdict, 'correct');
    assert.strictEqual(resultRes.body.score, 85);
  });

  // 9. Edge Cases: Non-existent case, unknown suspect, and invalid clue
  await t.test('GET /api/cases/:id rejects non-existent case with 404 CASE_NOT_FOUND', async () => {
    const res = await request(app)
      .get('/api/cases/case_nonexistent_999')
      .expect(404);
    assert.strictEqual(res.body.error.code, 'CASE_NOT_FOUND');
  });

  await t.test('POST /api/cases/:id/clues/:clueId/discover rejects invalid clue with 404 CLUE_NOT_FOUND', async () => {
    // Create an active case for testing invalid clue
    const caseRes = await request(app)
      .post('/api/cases')
      .send({ premise: 'Stolen data crystal from vault 4', difficulty: 'easy' })
      .expect(201);
    const cId = caseRes.body.case.id;

    const res = await request(app)
      .post(`/api/cases/${cId}/clues/clue_invalid_99/discover`)
      .expect(404);
    assert.strictEqual(res.body.error.code, 'CLUE_NOT_FOUND');
  });

  await t.test('POST /api/cases/:id/accuse rejects unknown suspect with 404 SUSPECT_NOT_FOUND', async () => {
    const caseRes = await request(app)
      .post('/api/cases')
      .send({ premise: 'Cybernetic robbery at NeoBank', difficulty: 'easy' })
      .expect(201);
    const cId = caseRes.body.case.id;

    const res = await request(app)
      .post(`/api/cases/${cId}/accuse`)
      .send({ suspectId: 'suspect_ghost_not_in_case' })
      .expect(404);
    assert.strictEqual(res.body.error.code, 'SUSPECT_NOT_FOUND');
  });

  // 10. Anti-Cheat: Client attempts to tamper with score or verdict
  await t.test('Anti-Cheat: Server ignores client-supplied score and verdict fields', async () => {
    const caseRes = await request(app)
      .post('/api/cases')
      .send({ premise: 'Sabotage at orbital space dock', difficulty: 'medium' })
      .expect(201);
    const cId = caseRes.body.case.id;

    // Client maliciously passes score: 99999 and verdict: 'correct'
    const res = await request(app)
      .post(`/api/cases/${cId}/accuse`)
      .send({
        suspectId: 'suspect_2', // Incorrect suspect
        score: 99999,
        verdict: 'correct',
      })
      .expect(200);

    // Backend must evaluate authoritatively (incorrect suspect gives 0 points)
    assert.strictEqual(res.body.verdict, 'incorrect');
    assert.strictEqual(res.body.score, 0, 'Tampered score must be completely ignored');
  });
});
