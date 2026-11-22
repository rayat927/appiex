import fs from 'node:fs';
import assert from 'node:assert/strict';
import nextConfig from '../next.config.mjs';

const origin='https://appiex.com';
const read=p=>fs.readFileSync(p,'utf8');
const sitemap=read('sitemap.xml');
const robots=read('robots.txt');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const normalize=s=>String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
assert(urls.length>=50,'Unexpected sitemap URL loss');
assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
assert(urls.every(x=>x.startsWith(origin+'/')),'Sitemap must use HTTPS canonical domain');

const titleOwners=new Map();
for(const url of urls){
  const pathname=new URL(url).pathname;
  const filename=(pathname==='/'?'index':pathname.slice(1))+'.html';
  assert(fs.existsSync(filename),'Missing public source file: '+filename);
  const source=read(filename);
  const head=source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]||'';
  const title=normalize(head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  assert(title.length>12,'Missing/short page title: '+pathname);
  assert(title.includes('appiex'),'Public title missing Appiex brand: '+pathname);
  assert(!titleOwners.has(title),'Duplicate public page titles: '+titleOwners.get(title)+' and '+pathname);
  titleOwners.set(title,pathname);
  const canon=head.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0]||'';
  assert(canon.includes('href="'+url+'"'),'Canonical must match sitemap: '+pathname);
  const robotsMeta=head.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0]||'';
  assert(!/noindex/i.test(robotsMeta),'Sitemap page incorrectly noindexed: '+pathname);
}

for(const page of ['login','profile','collections','start-project']){
  const html=read(page+'.html');
  const head=html.slice(0,html.search(/<\/head>/i));
  assert(/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(head),
    'Private/transactional page must remain noindex: '+page);
}
assert(/"@type":"WebSite"/.test(read('index.html')),'Home page has no WebSite structured data');
assert(/"name":"Appiex"/.test(read('index.html')),'Structured brand name missing');
assert(/<title[^>]*>[^<]*Appiex<\/title>/i.test(read('index.html')),'Brand missing in homepage title');

const botNames=['OAI-SearchBot','ChatGPT-User','Claude-SearchBot','PerplexityBot','Googlebot','Bingbot'];
for(const bot of botNames){
 const escaped=bot.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 assert(new RegExp('User-agent:\\s*'+escaped+'\\s*\\nAllow:\\s*\\/','i').test(robots),
   'Missing crawler allowance: '+bot);
}
assert(robots.includes('User-agent: *'),'Wildcard group missing');
assert(robots.includes('Sitemap: '+origin+'/sitemap.xml'),'Robots sitemap missing');

const config=JSON.parse(read('vercel.json'));
assert(config.redirects?.some(x=>x.destination==='https://appiex.com/:path*' &&
  x.permanent===true && x.has?.some(z=>z.type==='host'&&z.value==='www.appiex.com')),
  'www must permanently redirect to the HTTPS apex canonical');
const nextRedirects=await nextConfig.redirects();
for(const [oldPath,target] of [
 ['/journal','/blog'],['/media','/projects'],['/gallery','/projects'],
 ['/about','/team'],['/protocol','/projects'],
 ['/legal/terms-of-service','/terms-of-service'],
 ['/legal/privacy-policy','/privacy-policy'],
 ['/pages/product-design','/ui-ux-3d-design'],['/pages/contacts','/#contact']
]){
 assert(nextRedirects.some(x=>x.source===oldPath && x.destination===target && x.permanent),
  'Missing relevant legacy redirect: '+oldPath);
}
assert(nextRedirects.some(x=>x.source.startsWith('/blog/:slug') &&
  x.destination==='/blog/:slug' && x.permanent),'Legacy .html blog alias redirect missing');
const rules=await nextConfig.headers();
const global=rules.find(x=>x.source==='/(.*)');
assert(global?.headers.some(x=>x.key==='Strict-Transport-Security' && x.value.includes('max-age=')),
  'HSTS missing from default headers');

console.log('Indexing policy PASS: '+urls.length+' unique branded canonical titles; public pages indexable; private routes noindex; HTTPS canonical, HSTS, 9 old-route redirects, and 6 search/user assistant crawler groups.');
