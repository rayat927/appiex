# Appiex | SEO-25 execution register

**Reviewed:** 23 November 2026 (Asia/Dhaka)  
**Project:** https://appiex.com/  
**Implementation branch:** `feat/seo-25-buyer-intent-execution-20261123`  
**Rule:** Do not confuse "SEO terminology covered" with a verified ranking gain or completed third-party citation.

## Why these changes
First-party Google Search Console (28-day query/page sample, as retrieved at execution) returned 38 query–page rows and 44 page rows. In those rows the branded query **appiex** generated most of the observed clicks. Some commercial pages appeared for branded queries but had no nonbranded clicks in this sample. Do not describe their average positions as proof of competitive commercial rankings.

OpenSEO 50-page audit issues included: 18 meta descriptions >160 characters, 10 long titles, 4 heading-level skips, 2 legal pages with no outgoing links, and an audit limit of 50 pages (59 other URLs discovered but not crawled). An audit-page limit is not Google's crawl budget. Current canonical sitemap has 50 URLs; not every historical excluded URL should be indexed.

## Shipped in this branch
- Added accessible, user-visible buyer-intent/answer-guide sections to `/services`, `/ai-automation`, `/web-development`, and `/seo-marketing`.
- Included explicit service comparison criteria, automation-versus-rules advice, implementation risk controls, international/local suitability, and search measurement limitations.
- Added contextual links only to valid canonical destination pages and the existing consent-based `/start-project` funnel.
- Shortened the 2026 Bangladesh website cost and web-development titles, synchronized Open Graph/Twitter title text, and updated the curated search-intent map.
- Updated editorial policy on evidence, third-party publication, programmatic content and meaningful refreshes.
- Created mobile/keyboard/reduced-motion styling without introducing additional JavaScript dependencies.
- Added `scripts/check-seo-25-execution.mjs` to `npm run build` to prevent broken internal links, duplicate sections, unauthorized indexing, and degraded brand/lead tracking semantics.

## All 25 concepts — action, status and next evidence

| # | Concept | Applied or assessed on Appiex | Status | Evidence / follow-up |
|---|---|---|---|---|
| 1 | Query fan-out | Connect services, requirements, comparisons, cost factors and evidence across four visible buyer guides | Implemented | No invented fan-out traffic or automatic AI retrieval guarantees |
| 2 | Information gain | Added practical decision matrices, real buyer questions, implementation safeguards; no fabricated ROI studies | Partial | Next: publish sanitized real project measurements only with approval |
| 3 | Keyword cannibalization | Preserve distinct intent for each existing sitemap URL in `page-search-intents.json` and run existing uniqueness checks | Verified guard | 38 GSC query/page rows too sparse to justify merging unrelated pages |
| 4 | Crawl budget | Preserve small canonical sitemap and normal redirects; do not add unnecessary crawl-delay or blocking rules | No change required | 50 canonical URLs is not a large-site crawl-budget case |
| 5 | Index bloat | Maintain deliberate private/draft exclusions and legacy redirects; no forced bulk indexing | Protected | GSC exclusions ≠ index bloat; inspect individual URLs |
| 6 | Striking distance | Reviewed actual 28-day page opportunities and focused buyer-experience improvements | Prioritized | /partners 37 impressions at avg position ~4.4, /refer 28 at ~18.3, /case-studies 12 at ~6.4; small, often branded data |
| 7 | Passage ranking | Use direct-answer headings, self-contained explanations, decision tables and FAQs on relevant service pages | Implemented | Does not force Google to rank an isolated passage |
| 8 | Site reputation abuse | Added explicit third-party editorial/reputation policy | Implemented | Review third-party submissions individually |
| 9 | Entity salience | Consistent Appiex identity, Dhaka base and remote international delivery clarified in buyer guides | Improved | No claims about undisclosed international offices |
| 10 | Generative engine optimization | Better source-worthy answers with linked comparison and company evidence pages | Improved foundation | Citation measurement requires a representative AI-answer sample |
| 11 | Search intent | New decision-guide sections distinguish website, ecommerce, AI automation and SEO jobs-to-be-done | Implemented | Verify with actual non-branded query growth |
| 12 | Topical authority | Link services to relevant deep guides (AI vs n8n, SaaS timeline, pricing and technical SEO) | Improved | Avoid redundant keyword pages |
| 13 | Semantic SEO | Human-readable entities and distinctions between rules engines, AI agents, CRMs, ecommerce and SaaS | Implemented | Not a proprietary Google “semantic score” |
| 14 | E-E-A-T | Editorial corrections, human review, evidence standards and case-study links | Reinforced | Publish more first-party project proof once validated |
| 15 | Canonicalization | Keep sitewide HTTPS canonicals, preferred host and existing .html redirect guard | Verified existing | `check-gsc-noindex-coverage` / `check-https-titles-robots-redirects` |
| 16 | Orphan pages | Direct canonical internal links added from four service pages | Improved | Crawl all discovered URLs in a later >50-page audit |
| 17 | Internal link equity | Context-specific paths link commercial pages to educational resources and conversion funnel | Implemented | Link relevance, not a measured equity score |
| 18 | AEO | Direct, factual questions and answer sections on SEO and service pages | Implemented | No FAQ-rich-result guarantee |
| 19 | Zero-click search | Separate citations/brand awareness from confirmed web clicks and leads; no invented attribution | Measurement policy | Track quality through GA4 + CRM; AI-surface data is incomplete |
| 20 | Core Web Vitals | Scoped CSS, responsive tables, no new runtime JS | Performance-preserving | Still requires actual LCP/INP/CLS measurements on deployed pages; no score claims |
| 21 | Hreflang | Avoid invalid hreflang because the site currently lacks verified equivalent localized URLs | Correct non-action | Add only when genuine alternate language/regional pages exist |
| 22 | Structured data | Preserve existing Organization/WebSite and factual schemas; do not add made-up ratings/reviews | Verified guard | Validate visible-data match before adding more schema |
| 23 | Programmatic SEO | Editorial policy forbids thin location/keyword template pages and unreviewed scale | Guard implemented | Any scaled template must have unique user value and QA |
| 24 | Content decay | Explicit correction/update policy; reviewed content when material facts change | Policy implemented | Schedule editorial checks when platform and service data change |
| 25 | CRO | User-approved `/start-project` CTAs; preserve server-acknowledged `generate_lead` semantics | Implemented / guarded | Check actual successful submissions and source attribution in GA4 |

## Explicit non-actions
No mass noindex removal, sitemap inflation, generic city doorway pages, bought backlinks, fabricated customer data, fake review schema, unnecessary hreflang, unverified international office claims, or false ranking guarantees.

## Measurement checkpoints
Check in GSC for: distinct non-branded queries, impressions for target service pages, canonical/indexing exceptions, international country distribution, and CTR by query/page. Record 7/28-day changes and compare overlapping equivalent periods. For GA4, separate site visits, meaningful CTA interactions, **server-confirmed lead receipts**, CRM-qualified opportunities and closed clients. Never send visitor message contents or personal information into Google Analytics.

### Priority next tests
1. Verify the live Vercel production build, HTTP status, mobile layout, anchor links and CSS on the four changed pages.
2. Inspect **real** search queries and avoid implying that branded positions are commercial keyword wins.
3. Re-run OpenSEO's site audit with enough capacity to cover the 59 URLs not crawled in the previous capped audit, and measure Core Web Vitals through field/lab tools before claiming speed improvements.
4. Add consented, verifiable project data and screenshots to a suitable case study; avoid invented results.
5. Review results at least 7–28 days after release; indexing, GEO citations and conversion changes cannot be guaranteed in three days.

## Relevant guidance
- Google Search AI features: https://developers.google.com/search/docs/appearance/ai-features
- People-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Crawl budget: https://developers.google.com/crawling/docs/crawl-budget
