/**
 * HTTP integration tests against a real production-mode Next.js server.
 * Runs locally in CI after npm run build. No production credentials are used.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const base = 'http://127.0.0.1:3187';
const TEST_ENV = {
  ...process.env,
  ADMIN_KEY: 'ci-only-long-api-test-key-not-for-production-45a',
  APPIEX_ADMIN_USER: 'ci-admin-user',
  APPIEX_ADMIN_PASSWORD: 'ci-only-long-password-never-use-in-production'
};
const errors = [];
function spawnServer(env) {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3187', '--hostname', '127.0.0.1'], {
    env: { ...env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      const out = chunk.toString();
      if (/error|uncaught/i.test(out)) errors.push(out.slice(0, 700));
    });
  }
  return child;
}
async function ready(child) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Next.js stopped unexpectedly: ' + errors.join('\n'));
    try {
      const res = await fetch(base + '/robots.txt');
      if (res.status === 200) return;
    } catch {}
    await delay(300);
  }
  throw new Error('Next.js server did not start');
}
async function stop(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(5000)]);
  if (child.exitCode === null) child.kill('SIGKILL');
}
const api = async (path, options={}) => fetch(base + path, { redirect: 'follow', ...options });
let server;
try {
  // With missing credentials, admin must be inaccessible.
  const noSecrets = { ...process.env };
  delete noSecrets.ADMIN_KEY;
  delete noSecrets.APPIEX_ADMIN_USER;
  delete noSecrets.APPIEX_ADMIN_PASSWORD;
  server = spawnServer(noSecrets);
  await ready(server);
  let r = await api('/admin');
  assert.equal(r.status, 503, 'Admin must fail closed without secrets');
  await stop(server);

  server = spawnServer(TEST_ENV);
  await ready(server);

  r = await api('/admin');
  assert.equal(r.status, 401, 'Anonymous admin must be denied');
  assert.match(r.headers.get('www-authenticate') || '', /Basic/i);

  r = await api('/admin', {
    headers: { Authorization: 'Basic ' + Buffer.from('ci-admin-user:wrong').toString('base64') }
  });
  assert.equal(r.status, 401, 'Wrong admin password must be denied');

  const authHeader = 'Basic ' + Buffer.from(TEST_ENV.APPIEX_ADMIN_USER + ':' + TEST_ENV.APPIEX_ADMIN_PASSWORD).toString('base64');
  r = await api('/admin', { headers: { Authorization: authHeader } });
  assert.equal(r.status, 200, 'Correct admin credentials must succeed');
  assert.match(r.headers.get('cache-control') || '', /no-store/i, 'Admin HTML must not be cached');
  const setCookie = r.headers.get('set-cookie') || '';
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  assert.match(setCookie, /Secure/i);
  const cookie = setCookie.split(';')[0];
  assert.ok(cookie.startsWith('__Host-appiex_admin='));

  r = await api('/admin', { headers: { Cookie: cookie } });
  assert.equal(r.status, 200, 'Signed cookie must authorize browser admin');
  assert.match(r.headers.get('cache-control') || '', /no-store/i);

  r = await api('/api/visitors');
  assert.equal(r.status, 401, 'Anonymous visitor API must be denied');
  r = await api('/api/visitors', { headers: { Cookie: cookie } });
  assert.equal(r.status, 200, 'Admin browser cookie must allow visitor API GET');
  assert.match(r.headers.get('cache-control') || '', /no-store/i);

  r = await api('/api/visitors', { headers: { 'x-admin-key': TEST_ENV.ADMIN_KEY } });
  assert.equal(r.status, 200, 'Server private API key must still work');

  r = await api('/api/visitors', {
    method: 'DELETE', headers: { Cookie: cookie, Origin: 'https://evil.example' }
  });
  assert.equal(r.status, 401, 'Authenticated cookie cannot delete from foreign origin');

  r = await api('/api/visitors', {
    method: 'DELETE', headers: { Cookie: cookie, Origin: base }
  });
  assert.equal(r.status, 200, 'Authenticated same-origin admin can reset telemetry');

  const tampered = cookie.slice(0, -1) + (cookie.endsWith('A') ? 'B' : 'A');
  r = await api('/api/visitors', { headers: { Cookie: tampered } });
  assert.equal(r.status, 401, 'Tampered admin session must be denied');

  console.log('PASS: live admin fail-closed, login, signed cookies, protected API, CSRF and caching');
} finally {
  await stop(server);
}
