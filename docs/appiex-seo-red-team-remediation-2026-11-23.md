# Appiex SEO red-team remediation — 23 November 2026

## Decision
Protect site trust and increase **non-branded qualified enquiries**. Technical SEO fundamentals are necessary but not a substitute for differentiated services, published evidence, qualified demand, or measured leads.

### Sources and data limits
- First-party GSC 28-day query sample checked 23 Nov 2026: `appiex` accounts for **56 clicks / 96 impressions** (average position ~1.1). The remaining returned query rows have negligible impressions and no recorded non-branded clicks. These are the **returned** top query rows, not proof the entire website had zero non-branded clicks.
- GA4 for Nov 1–21: 68 organic sessions, 23 active users, 50 engaged organic sessions, and 0 tracked key events. **This is not equivalent to zero customer enquiries** because `generate_lead` was not included among GA4's registered key events at last check.
- 50 canonical sitemap URLs were retained. No broad removal of noindex, no artificial creation of city/keyword pages, no unsupported international offices.
- OpenSEO's most recent crawl had a 50-page limit; 59 discovered links were not crawled in that run. It does not demonstrate Google's crawl budget was exhausted.
- A Google Search Console/Analytics 4 Admin write tool is not currently connected. The account-side configuration cannot be claimed complete.

## High-confidence findings fixed in this PR
| Risk | Public pages | Resolution |
|---|---|---|
| Invented universal Core Web Vitals thresholds / score promises | `/seo-marketing`, `/best-software-agency`, `/partners`, `/projects`, `/website-redesign` | Replace fixed LCP, score and load-time boasts with per-project testing of LCP, INP and CLS and clear limits |
| Unfounded AI ranking mechanism terminology | `/seo-marketing` | Replace “LLM Knowledge Injection” / definitive AI result copy with evidence-led, public-content and assistant search-readiness explanations |
| Unsupported competitor rates, global ranking and delivery claims | `/best-software-agency`, `/best-agency-in-the-world` | Remove declared “verified rates”, pseudo ranking, baseless prices, overconfident delivery claims; identify publisher bias and provide an impartial buyer checklist |
| Case-study evidence boundary unclear | `/case-studies` | Add a specific buyer verification section distinguishing visible project work from separately measured results, with ethical source links |
| Regression risk | All touched public pages | CI gate checks forbidden claims, sitemap canonical preservation, metadata/schema consistency and lead tracking |
| Stale sitemap modification timestamps | Seven revised public pages | Mark actual 2026-11-23 content revisions with matching `lastmod` dates |

## Questions for an external SEO challenger
1. Can a buyer discover an Appiex commercial solution **without** already knowing the Appiex name?
2. Can claims about performance, speed, ROI, timelines and pricing be matched to publicly inspectable primary evidence?
3. Are reviews/testimonials genuine, consented, cited and limited to what a client actually approved?
4. Are commercial pages clear about scope, excluded services, decision criteria and contact methods?
5. Can a real human complete the `/start-project` flow and reach the secure API when durable storage is configured?
6. Are `generate_lead` reports based on server-acknowledged receipts, instead of `click_whatsapp`, failed submissions or draft forms?
7. Are claims of US/UAE coverage distinguished from registered local offices and verified client engagements?

## Highest-leverage uncompleted actions (real external dependencies)
1. **GA4 Admin:** Mark `generate_lead` as a key event; inspect DebugView after a permitted internal test that actually reaches durable storage. Align GA4 stream URL with the canonical site and verify the GA4↔GSC account link. See `docs/appiex-gsc-ga4-operation-checklist-2026-11-23.md`. Google tool connection alone cannot perform these Admin writes.
2. **Firsthand proof:** With explicit customer permission, add an actual case-study experiment: anonymized requirements, a reproducible baseline, device/network/test environment, changes made, dated after-measurement, known limitations and owner signoff. **Do not invent improvement numbers or testimonials**.
3. **Topical commercial SEO:** Check current SERPs and non-branded GSC impressions for Bangladesh website development, technical SEO and AI automation use cases. Strengthen a small number of distinct service pages. Avoid keyword-cannibalizing clone pages.
4. **Off-site authority:** Research verified industry directories, partner pages, open-source documentation and relevant conferences; request editorially appropriate citations. **No purchased, spammed or fabricated backlinks**.
5. **Core Web Vitals:** Obtain actual CrUX/Lighthouse or RUM LCP, INP and CLS on the deployed site, separately for device types. Field metrics must not be inferred from text or CI status.
6. **SEO crawl coverage:** Repeat OpenSEO audit with enough capacity for all intended public URLs. Categorize noindex pages and redirected aliases separately. Never conflate Search Console's aggregate-indexed count with a sample of inspected canonical URLs.
7. **AI visibility:** Establish a representative prompt/citation sample by service and market. Count observed citation events without guaranteeing that an AI assistant will mention Appiex.

## Four-week measurement protocol
**Day 0:** Freeze GSC query/page/country baseline and GA4 key-event definitions. Record current 50 preferred canonical pages and their GSC status.
**Week 1:** Complete GA4 Admin registration, one consented form test, verify API receipt and DebugView, document proof assets requiring client approval.
**Weeks 2–3:** Release 1–2 independent evidence pieces, improve internal links from commercial pages, review actual query mapping and search results; pursue a small number of genuine industry mentions.
**Week 4:** Report non-branded high-intent query impressions, clicks, organic landings, genuine key events, CRM-qualified leads, contacted prospects, scope-based proposals and sales. Avoid causal claims from a tiny observational sample.

## Official references
- Google Search people-first content and evidence: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Core Web Vitals and real measurement: https://web.dev/articles/vitals
- Verified GA4 account actions: `docs/appiex-gsc-ga4-operation-checklist-2026-11-23.md`

## Quality requirements
- No made-up case-study metrics, reviews, pricing tiers, external certifications or ranking promises.
- No changing existing private-page `noindex` unless a page is deliberately approved for publication.
- No change to `/api/orders` lead storage permissions or existing private lead contents.
- Keep HTML-specific metadata, JSON-LD, search-intent map and sitemap modification dates consistent; build must pass all current regression jobs.
