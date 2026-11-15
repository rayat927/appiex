import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = file => fs.readFileSync(file,'utf8');

const html=read('website-lead-calculator.html');
const js=read('scripts/website-lead-calculator.js');
const css=read('styles/website-lead-calculator.css');
const intents=JSON.parse(read('scripts/data/page-search-intents.json'));
const sitemap=read('sitemap.xml');
const url='https://appiex.com/website-lead-calculator';
const mapped=intents['/website-lead-calculator'];
assert(mapped && mapped.primary==='website lead conversion calculator','Missing calculator search intent');
assert(html.includes('<link rel="canonical" href="'+url+'">'),'Canonical missing');
assert(html.includes('<title>'+mapped.title+'</title>'),'Title mismatch');
assert(html.includes('content="'+mapped.description+'"'),'Description mismatch');
assert(html.includes('type="application/ld+json"') && html.includes('"WebApplication"'),'WebApplication markup missing');
assert(html.includes('max-image-preview:large'),'Indexable resource robots directive missing');
assert((html.match(/<h1\b/gi)||[]).length===1,'Calculator needs exactly one h1');
assert(sitemap.includes('<loc>'+url+'</loc>'),'Sitemap missing resource');
assert(css.includes('@media(max-width:710px)'),'Mobile styles missing');
for(const p of ['index.html','services.html','projects.html','web-development.html','ai-automation.html','seo-marketing.html','ai-search-readiness-checklist.html']){
 assert(read(p).includes('href="/website-lead-calculator"'),p+' missing free tool internal link');
}
assert(!js.includes('localStorage')&&!js.includes('sessionStorage'),'Calculator cannot store user inputs');
assert(!js.includes('fetch('),'Calculator must not transmit user inputs');
assert(!js.includes('generate_lead'),'Calculator interest cannot count as submitted lead');

// Simulate input interaction without a browser or network.
const elements=new Map();
function makeEl(id,value=''){
 return {
  id,value,textContent:'',hidden:false,disabled:false,
  listeners:new Map(),
  addEventListener(type,fn){this.listeners.set(type,fn)},
  dispatch(type){this.listeners.get(type)?.({preventDefault(){}})}
 };
}
for(const id of ['lead-calc','monthly-visits','current-rate','target-rate','qualified-rate','closing-rate','deal-value','calc-error','copy-results','copy-feedback','extra-enquiries','current-leads','future-leads','extra-qualified','extra-clients','revenue-change','context-line']){
 elements.set(id,makeEl(id));
}
const values={
 'monthly-visits':'1000','current-rate':'1','target-rate':'2','qualified-rate':'40','closing-rate':'20','deal-value':'2500'
};
for(const [id,value] of Object.entries(values))elements.get(id).value=value;
const document={getElementById(id){return elements.get(id)||null}};
vm.runInNewContext(js,{document,Intl,Number,Math,console,requestAnimationFrame:fn=>fn()},{timeout:3000});
const get=id=>elements.get(id);
assert.equal(get('extra-enquiries').textContent,'+10');
assert.equal(get('current-leads').textContent,'10');
assert.equal(get('future-leads').textContent,'20');
assert.equal(get('extra-qualified').textContent,'+4');
assert.equal(get('extra-clients').textContent,'+0.8');
assert.equal(get('revenue-change').textContent,'+$2,000');
get('target-rate').value='0.5';
get('target-rate').dispatch('input');
assert.equal(get('extra-enquiries').textContent,'−5','Downside scenario must not be silently clamped');
assert.equal(get('revenue-change').textContent,'−$1,000');
get('target-rate').value='105';
get('target-rate').dispatch('input');
assert.equal(get('extra-enquiries').textContent,'—','Invalid percentage must be rejected');
assert.equal(get('calc-error').hidden,false,'Invalid input must display feedback');
assert.equal(get('copy-results').disabled,true,'Invalid input disables sharing');
console.log('Lead calculator QA passed: canonical, SEO schema, links, privacy, positive/negative scenarios and validation.');
