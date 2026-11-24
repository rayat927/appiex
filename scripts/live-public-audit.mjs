import fs from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin='https://appiex.com', max=250;
const safe=p=>!/^\/(?:admin|login|profile|collections|resume|api|_next|rafsan_page|scratch_cuberto_live)(?:\/|\.html$|$)/i.test(p)
  && !/\.(?:js|css|png|jpe?g|webp|svg|gif|ico|woff2?|ttf|mp4|webm|mp3|pdf|json|xml|txt|zip|glb|gltf|avif)$/i.test(p);
const normalize=(href,from=origin)=>{try{const u=new URL(href.replaceAll('&amp;','&'),from);return u.origin===origin&&safe(u.pathname)?u.pathname.replace(/\/+$/,'')||'/':null}catch{return null}};
const publicFetch=async path=>{
  let u=new URL(path,origin);const visited=[];
  for(let i=0;i<6;i++){
    const response=await fetch(u,{redirect:'manual',signal:AbortSignal.timeout(18000),headers:{'User-Agent':'Appiex-Owner-Release-Audit/1.0','Cache-Control':'no-cache'}});
    if(response.status>=300&&response.status<400&&response.headers.get('location')){
      const next=new URL(response.headers.get('location'),u);
      visited.push({url:u.pathname,status:response.status,target:next.href});
      if(next.origin!==origin||!safe(next.pathname))return {status:response.status,final:u.pathname,redirects:visited,body:'',headers:{}};
      u=next;continue;
    }
    return {status:response.status,final:u.pathname,redirects:visited,body:await response.text(),headers:Object.fromEntries(response.headers)};
  }
  throw new Error('Redirect limit');
};
const sm=await fetch(origin+'/sitemap.xml',{signal:AbortSignal.timeout(18000)});
if(!sm.ok)throw Error('Sitemap HTTP '+sm.status);
const sitemap=[...new Set([...(await sm.text()).matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(x=>normalize(x[1])).filter(Boolean))];
const queue=[...new Set(['/',...sitemap])],queued=new Set(queue),pages=[],videos=[];
const attr=(tag,key)=>tag.match(new RegExp('\\b'+key+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'))?.[1]||'';
for(let i=0;i<queue.length&&i<max;){
  const chunk=queue.slice(i,Math.min(i+5,max));i+=chunk.length;
  const batch=await Promise.all(chunk.map(async path=>{
    try{
      const r=await publicFetch(path),html=r.body,head=html.split(/<\/head>/i)[0]||'';
      const robots=[...head.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).filter(t=>['robots','googlebot'].includes(attr(t,'name').toLowerCase())).map(t=>attr(t,'content')).join(' ');
      const canonical=[...head.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).find(t=>attr(t,'rel').toLowerCase()==='canonical');
      const links=[...new Set([...html.matchAll(/<a\b[^>]*>/gi)].map(m=>normalize(attr(m[0],'href'),origin+r.final)).filter(Boolean))];
      const media=[...html.matchAll(/<(?:video|source|iframe)\b[^>]*>/gi)].map(m=>({tag:m[0].match(/^<(\w+)/)[1],src:attr(m[0],'src'),poster:attr(m[0],'poster'),autoplay:/\bautoplay\b/i.test(m[0])})).filter(x=>x.tag==='video'||/\.(?:mp4|webm|m3u8)(?:\?|$)|youtube(?:-nocookie)?\.com|youtu\.be|vimeo\.com/i.test(x.src));
      const schemas=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m=>{try{return [JSON.parse(m[1])]}catch{return []}});
      const objects=[];const walk=x=>{if(!x||typeof x!=='object')return;if([x['@type']].flat().includes('VideoObject'))objects.push({name:x.name,contentUrl:x.contentUrl,embedUrl:x.embedUrl,thumbnailUrl:x.thumbnailUrl,uploadDate:x.uploadDate});for(const v of Object.values(x))walk(v)};schemas.forEach(walk);
      if(media.length||objects.length)videos.push({path,media,videoObjects:objects});
      return {path,sitemap:sitemap.includes(path),status:r.status,final:r.final,redirects:r.redirects,canonical:canonical?attr(canonical,'href'):'',noindex:/noindex/i.test(robots+' '+(r.headers['x-robots-tag']||'')),title:head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'',h1:(html.match(/<h1\b/gi)||[]).length,links,mediaCount:media.length,videoObjectCount:objects.length};
    }catch(err){return {path,sitemap:sitemap.includes(path),error:String(err.message),links:[]}}
  }));
  for(const p of batch){pages.push(p);for(const l of p.links){if(!queued.has(l)){queued.add(l);queue.push(l)}}}
  if(i<max)await new Promise(r=>setTimeout(r,500));
}
const issues=pages.filter(p=>p.error||(p.sitemap&&(p.status!==200||p.noindex||p.canonical!==origin+p.path||!p.title||p.h1!==1)));
const discoveredNotCrawled=queue.filter(p=>!pages.some(x=>x.path===p));
const summary={sitemap:sitemap.length,crawled:pages.length,discovered:queue.length,uncrawled:discoveredNotCrawled.length,issues:issues.map(({links,...p})=>p),videoPages:videos.length,videoObjectPages:videos.filter(p=>p.videoObjects.length).length};
fs.writeFileSync('crawl-results.json',JSON.stringify({summary,pages,videos,discoveredNotCrawled},null,2));
console.log('CRAWL SUMMARY',JSON.stringify(summary));console.log('VIDEO INVENTORY',JSON.stringify(videos.map(v=>({path:v.path,media:v.media.length,videoObjects:v.videoObjects.length}))));
const browser=await chromium.launch({headless:true});
const tested=[];
try{
 for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  for(const path of ['/','/services','/ai-automation','/ecommerce-development','/partners','/start-project','/blog/how-much-does-ai-automation-cost','/blog/how-long-does-it-take-to-build-a-saas-product','/blog/ai-agents-vs-n8n-automation-for-business']){
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message.slice(0,250)));
    try{
      const response=await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForTimeout(1000);
      const data=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {h1:document.querySelectorAll('h1').length,canonical:document.querySelector('link[rel=canonical]')?.href,robots:document.querySelector('meta[name=robots]')?.content,overflow:document.documentElement.scrollWidth>innerWidth+2,domContentLoadedMs:Math.round(n?.domContentLoadedEventEnd||0),responseStartMs:Math.round(n?.responseStart||0),serviceCard:!!document.querySelector('a[href="/gaming"]'),partnerConsent:!!document.querySelector('#part-consent'),ecommerceQuote:!!document.querySelector('a[href="/start-project?service=ecommerce"]')}});
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      tested.push({path,viewport:viewport.width,http:response?.status(),...data,errors,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))});
      await page.screenshot({path:'screenshots/'+viewport.width+'-'+(path==='/'?'home':path.slice(1).replaceAll('/','-'))+'.png',fullPage:false});
    }catch(e){tested.push({path,viewport:viewport.width,error:String(e.message).slice(0,250)})}finally{await page.close()}
  }
  await context.close();
 }
}finally{await browser.close()}
fs.writeFileSync('browser-results.json',JSON.stringify(tested,null,2));
console.log('BROWSER SUMMARY',JSON.stringify(tested));
if(issues.length||tested.some(t=>t.error||t.http!==200))process.exitCode=1;
