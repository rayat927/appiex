import assert from 'node:assert/strict';
import fs from 'node:fs';
import { adminAuthConfigured, isAdminAuthorized } from '../src/lib/admin-auth.mjs';

const read = (file) => fs.readFileSync(file, 'utf8');
const orderApi = read('src/app/api/orders/route.js');
const salesApi = read('src/app/api/sales/route.js');
const visitorApi = read('src/app/api/visitors/route.js');
const middleware = read('src/middleware.js');
const home = read('index.html');
const tracker = read('scripts/seo-conversion-tracker.js');

for (const [label, source] of [['orders', orderApi], ['sales', salesApi], ['visitors', visitorApi]]) {
  assert(!source.includes('https://ntfy.sh/'), label + ': public notification streaming is unsafe');
  assert(source.includes('isAdminAuthorized'), label + ': missing server authentication');
}
assert(!visitorApi.includes("process.env.ADMIN_KEY ||"), 'Hardcoded admin secret fallback');
assert(!read('admin.html').includes('rtx5090'), 'Admin HTML must not expose a password');
assert(!read('admin/index.html').includes('rtx5090'), 'Admin index must not expose a password');
assert(middleware.includes('protectedRoute'), 'Missing middleware access guard');
assert(orderApi.includes('Durable lead storage'), 'Lead storage must fail closed when unavailable');
assert(home.includes('value="ai-automation"') && home.includes('value="seo-growth"'), 'Core service choices absent');
assert(home.includes('You will need to press Send in WhatsApp'), 'WhatsApp delivery disclosure missing');
assert(!home.includes('This site is protected by reCAPTCHA'), 'False reCAPTCHA disclosure');
assert(tracker.includes("window.addEventListener('appiex:lead_received'"), 'Confirmed lead tracking missing');

const savedUser = process.env.APPIEX_ADMIN_BASIC_USER;
const savedPass = process.env.APPIEX_ADMIN_BASIC_PASSWORD;
try {
  delete process.env.APPIEX_ADMIN_BASIC_USER;
  delete process.env.APPIEX_ADMIN_BASIC_PASSWORD;
  assert(!adminAuthConfigured(), 'Auth must fail closed if no environment secret');
  assert(!isAdminAuthorized(new Request('https://appiex.com/api/orders')), 'Unconfigured admin must be denied');
  process.env.APPIEX_ADMIN_BASIC_USER = 'test_admin';
  process.env.APPIEX_ADMIN_BASIC_PASSWORD = 'test_password_not_a_secret';
  assert(!isAdminAuthorized(new Request('https://appiex.com/api/orders')), 'Anonymous admin access denied');
  const bad = new Request('https://appiex.com/api/orders', {headers: {authorization: 'Basic ' + btoa('test_admin:bad')}});
  assert(!isAdminAuthorized(bad), 'Incorrect password must be rejected');
  const good = new Request('https://appiex.com/api/orders', {headers: {authorization: 'Basic ' + btoa('test_admin:test_password_not_a_secret')}});
  assert(isAdminAuthorized(good), 'Configured credentials should authorize');
} finally {
  if (savedUser === undefined) delete process.env.APPIEX_ADMIN_BASIC_USER;
  else process.env.APPIEX_ADMIN_BASIC_USER = savedUser;
  if (savedPass === undefined) delete process.env.APPIEX_ADMIN_BASIC_PASSWORD;
  else process.env.APPIEX_ADMIN_BASIC_PASSWORD = savedPass;
}
console.log('Appiex security and lead integrity checks passed.');
