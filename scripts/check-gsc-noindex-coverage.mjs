/**
 * Search Console noindex regression guard.
 * Ensures the indexable blog URLs we submit in sitemap.xml never ship
 * a noindex directive, while private portals keep their protections.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nextConfig from '../next.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://appiex.com';
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(sitemapUrls.length > 10, 'Sitemap is missing expected public URLs');
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'Duplicate sitemap URLs');

for (const url of sitemapUrls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, origin, 'Sitemap contains an off-domain URL: ' + url);
  assert(!parsed.pathname.endsWith('.html'), 'Sitemap contains legacy .html alias: ' + url);
  assert(!['/login', '/profile', '/collections', '/admin'].includes(parsed.pathname),
    'Sitemap contains a private page: ' + url);
}

let checkedBlogPages = 0;
for (const url of sitemapUrls.filter(url => url.startsWith(origin + '/blog/'))) {
  const pathname = new URL(url).pathname;
  const file = path.join(root, pathname.slice(1) + '.html');
  assert(fs.existsSync(file), 'Sitemap blog destination missing HTML: ' + pathname);
  const html = fs.readFileSync(file, 'utf8');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const robots = head.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i)?.[0] || '';
  const canonical = head.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0] || '';
  assert(!/noindex/i.test(robots), 'Sitemap page is noindex: ' + pathname);
  assert(canonical.includes('href="' + url + '"'), 'Sitemap page has wrong canonical: ' + pathname);
  checkedBlogPages++;
}
assert(checkedBlogPages > 10, 'No blog URL assertions ran');

for (const name of ['login', 'profile', 'collections']) {
  const html = fs.readFileSync(path.join(root, name + '.html'), 'utf8');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const robots = head.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i)?.[0] || '';
  assert(/noindex/i.test(robots), 'Private page lost noindex: /' + name);
}

const redirects = await nextConfig.redirects();
assert(redirects.some(rule =>
  rule.source === '/blog/:slug\\.html' &&
  rule.destination === '/blog/:slug' &&
  rule.permanent === true
), 'Missing permanent redirect from /blog/article.html to /blog/article');

const headerRules = await nextConfig.headers();
assert(headerRules.some(rule =>
  String(rule.source).includes('login|profile|collections') &&
  rule.headers.some(header => header.key.toLowerCase() === 'x-robots-tag' &&
    /noindex/i.test(header.value))
), 'Private page noindex header protection was removed');

console.log('[GSC noindex guard] PASS:', checkedBlogPages,
  'indexable blog URLs,', sitemapUrls.length,
  'canonical sitemap URLs, protected private routes, and blog .html redirects.');
