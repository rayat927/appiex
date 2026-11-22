import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const facts=JSON.parse(read('agent-readiness.json'));
const html=read('ai-search-optimization.html');
const llms=read('llms.txt');
const sync=read('scripts/sync-nextjs-public.mjs');
const services=read('services.html');
assert.equal(facts.provider.canonical_url,'https://appiex.com/');
assert.equal(facts.provider.based_in,'Dhaka, Bangladesh');
assert(Array.isArray(facts.services)&&facts.services.length===6,'Six grounded service families required');
assert(facts.agent_use.no_public_agent_action_api===true,'Do not imply a transactional agent API');
assert(facts.agent_use.human_approval_required_for.includes('Sending enquiries'),'Agent must require permission before contact');
assert(facts.agent_use.do_not_send_pii_to_analytics===true,'Privacy guard missing');
for(const s of facts.services) {
  assert(/^https:\/\/appiex\.com\/[a-z0-9/-]+$/.test(s.url),'Invalid service URL: '+s.url);
  assert(fs.existsSync(s.url.replace('https://appiex.com/','')+'.html'),'Service source missing '+s.url);
}
assert(html.includes('id="assistive-agent-readiness"'),'Human-readable AAO section missing');
assert(html.includes('href="/agent-readiness.json"'),'Public JSON discovery link missing');
assert(html.includes('href="/start-project"'),'Permission-aware inquiry path missing');
assert(html.includes('submission and sharing contact details require user authorization'),'AAO permission language missing');
assert(llms.includes('https://appiex.com/agent-readiness.json'),'llms index missing public fact directory');
assert(llms.includes('Ask the buyer for permission'),'llms instructions must require consent');
assert(sync.includes("f === 'agent-readiness.json'"),'Production sync must publish the JSON file');
assert(!read('sitemap.xml').includes('<loc>https://appiex.com/agent-readiness.json</loc>'),'Do not list descriptive JSON as indexable landing page');
assert(!html.includes('guaranteed agent inclusion'),'No inclusion guarantees');
console.log('AAO checks passed: visible source facts, valid links, permission boundaries and static asset sync.');
