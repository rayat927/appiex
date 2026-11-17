import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const read = file => fs.readFileSync(file, 'utf8');
const home = read('index.html');
const ai = read('ai-automation.html');
const web = read('web-development.html');
const referral = read('refer.html');
const wizard = read('start-project.html');
const wizardJs = read('scripts/start-project-funnel.js');
const orders = read('src/app/api/orders/route.js');
const sales = read('src/app/api/sales/route.js');
const visitors = read('src/app/api/visitors/route.js');
const referralApi = read('src/app/api/referrals/route.js');
const middleware = read('src/middleware.js');
const privacy = read('privacy-policy.html');

assert.equal((home.match(/<h1\\b/g) || []).length, 1, 'Homepage must retain one H1');
assert(home.includes('Websites, Ecommerce &amp; AI Automation'), 'Homepage buyer-focused hero missing');
assert(home.includes("appiex:lead_received"), 'Confirmed-homepage lead event missing');
assert(home.includes('const resp = await fetch(\'/api/orders\''), 'Homepage lead response not awaited');
assert(!home.includes('This site is protected by reCAPTCHA'), 'False reCAPTCHA disclosure remains');

assert(!web.includes('Best Agency Award Winner'), 'Unsubstantiated award badge remains');
assert(!web.includes('prestigious</span>'), 'Unsubstantiated award claim remains');
assert(!web.includes('95+ Core Web Vitals'), 'Misleading performance promise remains');
assert(!ai.includes('Trusted by startups and global product teams'), 'Technology badges imply endorsements');
assert(ai.includes('logos identify technologies') || ai.includes('logos identify technologies'.replace('logos','logos')), 'Technology disclaimer missing');
assert(!ai.includes('<strong>90%</strong><br> <small>Faster customer replies</small>'), 'Unverified AI result remains');
assert(!ai.includes('<strong>100+</strong><br> <small>AI workflows delivered</small>'), 'Unverified AI delivery count remains');

assert(referral.includes("fetch('/api/referrals'"), 'Referral not submitted to private API');
assert(referral.includes('id="ref-consent"'), 'Referral consent control missing');
assert(referral.includes('id="ref-email"'), 'Referrer contact email missing');
assert(!referral.includes('appiex_admin_referrals_v2'), 'Referral PII still saved in localStorage');
assert(!referral.includes('saveReferralLead('), 'Unconfirmed Firebase referral fallback remains');
assert(!referral.includes('id="ref-bkash"'), 'Public form asks for payout account');
assert(!referral.includes('15% INSTANT PAYOUT'), 'Instant commission claim remains');
assert(referral.includes('hypothetical'), 'Commission examples must not be presented as actual deals');
assert(referral.includes('status.textContent = \'Referral received for review.'), 'Referral receipt not confirmation-specific');

assert(wizard.includes('id="funnel-submit"') && wizard.includes('id="funnel-consent"'), 'Consented wizard submission missing');
assert(wizardJs.includes("fetch('/api/orders'"), 'Wizard server submission missing');
assert(wizardJs.includes("appiex_funnel_lead_received"), 'Wizard confirmed lead event missing');
assert(!wizardJs.includes('localStorage') && !wizardJs.includes('sessionStorage'), 'Wizard stores personal data in browser');
assert(!wizardJs.includes("track('generate_lead'"), 'Wizard counts contact handoff as lead');
assert(privacy.includes('Project enquiries and referral submissions'), 'Privacy notice not updated');

for (const [name, source] of [['orders', orders], ['sales', sales], ['visitors', visitors]]) {
  assert(!source.includes('ntfy.sh'), name + ': customer/financial data sent to public stream');
  assert(source.includes('isAdminAuthorized'), name + ': missing server access check');
}
assert(orders.includes("if (!isAdminAuthorized(req))"), 'Orders GET not private');
assert(orders.includes('Durable lead storage'), 'Orders API missing fail-closed durable storage');
assert(referralApi.includes('HSET') && referralApi.includes('isAdminAuthorized'), 'Referrals lack durable private storage');
assert(referralApi.includes('body.consent !== true'), 'Referral API must enforce permission');
assert(!referralApi.includes('ntfy.sh'), 'Referral API broadcasts PII');
assert(middleware.includes('protectedRoute'), 'Missing admin access middleware');
assert(middleware.includes('/api'), 'API middleware routing missing');
assert(!read('admin.html').includes('rtx5090'), 'Client-side admin password exposed');
assert(!read('admin/index.html').includes('rtx5090'), 'Client-side admin password exposed');

for (const [name, html, handler] of [
  ['homepage', home, 'handleContactSubmit'],
  ['referral', referral, 'handleReferralSubmit']
]) {
  const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)]
    .map(match => match[1]).filter(source => source.includes('function ' + handler));
  assert.equal(scripts.length, 1, 'Expected a single inline ' + name + ' handler');
  new vm.Script(scripts[0], { filename: name + '-inline.js' });
}
for (const file of [
  'scripts/start-project-funnel.js',
  'src/app/api/orders/route.js',
  'src/app/api/sales/route.js',
  'src/app/api/visitors/route.js',
  'src/app/api/referrals/route.js',
  'src/middleware.js',
  'src/lib/admin-auth.mjs'
]) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
console.log('PASS Appiex buyer trust, lead-confirmation, referral consent, security, and JavaScript syntax checks.');
