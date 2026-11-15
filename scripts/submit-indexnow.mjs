import fs from 'node:fs';
import assert from 'node:assert/strict';

const key='edc774626e87396624f82617c4d6500e36b43d4b';
const keyPath='https://appiex.com/'+key+'.txt';
const paths=['/','/services','/projects','/seo-marketing','/ai-automation','/web-development','/ai-search-optimization','/ai-search-readiness-checklist','/website-lead-calculator'];
const urlList=paths.map(p=>'https://appiex.com'+p);
const sitemap=fs.readFileSync('sitemap.xml','utf8');
for(const url of urlList){
  assert(sitemap.includes('<loc>'+url+'</loc>'), 'Not in sitemap: '+url);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let found=false;
for(let attempt=1;attempt<=16;attempt++){
  try{
    const response=await fetch(keyPath+'?probe='+encodeURIComponent(process.env.GITHUB_SHA||'release'),{
      headers:{'Cache-Control':'no-cache','User-Agent':'Appiex-IndexNow-Ownership-Check/1.0'},
      signal:AbortSignal.timeout(12000)
    });
    const body=await response.text();
    if(response.ok&&body.trim()===key){found=true;break;}
    console.log('Waiting for public IndexNow key file: attempt',attempt,'HTTP',response.status);
  }catch(e){console.log('Ownership check retry',attempt,String(e).slice(0,120));}
  if(attempt<16)await sleep(6000);
}
if(!found)throw Error('IndexNow key is not yet publicly accessible. Not submitting.');
// Wait for the new indexable resource, so we do not announce an unpublished URL.
let resourceLive=false;
for (let attempt=1;attempt<=16;attempt++) {
  try {
    const response=await fetch('https://appiex.com/website-lead-calculator?check='+encodeURIComponent(process.env.GITHUB_SHA||'release'),{
      headers:{'Cache-Control':'no-cache','User-Agent':'Appiex-IndexNow-Release-Check/1.0'},
      signal:AbortSignal.timeout(12000)
    });
    const body=await response.text();
    if(response.ok && body.includes('<title>Website Lead Conversion Calculator | Free Tool | Appiex</title>')){
      resourceLive=true;break;
    }
    console.log('Waiting for updated production calculator: attempt',attempt,'HTTP',response.status);
  } catch(e) { console.log('Calculator release check retry',attempt,String(e).slice(0,80)); }
  if(attempt<16)await sleep(6000);
}
if(!resourceLive)throw Error('Updated calculator is not yet live; IndexNow submission skipped.');
const request={host:'appiex.com',key,keyLocation:keyPath,urlList};
const response=await fetch('https://api.indexnow.org/indexnow',{
  method:'POST',
  headers:{'Content-Type':'application/json; charset=utf-8','User-Agent':'Appiex-IndexNow-Submission/1.0'},
  body:JSON.stringify(request),
  signal:AbortSignal.timeout(30000)
});
const text=(await response.text()).slice(0,500);
console.log('IndexNow response HTTP',response.status, 'submitted_urls',urlList.length);
if(![200,202].includes(response.status)){
  throw Error('IndexNow did not accept submission: '+response.status+' '+text);
}
console.log('IndexNow received submission: initial verification or processing may still be pending. This is not a guarantee of indexing.');
