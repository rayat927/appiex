# Appiex — Bing Webmaster Tools setup and SEO operations

**Canonical property:** `https://appiex.com/`  
**Sitemap:** `https://appiex.com/sitemap.xml`  
**IndexNow ownership key URL:** `https://appiex.com/edc774626e87396624f82617c4d6500e36b43d4b.txt`  
**GitHub:** `rayat927/appiex`

## What is and isn't connected

Appiex already has IndexNow automation, which sends URL-change notifications to Bing and other participating search engines **without needing a Bing Webmaster account**. This is different from importing, verifying or signing into the private Bing Webmaster Tools dashboard. The repository does **not** prove that Appiex is already a verified property in Bing Webmaster Tools. Account setup requires a site owner to sign in and approve permissions.

## Recommended: import from existing Google Search Console

1. Open https://www.bing.com/webmasters and sign in using your preferred Microsoft, Google or Facebook account.
2. Choose **Add a Site → Import sites from Google Search Console**.
3. Sign in to the **Google account that actually owns or has verified access** to `https://appiex.com/` and explicitly approve the Bing integration.
4. Select **Appiex**. If both `www.appiex.com` and `appiex.com` appear, prioritize `https://appiex.com/` because the website redirects `www` there.
5. Confirm successful import and verified status. Import usually brings in the known Google sitemap, but check **Sitemaps** and submit `https://appiex.com/sitemap.xml` if missing.
6. Use **URL Inspection** → **Live URL** to test `https://appiex.com/`, `/services`, `/web-development`, `/ai-automation`, `/seo-marketing` and `/website-lead-calculator`.
7. Open **IndexNow** in Bing Webmaster Tools to inspect notifications, and **Search Performance** for Bing queries/clicks/impressions when data appears. The first data may take up to 48 hours.
8. Review **SEO Reports**, **Site Explorer**, and the Index coverage/URL Inspection reports; correct real technical issues before requesting unnecessary repeated indexing.

Reference: https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b

### If Google import is unavailable

Use **Add Site → Verify** and select either:
- **HTML meta tag:** Bing shows a unique `msvalidate.01` verification string. Add Bing's exact meta tag to the homepage's `<head>`, deploy, then press Verify.
- **XML verification:** Download the unique `BingSiteAuth.xml` Bing provides, place it at the public website root, deploy, then Verify.
- **DNS verification:** Add Bing's exact CNAME value in your DNS provider and verify after propagation.

Never invent a Bing verification token, and do not paste a Bing API key or account password into a public repository.

## Search-engine-notification workflow in this repository

The GitHub Action `.github/workflows/submit-indexnow.yml` now runs on **main branch** changes to:
- the published sitemap or robots file;
- root/site/blog HTML pages;
- the sitewide HTML/SEO source and the IndexNow publisher itself.

The publisher maps changed published HTML files to their canonical sitemap URLs, compares the previous and current sitemap entries, and submits only valid indexable Appiex URLs. Changes to global SEO code trigger a full-sitemap notification. Manual GitHub Actions dispatch can also submit the complete current sitemap.

**Guardrails:** Only `https://appiex.com/` URLs that appear in the 49-entry canonical sitemap; no query string, no admin/login/client funnel URL, no noindex page; verify the public IndexNow ownership key, the production sitemap version and each selected live URL before calling the API. Errors should be fixed rather than hidden.

A successful **HTTP 200/202** from IndexNow means the search engines' protocol endpoint received the submission. It does **not** prove a page was crawled, indexed, ranked, or mentioned by Copilot. Account verification and Bing Search Performance must be checked in the Webmaster Tools UI.

Reference: https://www.bing.com/webmasters/help/indexnow-0z209wby

## Bing search and AI/Copilot SEO priorities

1. **Query intent:** Review actual Bing keywords by landing page. Prioritize commercial matches such as website-development costs, business AI automation, WhatsApp automation, ecommerce development, and technical SEO instead of generic viral traffic.
2. **Reliable evidence:** Use accurate project screenshots and client-permitted results; review unsupported award/ranking/performance claims before using them for sales.
3. **Crawl clarity:** Keep indexable pages accessible to Bingbot, use one canonical URL per page, eliminate duplicate parameter/.html variants with redirects, and prevent indexing of login/admin/customer forms.
4. **Original answers:** Explain pricing factors, timelines, exclusions, data practices, and service suitability with original work. Use descriptive headings and internal links from related articles.
5. **Trustworthy external mentions:** Earn links from relevant real businesses, professional communities and publishers. Do not purchase spam links or copy pages solely to manipulate results.
6. **Lead quality:** Measure actual project enquiries, qualified meetings, signed contracts and source/channel attribution. A WhatsApp button click does not prove a lead was received.

Official Bing guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a

## Operational checklist

- [ ] Bing account signed in by site owner
- [ ] Google Search Console property imported or unique verification token deployed
- [ ] `https://appiex.com/` listed as **Verified** in Bing Webmaster Tools
- [ ] `https://appiex.com/sitemap.xml` visible in Bing **Sitemaps**
- [ ] Bingbot Live URL inspection passes for homepage + top service pages
- [ ] IndexNow submissions visible in Bing Webmaster Tools, with inspection of rejected/index-excluded URLs
- [ ] First Bing Search Performance baseline recorded
- [ ] Check weekly for Bing-specific crawl/index issues, compare with Google Search Console and confirmed leads

**Do not claim these account-dependent checklist items are complete until the site owner has verified them in the Bing dashboard.**
