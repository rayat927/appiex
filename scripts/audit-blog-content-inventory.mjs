/* Read-only audit: inventory blog HTML, discover duplicates and noindex reasons. */
import fs from 'node:fs/promises';
import path from 'node:path';
const dir='blog';
const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.html'));
const strip=x=>x.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 .replace(/<[^>]+>/g,' ').replace(/&[a-z]+;|&#\d+;/g,' ')
 .replace(/\s+/g,' ').trim();
const entries=[];
for(const filename of files){
 const html=await fs.readFile(path.join(dir,filename),'utf8');
 const head=html.split(/<\/head>/i)[0];
 const title=strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const desc=head.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0]?.match(/content=["']([^"']*)/i)?.[1]||'';
 const canonical=head.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0]?.match(/href=["']([^"']*)/i)?.[1]||'';
 const meta=head.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0]?.match(/content=["']([^"']*)/i)?.[1]||'';
 const body=strip(html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]||'');
 const tokens=new Set(body.toLowerCase().match(/[a-z]{4,}/g)||[]);
 const issues=[];
 if(!title)issues.push('missing-title');
 if(!desc)issues.push('missing-description');
 if(!canonical)issues.push('missing-canonical');
 if(body.split(/\s+/).length<250)issues.push('short-body-check-manually');
 if(/\bnoindex\b/i.test(meta))issues.push('noindex-review-if-intentional');
 entries.push({filename,title,description:desc,canonical,robots:meta,
   words:body.split(/\s+/).length,issues,tokens});
}
const collisions=[];
for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
 const a=entries[i],b=entries[j],common=[...a.tokens].filter(t=>b.tokens.has(t)).length;
 const score=common/Math.max(1,a.tokens.size+b.tokens.size-common);
 if(score>=0.7)collisions.push({a:a.filename,b:b.filename,jaccard:Number(score.toFixed(3)),
  note:'manual review needed; shared navigation may inflate similarity'});
}
await fs.mkdir('artifacts',{recursive:true});
const report={checkedAt:new Date().toISOString(),htmlFiles:files.length,
 pages:entries.map(({tokens,...rest})=>rest),potentialOverlap:collisions.sort((a,b)=>b.jaccard-a.jaccard)};
await fs.writeFile('artifacts/appiex-blog-content-inventory.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({htmlFiles:files.length,noindex:entries.filter(e=>e.robots.includes('noindex')).length,
 potentialOverlap:collisions.length,missingTitle:entries.filter(e=>!e.title).length},null,2));