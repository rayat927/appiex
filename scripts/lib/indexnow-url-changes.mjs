// Pure helpers for IndexNow URL discovery. Do not submit draft, private, or noindex URLs.
const HOST = 'https://appiex.com';
export const SITE_ORIGIN = HOST;

export function sitemapEntries(xml) {
  const records = new Map();
  for (const match of String(xml).matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const urlXml = match[1];
    const loc = urlXml.match(/<loc>\s*([^<]+)\s*<\/loc>/i)?.[1]?.trim();
    if (!loc) continue;
    let url;
    try {url=new URL(loc);} catch {continue;}
    if (url.origin!==HOST || url.search || url.hash || url.pathname.endsWith('.html')) continue;
    const normalized=HOST+url.pathname;
    const lastmod=urlXml.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i)?.[1]?.trim()||'';
    records.set(normalized,lastmod);
  }
  return records;
}

export function sourceToCanonical(filename) {
  const file=String(filename||'').replaceAll('\\','/');
  if (file==='index.html') return HOST+'/';
  if (!/^(?:blog\/|authors\/)?[a-z0-9][a-z0-9/-]*\.html$/i.test(file)) return null;
  const path=file.slice(0,-'.html'.length);
  if (path.includes('/index')) return null;
  return HOST+'/'+path;
}

export function URLsToNotify({current,previous,changedFiles,all=false}) {
  if (!(current instanceof Map) || !(previous instanceof Map)) throw TypeError('Expected sitemap entry Maps');
  const changed=new Set(changedFiles||[]);
  const globalChange=[
    'scripts/submit-indexnow.mjs',
    'scripts/lib/indexnow-url-changes.mjs',
    'src/lib/appiex-html-polish.mjs',
    'scripts/apply-sitewide-seo.mjs',
    'robots.txt'
  ].some(p=>changed.has(p));

  if(all||globalChange) return [...current.keys()].sort();

  const candidates=new Set();
  for(const file of changed){
    const mapped=sourceToCanonical(file);
    if(mapped && current.has(mapped)) candidates.add(mapped);
  }
  if(changed.has('sitemap.xml')){
    for(const [url,lastmod] of current){
      if(!previous.has(url) || previous.get(url)!==lastmod) candidates.add(url);
    }
  }
  // URLs removed from the sitemap should not be announced without verifying
  // their new production status (404, 410, or a redirect).
  return [...candidates].sort();
}
