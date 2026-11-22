# Appiex 72-hour qualified-client acquisition sprint (22–25 November 2026)

## Scope and evidence
- Focus on first conversations, not promises of Google indexing or instant rankings.
- First-party baseline 1–19 Nov: 66 organic sessions, 0 reported organic GA4 key events; 53 organic sessions entered through the homepage. Historic numbers are small and may include unqualified traffic.
- Test priority markets: Bangladesh (clinic/education), UAE (dealership/property), USA (med spa/professional services). These are business hypotheses, NOT proof of demand or local offices.
- Newly created **campaign landing page**: `https://appiex.com/growth-sprint` after PR approval and deployment; temporary campaign page is noindex deliberately. Do not add it to sitemap.
- Existing secure project-fit funnel `/start-project` remains a noindex conversion endpoint. It may record a real `generate_lead` event only after the site's server confirms receipt. Outbound WhatsApp/email *clicks are not leads*.

## Attribution
Use one source-labelled link per market and consistent UTMs. Never include names, email, phone numbers or message contents in analytics.

- Bangladesh: `https://appiex.com/growth-sprint?utm_source=bd_outreach&utm_medium=direct_outreach&utm_campaign=72h_growth`
- UAE: `https://appiex.com/growth-sprint?utm_source=uae_outreach&utm_medium=direct_outreach&utm_campaign=72h_growth`
- USA: `https://appiex.com/growth-sprint?utm_source=us_outreach&utm_medium=direct_outreach&utm_campaign=72h_growth`
- Partner: `https://appiex.com/growth-sprint?utm_source=partner&utm_medium=referral&utm_campaign=72h_growth`
- LinkedIn: `https://appiex.com/growth-sprint?utm_source=linkedin&utm_medium=organic_social&utm_campaign=72h_growth`

Note: page CTA destinations contain their own UTMs. GA4 session attribution normally follows the first landing URL; verify attribution before reporting. Do not interpret a click as a closed deal.

## Day 1 — Delivery and target validation
Owner: founder for market hypotheses and offer approval; technical owner for website and analytics; creative owner for proof and posts.
1. Merge only after Vercel preview, layout QA, funnel test and secure submission smoke test pass. Do not submit real customer data in a test.
2. In GA4 Admin, mark `generate_lead` as a **key event** after a verified non-PII test event arrives. Existing `qualify_lead` and `close_convert_lead` should reflect CRM-confirmed stages only.
3. Build a 30-per-market lead research shortlist (90 total) from publicly listed business websites. Verify one actual potential issue per company; record evidence and URL. Research does not grant permission to send spam.
4. Sample prospect columns: Company | Country/city | Segment | Public website | Observed bottleneck + URL | Appropriate contact route | Contact permitted? | Message personalized? | Outreach status | Reply | Qualified? | Meeting | Proposal.
5. Review three real examples of existing Appiex work with permission to cite. Do not invent customers, revenue uplifts, testimonials, logos, screenshots, or benchmarks.

## Day 2 — Distribution and respectful outreach
1. Send a modest first batch of *personally researched and relevant* approaches through appropriate business contact channels, following applicable laws and platform rules. No scraping personal addresses, bulk DMs, or automated unsolicited WhatsApp messages.
2. Publish 1–2 founder-led LinkedIn posts using genuinely helpful tips; respond to relevant business discussions instead of copying advertisements into communities.
3. Where a relevant partner already knows buyers, ask for an opt-in introduction. Track partner referrals with the link above.
4. Track replies, meeting intent and form submissions separately.

## Day 3 — Sales conversations and feedback
1. Respond to interested people, ask for the existing process and desired business outcome, and deliver a short, relevant opportunity memo.
2. Invite qualified prospects to complete `/start-project`; propose only if scope, authority and budget fit.
3. Review GA4 session acquisition, outbound contact clicks and confirmed form events. Use CRM records for qualified leads and proposals.
4. Retain only winning messages and relevant market offers; revise based on actual replies. Report zero honestly if zero.

## Outreach drafts: customize before sending

### UAE dealerships / property
Subject: Enquiry follow-up workflow for [Company]
Hi [Name], I looked at [specific page/process] on [Company]'s site and noticed [verifiable observation]. Have you considered routing website or WhatsApp enquiries into a shared follow-up workflow so the sales team can see the next step? Appiex builds websites and integrations around existing CRMs. If useful, I can send a concise three-point review of that exact process. Here is our approach: [UAE campaign link].

### USA med spas / services
Subject: A practical website enquiry idea for [Company]
Hi [Name], I was reviewing [specific service page] and noticed [verifiable observation]. One possibility is improving the path from the service description to an appointment request, with a clearer handoff for your team. Appiex can help with website UX and workflow integration, without changing clinical processes. Would a brief review be useful? [USA campaign link].

### Bangladesh clinics / education
Subject: Enquiry-management idea for [Company]
Hello [Name], I saw [specific observed issue or workflow] on [Company]'s website. We help teams make new enquiries easier to route, qualify and follow up through websites, email and WhatsApp integrations. I can share a short assessment of [specific process] if that would help. Details: [BD campaign link].

### LinkedIn founder post
More traffic is not the same as more customers. If visitors cannot find the right service, ask a question or reach the right team, acquisition can turn into wasted attention. Our starting point at Appiex is a practical workflow review: What happens from the first enquiry to the next human action? Here's the approach: [LinkedIn campaign link].

## Review gates and guardrails
- Never claim a completed audit, demo, live integration or case-study outcome that has not been tested.
- Never fabricate geographical offices, sales figures, customer names or 24-hour response promises.
- Never assume GA4 `generate_lead` is a confirmed qualified lead; only confirmed receipt. CRM status controls `qualify_lead` and `close_convert_lead`.
- Do not launch or pay for advertising without explicit budget and consent.
- Respect opt-outs and privacy; do not automate unrequested mass outreach.

## Scorecard (targets, not forecasts)
- 90 verified companies researched (up to 30 per market).
- 45–75 tailored, policy-compliant outreach attempts after prospect qualification.
- 5–12 meaningful human replies is an experimental goal, not a promised result.
- 2–5 discovery calls and 1–3 proposals are stretch goals; report actuals.
- Compare tagged campaign sessions, verified `generate_lead`, qualified leads and proposals by market. If there are no events, investigate GA4 collection and server persistence before claiming failure or success.

## Dependencies
- Validate Redis-backed `/api/orders` lead persistence in production safely. If Redis is not configured, the endpoint should return 503 rather than fake success; retain WhatsApp/email handoff.
- The campaign page is **not live** until its PR merges and Vercel confirms successful deployment.
- No outreach is sent by this file; actual external messaging requires a verified recipient and allowed channel.
