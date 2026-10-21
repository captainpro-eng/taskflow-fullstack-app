const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('Tasks API Endpoints', async (t) => {
  const app = createApp(':memory:');
  let createdTaskId = null;

  await t.test('GET /api/tasks returns initial seeded tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.count > 0);
  });

  await t.test('POST /api/tasks creates a new task', async () => {
    const newTask = {
      title: 'Automated test task',
      description: 'Testing task creation flow',
      status: 'todo',
      priority: 'high',
      category: 'Work',
      dueDate: '2026-12-31',
      tags: ['test', 'qa'],
      subtasks: [
        { title: 'Subtask 1', completed: false },
        { title: 'Subtask 2', completed: true }
      ]
    };

    const res = await request(app)
      .post('/api/tasks')
      .send(newTask)
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Automated test task');
    assert.equal(res.body.data.status, 'todo');
    assert.equal(res.body.data.priority, 'high');
    assert.equal(res.body.data.category, 'Work');
    assert.deepEqual(res.body.data.tags, ['test', 'qa']);
    assert.equal(res.body.data.subtasks.length, 2);
    assert.equal(res.body.data.subtasks[1].completed, true);
    assert.ok(res.body.data.id);

    createdTaskId = res.body.data.id;
  });

  await t.test('POST /api/tasks rejects empty title with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '   ' })
      .expect(400);

    assert.equal(res.body.error, 'Validation Error');
  });

  await t.test('POST /api/tasks rejects invalid status with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Valid title', status: 'invalid_status' })
      .expect(400);

    assert.equal(res.body.error, 'Validation Error');
  });

  await t.test('POST /api/tasks rejects invalid priority with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Valid title', priority: 'extreme' })
      .expect(400);

    assert.equal(res.body.error, 'Validation Error');
  });

  await t.test('GET /api/tasks/:id retrieves created task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, createdTaskId);
    assert.equal(res.body.data.title, 'Automated test task');
  });

  await t.test('GET /api/tasks/:id returns 404 for non-existent ID', async () => {
    const res = await request(app)
      .get('/api/tasks/non-existent-uuid')
      .expect(404);

    assert.equal(res.body.error, 'Not Found');
  });

  await t.test('PUT /api/tasks/:id updates task fields', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .send({
        title: 'Updated test task title',
        priority: 'urgent',
        status: 'in_progress'
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Updated test task title');
    assert.equal(res.body.data.priority, 'urgent');
    assert.equal(res.body.data.status, 'in_progress');
  });

  await t.test('PATCH /api/tasks/:id/status updates status directly', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .send({ status: 'completed' })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'completed');
  });

  await t.test('PATCH /api/tasks/:id/status rejects invalid status with 400', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .send({ status: 'unknown' })
      .expect(400);

    assert.equal(res.body.error, 'Validation Error');
  });

  await t.test('PATCH /api/tasks/:id/subtasks updates subtasks list', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/subtasks`)
      .send({
        subtasks: [
          { title: 'Subtask A', completed: true },
          { title: 'Subtask B', completed: true }
        ]
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.subtasks.length, 2);
    assert.equal(res.body.data.subtasks[0].completed, true);
  });

  await t.test('Filtering tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=completed')
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.every(t => t.status === 'completed'));
  });

  await t.test('Filtering tasks by priority', async () => {
    const res = await request(app)
      .get('/api/tasks?priority=urgent')
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.every(t => t.priority === 'urgent'));
  });

  await t.test('Filtering tasks by search query', async () => {
    const res = await request(app)
      .get('/api/tasks?search=Updated test task')
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.count >= 1);
    assert.ok(res.body.data.some(t => t.title.includes('Updated test task')));
  });

  await t.test('DELETE /api/tasks/:id deletes the task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.id, createdTaskId);

    // Verify subsequent GET returns 404
    await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .expect(404);
  });

  await t.test('DELETE /api/tasks/:id returns 404 when deleting non-existent ID', async () => {
    const res = await request(app)
      .delete('/api/tasks/already-deleted-id')
      .expect(404);

    assert.equal(res.body.error, 'Not Found');
  });
});
