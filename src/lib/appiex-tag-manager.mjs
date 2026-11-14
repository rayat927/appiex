// Shared GTM setup for all public HTML served through the Appiex Next.js renderer.
// Keep Google Analytics pageviews configured by the existing Appiex GA4 integration.
export function installTagManager(html,slug=[]) {
  const path = Array.isArray(slug) ? slug.join('/') : '';
  if (/^(?:admin|login|profile|resume|collections|rafsan_page|scratch_cuberto_live)(?:\/|$)/i.test(path)) return html;
  if (!/<head\b[^>]*>/i.test(html)) return html;
  const containerId = 'GTM-PTCQ98DC';
  // Remove legacy GTM markup from copied service pages, leaving GA4 untouched.
  html = html.replace(/<script\b[^>]*>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];\s*\(function\(w,d,s,l,i\)\{[\s\S]*?\}\)\(window,document,'script','dataLayer','GTM-T9VW8G26'\);\s*<\/script>/gi,'');
  html = html.replace(/<noscript>\s*<iframe\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-T9VW8G26["'][\s\S]*?<\/iframe>\s*<\/noscript>/gi,'');
  if (html.includes('gtm.js?id=' + containerId)) return html;
  const tag = `\n<!-- Appiex Google Tag Manager: configure GA4 only once to avoid duplicate pageviews -->\n<script async src="https://www.googletagmanager.com/gtm.js?id=${containerId}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };\n  window.gtag('js', new Date());\n</script>`;
  return html.replace(/<head\b[^>]*>/i, match => match + tag);
}
