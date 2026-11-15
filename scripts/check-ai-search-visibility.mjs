import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const sitemap = read('sitemap.xml');
const pages = [
  ['ai-search-optimization', 'AI Search Optimization (AEO & GEO) Services | Appiex'],
  ['ai-search-readiness-checklist', 'AI Search Readiness Checklist: SEO, GEO & AEO | Appiex']
];
for (const [slug, title] of pages) {
  const html = read(slug + '.html');
  const canonical = 'https://appiex.com/' + slug;
  assert(html.includes('<title>' + title.replaceAll('&', '&amp;') + '</title>'), slug + ': title missing');
  assert(html.includes('<link rel="canonical" href="' + canonical + '">'), slug + ': canonical missing');
  assert(/<meta name="robots" content="index, follow/.test(html), slug + ': noindex or missing robots');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, slug + ': expected exactly one H1');
  assert((html.match(/<h2\b/g) || []).length >= 3, slug + ': insufficient structured sections');
  assert(sitemap.includes('<loc>' + canonical + '</loc>'), slug + ': sitemap missing URL');
  assert(html.includes('https://appiex.com/images/appiex-logo.png'), slug + ': missing social image');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]);
    assert(data['@context'] === 'https://schema.org', slug + ': schema context mismatch');
  }
}
const linkPages = ['index.html','services.html','blog.html','seo-marketing.html'];
for (const p of linkPages) {
  const html=read(p);
  for (const [slug] of pages) {
    assert(html.includes('href="/' + slug + '"'), p + ' missing internal link to ' + slug);
  }
}
assert(read('ai-automation.html').includes('ai-automation-buyer-answers'), 'AI automation buyer Q&A missing');
assert(read('web-development.html').includes('web-development-buyer-answers'), 'Web development buyer Q&A missing');
assert(read('seo-marketing.html').includes('aeo-geo-search'), 'SEO/AEO/GEO service section missing');
assert(read('docs/seo-organic-growth-playbook-2026.md').includes('Reddit'), 'Distribution guidance missing');
console.log('AI search content, source schema, sitemap and internal link checks passed.');
