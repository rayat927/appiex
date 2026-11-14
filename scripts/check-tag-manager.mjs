import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installTagManager } from '../src/lib/appiex-tag-manager.mjs';

const pages = [
  ['index.html', [], false],
  ['ai-automation.html', ['ai-automation'], true],
  ['ui-ux-3d-design.html', ['ui-ux-3d-design'], true],
  ['digital-strategy.html', ['digital-strategy'], true],
  ['case-studies.html', ['case-studies'], true],
  ['gaming.html', ['gaming'], false],
  ['web-development.html', ['web-development'], false],
  ['blog.html', ['blog'], false],
  ['blog/ai-automation.html', ['blog', 'ai-automation'], false]
];

for (const [filename, route, hasLegacyGTM] of pages) {
  const original = fs.readFileSync(filename, 'utf8');
  const tagged = installTagManager(original, route);
  assert.equal((tagged.match(/gtm\.js\?id=GTM-PTCQ98DC/g) || []).length, 1,
    filename + ': expected one Tag Manager loader');
  assert.equal(installTagManager(tagged, route), tagged,
    filename + ': repeated rendering should not duplicate tags');
  assert(!tagged.includes('GTM-T9VW8G26'), filename + ': legacy GTM remains');
  if (hasLegacyGTM) {
    assert(original.includes('GTM-T9VW8G26'), filename + ': expected legacy source tag');
  }
  assert.equal((tagged.match(/gtag\/js\?id=G-DF198MPZGT/g) || []).length,
    (original.match(/gtag\/js\?id=G-DF198MPZGT/g) || []).length,
    filename + ': existing GA4 loader must be preserved');
}

for (const route of ['admin', 'login', 'profile', 'resume', 'collections', 'rafsan_page']) {
  const input = '<html><head><title>Private</title></head><body>Private</body></html>';
  assert.equal(installTagManager(input, [route]), input,
    route + ': private routes should remain untagged');
}

const tracker = fs.readFileSync('scripts/seo-conversion-tracker.js', 'utf8');
assert(tracker.includes("entry[0] === 'config' && entry[1] === ga4Id"),
  'Tracker must detect an existing homepage GA4 config');
assert(tracker.includes('if (!excludedPage && !ga4Configured)'),
  'Tracker must initialize GA4 even when GTM has provided gtag()');
console.log('Tag Manager and existing GA4 integration checks passed.');
