# Appiex Security & Next.js Migration Notes

## Deployment prerequisites

Before promoting the Next.js migration to production, configure these **server-side** environment variables in Vercel for Production and Preview as appropriate:

- `ADMIN_KEY`: a **new**, long random secret for privileged `/api/visitors` operations. Do not reuse the previously embedded demo key. Never expose it through `NEXT_PUBLIC_*` variables or browser code.
- `APPIEX_ADMIN_USER`: unique dashboard username.
- `APPIEX_ADMIN_PASSWORD`: a new, strong dashboard password (different from `ADMIN_KEY`).

The admin UI is protected by server-side HTTPS Basic authentication on first login. A short-lived, HMAC-signed, `HttpOnly`/`Secure`/`SameSite=Strict` cookie then allows the browser to use the protected Next.js visitor API without exposing `ADMIN_KEY` to client JavaScript. Cookie-authorized DELETE requests require the exact same origin. With any required credential unset, the admin UI fails closed with HTTP 503, and the protected API cannot be accessed using that missing key. Admin HTML and JSON responses are never publicly cached. This remains a **temporary** authentication design: implement role-aware sessions, revocation, and a private database before scaling.

## Visitor telemetry privacy

The legacy outbound notification stream was unauthenticated and could contain personal information. Publishing and hydrating from that stream are disabled. The visitor endpoint no longer persists full names, email addresses, phone numbers, or IP addresses as visitor records.

**Important:** The current in-memory and `/tmp` telemetry store is ephemeral in serverless deployments and is not suitable for reliable multi-instance dashboards or CRM leads. Implement private durable storage (e.g. a managed Postgres database) with authentication, minimal fields and retention policies before treating it as a source of truth. Previously published stream messages might still exist outside this repository; investigate deletion with the provider and assess privacy obligations.

Browser visitor-API access now uses the signed admin cookie issued at Basic login; keep `ADMIN_KEY` strictly server-only. The legacy dashboard still needs real preview testing: its historical API paths, on-page widgets and data refresh may not all be compatible. Closing the browser or clearing site data is recommended for ending a Basic-auth session; browsers may retain Basic credentials independently of the signed cookie.

## Migration preflight

Run:

```bash
npm ci
npm run check:migration
npm run build
```

The build runs the migration preflight, which checks route configuration, sitemap targets, security regressions, and GA4 configuration.

## Release checklist

1. Verify Vercel's Framework Preset is **Next.js** and a preview deployment completes `next build` (not a legacy static build).
2. Verify `/`, `/web-development`, `/ai-automation`, `/seo-marketing`, `/blog`, `/sitemap.xml`, `/robots.txt` all respond correctly.
3. Verify legacy URL redirects, especially `/pages/product-design.html`, `/pages/contacts.html`, `/legal/terms-of-service`.
4. Confirm anonymous requests to `/admin` receive 401, the administrator can sign in, and missing/wrong API admin keys cannot retrieve visitor records.
5. Verify no personal data is posted to public third-party streams.
6. Verify Google Tag Assistant page_view and real lead-submission events; do not count WhatsApp compose opens as delivered leads.
7. Check Search Console and Core Web Vitals after production deployment. Search Console data is delayed.

## Reporting a vulnerability

Use the repository's private vulnerability-reporting mechanism if enabled; do not post credentials, personal visitor records, or exploit data in public issues.
