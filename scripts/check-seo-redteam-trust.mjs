import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const publicPages=['seo-marketing','best-software-agency','best-agency-in-the-world','partners','projects','website-redesign','case-studies'];
const sitemap=read('sitemap.xml');
const intents=JSON.parse(read('scripts/data/page-search-intents.json'));
const forbidden=[
 'Sub-300ms Core Web Vitals',
 'Sub-300ms Page Load Speeds',
 '95+ Core Web Vitals',
 'All projects achieve sub-second load times',
 'Verified Rates: $25',
 'Sub-Second Performance Architecture',
 'LLM Knowledge Injection (LLMO)',
 'Discover Why Appiex is the Best Software Agency For You',
 'guaranteed SLA delivery timelines'
];
for(const page of publicPages){
 const html=read(page+'.html');
 const head=html.slice(0,html.indexOf('</head>'));
 assert(head.includes('href="https://appiex.com/'+page+'"'),page+': canonical changed');
 assert(!/noindex/i.test(head.match(/<meta\s+name=["']robots["'][^>]*>/i)?.[0]||''),page+': accidental noindex');
 assert(sitemap.includes('<loc>https://appiex.com/'+page+'</loc><lastmod>2026-11-23</lastmod>'),page+': substantial revision missing truthful lastmod');
 for(const phrase of forbidden)assert(!html.includes(phrase),page+': unsupported marketing phrase remains: '+phrase);
}
const seo=read('seo-marketing.html');
for(const metric of ['Largest Contentful Paint (LCP)','Interaction to Next Paint (INP)','Cumulative Layout Shift (CLS)']){
 assert(seo.includes(metric),'SEO page must describe measured metric: '+metric);
}
assert(seo.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').includes('Citations and recommendations are not guaranteed.'),'AI citation caution not present in rendered text');

const guide=read('best-agency-in-the-world.html');
const head=guide.slice(0,guide.indexOf('</head>'));
const expectedTitle='How to Compare Digital Agencies Worldwide | Appiex';
const expectedDesc='Compare digital and software agencies using project evidence, security, delivery fit and IP terms. A practical buyer checklist published by Appiex.';
assert(head.includes('<title>'+expectedTitle+'</title>'),'Buyer-guide title mismatch');
assert(head.includes('name="description" content="'+expectedDesc+'"'),'Buyer-guide description mismatch');
assert(head.includes('property="og:title" content="'+expectedTitle+'"'),'OpenGraph title drift');
assert(head.includes('name="twitter:title" content="'+expectedTitle+'"'),'Twitter title drift');
assert(head.includes('property="og:description" content="'+expectedDesc+'"'),'Social description drift');
assert(head.includes('name="twitter:description" content="'+expectedDesc+'"'),'Twitter description drift');
const jsonld=head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
assert(jsonld,'Global buyer guide JSON-LD missing');
const graph=JSON.parse(jsonld[1])['@graph'];
const article=graph.find(x=>x['@type']==='Article');
assert(article?.headline==='How to Compare Digital and Software Agencies Worldwide','Article structured headline out of sync');
assert(article?.dateModified==='2026-11-23','True modification date not updated');
assert(intents['/best-agency-in-the-world']?.title===expectedTitle,'Curated title out of sync');
assert(intents['/best-agency-in-the-world']?.description===expectedDesc,'Curated description out of sync');
assert(guide.includes('This guide is published by Appiex'),'Comparison publisher disclosure missing');

const buyer=read('best-software-agency.html');
assert(buyer.includes('Rates and delivery terms: confirm directly'),'Buyer pricing disclaimer missing');
assert(buyer.includes('not a verified ranking, endorsement, or live price comparison'),'Comparative claim caution missing');
assert(!/\$\s?\d+[\d,]*(?:\s*[-–]\s*\$?\d+[\d,]*)?\s*\/\s*hr/i.test(buyer),
 'Unsupported hourly rate remains on commercial comparison page');

const study=read('case-studies.html');
assert(study.includes('id="case-study-evidence-boundaries"'),'Case study requires transparent evidence section');
assert(study.includes('not independently verified evidence'),'Case-study results must distinguish claimed vs measured');
assert(study.includes('href="/editorial-policy"'),'Evidence policy must be reachable');
assert(study.includes('/styles/appiex-buyer-guides.css'),'Case-study styles missing');

const funnel=read('scripts/seo-conversion-tracker.js');
assert(funnel.includes("window.addEventListener('appiex:lead_received'"),'Confirmed GA4 lead flow missing');
assert(read('start-project.html').includes('<meta name="robots" content="noindex, follow">'),'Private transactional funnel indexing changed');
const canonicalCount=[...sitemap.matchAll(/<loc>/g)].length;
assert(canonicalCount===50,'Sitemap canonical count changed unexpectedly');
console.log('SEO red-team trust QA PASS: 7 public pages, evidence transparency, true CWV definitions, comparison fairness, 50 canonicals, title/schema/metadata synchronization and confirmed lead tracking.');
