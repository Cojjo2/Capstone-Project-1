// frontend/tests/Header.test.mjs
// Static smoke test: read the Header.js source and assert that
// key nav links and labels are present. This avoids executing JSX.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const HEADER_PATH = resolve(__dirname, '../components/Header.js');

test('Header contains key nav links and labels (static check)', async () => {
  const src = await readFile(HEADER_PATH, 'utf8');

  // project title
  assert.match(src, /Pup Pantry/, 'should show site title "Pup Pantry"');

  // main nav links
  assert.match(src, /<Link[^>]+href=["'`]\/["'`]/, 'has Home link');
  assert.match(src, /<Link[^>]+href=["'`]\/products["'`]/, 'has Products link');
  assert.match(src, /<Link[^>]+href=["'`]\/stores["'`]/, 'has Stores link');
  assert.match(src, /<Link[^>]+href=["'`]\/brands["'`]/, 'has Brands link');
  assert.match(src, /<Link[^>]+href=["'`]\/ingredients["'`]/, 'has Ingredients link');
  assert.match(src, /<Link[^>]+href=["'`]\/favorites["'`]/, 'has Favorites link');
  assert.match(src, /<Link[^>]+href=["'`]\/dogs["'`]/, 'has Dogs link');
  assert.match(src, /<Link[^>]+href=["'`]\/profile["'`]/, 'has Profile link');

  // login/register (may be conditional, just ensure references exist)
  assert.match(src, /<Link[^>]+href=["'`]\/login["'`]/, 'has Login link');
  assert.match(src, /<Link[^>]+href=["'`]\/register["'`]/, 'has Register link');

  // API base url display
  assert.match(
    src,
    /process\.env\.NEXT_PUBLIC_API_BASE_URL/,
    'prints NEXT_PUBLIC_API_BASE_URL somewhere in Header'
  );
});
