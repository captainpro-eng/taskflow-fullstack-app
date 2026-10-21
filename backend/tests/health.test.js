const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('Health API Endpoints', async (t) => {
  const app = createApp(':memory:');

  await t.test('GET /api/health should return ok and database connected', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database, 'connected');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(res.body.timestamp);
  });

  await t.test('GET /api/unknown should return 404', async () => {
    const res = await request(app)
      .get('/api/non-existent-route')
      .expect(404);

    assert.equal(res.body.error, 'Not Found');
  });
});
