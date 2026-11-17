import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = path => fs.readFileSync(path, 'utf8');
const html = read('start-project.html');
const js = read('scripts/start-project-funnel.js');
const css = read('styles/start-project-funnel.css');
const entryCSS = read('styles/qualified-lead-entry.css');
assert(html.includes('<link rel="canonical" href="https://appiex.com/start-project">'), 'Funnel canonical missing');
assert(/<meta name="robots" content="noindex, follow">/.test(html), 'Transactional funnel must not compete with service pages');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Funnel should have one primary headline');
assert.equal((html.match(/<fieldset class="funnel-step"/g) || []).length, 4, 'Questionnaire should have four steps');
for (const id of ['budget','timeline','client-name','challenge','funnel-whatsapp','funnel-email','funnel-next','funnel-back']) {
  assert(html.includes('id="'+id+'"'), 'Missing qualification control '+id);
}
for (const goal of ['More qualified leads','Launch or improve digital sales','Save time with automation','Build software or a new product']) {
  assert(html.includes('value="'+goal+'"'), 'Missing buyer outcome '+goal);
}
for (const service of ['Web development','AI automation','SEO and growth','Custom software and SaaS','Need guidance']) {
  assert(html.includes('value="'+service+'"'), 'Missing service choice '+service);
}
assert(html.includes('https://wa.me/8801917354847'), 'WhatsApp destination must remain correct');
assert(html.includes('mailto:contact@appiex.com'), 'Email contact option must remain available');
assert(js.includes('appiex_funnel_step_complete') && js.includes('appiex_funnel_contact_handoff'), 'Funnel event tracking missing');
assert(js.includes('Do not call generate_lead here'), 'Outbound click is not a confirmed lead');
assert(!js.includes('localStorage') && !js.includes('sessionStorage'), 'Never persist contact details in browser storage');
assert(js.includes("fetch('/api/orders'"), 'Secure funnel submission route missing');
assert(js.includes('appiex_funnel_lead_received'), 'Confirmed lead event missing');
assert(html.includes('id="funnel-consent"') && html.includes('id="funnel-submit"'), 'Consent-based submission missing');
assert(!js.includes("track('generate_lead'"), 'Do not double count handoff as a lead');
assert(!html.includes('guaranteed results'), 'No unsupported conversion promise');
assert(css.includes('@media(max-width:620px)'), 'Responsive mobile styles missing');
assert(entryCSS.includes('.apx-fit-module'), 'Shared entry module CSS missing');
for (const filename of ['index.html','services.html','web-development.html','ai-automation.html','seo-marketing.html','blog.html']) {
  const page = read(filename);
  assert(page.includes('id="qualified-project-fit"'),filename+': entry point missing');
  assert(page.includes('href="/start-project'),filename+': link to funnel missing');
  assert(page.includes('/styles/qualified-lead-entry.css'),filename+': entry CSS missing');
}
const sitemap = read('sitemap.xml');
assert(!sitemap.includes('<loc>https://appiex.com/start-project</loc>'), 'Noindex questionnaire must not be listed in sitemap');
execFileSync(process.execPath, ['--check','scripts/start-project-funnel.js'], {stdio:'inherit'});
console.log('Qualified funnel QA: four-step structure, channel handoff, privacy, accessibility basics and 6 connected entry points passed.');
