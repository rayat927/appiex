import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const home = fs.readFileSync('index.html', 'utf8');
const tracker = fs.readFileSync('scripts/seo-conversion-tracker.js', 'utf8');
const a = home.indexOf('async function handleContactSubmit(e)');
const b = home.indexOf('</script>', a);
assert(a >= 0 && b > a, 'Async contact form handler missing');
const handler = home.slice(a, b);
new vm.Script(handler);
new vm.Script(tracker);
assert(handler.includes('appiex:contact_prepared'), 'Missing contact prepared event');
assert(handler.includes('whatsapp_fallback'), 'Missing WhatsApp fallback');
assert(handler.includes('appiex:lead_received'), 'Confirmed server lead event missing');
assert(handler.includes("await fetch('/api/orders'"), 'Lead must wait for server receipt');
assert(handler.includes('modal-wa-btn'), 'WhatsApp fallback missing');
assert(!/localStorage\.(getItem|setItem)/.test(handler), 'Visitor PII should not be stored in browser CRM');
assert(!handler.includes("status: 'delivered'"), 'Unsent draft must not appear delivered');
// Count a lead only after the secure API acknowledges the enquiry.
assert(tracker.includes("window.addEventListener('appiex:lead_received'"), 'Confirmed lead listener missing');
assert(tracker.includes("trackConversionEvent('generate_lead'"), 'GA4 lead event must be emitted on server-confirmed receipt');
const listener = tracker.indexOf("window.addEventListener('appiex:lead_received'");
const leadEvent = tracker.indexOf("trackConversionEvent('generate_lead'");
const nextListener = tracker.indexOf("window.addEventListener(", listener + 1);
assert(listener >= 0 && leadEvent > listener && (nextListener < 0 || leadEvent < nextListener),
  'generate_lead must only fire inside confirmed receipt handler');
assert(!tracker.includes("trackConversionEvent('generate_lead', { cta_"), 'CTA click must not count as a lead');
assert(!tracker.includes("trackConversionEvent('book_consultation'"), 'CTA click must not count as booking');
assert(tracker.includes("trackConversionEvent('contact_cta_click'"), 'Click intent event missing');
assert(home.includes('Please press Send inside WhatsApp'), 'Send instructions missing');
console.log('Lead event integrity checks passed');
