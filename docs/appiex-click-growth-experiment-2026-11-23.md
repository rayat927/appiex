# Appiex — Organic Click Growth Experiment (23 November 2026)

**Input:** Appiex's red-team audit and verified Google Search Console query/page records.  
**Canonical property:** https://appiex.com/  
**Reporting window:** 2026-10-24 through 2026-11-20 (Google Search Console Pacific-time date boundaries; report can exclude the last several days due to data lag).

## Why this is a focused CTR test rather than a sitewide rewrite

The first-party GSC report shows 58 reported clicks for query `appiex` across URLs in its query-page rows, with very few non-branded clicks visible. It does **not** follow that a service page with an average position near 2 ranks near 2 for competitive terms; most of those positions are for brand searches. Google's query table withholds or anonymizes some searches, so the visible rows are not an exhaustive query census.

Do not change the homepage's successful brand-result title merely to increase a vanity CTR.

| URL | Baseline impressions | Baseline clicks | Baseline CTR | Avg position | Treatment |
|---|---:|---:|---:|---:|---|
| `/blog/technical-seo-checklist-for-business-websites` | 45 | 0 | 0% | 6.5 | New truthful "9 Tests & Fixes" title, clear snippet, 9 practical visible checks, two navigation links to checklist, verified scoped enquiry CTA |
| `/blog/website-development-cost-bangladesh` | 16 | 1 | 6.25% | 19.8 | Specific 2026 cost-range snippet and a preselected scope-based quotation path; existing title preserved |
| `/partners` | 38 | 1 | 2.63% | 4.3 | Clear white-label agency H1 and stronger agency-partnership CTA; existing title preserved |
| `/best-software-agency` | 49 | 1 | 2.04% | 9.9 | **Untouched control page:** previously improved buyer criteria; avoid frequent keyword/title churn |
| `/services` | 93 | 0 | 0% | 2.5 | **Untouched control page:** impressions predominantly for `appiex`; not evidence of competitive ranking failure |

GSC impressions and positions depend on queries, market, device, search appearance and date; do not interpret these very small samples as a valid statistical test or guarantee CTR lift.

## Content improvements shipped
1. Technical SEO checklist: changed title to `Technical SEO Checklist (2026): 9 Tests & Fixes | Appiex`, synchronized the title, social previews and article headline, kept the canonical, included an immediately visible nine-check summary with precise technical checks.
2. Updated Article JSON-LD and Open Graph modified time to 2026-11-23 **after substantive content revision**. Original publication date remains 2026-10-08.
3. Linked both desktop and mobile guide navigation to the new checklist section and changed the guide's project CTAs from homepage handoff to `/start-project?service=seo`, which preselects the SEO service using an existing approved list.
4. The Bangladesh cost guide now explains that it compares **ranges and scope**, not a universal exact quotation; the visible quote button leads to `/start-project?service=web`.
5. The agency partnership hero now more accurately aligns with white-label agency delivery and offers a clear application action.
6. The existing 50 preferred sitemap URLs, .html alias redirection policy, privacy-page `noindex` safeguards and server-confirmed `generate_lead` behavior remain unchanged.
7. Added `scripts/check-click-growth-experiment.mjs` to production builds to stop title/schema/snippet mismatches and protect user-qualified enquiry routes.

## How to measure without fooling ourselves

**Day 0:** Record the exact change date, current GSC query-page-country-device cohorts, and GA4 confirmed-lead baseline. The Google Analytics Admin property currently does **not** mark `generate_lead` as a key event; that remains an external account-side task.

**Day 7–14:** Confirm Google has recrawled the updated guide via GSC URL Inspection; don't assume a code deploy immediately changes search result title or snippet. Inspect the actual live Search appearance for the relevant queries if there are enough impressions.

**Day 28:** Compare equal length GSC periods by page, search type, country and device. Separate the branded `appiex` query from category and commercial queries; check visible Google-selected title/snippet and landing-page impressions. If impressions are below ~100 per URL, treat differences as directional, not evidence of a meaningful uplift.

**After a qualified submission:** Verify successful server acknowledgement, corresponding GA4 `generate_lead` event and private CRM record; clicks on WhatsApp/email are handoffs, not completed leads. To report conversion as a GA4 key event, someone with GA4 Admin rights must register `generate_lead`.

### Reporting table
| URL | Pre period impressions | Pre clicks | Post period impressions | Post clicks | CTR delta | Relevant nonbrand impressions | Confirmed organic leads |
|---|---:|---:|---:|---:|---:|---:|---:|
| Tech SEO checklist | 45 | 0 | Pending | Pending | Pending | Need query classification | Not measured |
| Bangladesh cost guide | 16 | 1 | Pending | Pending | Pending | Need query classification | Not measured |
| Partners | 38 | 1 | Pending | Pending | Pending | Need query classification | Not measured |

**Don't declare a click increase immediately after deployment**. Clicks are generated by search users over time, not by publishing metadata. A good result is more relevant non-branded clicks and server-confirmed leads, not an increase in irrelevant traffic.

## Google documentation
- Titles are generated automatically from title tags, visible headings, Open Graph and other sources: https://developers.google.com/search/docs/appearance/title-link
- Google primarily produces snippets from visible page content and may use the meta description: https://developers.google.com/search/docs/appearance/snippet
- Search Console metrics and Analytics measure different things: https://support.google.com/webmasters/answer/7576553

## Avoid
No clickbait, fabricated customer results, keyword-stuffed titles, mass URL submissions, fake rating markup, private-page indexing, or AI-generated doorway content. The site's commercial demand and genuine third-party authority require separate development beyond this small CTR treatment.
