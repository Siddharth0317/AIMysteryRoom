import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { clearMemoryCases, getCaseById } from '../src/services/caseService.js';
import { evaluateAdaptiveAssistance } from '../src/services/adaptiveService.js';

test('Phase 7: Adaptive Difficulty, Case Archive, Stats, and Achievements', async (t) => {
  clearMemoryCases();

  let case1Id;
  let case2Id;

  // 1. Setup cases
  await t.test('Setup: Create active cases for progress tracking', async () => {
    // Case 1: Easy case
    const res1 = await request(app)
      .post('/api/cases')
      .send({
        premise: 'Sub-orbital shuttle telemetry overridden over sector 4.',
        difficulty: 'easy',
      })
      .expect(201);
    case1Id = res1.body.case.id;

    // Case 2: Hard case
    const res2 = await request(app)
      .post('/api/cases')
      .send({
        premise: 'Quantum lattice encryption key wiped from Deep Vault 9.',
        difficulty: 'hard',
      })
      .expect(201);
    case2Id = res2.body.case.id;

    assert.ok(case1Id);
    assert.ok(case2Id);
  });

  // 2. Adaptive Assistance Rule Tests (SPEC.md Section 17.5 & 17.14)
  await t.test('Adaptive Engine: Surfaces action suggestion when zero clues discovered', async () => {
    const res = await request(app)
      .get(`/api/cases/${case1Id}/assistance`)
      .expect(200);

    assert.strictEqual(res.body.mode, 'standard');
    assert.ok(res.body.recommendation);
    assert.strictEqual(res.body.recommendation.type, 'suggest_action');
    assert.ok(res.body.recommendation.message.includes('Decrypt the first forensic evidence'));
  });

  await t.test('Adaptive Engine: Respects challengeMode by disabling automated guidance', async () => {
    const res = await request(app)
      .get(`/api/cases/${case1Id}/assistance?challengeMode=true`)
      .expect(200);

    assert.strictEqual(res.body.mode, 'challenge');
    assert.strictEqual(res.body.recommendation, null);
    assert.ok(res.body.message.includes('Challenge mode active'));
  });

  await t.test('Adaptive Engine: Recommends review when hint budget is exhausted', () => {
    const mockCase = {
      difficulty: 'easy',
      clues: [{ id: 'c1' }, { id: 'c2' }],
      discoveredClueIds: ['c1'],
      hintsUsed: 2, // Easy maxHints = 2
    };

    const guidance = evaluateAdaptiveAssistance(mockCase);
    assert.strictEqual(guidance.recommendation.type, 'encourage_review');
    assert.ok(guidance.recommendation.message.includes('budget has been exhausted'));
  });

  await t.test('Adaptive Engine: Recommends interrogation when clues accumulate without suspect questions', () => {
    const mockCase = {
      difficulty: 'medium',
      clues: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
      discoveredClueIds: ['c1', 'c2'],
      hintsUsed: 0,
      interrogations: [],
    };

    const guidance = evaluateAdaptiveAssistance(mockCase);
    assert.strictEqual(guidance.recommendation.type, 'suggest_action');
    assert.ok(guidance.recommendation.message.includes('Interrogate suspects'));
  });

  // 3. Complete Case 1 for history and achievement evaluation
  await t.test('Complete Case 1 with 0 hints for perfect score achievement', async () => {
    // Discover 1 clue
    await request(app)
      .post(`/api/cases/${case1Id}/clues/clue_1/discover`)
      .expect(200);

    // Interrogate 3 times for interrogation master achievement
    await request(app)
      .post(`/api/cases/${case1Id}/suspects/suspect_1/interrogate`)
      .send({ question: 'Where were you during the security incident?' })
      .expect(200);

    await request(app)
      .post(`/api/cases/${case1Id}/suspects/suspect_1/interrogate`)
      .send({ question: 'Did you witness anyone near the console?' })
      .expect(200);

    await request(app)
      .post(`/api/cases/${case1Id}/suspects/suspect_1/interrogate`)
      .send({ question: 'Confirm your biometric authorization log.' })
      .expect(200);

    // Accuse correct culprit
    const accuseRes = await request(app)
      .post(`/api/cases/${case1Id}/accuse`)
      .send({ suspectId: 'suspect_1' })
      .expect(200);

    assert.strictEqual(accuseRes.body.verdict, 'correct');
    assert.strictEqual(accuseRes.body.score, 105); // 100 base + 5 clue - 0 hints
  });

  // 4. Case History & Archive Listing (SPEC.md Section 17.7)
  await t.test('GET /api/cases lists cases and enforces Zero-Leakage on active cases', async () => {
    const res = await request(app)
      .get('/api/cases')
      .expect(200);

    assert.ok(Array.isArray(res.body.cases));
    assert.strictEqual(res.body.cases.length, 2);

    // Case 2 is ACTIVE: must NOT leak solution, culpritId, or score
    const activeSummary = res.body.cases.find((c) => c.id === case2Id);
    assert.ok(activeSummary);
    assert.strictEqual(activeSummary.status, 'active');
    assert.strictEqual(activeSummary.culpritId, undefined);
    assert.strictEqual(activeSummary.solution, undefined);
    assert.strictEqual(activeSummary.score, null, 'Active case score must be null in summary');
    assert.strictEqual(activeSummary.culpritName, null, 'Active culprit name must be null');

    // Case 1 is COMPLETED: reveals score and verified status
    const completedSummary = res.body.cases.find((c) => c.id === case1Id);
    assert.ok(completedSummary);
    assert.strictEqual(completedSummary.status, 'completed');
    assert.strictEqual(completedSummary.isCorrect, true);
    assert.strictEqual(completedSummary.score, 105);
  });

  await t.test('GET /api/cases supports filtering by status', async () => {
    const completedRes = await request(app)
      .get('/api/cases?status=completed')
      .expect(200);
    assert.strictEqual(completedRes.body.cases.length, 1);
    assert.strictEqual(completedRes.body.cases[0].id, case1Id);

    const activeRes = await request(app)
      .get('/api/cases?status=active')
      .expect(200);
    assert.strictEqual(activeRes.body.cases.length, 1);
    assert.strictEqual(activeRes.body.cases[0].id, case2Id);
  });

  // 5. Player Statistics Overview (SPEC.md Section 17.7)
  await t.test('GET /api/stats computes authoritative detective performance telemetry', async () => {
    const res = await request(app)
      .get('/api/stats')
      .expect(200);

    assert.ok(res.body.stats);
    const stats = res.body.stats;
    assert.strictEqual(stats.totalCasesAttempted, 2);
    assert.strictEqual(stats.totalCasesCompleted, 1);
    assert.strictEqual(stats.totalCasesSolved, 1);
    assert.strictEqual(stats.winRatePercentage, 100);
    assert.strictEqual(stats.highScore, 105);
    assert.strictEqual(stats.averageScore, 105);
    assert.strictEqual(stats.totalInterrogations, 3);
  });

  // 6. Achievements Overview (SPEC.md Section 17.7)
  await t.test('GET /api/achievements evaluates unlocked badges based on server events', async () => {
    const res = await request(app)
      .get('/api/achievements')
      .expect(200);

    assert.ok(Array.isArray(res.body.achievements));
    assert.ok(res.body.unlockedCount >= 2);

    // FIRST_SOLVE should be unlocked
    const firstSolve = res.body.achievements.find((a) => a.id === 'FIRST_SOLVE');
    assert.strictEqual(firstSolve.unlocked, true);
    assert.ok(firstSolve.unlockedAt);

    // PERFECT_INVESTIGATION (0 hints used) should be unlocked
    const perfectInvest = res.body.achievements.find((a) => a.id === 'PERFECT_INVESTIGATION');
    assert.strictEqual(perfectInvest.unlocked, true);

    // CROSS_EXAMINER (3+ interrogations) should be unlocked
    const crossExam = res.body.achievements.find((a) => a.id === 'CROSS_EXAMINER');
    assert.strictEqual(crossExam.unlocked, true);

    // MASTER_SLEUTH (Hard case solve) should be LOCKED since case2 is still active
    const masterSleuth = res.body.achievements.find((a) => a.id === 'MASTER_SLEUTH');
    assert.strictEqual(masterSleuth.unlocked, false);
  });

  // 7. Daily Mystery Seed & Cache (SPEC.md Section 17.8)
  await t.test('POST /api/cases/daily returns deterministic daily case cached per date', async () => {
    const res1 = await request(app)
      .post('/api/cases/daily')
      .expect(200);

    assert.ok(res1.body.case);
    assert.ok(res1.body.dailyDate);
    assert.strictEqual(res1.body.isExisting, false);
    const dailyId = res1.body.case.id;

    // Consecutive request on same day returns the cached case
    const res2 = await request(app)
      .post('/api/cases/daily')
      .expect(200);

    assert.strictEqual(res2.body.case.id, dailyId);
    assert.strictEqual(res2.body.isExisting, true);
  });

  // 8. Replay Mode (SPEC.md Section 17.8)
  await t.test('POST /api/cases/:id/replay creates fresh active case without mutating original', async () => {
    const res = await request(app)
      .post(`/api/cases/${case1Id}/replay`)
      .expect(201);

    assert.ok(res.body.replayedCaseId);
    assert.notStrictEqual(res.body.replayedCaseId, case1Id);
    assert.strictEqual(res.body.case.progress.status, 'active');

    // Original completed case remains unchanged
    const original = await getCaseById(case1Id);
    assert.strictEqual(original.status, 'completed');
    assert.strictEqual(original.score, 105);
  });
});
