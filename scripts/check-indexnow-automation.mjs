import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sitemapEntries,sourceToCanonical,URLsToNotify} from './lib/indexnow-url-changes.mjs';

const source=fs.readFileSync('sitemap.xml','utf8');
const current=sitemapEntries(source);
assert.equal(current.size,49,'Expected 49 canonical sitemap URLs from the current release');
assert(current.has('https://appiex.com/'),'Homepage missing');
assert(current.has('https://appiex.com/website-lead-calculator'),'Free tool missing');
assert(!current.has('https://appiex.com/start-project'),'Noindex funnel must not be submitted');
assert.equal(sourceToCanonical('index.html'),'https://appiex.com/');
assert.equal(sourceToCanonical('web-development.html'),'https://appiex.com/web-development');
assert.equal(sourceToCanonical('blog/ai-agents-vs-n8n-automation-for-business.html'),'https://appiex.com/blog/ai-agents-vs-n8n-automation-for-business');
assert.equal(sourceToCanonical('admin/insights.html'),null);
assert.equal(sourceToCanonical('start-project.html'),null);
assert.equal(sourceToCanonical('login.html'),null);
assert(!current.has('https://appiex.com/login'),'Login must never be in the public sitemap');
assert.equal(sourceToCanonical('README.md'),null);
assert.equal(sourceToCanonical('../admin.html'),null);
assert.equal(sourceToCanonical('web-development.html?x=1'),null);

const prior=new Map(current);
prior.delete('https://appiex.com/website-lead-calculator');
prior.set('https://appiex.com/web-development','2026-01-01');
const patch=URLsToNotify({
  current,previous:prior,changedFiles:['sitemap.xml','blog/technical-seo-checklist-for-business-websites.html']
});
assert.deepEqual(patch,[
 'https://appiex.com/blog/technical-seo-checklist-for-business-websites',
 'https://appiex.com/web-development',
 'https://appiex.com/website-lead-calculator'
]);

assert.deepEqual(URLsToNotify({current,previous:current,changedFiles:['blog.html']}),
 ['https://appiex.com/blog']);
assert.deepEqual(URLsToNotify({current,previous:current,changedFiles:['login.html','start-project.html','docs/readme.md']}),[]);
assert.deepEqual(URLsToNotify({current,previous:current,changedFiles:[]}),[]);
assert.equal(URLsToNotify({current,previous:current,changedFiles:['src/lib/appiex-html-polish.mjs']}).length,49);
assert.equal(URLsToNotify({current,previous:current,changedFiles:[],all:true}).length,49);
const malformed=sitemapEntries('<urlset><url><loc>https://evil.test/hijack</loc></url><url><loc>https://appiex.com/login.html</loc></url><url><loc>https://appiex.com/valid?x=1</loc></url></urlset>');
assert.equal(malformed.size,0,'Only canonical first-party clean URLs may be notified');
const scripted=fs.readFileSync('scripts/submit-indexnow.mjs','utf8');
assert(scripted.includes('api.indexnow.org/indexnow'),'IndexNow endpoint missing');
assert(scripted.includes('Ownership key not accessible'),'Ownership key fail-closed guard missing');
assert(scripted.includes('Production sitemap does not match git'),'Production release verification missing');
console.log('Bing / IndexNow QA passed: 49 public URLs, change detection, private route exclusions and production guards.');
