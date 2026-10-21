const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('Stats API Endpoints', async (t) => {
  const app = createApp(':memory:');

  await t.test('GET /api/stats returns accurate task metrics', async () => {
    const res = await request(app)
      .get('/api/stats')
      .expect(200);

    assert.equal(res.body.success, true);
    const { data } = res.body;

    assert.ok(typeof data.total === 'number');
    assert.ok(typeof data.completed === 'number');
    assert.ok(typeof data.inProgress === 'number');
    assert.ok(typeof data.review === 'number');
    assert.ok(typeof data.todo === 'number');
    assert.ok(typeof data.overdue === 'number');
    assert.ok(typeof data.completionRate === 'number');

    assert.equal(
      data.total,
      data.completed + data.inProgress + data.review + data.todo
    );

    assert.ok(data.byStatus);
    assert.ok(data.byPriority);
    assert.equal(
      data.total,
      data.byPriority.urgent + data.byPriority.high + data.byPriority.medium + data.byPriority.low
    );
  });
});
