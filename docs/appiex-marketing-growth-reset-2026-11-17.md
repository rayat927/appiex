# Appiex: marketing and sales operating plan — 17 November 2026

## Decision
Prioritize **qualified, profitable B2B projects** over mass traffic. Keep the agency's broader capabilities, but sell two tightly scoped introductory offers:

1. **Ecommerce & operations engineering** — for businesses with an existing product or operational workflow: storefront upgrades, ecommerce integrations, customer-support automation and measurable workflow improvements.
2. **White-label engineering for agencies** — for design/marketing agencies that need documented technical delivery capacity.

AI agents, SEO, UI/UX, 3D and brand/video production remain supporting specialties. Do not promise a specific revenue uplift or timeline without client-specific evidence.

## Buyer-fit rubric (human qualification)
- An actual business, named owner/decision-maker and demonstrable problem.
- Buyer can explain why the issue matters (delays, abandoned carts, manual replies, mismatched data, maintenance risk).
- Project size can cover direct delivery costs, commission, revisions and support while preserving a healthy contribution margin.
- Timeline and data-access requirements are realistic; contract includes scope, milestones, acceptance criteria and change requests.
- Don't report a form handoff as a lead until the submitted data is safely acknowledged.

## Evidence policy
Before publishing any claim, record: source, proof owner, source date, permission to use, numerical methodology, and whether client-identifiable details are approved. Technology/provider icons must be explicitly labeled as tooling, never client logos or endorsements without independent proof. Generic articles and unsupported project results are not case studies.

Suggested case-study outline: business problem; constraints; before state; solution architecture; screenshots (permissioned); acceptance test; measured after results (with time interval and measurement source); limitations; client authorization; next action. If results are unavailable, label as a product demonstration rather than an achieved commercial outcome.

## Distribution experiments (30 days, not guaranteed)
**Week 1 — Foundation:** Verify privacy and lead infrastructure; test one real consent-based form submission with non-sensitive sample data; confirm protected admin reads, analytics events and reply ownership. Audit public marketing claims. Complete one permissioned case study or detailed technical demo.

**Week 2 — Ecommerce:** Research 30-50 retailers where the public website reveals an observable problem. Keep a source URL, specific issue, contact method, permission/opt-out flag and fit assessment. Write personal messages referring to the actual problem. Avoid fabricated audits or claims that you accessed their private conversion metrics.

**Week 3 — Agency partnerships:** Shortlist 15-25 relevant design/marketing studios that serve ecommerce customers. Propose a small paid technical pilot with milestones and confidentiality terms; avoid asking for client access without permission.

**Week 4 — Measurement:** Review replies, qualified calls, proposals, actual signed revenue, delivery-margin expectations, and the specific reasons buyers declined. Retain channels that produce qualified opportunities; cut spammy low-intent channels.

## Weekly metrics
Prospects researched; tailored messages sent; positive replies; buyer-qualified discovery calls; proposals; signed projects; contract value; direct cost; contribution profit; sales cycle; source attribution; opted-out contacts. Explicitly segment individual freelancers from agency and direct-client buyers. Do not infer ROI from raw clicks, reach or impressions.

## Reddit and community participation
Follow each forum's current rules, anti-spam requirements and approved promotion threads. Publish original self-contained answers and demonstrations relevant to members' questions. Reserve agency listings for communities that permit agencies. Never mass-post across 50 communities or impersonate clients.

## Referral agreement checklist
Registration has no fee; up to 15% is a possible negotiated maximum, not an automatic guarantee. Define who qualifies, non-duplicate accepted referrals, client permission, eligible contracted revenue excluding taxes/refunds, payment schedule tied to verified client payments, clawback where lawful and agreed, expiry/dispute terms, and payout identity checks **after** the referral is approved. Obtain appropriate legal advice before launch.

## Mandatory release / incident response
- Set server-side secrets `APPIEX_ADMIN_BASIC_USER`, `APPIEX_ADMIN_BASIC_PASSWORD`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` in the correct Vercel project environments. Never commit credentials.
- Contact submissions will return 503 rather than claim a saved lead when durable storage isn't configured. The existing WhatsApp/email handoffs remain alternatives.
- The old public notification topics may have exposed personal and financial records. Disable them, rotate affected secrets and assess deletion/notification obligations; removing new publishes does not erase old copies.
- Verify privacy/retention, permissions, rate limiting, durable storage under multiple simultaneous requests, mobile form interactions, and business continuity before merging.
- Run all GitHub checks, inspect preview, verify Vercel deployment, and only then promote. No guarantee of rankings, revenue, or zero issues.
