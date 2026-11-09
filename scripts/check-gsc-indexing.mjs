import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from '../next.config.mjs';

// Guardrails based on Nov 9, 2026 Search Console exclusion exports.
// An exclusion is not necessarily an error; redirects, canonical variants,
// private noindex routes and removed pages should not be forced into the index.
const redirects = await config.redirects();
const to = new Map(redirects.map(r => [r.source, r.destination]));
const required = {
  '/index':'/',
  '/index.html':'/',
  '/legal/terms-of-service':'/terms-of-service',
  '/legal/privacy-policy':'/privacy-policy',
  '/legal/legal-license':'/terms-of-service',
  '/about':'/team',
  '/journal':'/blog',
  '/gallery':'/projects',
  '/protocol':'/projects',
  '/media':'/projects',
  '/pages/product-design.html':'/ui-ux-3d-design',
  '/pages/contacts.html':'/#contact',
  '/pages/product-design':'/ui-ux-3d-design',
  '/pages/contacts':'/#contact'
};
for(const [source, destination] of Object.entries(required)) {
  assert.equal(to.get(source), destination, 'Wrong legacy redirect for '+source);
  assert.equal(redirects.find(r=>r.source===source)?.permanent, true,
    'Legacy redirect must be permanent for '+source);
}
const generalHtmlIndex = redirects.findIndex(r=>r.source.includes('\\.html'));
assert(generalHtmlIndex >= 0, 'Missing general .html canonicalization');
for(const route of ['/pages/product-design.html','/pages/contacts.html']) {
  assert(redirects.findIndex(r=>r.source===route)<generalHtmlIndex,
    'Direct redirect must come before generic .html rule: '+route);
}
const sitemap = fs.readFileSync('sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert(urls.length>=45,'Sitemap needs a curated set of indexable pages');
assert.equal(new Set(urls).size,urls.length,'No duplicate sitemap URLs');
for(const url of urls) {
  assert(!/\.html(?:$|\?)/.test(url),'Keep .html aliases out of sitemap: '+url);
  assert(!url.includes('?'),'Keep query variants out of sitemap: '+url);
  assert(!url.includes('/index'),'Do not list duplicate /index route');
}
const gaming=fs.readFileSync('gaming.html','utf8');
const gamingHead=gaming.slice(0,gaming.indexOf('</head>'));
assert(/<meta name="robots" content="index, follow/.test(gamingHead),
  'Gaming must be indexable (Google reported earlier noindex)');
assert(gamingHead.includes('rel="canonical" href="https://appiex.com/gaming"'),
  'Gaming canonical must be extensionless');
assert(urls.includes('https://appiex.com/gaming'),'Gaming must remain in sitemap');
const privatePage=fs.readFileSync('profile.html','utf8');
assert(/<meta name="robots" content="noindex/.test(privatePage),
  'Private partner profile intentionally remains noindex');
const draft = fs.readFileSync('blog/cuberto-mouse-follower.html','utf8');
assert(/<meta name="robots" content="noindex/.test(draft),
  'Unreviewed/draft blog pages must not be bulk-indexed');
assert(!urls.includes('https://appiex.com/blog/cuberto-mouse-follower'),
  'Noindex draft must remain out of sitemap');
const robots=fs.readFileSync('robots.txt','utf8');
assert(robots.includes('Sitemap: https://appiex.com/sitemap.xml'),
  'robots.txt must link the canonical sitemap');
const nav=fs.readFileSync('scripts/instant-nav.js','utf8');
assert(nav.includes("spec.type = 'speculationrules'"),'Keep curated prefetch');
assert(!nav.includes('href_matches:'),
  'Avoid dynamic path wildcards appearing as misleading crawled URLs');
const specStart=nav.indexOf("spec.type = 'speculationrules'");
const specEnd=nav.indexOf('document.head.appendChild(spec)',specStart);
assert(specEnd>specStart,'SpeculationRules block missing');
const specRules=nav.slice(specStart,specEnd);
assert(!specRules.includes("'/login',"),'Do not prefetch the private login route');

// Confirm absent, unrelated legacy URLs are not redirected to the homepage.
// Google's recommended response for genuinely gone content is 404/410.
for(const orphan of ['/pages/flipaclip','/pages/sca','/pages/puntopago',
 '/pages/cisco','/assets/unseen/theme']) {
  assert(!to.has(orphan), 'Do not map unrelated removed content to /: '+orphan);
}
console.log('GSC indexing guardrails PASS: clean canonical sitemap, indexable /gaming, safe noindex preservation, precise legacy redirects, no broad prefetch URL patterns.');
