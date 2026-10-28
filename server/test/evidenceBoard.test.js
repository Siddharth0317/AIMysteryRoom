import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { clearMemoryCases } from '../src/services/caseService.js';
import { toPlayerSafeBoard } from '../src/services/caseSerializer.js';

test('Feature C: Interactive Evidence Board Integration and Integrity', async (t) => {
  clearMemoryCases();

  // Create an active case for evidence board testing
  let caseId;
  let suspect1Id;
  let suspect2Id;
  let clue1Id;
  let clue2Id;

  await t.test('Setup: Create active case for board interactions', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        premise: 'Sub-level mainframe corrupted in research bunker.',
        difficulty: 'easy',
      })
      .expect(201);

    caseId = res.body.case.id;
    suspect1Id = res.body.case.suspects[0].id;
    suspect2Id = res.body.case.suspects[1].id;
    clue1Id = res.body.case.clues[0].id;
    clue2Id = res.body.case.clues[1].id;

    assert.ok(caseId);
    assert.ok(suspect1Id);
    assert.ok(clue1Id);
  });

  // 1. Initial Empty Board State
  await t.test('GET /api/cases/:id/board returns initial empty board structure', async () => {
    const res = await request(app)
      .get(`/api/cases/${caseId}/board`)
      .expect(200);

    assert.ok(res.body.board);
    assert.deepStrictEqual(res.body.board.nodes, []);
    assert.deepStrictEqual(res.body.board.edges, []);
  });

  // 2. Reject Undiscovered Clue on Board
  await t.test('PUT /api/cases/:id/board rejects placing undiscovered clues with 400 VALIDATION_ERROR', async () => {
    // clue1Id has NOT been discovered yet
    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send({
        nodes: [
          { id: clue1Id, type: 'clue', note: 'Undiscovered clue hypothesis' },
          { id: suspect1Id, type: 'suspect', note: 'Prime suspect' },
        ],
        edges: [
          { id: 'edge-1', source: clue1Id, target: suspect1Id, label: 'suspicious link' },
        ],
      })
      .expect(400);

    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.message.includes('Undiscovered clue'));
  });

  // 3. Discover Clue 1
  await t.test('POST /api/cases/:id/clues/:clueId/discover decrypts clue 1', async () => {
    const res = await request(app)
      .post(`/api/cases/${caseId}/clues/${clue1Id}/discover`)
      .expect(200);

    assert.strictEqual(res.body.clue.discovered, true);
  });

  // 4. Save Valid Theory Links on Discovered Clue
  await t.test('PUT /api/cases/:id/board persists valid player theories linking discovered clue to suspect', async () => {
    const payload = {
      nodes: [
        { id: clue1Id, type: 'clue', note: 'Keycard access logs match time of breach' },
        { id: suspect1Id, type: 'suspect', note: 'Had physical access to sector' },
      ],
      edges: [
        {
          id: 'edge-theory-1',
          source: clue1Id,
          target: suspect1Id,
          label: 'contradicts statement',
          note: 'Suspect claimed to be in cafeteria during breach window',
        },
      ],
    };

    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send(payload)
      .expect(200);

    assert.ok(res.body.board);
    assert.strictEqual(res.body.board.nodes.length, 2);
    assert.strictEqual(res.body.board.edges.length, 1);
    assert.strictEqual(res.body.board.edges[0].label, 'contradicts statement');
    assert.strictEqual(res.body.board.edges[0].source, clue1Id);
    assert.strictEqual(res.body.board.edges[0].target, suspect1Id);
  });

  // 5. GET /api/cases/:id/board returns persisted state
  await t.test('GET /api/cases/:id/board retrieves persisted nodes and player hypotheses', async () => {
    const res = await request(app)
      .get(`/api/cases/${caseId}/board`)
      .expect(200);

    assert.strictEqual(res.body.board.nodes.length, 2);
    assert.strictEqual(res.body.board.edges.length, 1);
    assert.strictEqual(res.body.board.edges[0].id, 'edge-theory-1');
    assert.strictEqual(res.body.board.edges[0].note, 'Suspect claimed to be in cafeteria during breach window');
  });

  // 6. Reject Foreign Suspect Not Belonging to Case
  await t.test('PUT /api/cases/:id/board rejects foreign suspect with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send({
        nodes: [
          { id: clue1Id, type: 'clue' },
          { id: 'suspect_alien_infiltrator', type: 'suspect' },
        ],
        edges: [],
      })
      .expect(400);

    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.message.includes('Foreign suspect'));
  });

  // 7. Reject Edge referencing Unknown Target or Source
  await t.test('PUT /api/cases/:id/board rejects edge referencing non-existent node with 400', async () => {
    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send({
        nodes: [
          { id: clue1Id, type: 'clue' },
          { id: suspect1Id, type: 'suspect' },
        ],
        edges: [
          { id: 'edge-bad', source: clue1Id, target: 'phantom_node_id', label: 'unverified' },
        ],
      })
      .expect(400);

    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.message.includes('Edge target'));
  });

  // 8. Reject Invalid Node Type
  await t.test('PUT /api/cases/:id/board rejects invalid node type with 400', async () => {
    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send({
        nodes: [
          { id: clue1Id, type: 'weapon' }, // Invalid enum
        ],
        edges: [],
      })
      .expect(400);

    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 9. Reject Oversized Notes
  await t.test('PUT /api/cases/:id/board rejects node note exceeding 500 characters', async () => {
    const longNote = 'A'.repeat(501);
    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send({
        nodes: [
          { id: clue1Id, type: 'clue', note: longNote },
        ],
        edges: [],
      })
      .expect(400);

    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 10. Update/Remove Theory Connections
  await t.test('Player can update and remove theories without affecting clue data', async () => {
    // Remove the edge
    const res = await request(app)
      .put(`/api/cases/${caseId}/board`)
      .send({
        nodes: [
          { id: clue1Id, type: 'clue', note: 'Updated clue observation' },
          { id: suspect1Id, type: 'suspect' },
          { id: suspect2Id, type: 'suspect' },
        ],
        edges: [
          // Re-linked to suspect2 instead
          { id: 'edge-theory-2', source: clue1Id, target: suspect2Id, label: 'supports alibi' },
        ],
      })
      .expect(200);

    assert.strictEqual(res.body.board.edges.length, 1);
    assert.strictEqual(res.body.board.edges[0].target, suspect2Id);
    assert.strictEqual(res.body.board.edges[0].label, 'supports alibi');
  });

  // 11. Zero-Leakage & Scoring Independence
  await t.test('Evidence board operations NEVER alter score, hints, or leak solution', async () => {
    const caseRes = await request(app)
      .get(`/api/cases/${caseId}`)
      .expect(200);

    // Board in player-safe case
    assert.ok(caseRes.body.case.boardState);
    assert.strictEqual(caseRes.body.case.boardState.edges.length, 1);

    // Zero-leakage assertions: solution and score are never leaked in active case
    assert.strictEqual(caseRes.body.case.culpritId, undefined);
    assert.strictEqual(caseRes.body.case.solution, undefined);
    assert.strictEqual(caseRes.body.case.evidenceMapping, undefined);
    assert.strictEqual(caseRes.body.case.score, undefined, 'Active case DTO never leaks score');

    // Scoring untouched by board links
    assert.strictEqual(caseRes.body.case.progress.status, 'active');
    assert.strictEqual(caseRes.body.case.progress.hintsUsed, 0);
    assert.strictEqual(caseRes.body.case.progress.discoveredClueCount, 1);
  });

  // 12. Non-existent Case handling
  await t.test('GET and PUT /api/cases/:id/board reject non-existent case with 404', async () => {
    await request(app)
      .get('/api/cases/case_nonexistent_888/board')
      .expect(404);

    await request(app)
      .put('/api/cases/case_nonexistent_888/board')
      .send({ nodes: [], edges: [] })
      .expect(404);
  });
});

test('Unit Test: toPlayerSafeBoard filters undiscovered clues and orphaned edges', () => {
  const mockCaseDoc = {
    discoveredClueIds: ['clue_1'],
    boardState: {
      nodes: [
        { id: 'clue_1', type: 'clue' },
        { id: 'clue_2', type: 'clue' }, // Undiscovered!
        { id: 'suspect_1', type: 'suspect' },
      ],
      edges: [
        { id: 'edge_1', source: 'clue_1', target: 'suspect_1' },
        { id: 'edge_2', source: 'clue_2', target: 'suspect_1' }, // References undiscovered clue!
      ],
    },
  };

  const safeBoard = toPlayerSafeBoard(mockCaseDoc);

  assert.strictEqual(safeBoard.nodes.length, 2, 'Must only retain clue_1 and suspect_1');
  assert.strictEqual(safeBoard.nodes.some(n => n.id === 'clue_2'), false);
  assert.strictEqual(safeBoard.edges.length, 1, 'Must strip orphaned edge referencing clue_2');
  assert.strictEqual(safeBoard.edges[0].id, 'edge_1');
});
