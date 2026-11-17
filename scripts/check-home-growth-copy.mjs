import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const intents=JSON.parse(fs.readFileSync('scripts/data/page-search-intents.json','utf8'));
const head=html.slice(0,html.indexOf('</head>'));
const plain=s=>String(s).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const meta=(kind,key)=>plain([...head.matchAll(/<meta\b[^>]*>/gi)].find(m=>new RegExp('\\b'+kind+'=["\\x27]'+key+'["\\x27]','i').test(m[0]))?.[0]?.match(/\bcontent=["']([^"']+)["']/i)?.[1]||'');
const title=plain(head.match(/<title\b[^>]*>(.*?)<\/title>/i)?.[1]);
const description=meta('name','description');
assert.equal(title,intents['/'].title,'Homepage title not aligned with curated search intent');
assert.equal(description,intents['/'].description,'Homepage description differs from mapped SEO snippet');
assert(title.includes('Ecommerce & AI Automation'),'Commercial service positioning absent from SEO title');
assert(description.length>=90&&description.length<=175,'SEO description too short or too long');
for(const [kind,key,expected] of [
 ['property','og:title',title],['name','twitter:title',title],
 ['property','og:description',description],['name','twitter:description',description]
])assert.equal(meta(kind,key),expected,'Social preview mismatch: '+key);
const hero=html.match(/<section id="home"[\s\S]*?<\/section>/)?.[0]||'';
assert(hero,'Homepage hero section missing');
assert.equal((hero.match(/<h1\b/gi)||[]).length,1,'Hero should contain exactly one H1');
assert(hero.includes('Websites, Ecommerce &amp; AI Automation'),'New commercial H1 missing');
assert(hero.includes('Built Around Your Business'),'Outcome-led H1 missing');
for (const term of ['ecommerce storefronts','custom software','AI-powered customer workflows','human oversight'])
  assert(hero.toLowerCase().includes(term.toLowerCase()), 'Commercial offer unclear in hero: ' + term);
const match=head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert(match,'Main JSON-LD missing');
const data=JSON.parse(match[1])['@graph'];
const site=data.find(x=>x['@type']==='WebPage');
const org=data.find(x=>x['@type']==='Organization');
const agency=data.find(x=>x['@type']==='ProfessionalService');
assert.equal(site?.name,title,'WebPage schema title out of sync');
assert.equal(site?.description,description,'WebPage schema description out of sync');
assert(agency?.description?.includes('ecommerce websites'),'ProfessionalService should reflect the actual offerings');
const offered=new Set(org?.hasOfferCatalog?.itemListElement?.map(x=>x.itemOffered?.url));
for(const route of ['/digital-strategy','/web-development','/ui-ux-3d-design','/ai-automation','/seo-marketing','/gaming'])
  assert(offered.has('https://appiex.com'+route),'Service missing from schema: '+route);
console.log('Homepage commercial SEO validated: six retained offerings, buyer-focused H1, title, description, OG/Twitter and OfferCatalog.');
