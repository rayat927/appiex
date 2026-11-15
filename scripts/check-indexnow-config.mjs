import assert from 'node:assert/strict';
import fs from 'node:fs';
const key='edc774626e87396624f82617c4d6500e36b43d4b';
const file=key+'.txt';
assert(fs.existsSync(file),'IndexNow key file missing from source');
assert.equal(fs.readFileSync(file,'utf8').trim(),key,'IndexNow key content mismatch');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
for(const route of ['/','/seo-marketing','/ai-automation','/web-development','/ai-search-optimization','/ai-search-readiness-checklist']){
  const url='https://appiex.com'+route;
  assert(sitemap.includes('<loc>'+url+'</loc>'),'IndexNow target not canonical in sitemap: '+route);
}
console.log('IndexNow config OK: ownership key and six canonical updated pages.');
