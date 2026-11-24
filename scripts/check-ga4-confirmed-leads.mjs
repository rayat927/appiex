import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const tracker=read('scripts/seo-conversion-tracker.js');
const funnel=read('scripts/start-project-funnel.js');
const page=read('start-project.html');
const callbacks=new Map();
const calls=[];
const dataLayer=[];
const fakeWindow={
 dataLayer,
 location:{pathname:'/start-project'},
 gtag:function (...args){calls.push(args);dataLayer.push(args)},
 addEventListener:function(name,fn){callbacks.set(name,fn)}
};
const fakeDocument={
 readyState:'complete',
 title:'Start a Website, AI or SEO Project | Appiex',
 addEventListener:function(){},
 querySelector:function(){return true},
 head:{appendChild:function(){}},
 createElement:function(){return {async:false,src:''}}
};
vm.runInNewContext(tracker,{window:fakeWindow,document:fakeDocument},{filename:'seo-conversion-tracker.js'});
const emit=(name,detail)=>{assert(callbacks.has(name),'Missing event handler '+name);callbacks.get(name)({detail})};
const count=name=>calls.filter(a=>a[0]==='event'&&a[1]===name).length;
assert.equal(calls.filter(a=>a[0]==='config'&&a[1]==='G-DF198MPZGT').length,1,'GA4 must be configured once on funnel');
assert.equal(count('generate_lead'),0,'A pageview must not be counted as a lead');
emit('appiex:whatsapp_handoff',{channel:'whatsapp'});
assert.equal(count('generate_lead'),0,'Opening WhatsApp is not confirmed lead');
emit('appiex:contact_prepared',{channel:'whatsapp_fallback'});
assert.equal(count('generate_lead'),0,'Contact draft must not be a lead');
emit('appiex:lead_received',{channel:'project_fit',service:'AI automation',email:'sensitive@example.org'});
assert.equal(count('generate_lead'),1,'Server receipt must create one lead event');
const first=calls.find(a=>a[0]==='event'&&a[1]==='generate_lead')[2];
assert.equal(first.lead_source,'project_fit');
assert.equal(first.lead_service,'ai_automation');
assert.equal(first.confirmation_type,'server_acknowledged');
assert(!JSON.stringify(first).includes('sensitive@example.org'),'No PII passed into GA4');
emit('appiex:lead_received',{channel:'website_form',service:'sensitive@example.org'});
assert.equal(count('generate_lead'),2,'Separate genuine website receipt can be recorded');
const second=calls.filter(a=>a[0]==='event'&&a[1]==='generate_lead')[1][2];
assert.equal(second.lead_channel,'homepage_contact');
assert.equal(second.lead_service,'unspecified','Unexpected user data should never be sent');
assert(!JSON.stringify(second).includes('sensitive@example.org'),'Untrusted input was forwarded to GA4');
assert(funnel.includes("data.success !== true"),'Backend must acknowledge lead receipt');
assert(funnel.includes("detail: { channel: 'project_fit', service: chosen('service') }"),'Fixed service category must be passed after receipt');
assert(page.includes('/scripts/seo-conversion-tracker.js'),'GA4 script must load on project funnel');
assert(page.includes('id="funnel-consent"'),'Lead consent UI missing');
console.log('GA4 QA passed: configured event dispatch, confirmed-only leads, channel/service categorization and PII exclusion.');

// The partnership lead is distinct from a referral click or a prepared form.
emit('appiex:lead_received',{channel:'agency_partnership',service:'Agency partnership',email:'sensitive@example.org'});
const partnerEvent=calls.filter(a=>a[0]==='event'&&a[1]==='generate_lead').at(-1)[2];
assert.equal(partnerEvent.lead_channel,'agency_partnership');
assert.equal(partnerEvent.lead_service,'agency_partnership');
assert(!JSON.stringify(partnerEvent).includes('sensitive@example.org'));
const partnerPage=read('partners.html');
const partnerHandler=partnerPage.slice(partnerPage.indexOf('async function handlePartnerSubmit'),partnerPage.indexOf('(function initRafsanNavbar()',partnerPage.indexOf('async function handlePartnerSubmit')));
assert(partnerPage.includes('id="part-consent" required'),'Partner consent required');
assert(partnerHandler.includes("fetch('/api/orders'"),'Partner application must use durable lead API');
assert(partnerHandler.includes('data.success !== true || !data.orderId'),'Partner lead must have receipt');
assert(!/localStorage|saveReferralLead|ndaSigned/.test(partnerHandler),'Do not store applicant data locally or invent NDA acceptance');
assert(partnerHandler.indexOf("data.success !== true")<partnerHandler.indexOf("appiex:lead_received"),'No lead event before receipt');
new vm.Script(partnerHandler,{filename:'partner-handler.js'});
assert.equal((read('ecommerce-development.html').match(/href="\/start-project\?service=ecommerce"/g)||[]).length,3,'Ecommerce quote CTAs should enter qualified funnel');
console.log('Partner receipt, consent, attribution and ecommerce funnel QA passed.');
