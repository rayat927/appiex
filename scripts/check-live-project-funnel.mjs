import assert from 'node:assert/strict';

const origin = 'https://appiex.com';
const search = 'appiex_funnel_release=' + encodeURIComponent(process.env.GITHUB_SHA || 'manual');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(path, retry = 4) {
  const url = origin + path + (path.includes('?') ? '&' : '?') + search;
  for (let attempt=1;attempt<=retry;attempt++) {
    try {
      const response = await fetch(url, {
        headers:{'User-Agent':'Appiex-Project-Funnel-Live-QA/1.0','Cache-Control':'no-cache'},
        signal:AbortSignal.timeout(14000)
      });
      const body = await response.text();
      if (response.status===200 && body.length) return body;
      if (attempt===retry) throw Error(path+' HTTP '+response.status);
    } catch(e) { if(attempt===retry) throw e; }
    await sleep(3000);
  }
}

let html = '';
for (let attempt = 1; attempt<=16;attempt++) {
  try {
    html = await fetchPage('/start-project', 1);
    if (html.includes('id="project-fit-form"')) break;
  } catch(_) {}
  if (attempt===16) throw Error('Production is not serving the new project-fit questionnaire');
  console.log('Waiting for Vercel production promotion, attempt', attempt);
  await sleep(8000);
}

assert(html.includes('id="project-fit-form"'), 'Four-step form missing');
assert(/<meta name="robots" content="noindex, follow">/.test(html), 'Transactional page should stay noindex');
assert(html.includes('https://appiex.com/start-project'), 'Canonical missing');
assert((html.match(/<fieldset class="funnel-step"/g)||[]).length===4, 'Expected four questionnaire steps');
assert(html.includes('/scripts/start-project-funnel.js'), 'Wizard script missing');
assert(html.includes('/styles/start-project-funnel.css'), 'Wizard stylesheet missing');
console.log('PASS /start-project HTTP 200 and 4-step structure');

const js=await fetchPage('/scripts/start-project-funnel.js');
const css=await fetchPage('/styles/start-project-funnel.css');
const entryCSS=await fetchPage('/styles/qualified-lead-entry.css');
assert(js.includes('appiex_funnel_contact_handoff'), 'Handoff tracking missing');
assert(js.includes('wa.me/8801917354847'), 'WhatsApp handoff missing');
assert(!js.includes('localStorage'), 'Should not store contact PII');
assert(css.includes('.choice-grid'), 'Responsive funnel CSS missing');
assert(entryCSS.includes('.apx-fit-module'), 'Service entry CTA styles missing');
console.log('PASS funnel script, stylesheet and contact handoff');

for (const path of ['/','/services','/web-development','/ai-automation','/seo-marketing','/blog']) {
  const body=await fetchPage(path);
  assert(body.includes('id="qualified-project-fit"'), path+': relevant funnel section not deployed');
  assert(body.includes('href="/start-project'), path+': funnel link not deployed');
  console.log('PASS',path,'buyer-intent entry');
}
console.log('LIVE QUALIFIED LEAD FUNNEL VERIFIED: 6 connected entry points, project wizard and assets.');
