# Appiex — Advanced SEO Growth, Backlink Forensics & Measurement Plan

**Prepared:** 23 November 2026 (Asia/Dhaka)  
**Canonical property:** https://appiex.com/  
**Source of truth:** connected first-party Google Search Console/GA4 via OpenSEO, live backlink API, Ahrefs DR, and current `rayat927/appiex` source at audit time. This is an internal operational document, **not a customer success case study**.

## Executive forensic findings

1. **Search discovery is branded-dominated.** Search Console's returned query/page sample for October 23–November 19 has 38 rows. The brand query `appiex` accounts for 56 clicked results across returned URL entries; none of the other returned non-brand query/page pairs shows clicks. Google's API omits some low-volume/anonymized query rows, so **this is not proof of exactly zero non-branded clicks sitewide**.
2. **Real organic traffic is small and concentrated on the homepage.** GA4's 1–20 November organic search landing-page report shows 54 homepage sessions out of 67 visible row sessions (all channels and full month excluded). There are nine landing-page rows, two sessions each on the website-cost blog, projects and case study. Do not mix GSC clicks and GA4 sessions as if identical.
3. **Measurement is incomplete.** The GA4 property `properties/561800149` (Appiex Website), web stream `16249768164` (`G-DF198MPZGT`) still lists `qualify_lead`, `close_convert_lead`, and `purchase` as key events, **not `generate_lead`**. Its configured stream default URI is still `https://www.appiex.com`, while website canonicals use `https://appiex.com/`.
4. **External authority is weak.** Ahrefs public Domain Rating for appiex.com is **1.2** on Nov 23; DR is Ahrefs' proprietary metric, **not a Google metric**. A separate OpenSEO backlink provider reported 33 backlinks from 30 referring domains as of Nov 22, and a 26-domain per-domain sample when asking for individual links without a spam filter. Differences are vendor/sample/scope dependent; do not sum them.
5. **Backlink quality requires investigation.** The backlink provider's historical trend temporarily showed 176 referring domains in September before a return to ~30 by Nov 22. Several current source pages use generic promotional “SEO authority backlinks” anchors or automated report templates. This *may* indicate automated links but does not establish a Google manual action, ownership, a coordinated attack or a rank suppression.
6. **Technical structure is relatively stable.** The sitemap has 50 preferred HTTPS canonical URLs. The last OpenSEO audit reached a 50-page configured crawl limit, leaving 59 discovered URLs outside that scan. This is **OpenSEO's audit cap, not Google's crawl budget**.
7. **Specific on-page findings.** OpenSEO's last capped crawl showed 18 over-160-character meta descriptions, 10 long titles, four heading-order warnings, and two legal URLs without normal outgoing internal links. These are mostly informational/medium-priority, not reasons by themselves for poor rankings. Relevant descriptions, evidence sections and legal navigation were improved in this branch.
8. **The code now contains unique buyer acceptance tests** on `/best-software-agency`, `/web-development` and `/seo-marketing`. These are practical procurement and audit criteria, *not fabricated project results*.

## Keyword evidence: Bangladesh (DataForSEO via OpenSEO, November 23, 2026)

Volume and difficulty are third-party estimates, not Google Search Console impressions. Google location `2050` (Bangladesh), provider language code `bn` due provider coverage. English phrase demand estimates can be sparse; revalidate before substantial investment.

| Keyword | Est. monthly searches | Est. KD | Commercial use | Canonical page |
|---|---:|---:|---|---|
| software company in bangladesh | 1,300 | 6 | Buyer comparison and company selection | /best-software-agency |
| website development company in bangladesh | 720 | 25 | Build or redesign a business site | /web-development |
| seo agency bangladesh | 30 | 18 | Audit/service quote | /seo-marketing |
| website development cost in bangladesh | 30 | 34 | Price and scope research | /blog/website-development-cost-bangladesh |
| ecommerce website development bangladesh | n/a | n/a | Existing commercial category; provider returned no metric | /ecommerce-development |

No relevant metric returned for several other requested phrases, including `ai automation agency bangladesh` and `n8n automation services`. **No result is not zero search volume.** Avoid invented forecasts or summing grouped variants.

## Evidence-led backlink review (never bulk disavow)

OpenSEO's 26-link one-per-domain sample includes links from domains such as:
- `filmizleten.com` and `theminee.com`: anchor text advertising “Proven SEO Authority Backlinks”; provider spam heuristic 60.
- `relevantbacklinks.shop`: anchor text advertising premium SEO links to appiex.com; spam heuristic 55.
- Auto-generated report/share-type URLs on `bye.fyi`, `screenshots.wiki`, `drjack.world`, `urls-shortener.eu`, `anchorurl.cloud`, `ready.pro`, `ycm.info`, and similar hostnames; many have provider spam heuristics around 50.
- `hub.rankvance.com` (heuristic 20), `global-website.pages.dev` (35), `echoz.pages.dev` (25): inspect source relevance manually before assigning a quality label.

These are *review leads*, not a proven penalty list. Do not submit disavow.txt based on an automatically assigned risk score. First check GSC **Security & Manual Actions → Manual actions**, investigate whether links were purchased/generated on behalf of Appiex, and seek removal only where appropriate. Google's disavow guidance requires strong evidence of artificial links and actual/potential manual action risk. Resource: https://support.google.com/webmasters/answer/2648487

### Positive, ethical authority plan
1. Ask **existing client/partner contacts**, with explicit approval, to cite a genuine, publicly released Appiex case study where it helps their own users. No compulsory footer/sitewide credit links.
2. Publish a **reproducible technical asset** (e.g., a genuine documented ecommerce test fixture, anonymized QA workflow, or open-source example) and share it with relevant engineering communities for their own use.
3. Seek editorial inclusion in **relevant industry ecosystems** that require real business information and editorial verification. Avoid paid mass-directory submissions.
4. Improve team and case-study provenance, company contact identity and client-controlled factual references.
5. Record each opportunity: publication, reason for relevance, contact permission, date, whether editorially earned, actual source URL and eventual observed referral traffic.
6. Re-evaluate each month using first-party referring traffic and a trusted backlink vendor; ignore raw link-count spikes as success metrics.

## Implementation register — this branch

- `/best-software-agency`: buyer evidence matrix, practical tender acceptance criteria, distinct comparison of software, ecommerce, SaaS and AI needs; internal links to published work and a scoped project enquiry.
- `/web-development`: 6-category pre-launch acceptance test matrix (enquiries, migration, accessibility, Core Web Vitals, operations, ecommerce reliability).
- `/seo-marketing`: 6-workstream auditable SEO deliverable framework (crawl/indexability, query intent, information gain, performance, backlinks, conversion).
- `/privacy-policy` and `/terms-of-service`: useful crawlable related-page navigation.
- Seven high-visibility search snippets shortened and synchronized with OG/Twitter and curated `page-search-intents.json`.
- `sitemap.xml`: truthful `lastmod` for 10 pages substantively updated this release.
- `scripts/check-advanced-seo-architecture.mjs`: analyze internal link graph from every canonical HTML source, log orphan/low-inbound pages, and gate future releases on buyer evidence, metadata, sitemap and privacy safeguards.
- Preserve the 50 canonical URLs and all deliberate private-page `noindex` protections.

## Human/administrator actions that cannot be performed by available account tools

**P0 — GA4:** In property Appiex Website, mark `generate_lead` as a key event. The website emits it only after successful `/api/orders` acknowledgement. In GA4 Realtime/DebugView, run **one permitted internal test** with consent and valid backend; verify receipt and no PII in analytics. Align default stream URI with canonical `https://appiex.com/`; check GA4↔GSC product link. Read `docs/appiex-gsc-ga4-operation-checklist-2026-11-23.md`.

**P0 — Google Search Console:** Verify sitemap status in the dashboard, do not repeatedly request indexing of already-indexed pages, review manual actions and security notices, and reconcile aggregate indexed count against inspected *canonical* URLs. URL Inspection API does not expose Google's manual Request Indexing action.

**P1 — Original proof:** Obtain permission to publish one actual customer implementation or owner-approved internal technical experiment. Record environment, dates, source data, steps, baseline, after-measurement, failure cases and limitations. Do not invent revenue/ranking/performance numbers.

**P1 — Core Web Vitals:** Run real field/lab checks on priority templates, grouped by page and device. Use the actual LCP/INP/CLS metrics and conditions, not an unverified “95+ CWV” claim.

**P1 — Broader crawl:** Run a >50 URL audit covering all intended public URLs; categorize redirects, private routes and legitimate exclusions separately. Do not confuse vendor crawl limits with Googlebot capacity.

## Four-stage success measures (not a forecast)
- **Now:** code QA, stable canonical/indexability, validated metadata, documented external authority baseline.
- **Next 7 days:** verified GA4 key-event setting, received test event, source/CRM match; review GSC manual actions and current crawl.
- **Next 28 days:** relevant non-branded commercial impressions/clicks by landing page and country, source-specific landing engagement, actual site enquiries and qualified outcomes.
- **Next 60–90 days:** editorially earned relevant citations, published proof assets, qualified organic proposals and deals. Evaluate whether each change had enough traffic to infer anything.

### The decisive KPI
**Genuine qualified enquiries from people who did not search specifically for Appiex.** Index counts, backlink totals, AI-mentions or third-party SEO scores are supporting diagnostics only.
