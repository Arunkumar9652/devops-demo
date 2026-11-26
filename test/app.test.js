// Tests use Node's built-in test runner: run with `npm test`
const test = require('node:test');
const assert = require('node:assert');
const server = require('../app');

let base;

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

test.after(() => server.close());

test('home page returns 200', async () => {
  const res = await fetch(base + '/');
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /Hello from my DevOps pipeline/);
});

test('health check returns ok', async () => {
  const res = await fetch(base + '/health');
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.status, 'ok');
});

test('unknown page returns 404', async () => {
  const res = await fetch(base + '/nope');
  assert.strictEqual(res.status, 404);
});
