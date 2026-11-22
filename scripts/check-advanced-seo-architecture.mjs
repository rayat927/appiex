import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(path,'utf8');
const sitemap=read('sitemap.xml');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert(urls.length>=50 && new Set(urls).size===urls.length,'Unexpected canonical sitemap loss/duplicates');
const paths=urls.map(u=>u.replace('https://appiex.com',''));
const expected=new Set(paths);
const intents=JSON.parse(read('scripts/data/page-search-intents.json'));
const inlinks=new Map(paths.map(p=>[p,new Set()]));
const outlinks=new Map(paths.map(p=>[p,new Set()]));

const fromHref=(href)=>{
 if(/^https?:\/\/(?:www\.)?appiex\.com(?=\/|$)/i.test(href)){
   href=href.replace(/^https?:\/\/(?:www\.)?appiex\.com/i,'');
 }
 if(!href.startsWith('/')||href.startsWith('//'))return null;
 let clean=href.split(/[?#]/,1)[0];
 if(clean.endsWith('.html'))clean=clean.slice(0,-5);
 if(clean==='')clean='/';
 return expected.has(clean)?clean:null;
};

for(const path of paths){
 const sourcePath=(path==='/'?'index':path.slice(1))+'.html';
 assert(fs.existsSync(sourcePath),'Canonical page missing from repo: '+sourcePath);
 const html=read(sourcePath);
 // Avoid treating JavaScript strings as internal navigation; use literal HTML anchors only.
 const clean=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
 for(const link of clean.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)){
   const to=fromHref(link[1]);
   if(to!==null && to!==path){outlinks.get(path).add(to);inlinks.get(to).add(path);}
 }
}
const compact=[...inlinks].map(([path,from])=>({path,inbound:from.size,outbound:outlinks.get(path).size}));
const orphans=compact.filter(x=>x.inbound===0);
const low=compact.filter(x=>x.inbound<=2).sort((a,b)=>a.inbound-b.inbound);
console.log('[SEO link graph] Canonicals='+urls.length+
  '; orphan count='+orphans.length+'; low-inbound (0–2)='+low.length+
  '; review='+JSON.stringify(low.slice(0,12)));

const updated=[
'/','/web-development','/best-software-agency','/seo-marketing',
'/partners','/projects','/website-redesign',
'/blog/website-development-cost-bangladesh','/privacy-policy','/terms-of-service'];
for(const path of updated){
 const html=read((path==='/'?'index':path.slice(1))+'.html');
 const head=html.slice(0,html.indexOf('</head>'));
 const meta=(name,value)=>{
  const re=new RegExp('<meta\\s+(?:name|property)="'+name+'"\\s+content="([^"]*)"','i');
  return head.match(re)?.[1];
 };
 const d=meta('description'),og=meta('og:description'),tw=meta('twitter:description');
 assert(d&&d.length>=90&&d.length<=155,'Revised description should be meaningful and concise: '+path+' '+d?.length);
 assert(d===og && d===tw,'Page and social descriptions differ: '+path);
 assert(intents[path]?.description===d.replace(/&amp;/g,'&'),'Curated intent map description out of sync: '+path);
 const url='https://appiex.com'+path;
 if(path==='/'){
  assert(sitemap.includes('<loc>https://appiex.com/</loc><lastmod>2026-11-16</lastmod>'),
    'A meta snippet edit must not falsely advance the homepage lastmod');
 } else {
  assert(sitemap.includes('<loc>'+url+'</loc><lastmod>2026-11-23</lastmod>'),
    'Significantly changed URL needs actual lastmod date: '+path);
 }
}

const sections=[
['best-software-agency.html','software-agency-buyer-acceptance',['/case-studies','/web-development','/ai-automation']],
['web-development.html','bangladesh-website-delivery-acceptance',['/case-studies','/seo-marketing','/ecommerce-development']],
['seo-marketing.html','seo-audit-evidence-protocol',['/blog/technical-seo-checklist-for-business-websites','/ai-search-readiness-checklist']]
];
for(const [path,id,links] of sections){
 const html=read(path);
 assert(html.includes('id="'+id+'"'),path+': expected substantive buyer evidence missing');
 assert(html.includes('href="/styles/appiex-buyer-guides.css?v=20261123"'),path+': style asset missing');
 for(const link of links)assert(html.includes('href="'+link+'"'),path+': buyer evidence link missing '+link);
 assert(html.includes('href="/start-project?service='),path+': qualified project path missing');
}
for(const page of ['privacy-policy.html','terms-of-service.html']){
 const html=read(page);
 assert(html.includes('id="legal-site-navigation"'),page+': no crawlable legal navigation');
 for(const link of ['/services','/start-project'])assert(html.includes('href="'+link+'"'),page+': useful navigation missing '+link);
}
const leadTracker=read('scripts/seo-conversion-tracker.js');
assert(leadTracker.includes("window.addEventListener('appiex:lead_received'"),'Server-confirmed lead analytics removed');
for(const p of ['login','profile','collections'])assert(/noindex/i.test(read(p+'.html').slice(0,read(p+'.html').indexOf('</head>'))),'Private route unintentionally indexable: '+p);

console.log('Advanced SEO QA PASS: 50+ canonical URLs, link graph, updated search/OG/Twitter/intent metadata, buyer evidence, legal links and protected lead tracking.');
