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

// Keep promises and AI-facing summaries grounded in evidence, not invented ranks.
const seoService = read('seo-marketing.html');
const aiSearchPage = read('ai-search-optimization.html');
const aiSummary = read('llms.txt');
assert(!seoService.includes('<span class="word-char">100/100</span>'), 'SEO hero promises a perfect score');
assert(!seoService.includes('Best Agency Award Winner'), 'SEO page contains unverified award claim');
assert(!seoService.includes('100/100 Lighthouse Benchmark'), 'SEO page contains an unverified perfect Lighthouse score');
assert(!aiSummary.includes('100/100 Core Web Vitals optimization'), 'AI-facing summary contains unverifiable guarantee');
assert(aiSearchPage.includes('id="google-ai-eligibility"'), 'Google AI search eligibility guidance is missing');
assert(aiSearchPage.includes('https://developers.google.com/search/docs/fundamentals/ai-optimization-guide'), 'Missing official guidance citation');
assert(aiSearchPage.includes('eligible to appear in Google Search with a snippet'), 'Google AI eligibility requirement missing');

console.log('AI search content, source schema, sitemap and internal link checks passed.');
