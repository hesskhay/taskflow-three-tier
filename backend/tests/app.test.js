import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function withServer(db, fn) {
  const server = createApp(db).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('liveness endpoint does not need a database', async () => {
  await withServer({ query: async () => { throw Error('should not query'); } }, async base => {
    const res = await fetch(`${base}/health/live`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'alive' });
  });
});

test('readiness endpoint reports database failure', async () => {
  await withServer({ query: async () => { throw Error('offline'); } }, async base => {
    const res = await fetch(`${base}/health/ready`);
    assert.equal(res.status, 503);
  });
});

test('task creation validates input', async () => {
  await withServer({ query: async () => { throw Error('should not query'); } }, async base => {
    const res = await fetch(`${base}/api/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: '' }) });
    assert.equal(res.status, 400);
  });
});

test('task listing returns mocked database rows', async () => {
  await withServer({ query: async () => ({ rows: [{ id: 1, title: 'Demo task' }] }) }, async base => {
    const res = await fetch(`${base}/api/tasks`);
    assert.deepEqual(await res.json(), [{ id: 1, title: 'Demo task' }]);
  });
});
