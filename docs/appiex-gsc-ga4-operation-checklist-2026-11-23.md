# Appiex — Google Search Console + Google Analytics 4 operations
**Checked:** 2026-11-23 (Bangladesh time)  
**Source:** Connected OpenSEO Google Search Console, Google Analytics Admin/Data API, Appiex GitHub and primary Vercel build.  
**Note:** The connected OpenSEO and Windsor.ai Search Console tools provide data access but do not expose permissions to create GA4 admin key events, change GA4 stream settings, create GSC↔GA4 product links, or submit a Google sitemap. Do not claim those account-side actions happened.

## 1. Verified correct Google properties
- GSC selected verified owner property: `https://appiex.com/`. **Do not replace it with `www.appiex.com`** because the site's canonical host is apex.
- GA4 selected property: Appiex Website, `properties/561800149`.
- GA4 web stream: Appiex, `16249768164`; measurement ID `G-DF198MPZGT`.
- Current GA4 stream default URI is `https://www.appiex.com`; this differs from the canonical `https://appiex.com/`. This setting is a metadata alignment task, not proof that measurement fails.
- Enhanced measurement is on for page changes, scroll, outbound clicks, site search, videos, file downloads and form interactions.
- Currently marked GA4 key events: `close_convert_lead`, `qualify_lead`, `purchase`. **`generate_lead` is not a marked key event**.
- GA4 Admin returned no administrative issues but that does not prove live frontend event collection.

## 2. Baseline before this release
- GA4 organic search, November 1–21 (GA4 America/Los_Angeles timezone): **68 sessions**, **23 active users**, **50 engaged sessions**, **0 recorded key events**.
- GA4 campaigns (all channels, Nov 1–21): (direct) 164 sessions, (referral) 87, (organic) 56, (ai-assistant) 36, (not set) 2. These are GA4's sessionCampaignName categories, not verified distinct external assistant referrals.
- Do not conclude there were zero actual enquiries from zero key events: event marking or delivery may be incomplete.
- GSC recent query data is predominantly branded `appiex`. Current aggregate indexed count must be read from GSC's own Pages chart; earlier dashboards showed 42 while individual inspected URL statuses were newer.
- The canonical sitemap remains **50 URLs**; six substantively updated public pages now have truthful `lastmod>2026-11-23`.

## 3. Code-side change and test (completed in this release)
- The site already sends `generate_lead` **only after a successful `/api/orders` response**. A WhatsApp click, opening the email composer, or a prepared form is *not* a lead.
- Confirmed events now carry whitelisted non-personal `lead_channel` and `lead_service` labels, to distinguish `project_fit` and `homepage_contact` and recognized services.
- `scripts/check-ga4-confirmed-leads.mjs` simulates the tracker: verifies GA4 setup, no lead from handoffs, correct confirmed event, no untrusted personal details, and exact event categories.
- `npm run build` runs that verification before Next.js compiles.
- No real customer message, name, email, phone number, or website URL is sent as an Analytics event parameter.

## 4. GA4 account actions still required (not executable through connected tools)
A user with GA4 **Marketer** or greater permission for key events should:
1. Open https://analytics.google.com/ and select property **Appiex Website** `561800149`.
2. Admin → Data display → Events / Key events (UI labels may vary); create or mark `generate_lead` as a **key event**. The name must match exactly, lowercase and underscore. Do not create a new event whose conditions re-fire on click; the website already sends `generate_lead` after verified receipt.
3. Keep `qualify_lead` and `close_convert_lead` distinct for later CRM qualification/closing. Don't rename a `click_whatsapp` or `form_submit` into a qualified lead.
4. Admin → Data streams → Appiex stream → set default website URL to `https://appiex.com/` for consistent metadata, provided no other webstream is intentionally targeting www.
5. For segment reporting, Admin → Custom definitions → create event-scoped custom dimensions for **Lead channel** (`lead_channel`) and **Lead service** (`lead_service`), after verifying compliant event data. These are optional and not retroactive.
6. Use GA4 DebugView / Realtime with **one authorized internal test**, only when the production form's durable Redis backend is correctly configured, consent is accepted, and test lead cleanup is planned. A successful JSON API acknowledgement is required. Verify one `generate_lead` event, the service category, and no personally identifiable information in Analytics.
7. In GA4 Admin → Product links → Search Console links, check if GSC `https://appiex.com/` is already linked. If not, use **Link** (requires GA4 Editor and verified GSC owner) and choose stream `G-DF198MPZGT`. This is a different action from connecting both tools to OpenSEO.
Official guidance: https://support.google.com/analytics/answer/10737381 and https://support.google.com/analytics/answer/12966437

## 5. Search Console actions still required (not executable through connected tools)
1. In https://search.google.com/search-console, select **URL-prefix property** `https://appiex.com/` (already confirmed owned).
2. Open **Sitemaps**. Check existing entries first; if `https://appiex.com/sitemap.xml` is absent, submit `sitemap.xml`. If already successful, there is no need to repeatedly remove/resubmit.
3. Inspect `https://appiex.com/` under URL Inspection. The homepage was confirmed indexed by Google on November 22; do not request indexing repeatedly for an already-indexed page.
4. Inspect the six changed pages after deployment and choose **Request Indexing** only when their current live content is indexable and Google has not already fetched the relevant revision. The Search Console URL Inspection API is read-only; no general API exists to press this UI button for agency pages.
5. Check Pages → why pages aren't indexed. Redirected .html aliases, private pages and deliberately withheld editorial drafts should **not** be bulk-submitted.
6. Validate the Google-selected canonical, live HTTP 200, no `noindex`, sitemap links, internal links, and crawl timestamps before deciding that a page needs correction.
Official guidance: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl and https://developers.google.com/webmaster-tools/v1/sitemaps/submit

## 6. IndexNow changes already sent
On Nov 23, six updated canonical URLs were submitted successfully through OpenSEO IndexNow, for participating search engines such as Bing, **not Google**:
`/services`, `/ai-automation`, `/web-development`, `/seo-marketing`, `/blog/website-development-cost-bangladesh`, `/editorial-policy`.
Do not say IndexNow updated Google Search Console.

## 7. Monitoring plan
- Daily: GA4 Realtime DebugView on consented tests, form/API health without private data, new key-event metrics after registration.
- After a few days: GSC last crawl and indexing for the six changed URLs; compare branded vs nonbranded query impressions and countries.
- After 28 days: use consistent full date ranges, actual GA4 completed key-event observations, CRM qualification by source, conversion rate and proposals. Do not present a 1–2 day trend as a reliable SEO outcome.
- Use separate terms: **view → contact CTA click → form prepared → secure receipt (`generate_lead`) → qualified lead (`qualify_lead`) → closed project (`close_convert_lead`)**.
