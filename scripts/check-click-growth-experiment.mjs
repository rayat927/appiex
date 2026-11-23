import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(p,'utf8');
const dec = s => String(s ?? '').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
const head = html => html.slice(0,html.indexOf('</head>'));
const meta = (h,kind,key) => {
  const tag=[...h.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(t=>t.includes(kind+'="'+key+'"'));
  return dec(tag?.match(/\bcontent="([^"]*)"/i)?.[1]||'');
};
const title = h => dec(h.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
const intents=JSON.parse(read('scripts/data/page-search-intents.json'));
const siteMap=read('sitemap.xml');
const urls=[...siteMap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,50,'Do not expand the indexed sitemap to chase clicks');
assert.equal(new Set(urls).size,50,'Do not create duplicate canonical URLs');

const samples=[
 ['blog/technical-seo-checklist-for-business-websites.html','/blog/technical-seo-checklist-for-business-websites'],
 ['blog/website-development-cost-bangladesh.html','/blog/website-development-cost-bangladesh']
];
for(const [file,path] of samples) {
  const html=read(file),h=head(html),intent=intents[path];
  assert(intent,'Curated search intent missing: '+path);
  assert.equal(title(h),intent.title || title(h),'Title does not match curated search intent: '+path);
  assert.equal(meta(h,'name','description'),intent.description,'SERP description out of sync: '+path);
  assert.equal(meta(h,'property','og:title'),title(h),'OpenGraph title out of sync: '+path);
  assert.equal(meta(h,'name','twitter:title'),title(h),'Social title out of sync: '+path);
  assert.equal(meta(h,'property','og:description'),intent.description,'OG description out of sync: '+path);
  assert.equal(meta(h,'name','twitter:description'),intent.description,'Social description out of sync: '+path);
  assert(intent.description.length<161 && intent.description.length>100,'Description not concise enough: '+path);
  assert(h.includes('href="https://appiex.com'+path+'"'),'Preferred canonical changed: '+path);
  assert(!/noindex/i.test(meta(h,'name','robots')),'Important public page became noindex: '+path);
  assert(siteMap.includes('<loc>https://appiex.com'+path+'</loc><lastmod>2026-11-23</lastmod>'),'Sitemap lastmod not aligned: '+path);
}

const article=read(samples[0][0]);
const articleHead=head(article);
const articleH1='Technical SEO Checklist (2026): 9 Tests and Fixes';
assert(article.includes('<h1 id="cms-article-h1">'+articleH1+'</h1>'),'Article heading misaligned with search preview');
const ld=articleHead.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
assert(ld,'BlogPosting JSON-LD missing');
const entities=JSON.parse(ld[1]);
assert(Array.isArray(entities),'Expected existing structured-data array');
const blogPost=entities.find(e=>e['@type']==='BlogPosting');
assert(blogPost?.headline===articleH1,'BlogPosting headline differs from visible heading');
assert(blogPost.dateModified==='2026-11-23T00:00:00.000Z','Article dateModified not truthful');
assert(article.includes('content="2026-11-23T00:00:00.000Z"'),'OpenGraph modified date not aligned');
const quick=article.slice(article.indexOf('<section class="appiex-blog-prose" id="quick-nine-checks"'),article.indexOf('</section>',article.indexOf('<section class="appiex-blog-prose" id="quick-nine-checks"'))+10);
assert(quick.includes('<h2 id="quick-nine-checks-heading">'),'Nine-step quick answer needs visible heading');
assert.equal([...quick.matchAll(/<li\b/gi)].length,9,'Exactly nine published practical checks are required');
assert.equal((article.match(/href="#quick-nine-checks"/g)||[]).length,2,'The summary must be reachable from both TOCs');
assert(quick.includes('href="/seo-marketing"'),'Missing relevant service citation');
assert(quick.includes('href="/start-project?service=seo"'),'Missing a preselected SEO enquiry path');
assert(!quick.includes('guaranteed ranking'),'No misleading click promises');

const cost=read(samples[1][0]);
assert(cost.includes('href="/start-project?service=web"'),'Pricing visitor must reach preselected website enquiry');
assert(cost.includes('Request a Scope-Based Website Quote'),'Cost CTA must describe a genuine scoped quotation');

const partners=read('partners.html');
const h1=partners.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'';
assert(/White-Label Web Development for/.test(h1),'Agency partnership hero needs a clear service offer');
assert(/Agencies &amp; Studios/.test(h1),'Agency audience missing');
assert(partners.includes('Apply for Agency Partnership'),'Agency CTA is too vague');

const funnel=read('scripts/start-project-funnel.js'),tracker=read('scripts/seo-conversion-tracker.js');
assert(funnel.includes("seo: ['SEO and growth'"),'SEO service preselection unsupported');
assert(funnel.includes("web: ['Web development'"),'Web service preselection unsupported');
assert(tracker.includes("window.addEventListener('appiex:lead_received'"),'Confirmed lead measurement removed');
for(const p of ['login','profile','collections']){
  const h=head(read(p+'.html'));
  assert(/noindex/i.test(h),'Private route indexing inadvertently changed: '+p);
}
console.log('Search click experiment PASS: 50 canonicals, aligned SERP/social metadata, 9 true checklist tests, structured publication dates, qualified funnels and private protections.');
