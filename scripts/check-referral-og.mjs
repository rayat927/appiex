import assert from 'node:assert/strict';
import fs from 'node:fs';
const imagePath = 'public/images/appiex-referral-linkedin.png';
const source = fs.readFileSync('refer.html', 'utf8');
const head = source.slice(0, source.indexOf('</head>'));
const link = 'https://appiex.com/images/appiex-referral-linkedin.png';
const all = type => [...head.matchAll(new RegExp('<meta\\b[^>]*(?:property|name)="' + type + '"[^>]*>', 'gi'))].map(m => m[0]);
for (const key of ['og:url', 'og:title', 'og:description', 'og:image', 'og:image:width', 'og:image:height', 'twitter:card', 'twitter:image']) {
  assert.equal(all(key).length, 1, key + ' missing or duplicated');
}
assert(head.includes('property="og:url" content="https://appiex.com/refer"'), 'Bad shared URL');
assert(head.includes('property="og:image" content="' + link + '"'), 'Wrong social poster URL');
assert(head.includes('name="twitter:image" content="' + link + '"'), 'Twitter image differs');
assert(head.includes('name="twitter:card" content="summary_large_image"'), 'Large image card missing');
assert(head.includes('property="og:image:type" content="image/png"'), 'Wrong image MIME type');
assert(head.includes('name="twitter:image:alt"'), 'Twitter image alt missing');
assert(head.includes('property="og:image:alt"'), 'OG image alt missing');
assert(fs.existsSync(imagePath), 'Static referral poster not generated before build');
const png = fs.readFileSync(imagePath);
const sig = Buffer.from([137,80,78,71,13,10,26,10]);
assert(png.subarray(0,8).equals(sig), 'Image is not a valid PNG');
const w=png.readUInt32BE(16), h=png.readUInt32BE(20);
assert.equal(w,1200,'OG image width wrong');
assert.equal(h,630,'OG image height wrong');
assert(png.length < 5_000_000, 'OG image should be under 5 MB');
console.log('[Referral OG] 1200x630 PNG, correct metadata, accessible path in public, under 5 MB');
