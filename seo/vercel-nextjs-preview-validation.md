# Appiex Vercel Next.js migration — PREVIEW ONLY

**Status:** This branch is an unmerged, production-sensitive deployment proposal. Do not promote it or attach `appiex.com` until all preview checks pass and rollback is prepared.

## Finding
- Repo contains `package.json` with `npm run build` invoking `next build`, `next.config.mjs`, and Next.js App Router `src/app/[[...slug]]/route.js`.
- Existing `vercel.json` still configured **legacy static builders** (`@vercel/static` + `@vercel/node`) and 15 legacy `routes` entries. Official Vercel documentation states framework auto-detection is the default and legacy build/route configuration can override it.
- GitHub's Next.js build passing does not prove the production domain is deploying its output.
- Public web retrieval on November 6 still displayed Appiex's prior "Planet Jupiter" homepage text despite newer GitHub SEO content. The discrepancy could also involve the wrong Vercel project, production branch or cached content. Root cause cannot be confirmed without the Vercel project.

## What this draft changes
- Deletes legacy `version`, `builds` and `routes` in `vercel.json`.
- Explicitly sets `framework: "nextjs"` so Vercel uses the Next.js build adapter.
- Retains `redirects`, `headers`, `cleanUrls` and `trailingSlash` unchanged.
- Relies on `next.config.mjs` for framework redirects and security headers, with the catch-all Next.js route for HTML and 404 pages.
- **No domain settings, production environment variables or external deployments are changed by this PR.**

## Mandatory Vercel Preview acceptance
1. Create a preview deployment from this branch, not Production; verify Project Settings → Git points to `rayat927/appiex` and root directory is correct.
2. Confirm framework preset **Next.js**, default output directory, and `npm run build` executes the sync + Next build.
3. Confirm preview homepage title, H1, meta description and assets are current and consistent with GitHub.
4. Confirm `/blog`, `/blog/ai-agents-vs-n8n-automation-for-business`, `/seo-marketing`, `/refer`, `/partners`, `/projects` and `/sitemap.xml` return expected **200** (not a soft-404).
5. Confirm `/robots.txt` advertises the sitemap; no page listed in the sitemap is delivered with `noindex`.
6. Confirm `/web-development.html` redirects (308/301) to `/web-development` and that Google verification `google*.html` remains available.
7. Confirm `/api/visitors` still resolves safely and **unauthenticated GET access remains denied**; root `api/visitors.js` previously depended on the legacy builder. If that endpoint is broken or exposed, do NOT merge; migrate/disable it securely first.
8. Confirm private admin pages remain protected, dotfiles and backups cannot be served, and no private data is published.
9. Verify `/#contact` form → WhatsApp handoff, social links, CSS, JS, CSP, page navigation and GA4 event tracking in browser/network checks.
10. Only after success, compare Production branch `main` and deployment SHA, promote under a reversible release process. Re-check live `https://appiex.com` and GSC URL inspection.

## Rollback
If preview/production fails, revert only the Vercel config change or restore the previously working deployment. Do not change DNS, secrets or production domain to force this migration without proof.

## Sources
- Vercel project config: https://vercel.com/docs/project-configuration/vercel-json
- Vercel builds: https://vercel.com/docs/builds
- Vercel framework configuration: https://vercel.com/docs/builds/configure-a-build
- Next.js deployment: https://nextjs.org/docs/app/getting-started/deploying
