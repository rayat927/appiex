# Appiex: Qualified Traffic → Real Client Funnel (November 2026)

## Outcome

Prioritize potential clients who have a real business problem and a credible service fit. Success is **qualified enquiries and signed projects**, not forced clicks, misleading urgency, keyword stuffing or raw visitor counts.

## Verified starting point

Search Console (Oct 18–Nov 14, 2026; `https://appiex.com/`):
- Web Development: 77 impressions, 1 click
- AI Automation: 28 impressions, 0 clicks
- Technical SEO Checklist: 45 impressions, 0 clicks

The dataset is too small for accurate conversion projections or a validated ranking uplift. Do not assume the current high branded CTR represents commercial demand.

## Funnel architecture

```
High-intent search / relevant editorial discussion / referral / case study
  → Intent-matched Web, AI, or SEO service page
  → Relevant business outcome, honest evidence, clear delivery boundaries
  → "Scope my project" entry linked to /start-project?service=<category>
  → Four-step project-fit questionnaire
  → WhatsApp/email handoff (user must press Send)
  → Human verifies incoming enquiry, asks clarifying questions, prepares proposal
  → Qualified / won / lost CRM status with privacy-safe analytics
```

The existing homepage enquiry form remains available. It is separate from the new funnel because the legacy order API still needs a secure production release (see PR #40). No PII from the new questionnaire is stored locally or sent to analytics; the visitor chooses whether to send via WhatsApp or email.

## Entry strategies by intent

| Demand | Buyer question | Landing experience | Natural next step |
|---|---|---|---|
| Revenue / ecommerce | How much does a business website cost? | Web Development page, a relevant real project and cost guide | /start-project?service=web |
| Operations | Can we automate WhatsApp and CRM without mistakes? | AI Automation, n8n comparison, governance & human handoff | /start-project?service=ai |
| Organic acquisition | Why does my site get impressions but few leads? | SEO & Marketing, technical checklist, AEO/GEO guide | /start-project?service=seo |
| Software launch | Should we build custom software or use SaaS? | Project evidence, scope & maintenance questions | /start-project?service=software |

Do not manufacture case studies, awards, testimonials, results, or company statistics.

## Four-step visitor qualification

1. **Goal:** Grow qualified demand / launch digital sales / reduce manual work / build software.
2. **Service:** Website / AI automation / SEO / custom software / UI-UX / undecided.
3. **Fit:** Approximate budget band and timing. Under-$1k visitors can still enquire; show a practical self-serve resource instead of making them feel rejected.
4. **Context:** Name, optional business/website/email, and the business challenge. WhatsApp or email only prepares a draft; the contact is **not** counted as a confirmed lead until actually received.

## Analytics & attribution

GA4 best-practice lead lifecycle:
- `appiex_funnel_view`: step wizard loaded.
- `appiex_funnel_step_complete`: a stage was completed.
- `appiex_funnel_prepared`: visitor reviewed their enquiry.
- `appiex_funnel_contact_handoff`: visitor clicked outbound WhatsApp/mailto link. *Intent only, not confirmed submission.*
- `generate_lead`: business actually receives a valid enquiry or backend persistently acknowledges a submission.
- `qualify_lead`: human/CRM verifies the buyer, service fit and viable scope.
- `working_lead`: team starts the conversation.
- `close_convert_lead`: real signed contract/payment; not a prepared WhatsApp message.

The new client-side code emits `dataLayer` custom events with goal, service, budget category and timeline, not contact PII. GTM requires explicit tags/triggers to turn these events into GA4 reports. Do not auto-count a WhatsApp click as a signed or confirmed lead.

Helpful source: https://support.google.com/analytics/answer/9267735

**Primary business metric:** qualified accepted enquiries / unique relevant service page visitors, segmented by service and source. Also track closed deals and realized revenue; monitor raw sessions/CTR as diagnostic inputs, not business outcomes.

GTM QA: Tag Assistant → event emission → GA4 DebugView → verify no PII → confirm deduplication and consent behavior. Test both WhatsApp and email independently.

## Sales response playbook (human-verified)

On receiving a valid lead, store it in a secure CRM with consent/retention settings. Suggested fields: source, goal, service, budget band, timeline, business name, contact, problem description, stage, next action.

- **Good fit:** Business challenge matches delivery expertise, realistic budget/timing, decision-maker accessible. Offer a short discovery call; ask for success criteria and existing tools.
- **Needs scoping:** Unclear solution, undecided budget. Ask two concise questions before suggesting a paid discovery or phased project.
- **Not ready:** Very early ideas / small budget. Give the free checklist or a narrowly scoped next step; do not pressure them to buy.

Example first human response:

> Thanks for sharing your challenge. To suggest the right approach, could you tell me (1) the single outcome you want to improve first, and (2) which system or website you're using today? I'll then suggest a suitable first phase, including what's in and out of scope.

Example after genuine qualification:

> Based on the details you've shared, I recommend starting with [specific first phase]. It should address [measurable problem] while keeping [risk/approval] under human control. We can discuss requirements, delivery checkpoints and a written estimate before committing.

Avoid claims such as "guaranteed 300% conversion" or "we'll respond within 5 minutes" unless operationally guaranteed and documented.

## SEO and content: attract buyers rather than random traffic

**Commercial / BOFU:** Work on existing Web Development, AI Automation, SEO and WhatsApp Automation pages first. Clearly explain deliverables, typical project inputs, security/compliance boundaries and customer fit. Don't create dozens of low-value location/niche doorway pages.

**Comparison / MOFU:** Strengthen authentic comparisons: AI agents vs n8n; custom software vs SaaS; website cost in Bangladesh; service provider selection. Place useful links to the relevant service and questionnaire naturally.

**Informational / TOFU:** Publish original practical checklists, technical demonstrations and real project learnings that can attract editorial links. Self-contained Reddit comments and community participation should genuinely answer questions without automatic promotions.

Google people-first content principles: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## Conversion checklist (release QA)

- Public site and the new funnel return HTTP 200 with a canonical and noindex directive on this transactional page.
- Goal and service choice work with keyboard and touch; service preselection from query string is restricted to known values.
- Buttons cannot advance without the current required answers; "Not sure" is allowed.
- Low budget guidance appears without rejecting an enquiry.
- Link to real service pages and portfolio; no fake testimonial or urgency.
- WhatsApp and email messages include goal/service/budget/timeline and user-typed details; visitor must press Send.
- Neither localStorage/sessionStorage nor GA4 receives client names, email, business URL or challenge text.
- No `generate_lead` event fires merely on outbound intent.
- No existing header, blog or SEO tests regress; production routes are checked after deploy.

## Incremental rollout

1. Release on a tested branch/preview; verify desktop and mobile.
2. Record a pre-release GSC baseline for the key commercial pages and GA4 setup.
3. Compare periods over multiple weeks, segment branded and nonbranded search traffic.
4. Change one funnel dimension at a time (headline, entry wording, lead questions) and track completion/dropoff; no significance claims on tiny samples.
5. Review **qualified** enquiries and closed projects; remove steps that cause confusion rather than gaming clicks.

**Operational dependency:** Production PR #40 still needs admin/Redis credentials and security regression testing. Do not route sensitive details into insecure existing APIs until that release is verified. This funnel intentionally uses visitor-controlled WhatsApp/email handoff instead.
