import assert from 'node:assert/strict';

// Public, anonymous smoke test. Never retrieve customer records or require secrets.
// This verifies the deployed domain rather than assuming that a merged PR is live.
const host = 'https://appiex.com';
const expected = [
  {path: '/', marker: 'ai-search-home-discovery'},
  {path: '/seo-marketing', marker: 'aeo-geo-search'},
  {path: '/ai-automation', marker: 'ai-automation-buyer-answers'},
  {path: '/web-development', marker: 'web-development-buyer-answers'},
  {path: '/ai-search-optimization', marker: 'AI Search Optimization'},
  {path: '/ai-search-readiness-checklist', marker: 'AI Search Readiness Checklist'}
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fetchPublic(path) {
  const url = host + path + (path.includes('?') ? '&' : '?') + 'appiex_release_check=' + encodeURIComponent(process.env.GITHUB_SHA || 'manual');
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: {'User-Agent':'Appiex-Live-SEO-Release-Check/1.0', 'Cache-Control':'no-cache'},
        signal: AbortSignal.timeout(16000)
      });
      const body = await response.text();
      if (response.status === 200 && body.length > 100) return {response,body};
      if (attempt === 4) throw Error('HTTP '+response.status+' at '+path);
    } catch (e) {
      if (attempt === 4) throw e;
    }
    await sleep(attempt * 2000);
  }
}

let pages=0;
for (const {path,marker} of expected) {
  const {response,body} = await fetchPublic(path);
  const cleanPath = path === '/' ? '/' : path;
  const canonical = host + cleanPath;
  assert(body.includes(marker), path+': release marker missing on production');
  assert(body.includes('href="'+canonical+'"'),path+': canonical missing');
  assert(/<h1\\b/i.test(body),path+': H1 missing');
  const head = body.split('</head>')[0] || '';
  assert(!/<meta\\s+name=['"]robots['"]\\s+content=['"][^'"]*noindex/i.test(head),path+': noindex on commercial page');
  console.log('PASS', path, response.status,'bytes',body.length);
  pages++;
}

const sitemap=await fetchPublic('/sitemap.xml');
for (const page of expected.slice(-2)) {
  assert(sitemap.body.includes('<loc>'+host+page.path+'</loc>'), 'sitemap missing '+page.path);
}
const urlCount=(sitemap.body.match(/<loc>/g)||[]).length;
assert(urlCount >= 48,'sitemap should contain at least 48 canonical URLs');
const robots=await fetchPublic('/robots.txt');
assert(robots.body.includes('Sitemap: https://appiex.com/sitemap.xml'),'robots sitemap directive missing');
console.log('PASS', 'sitemap',urlCount,'URLs');
console.log('PASS', 'robots.txt','present');
console.log('LIVE SEO RELEASE SMOKE: PASSED',pages,'production HTML pages');
