const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('Categories API Endpoints', async (t) => {
  const app = createApp(':memory:');

  await t.test('GET /api/categories returns default categories with task counts', async () => {
    const res = await request(app)
      .get('/api/categories')
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 4);

    const workCat = res.body.data.find(c => c.name === 'Work');
    assert.ok(workCat);
    assert.ok(typeof workCat.taskCount === 'number');
  });

  await t.test('POST /api/categories creates a new category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({
        name: 'Quality Assurance',
        color: '#6366f1',
        icon: 'check-circle'
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Quality Assurance');
    assert.equal(res.body.data.color, '#6366f1');
    assert.equal(res.body.data.taskCount, 0);
  });

  await t.test('POST /api/categories rejects duplicate category name with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({
        name: 'Quality Assurance',
        color: '#6366f1'
      })
      .expect(409);

    assert.equal(res.body.error, 'Conflict');
  });

  await t.test('POST /api/categories rejects missing name with 400', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({
        color: '#6366f1'
      })
      .expect(400);

    assert.equal(res.body.error, 'Validation Error');
  });
});
