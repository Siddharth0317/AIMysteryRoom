import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';

test('GET /api/health returns 200 OK with expected payload', async () => {
  const response = await request(app)
    .get('/api/health')
    .expect(200);

  assert.strictEqual(response.body.status, 'ok');
  assert.strictEqual(response.body.service, 'AI Mystery Room API');
  assert.ok(response.body.timestamp);
});
