/**
 * Integration-style tests for admin middleware and visitors API.
 * Run with Node >=22 after npm ci; uses only local in-memory Request objects.
 */
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

process.env.ADMIN_KEY = 'ci-only-long-api-test-key-not-for-production-45a';
process.env.APPIEX_ADMIN_USER = 'ci-admin-user';
process.env.APPIEX_ADMIN_PASSWORD = 'ci-only-long-password-never-use-in-production';

const { middleware } = await import('../src/middleware.js');
const { GET, DELETE, POST } = await import('../src/app/api/visitors/route.js');
const { ADMIN_COOKIE_NAME, hasValidAdminSession } = await import('../src/lib/admin-session.js');
const request = (path, init = {}) => new NextRequest('https://appiex.com' + path, init);

let r = await middleware(request('/admin'));
assert.equal(r.status, 401, 'Unauthorized dashboard must challenge');
assert.match(r.headers.get('WWW-Authenticate') || '', /^Basic /);

r = await middleware(request('/admin', { headers: {
  authorization: 'Basic ' + btoa('ci-admin-user:bad-password')
}}));
assert.equal(r.status, 401, 'Wrong password denied');

r = await middleware(request('/admin', { headers: {
  authorization: 'Basic ' + btoa(process.env.APPIEX_ADMIN_USER + ':' + process.env.APPIEX_ADMIN_PASSWORD)
}}));
assert.equal(r.status, 200, 'Valid credentials allow admin');
assert.match(r.headers.get('set-cookie') || '', /HttpOnly/i);
assert.match(r.headers.get('set-cookie') || '', /SameSite=Strict/i);
assert.match(r.headers.get('set-cookie') || '', /Secure/i);
const setCookie = r.headers.get('set-cookie');
const cookie = setCookie.split(';')[0];
assert.ok(cookie.startsWith(ADMIN_COOKIE_NAME + '='));

const adminRequest = request('/admin', { headers: { cookie } });
assert.equal(await hasValidAdminSession(adminRequest), true, 'Signed admin cookie authenticates');
r = await middleware(adminRequest);
assert.equal(r.status, 200, 'Signed session allows dashboard');
assert.match(r.headers.get('Cache-Control') || '', /no-store/);

r = await GET(request('/api/visitors'));
assert.equal(r.status, 401, 'Unauthenticated API GET denied');

r = await GET(request('/api/visitors', { headers: { cookie } }));
assert.equal(r.status, 200, 'Authenticated browser can read visitor telemetry');
assert.match(r.headers.get('Cache-Control') || '', /no-store/);

r = await GET(request('/api/visitors', { headers: { 'x-admin-key': process.env.ADMIN_KEY } }));
assert.equal(r.status, 200, 'Private server-side API key still works');

r = await DELETE(request('/api/visitors', {
  method: 'DELETE',
  headers: { cookie, origin: 'https://evil.example' }
}));
assert.equal(r.status, 401, 'Cookie-authenticated DELETE blocks foreign origins');

r = await DELETE(request('/api/visitors', {
  method: 'DELETE',
  headers: { cookie, origin: 'https://appiex.com' }
}));
assert.equal(r.status, 200, 'Cookie-authenticated same-origin DELETE works');

r = await GET(request('/api/visitors', {
  headers: { cookie: cookie.replace(/.$/, cookie.endsWith('A') ? 'B' : 'A') }
}));
assert.equal(r.status, 401, 'Tampered cookie is rejected');

delete process.env.ADMIN_KEY;
r = await middleware(request('/admin'));
assert.equal(r.status, 503, 'Admin fails closed when key unconfigured');
assert.equal(await hasValidAdminSession(adminRequest), false, 'Session fails closed without secret');
console.log('Admin authentication, signed sessions, API access, and cache controls passed.');
