# Search Console `noindex` coverage: 17 November 2026

The Google Search Console drilldown reported 105 URLs as **Excluded by `noindex` tag**. This is a mixed report, not 105 URLs that should all be indexed.

## Source inspection

- 45 legacy `.html` addresses are duplicate URL formats. They should permanently redirect to the extensionless canonical URL. `next.config.mjs` now has an explicit `/blog/:slug.html` redirect ahead of its generic legacy alias rule.
- 3 account/utility addresses (`/login`, `/profile`, `/collections`) deliberately use `noindex`; retain this for privacy and duplicate-prevention reasons.
- 3 affected guides (`/blog/how-much-does-ai-automation-cost`, `/blog/how-long-does-it-take-to-build-a-saas-product`, `/blog/website-redesign-process`) now declare `index, follow`, a correct self-canonical and inclusion in the sitemap. Their older Search Console reports can persist until Google recrawls.
- Other public articles are excluded on purpose and are not currently included in the canonical sitemap. Some use generic template wording; rewrite, fact-check and substantiate individual articles before making them indexable. Do not remove `noindex` in bulk.

## Safeguard

The build runs `node scripts/check-gsc-noindex-coverage.mjs`. It fails if an indexable blog sitemap entry becomes `noindex`, loses its self-canonical, or if private pages lose their `noindex` protection. It also ensures the explicit `.html` redirect remains present.

## Production validation after release

1. Check `https://appiex.com/blog/lottie-animation-and-after-effects-tutorial.html`: expect a permanent HTTP redirect (normally 308 with Next.js) to the same address **without** `.html`; it should not resolve as a separate indexable document.
2. Check all three already-indexable guides above with a GET request and a Google Search Console live URL inspection. Expect HTTP 200, canonical to self, no `noindex` meta or `X-Robots-Tag` on the target.
3. Check `/login`, `/profile`, and `/collections`: expect `noindex`; do not request their indexing.
4. In Search Console use **URL Inspection → Test Live URL → Request Indexing** for the three guides if the live result permits indexing. Use **Validate Fix** on the appropriate issue after confirming the changed responses.
5. Google Search Console may continue to list intentional `noindex` pages under excluded. Google indexing is not guaranteed; a clean sitemap does not mean every page must be indexed.

The repository-level check cannot substitute for a live HTTP test or Search Console account access. Keep these validations as release evidence; do not claim a successful Google reindex until GSC confirms it.
