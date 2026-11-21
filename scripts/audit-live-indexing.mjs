import fs from 'node:fs/promises';
/* Read-only production SEO smoke test: node scripts/audit-live-indexing.mjs */
const BASE='https://appiex.com', results=[];
async function request(url, redirect='follow') {
 const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),15000);
 try {
  const r=await fetch(url,{redirect,signal:controller.signal,headers:{'User-Agent':'AppiexSeoAudit/1.0'}});
  return {status:r.status,url:r.url,location:r.headers.get('location'),type:r.headers.get('content-type')||'',robots:r.headers.get('x-robots-tag')||'',body:await r.text()};
 } catch(e) {return {status:0,url,location:null,type:'',robots:'',body:'',error:String(e)};}
 finally {clearTimeout(timer);}
}
function canonical(html) {
 const head=html.split(/<\/head>/i)[0];
 return [...head.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0])
  .filter(t=>/\brel=["']canonical["']/i.test(t))
  .map(t=>t.match(/\bhref=["']([^"']*)/i)?.[1]).filter(Boolean);
}
function robotsMeta(html) {
 const head=html.split(/<\/head>/i)[0];
 const t=[...head.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(x=>/\bname=["']robots["']/i.test(x));
 return t?.match(/\bcontent=["']([^"']*)/i)?.[1]||'';
}
const sm=await request(BASE+'/sitemap.xml');
if(sm.status!==200||!sm.body.includes('<urlset')) {
 results.push({kind:'sitemap',url:BASE+'/sitemap.xml',status:sm.status,issues:['sitemap-unavailable'],error:sm.error});
} else {
 const urls=[...sm.body.matchAll(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/g)].map(m=>m[1].trim().replaceAll('&amp;','&'));
 if(new Set(urls).size!==urls.length) results.push({kind:'sitemap',issues:['duplicate-urls']});
 for(const url of urls) {
  const r=await request(url), cs=canonical(r.body), meta=robotsMeta(r.body),issues=[];
  if(r.status!==200)issues.push('not-200');
  if(r.url!==url)issues.push('redirected');
  if(cs.length!==1||cs[0]!==url)issues.push('canonical-mismatch');
  if(/\bnoindex\b/i.test(meta+' '+r.robots))issues.push('unexpected-noindex');
  if(!r.type.includes('text/html'))issues.push('non-html');
  results.push({kind:'page',url,status:r.status,finalURL:r.url,canonical:cs,metaRobots:meta,xRobots:r.robots,issues,error:r.error});
 }
}
// Check each intermediate hop; hosting layers may normalize legacy paths first.
async function checkRedirectChain(startURL, expectedURL) {
 let current=startURL, hops=[], issues=[];
 for(let i=0;i<4;i++){
  const r=await request(current,'manual');
  const location=r.location?new URL(r.location,current).toString():null;
  hops.push({url:current,status:r.status,location});
  if(![301,308].includes(r.status)||!location){
   issues.push('non-permanent-or-missing-redirect'); break;
  }
  if(location===expectedURL)break;
  if(hops.some(h=>h.url===location)){
   issues.push('redirect-loop'); break;
  }
  current=location;
 }
 if(hops.at(-1)?.location!==expectedURL)issues.push('wrong-redirect-destination');
 results.push({kind:'redirect-chain',url:startURL,expected:expectedURL,hops,issues});
}
for(const [from,to] of [['/index.html','/'],['/index','/'],['/home','/'],['/about','/team'],
 ['/journal','/blog'],['/legal/privacy-policy','/privacy-policy'],
 ['/blog/lottie-animation-and-after-effects-tutorial.html','/blog/lottie-animation-and-after-effects-tutorial']]) {
 await checkRedirectChain(BASE+from,BASE+to);
}
const www=await request('https://www.appiex.com/','manual');
const wwwTarget=www.location?new URL(www.location,'https://www.appiex.com/').toString():null;
// Vercel domain routing may issue a 307 before project redirect rules.
// A 307 to the correct canonical is crawlable but should be flagged as an SEO improvement.
const wwwCorrect=[301,307,308].includes(www.status)&&wwwTarget===BASE+'/';
results.push({kind:'redirect',url:'https://www.appiex.com/',status:www.status,location:wwwTarget,
 issues:wwwCorrect?[]:['bad-www-redirect'],
 warnings:www.status===307&&wwwCorrect?['temporary-www-redirect-update-in-vercel-domain-settings']:[],
 error:www.error});
const rob=await request(BASE+'/robots.txt');
results.push({kind:'robots',url:BASE+'/robots.txt',status:rob.status,
 issues:rob.status===200&&rob.body.includes('Sitemap: '+BASE+'/sitemap.xml')?[]:['robots-error'],error:rob.error});
const bad=results.filter(x=>x.issues?.length);
const warnings=results.flatMap(x=>(x.warnings||[]).map(w=>({url:x.url,warning:w})));
const report={checkedAt:new Date().toISOString(),checked:results.length,failed:bad.length,warnings,results};
await fs.mkdir('artifacts',{recursive:true});
await fs.writeFile('artifacts/appiex-live-indexing-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checked:report.checked,failed:report.failed,warnings,errors:bad},null,2));
if(bad.length)process.exitCode=1;