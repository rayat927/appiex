import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {SITE_ORIGIN,sitemapEntries,URLsToNotify} from './lib/indexnow-url-changes.mjs';

const key='edc774626e87396624f82617c4d6500e36b43d4b';
const keyLocation=SITE_ORIGIN+'/'+key+'.txt';
const localSitemap=fs.readFileSync('sitemap.xml','utf8');
const localEntries=sitemapEntries(localSitemap);
assert(localEntries.size>=49,'Expected published canonical URLs in sitemap');
assert.equal(localEntries.size,(localSitemap.match(/<loc>/g)||[]).length,
  'Sitemap has a noncanonical/invalid entry');

function git(args) {
  try {return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}
  catch {return '';}
}
const files=git(['diff','--name-only','HEAD^','HEAD']).split('\n').filter(Boolean);
const oldSitemap=git(['show','HEAD^:sitemap.xml']);
const oldEntries=sitemapEntries(oldSitemap);
const all=process.env.INDEXNOW_ALL==='true';
const urls=URLsToNotify({current:localEntries,previous:oldEntries,changedFiles:files,all});
console.log('IndexNow selected',urls.length,'canonical URLs from',localEntries.size,
  'published sitemap URLs; changed files',files.length,'full submit',all);
if(urls.length===0){console.log('No indexable page changes to notify.');process.exit(0);}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fetchText=async(url,timeout=16000)=>{
  const response=await fetch(url,{
    redirect:'follow',
    headers:{
      'User-Agent':'Appiex-IndexNow-Publisher/2.0',
      'Cache-Control':'no-cache'
    },
    signal:AbortSignal.timeout(timeout)
  });
  return {status:response.status,body:await response.text(),ok:response.ok,finalUrl:response.url};
};

// Verify the public ownership key. Never submit with a missing or incorrect key.
let verified=false;
for(let n=1;n<=15;n++){
  try{
    const a=await fetchText(keyLocation+'?indexnow_key_check='+encodeURIComponent(process.env.GITHUB_SHA||'manual'));
    if(a.ok && a.body.trim()===key){verified=true;break;}
    console.log('Waiting for public IndexNow ownership key:',n,'HTTP',a.status);
  }catch(err){console.log('Ownership retry',n,String(err).slice(0,100));}
  if(n<15) await sleep(6000);
}
if(!verified)throw Error('Ownership key not accessible. Refusing IndexNow submission.');

// Require the deployed sitemap to match this commit.
let currentProduction=false;
for(let n=1;n<=25;n++){
  try{
    const a=await fetchText(SITE_ORIGIN+'/sitemap.xml?indexnow_release='+encodeURIComponent(process.env.GITHUB_SHA||'manual'));
    const live=sitemapEntries(a.body);
    if(a.ok && live.size===localEntries.size &&
       [...localEntries].every(([url,modified])=>live.has(url)&&live.get(url)===modified)){
      currentProduction=true;break;
    }
    console.log('Waiting for production sitemap:',n,'HTTP',a.status,
      'published_urls',live.size,'expected',localEntries.size);
  }catch(err){console.log('Sitemap retry',n,String(err).slice(0,100));}
  if(n<25)await sleep(6000);
}
if(!currentProduction)throw Error('Production sitemap does not match git. Refusing premature IndexNow submission.');

// Verify every selected public URL resolves and declares its canonical.
// Never notify pages that are inaccessible or noindex.
const available=[];
const errors=[];
const batches=[];
for(let i=0;i<urls.length;i+=6)batches.push(urls.slice(i,i+6));
for(const batch of batches){
  const results=await Promise.all(batch.map(async url=>{
    try{
      const a=await fetchText(url+'?indexnow_check='+encodeURIComponent(process.env.GITHUB_SHA||'manual'));
      if(!a.ok) return {url,error:'HTTP '+a.status};
      const head=a.body.split('</head>')[0]||'';
      const canonicalTags=[...head.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)].map(m=>m[0]);
      if(!canonicalTags.some(tag=>tag.includes('href="'+url+'"')||tag.includes("href='"+url+"'")))
        return {url,error:'Canonical not found in live HTML'};
      if(/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(head))
        return {url,error:'Page has noindex'};
      return {url};
    }catch(err){return{url,error:String(err).slice(0,110)}}
  }));
  for(const r of results){if(r.error)errors.push(r);else available.push(r.url);}
}
for(const e of errors) console.error('Not announced:',e.url,e.error);
if(errors.length) throw Error('Some changed pages were not crawlable; no URLs submitted. Details above.');
assert(available.length===urls.length,'Only publish fully verified batch');

// IndexNow 200 or 202 is a receipt, not proof of crawling or indexing.
const response=await fetch('https://api.indexnow.org/indexnow',{
  method:'POST',
  headers:{
    'Content-Type':'application/json; charset=utf-8',
    'User-Agent':'Appiex-IndexNow-Publisher/2.0'
  },
  body:JSON.stringify({host:'appiex.com',key,keyLocation,urlList:available}),
  signal:AbortSignal.timeout(35000)
});
const responseText=(await response.text()).slice(0,500);
console.log('IndexNow response HTTP',response.status,'submitted_urls',available.length);
if(response.status!==200 && response.status!==202)
  throw Error('IndexNow did not accept URL notification: '+response.status+' '+responseText);
console.log('IndexNow accepted notification. Crawling and indexing are decided by each search engine.');
