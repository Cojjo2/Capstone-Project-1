// backend/src/tests/api.smoke.test.js
// Minimal backend smoke tests using Node's built-in test runner (Node 22+).
// This pings your running API; it does NOT import any of your source files.

import test from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_BASE || 'http://localhost:5000/api';

test('GET /ingredients returns JSON list', async () => {
  const res = await fetch(`${API}/ingredients`);
  assert.equal(res.ok, true, `Expected 2xx, got ${res.status}`);

  const ct = res.headers.get('content-type') || '';
  assert.match(ct, /application\/json/i, 'content-type should be JSON');

  const body = await res.json().catch(() => null);
  assert.ok(body, 'Response should be JSON parseable');

  const items = Array.isArray(body?.items) ? body.items : (Array.isArray(body) ? body : []);
  assert.ok(Array.isArray(items), 'Expected an items array');
});

test('GET /products returns JSON list', async () => {
  const res = await fetch(`${API}/products`);
  assert.equal(res.ok, true, `Expected 2xx, got ${res.status}`);

  const body = await res.json().catch(() => null);
  assert.ok(body, 'Response should be JSON parseable');

  const items = Array.isArray(body?.items) ? body.items : (Array.isArray(body) ? body : []);
  assert.ok(Array.isArray(items), 'Expected an items array');
});

test('GET /dogs requires auth (401)', async () => {
  const res = await fetch(`${API}/dogs`);
  assert.equal(res.status, 401, `Expected 401, got ${res.status}`);

  const body = await res.json().catch(() => null);
  assert.ok(body?.error?.code === 'AUTH_REQUIRED', 'Should return AUTH_REQUIRED');
});
