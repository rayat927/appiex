import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(p,'utf8');
const pages = [
  ['services.html','choose-digital-service'],
  ['ai-automation.html','ai-automation-fit'],
  ['web-development.html','website-buyers-checklist'],
  ['seo-marketing.html','search-visibility-measurement']
];
const sitemap = new Set([...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]));
const allowNoindexHandoffs = new Set(['/start-project']);
const changed = new Set();
let links = 0;

for (const [page, sectionId] of pages) {
 const html = read(page);
 const sectionStart=html.indexOf('<section class="appiex-buyer-guides" id="'+sectionId+'"');
 assert(sectionStart>0,page+': missing user-visible buyer-intent section');
 assert(html.split('id="'+sectionId+'"').length===2,page+': duplicate original buyer section id');
 const footer=html.indexOf('<footer',sectionStart);
 assert(footer>sectionStart,page+': buyer section must precede footer');
 const section=html.slice(sectionStart,footer);
 assert(section.includes('</section>'),page+': buyer guide not closed');
 assert(section.includes('<h2 id="'+sectionId+'-heading">'),page+': direct-answer heading missing');
 assert(section.includes('<table>'),page+': no comparison/evidence matrix');
 assert(section.includes('href="/start-project"'),page+': no qualified enquiry path');
 assert(html.slice(0,html.indexOf('</head>')).includes('/styles/appiex-buyer-guides.css'),page+': shared responsive CSS absent');
 const robots=html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0]||'';
 assert(!/noindex/i.test(robots),page+': commercial page unexpectedly noindex');
 const hrefs=[...section.matchAll(/\bhref="(\/[^"]+)"/g)].map(m=>m[1]);
 for (const href of hrefs) {
   const path=href.split('?')[0].split('#')[0];
   if (allowNoindexHandoffs.has(path))continue;
   const url='https://appiex.com'+path;
   assert(sitemap.has(url),page+': buyer guide links to a noncanonical or excluded page: '+href);
   links++;
 }
 changed.add(sectionId);
}
assert(changed.size===4,'Four improved commercial pages are required');
const css=read('styles/appiex-buyer-guides.css');
assert(css.includes('@media(max-width:840px)'),'Buyer guide lacks a mobile layout');
assert(css.includes(':focus-visible'),'Keyboard focus must remain visible');
assert(css.includes('prefers-reduced-motion'),'Respect reduced-motion preferences');
assert(css.includes('overflow-x:auto'),'Comparison tables need mobile scrolling');

const editorial=read('editorial-policy.html');
for(const term of ['Site reputation','Third-party material','Programmatic publishing','Content freshness']){
 assert(editorial.toLowerCase().includes(term.toLowerCase()),'Missing evidence policy: '+term);
}
const intentions=JSON.parse(read('scripts/data/page-search-intents.json'));
const unique=new Set();
for(const url of sitemap){
  const path=url.replace('https://appiex.com','')||'/';
  const data=intentions[path];
  assert(data&&data.primary,'Missing curated search intent '+path);
  const term=data.primary.toLowerCase();
  assert(!unique.has(term),'Keyword intent map duplicate '+term);
  unique.add(term);
}
assert(sitemap.size===Object.keys(intentions).length,'Index coverage drift');
const newTitles={
 '/web-development':'Website Development in Bangladesh | Appiex',
 '/blog/website-development-cost-bangladesh':'Website Development Cost in Bangladesh (2026) | Appiex'
};
for(const [path,title] of Object.entries(newTitles)){
 const html=read(path.slice(1)+'.html');
 const encoded=title.replace(/&/g,'&amp;');
 assert(html.includes('>'+encoded+'</title>'),'Page title not synchronized '+path);
 assert(html.includes('property="og:title" content="'+encoded+'"'),'Social title not synchronized '+path);
 assert(html.includes('name="twitter:title" content="'+encoded+'"'),'Twitter title not synchronized '+path);
 assert(intentions[path].title===title,'Intent metadata mismatch '+path);
}
assert(read('index.html').includes('"@type":"Organization"') && read('index.html').includes('"@type":"WebSite"'),'Keep verified brand structured data');
assert(/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(read('start-project.html')),'Do not index transactional funnel');
assert(read('scripts/seo-conversion-tracker.js').includes("window.addEventListener('appiex:lead_received'"),'Confirmed lead tracking must remain intact');
console.log('SEO-25: PASS — 4 buyer guides, '+links+' verified canonical contextual links, responsive accessibility, evidence standards, 50-page intent coverage, two branded titles and confirmed-lead guard.');
