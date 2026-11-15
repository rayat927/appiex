import assert from 'node:assert/strict';

const base='https://appiex.com';
const fingerprint=process.env.GITHUB_SHA || 'manual';
const pause=ms=>new Promise(r=>setTimeout(r,ms));

async function request(path){
  const sep=path.includes('?')?'&':'?';
  const url=base+path+sep+'verify_organic='+encodeURIComponent(fingerprint);
  const response=await fetch(url,{
    headers:{'Cache-Control':'no-cache','User-Agent':'Appiex-Live-Free-Tool-QA/1.0'},
    signal:AbortSignal.timeout(16000)
  });
  return {status:response.status,body:await response.text()};
}

let page=null;
for(let attempt=1;attempt<=18;attempt++){
  try {
    const result=await request('/website-lead-calculator');
    if(result.status===200 && result.body.includes('id="lead-calc"')){page=result;break;}
    console.log('Awaiting new calculator release',attempt,'HTTP',result.status);
  } catch(e){ console.log('Calculator check retry',attempt,String(e).slice(0,110)); }
  if(attempt<18)await pause(6500);
}
assert(page,'No production calculator found after retries');
assert(page.body.includes('<link rel="canonical" href="https://appiex.com/website-lead-calculator">'),'Canonical missing');
assert(page.body.includes('id="lead-calculator-cta"'),'Funnel CTA missing');
assert(page.body.includes('href="/start-project?service=seo"'),'Qualified funnel routing missing');
assert(page.body.includes('"WebApplication"'),'Public tool structured data missing');
console.log('PASS calculator production route, canonical, schema and funnel CTA');

for(const path of ['/scripts/website-lead-calculator.js','/styles/website-lead-calculator.css']){
  const r=await request(path);
  assert.equal(r.status,200,path+' not served');
  assert(r.body.length>100,path+' empty');
  console.log('PASS asset',path);
}
const sitemap=await request('/sitemap.xml');
assert.equal(sitemap.status,200);
assert(sitemap.body.includes('<loc>https://appiex.com/website-lead-calculator</loc>'),'New free tool missing from live sitemap');
const count=(sitemap.body.match(/<loc>/g)||[]).length;
assert(count>=49,'Live sitemap should include at least 49 indexable pages');
console.log('PASS sitemap',count,'URLs');

for(const path of ['/','/services','/projects','/web-development','/ai-automation','/seo-marketing','/ai-search-readiness-checklist']){
 const r=await request(path);
 assert.equal(r.status,200,path+' unreachable');
 assert(r.body.includes('href="/website-lead-calculator"'),path+' no calculator link');
 console.log('PASS free resource link',path);
}
console.log('LIVE CTR AND FREE LEAD RESOURCE CHECK PASSED');
