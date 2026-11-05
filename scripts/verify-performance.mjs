// Check the performance optimizations without an external browser or network.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const pages = [
  'index.html', 'team.html', 'blog.html', 'refer.html', 'projects.html',
  'partners.html', 'services.html', 'case-studies.html', 'seo-marketing.html',
  'ai-automation.html', 'web-development.html', 'ui-ux-3d-design.html',
  'digital-strategy.html'
];
const issues = [];
const assert = (pass, description) => {
  if (!pass) issues.push(description);
  console.log((pass ? 'PASS ' : 'FAIL ') + description);
};

const nav = read('scripts/instant-nav.js');
new vm.Script(nav, { filename: 'scripts/instant-nav.js' });
assert(!/eagerness\s*:\s*['"]immediate['"]/.test(nav), 'Navigation avoids immediate prerendering');
assert(!/topPages\.forEach/.test(nav), 'Navigation avoids automatic bulk page fetches');
assert(!/link\.rel\s*=\s*['"]prefetch['"]/.test(nav), 'Navigation does not duplicate prefetch with link and fetch');
assert(nav.includes("document.addEventListener('mouseover'"), 'Navigation prefetch is based on interaction');

for (const page of pages) {
  const html = read(page);
  assert(!/<script\s+type=['"]speculationrules['"]/.test(html), page + ': no blanket speculation rules');
  const snippets = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const [i, match] of snippets.entries()) {
    const attrs = match[1] || '';
    if (/\bsrc\s*=/.test(attrs) || /\btype\s*=\s*['"](application\/ld\+json|application\/json|speculationrules)['"]/.test(attrs)) continue;
    try {
      new vm.Script(match[2], { filename: page + ':script-' + i });
    } catch (error) {
      issues.push('Inline JavaScript parse failed in ' + page + ', script ' + i + ': ' + error.message);
    }
  }
}
const home = read('index.html');
const hero = home.match(/<video\b[^>]*appiex-hero-bg-video[^>]*>[\s\S]*?<\/video>/i)?.[0] || '';
assert(Boolean(hero), 'Homepage hero video exists');
assert(hero.includes('preload="none"') && !/\bautoplay\b/i.test(hero), 'Hero video is not preloaded or autoplayed before page ready');
assert(hero.includes('data-src="./assets/static/vde.webm"'), 'Hero video loads compressed WebM only when activated');
assert(hero.includes('data-src="./assets/static/vde.mp4"'), 'Hero video preserves MP4 fallback');
assert(hero.includes('poster="./assets/posters/vde-poster.webp"'), 'Hero poster is retained');
assert(!home.includes('gsap.min.js') && !home.includes('ScrollTrigger.min.js'), 'Homepage removes redundant animation libraries');
assert(!home.includes('<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>'), 'Lenis is not parser blocking');
assert(home.includes("window.__appiexLenisRequested"), 'Lenis dynamically loads only if required');
assert(home.includes('G-DF198MPZGT'), 'GA4 measurement is preserved');
assert(home.includes('<link rel="canonical" href="https://appiex.com/">'), 'Homepage canonical preserved');

const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert(urls.length >= 30, 'Sitemap retains its existing published URLs');
for (const url of urls) {
  if (!url.startsWith('https://appiex.com/')) {
    issues.push('Unexpected sitemap origin: ' + url);
    continue;
  }
  const p = url.slice('https://appiex.com/'.length) || 'index';
  if (![p + '.html', path.join(p, 'index.html')].some(x => fs.existsSync(path.join(root, x)))) {
    issues.push('Missing sitemap HTML file: ' + url);
  }
}
console.log('Checked ' + pages.length + ' pages and ' + urls.length + ' sitemap routes.');
if (issues.length) {
  console.error('Performance checks failed:\n' + issues.map(x => '- ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('All performance safety checks passed.');
}
