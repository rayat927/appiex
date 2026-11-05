import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function resolveHtmlPath(slugArray) {
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');

  const relPath = (!slugArray || slugArray.length === 0) ? 'index' : slugArray.join('/');

  // Prevent directory traversal
  const normalized = path.posix.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');

  const candidates = [
    path.join(publicDir, `${normalized}.html`),
    path.join(publicDir, normalized, 'index.html'),
    path.join(rootDir, `${normalized}.html`),
    path.join(rootDir, normalized, 'index.html')
  ];

  // If the slug already ended with .html (e.g. google verification)
  if (normalized.endsWith('.html')) {
    candidates.unshift(
      path.join(publicDir, normalized),
      path.join(rootDir, normalized)
    );
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch (e) {}
  }

  return null;
}


const BLOG_HUBS = new Set([
  'blog/ai-automation', 'blog/web-development', 'blog/seo-marketing',
  'blog/digital-strategy', 'blog/ui-ux-3d-design',
  'blog/gaming-3d-worlds', 'blog/view'
]);

function appendBodyClass(html, className) {
  return html.replace(/<body\b([^>]*)>/i, (tag, attrs) => {
    if (/\bclass\s*=/i.test(attrs)) {
      return tag.replace(/\bclass\s*=\s*(["'])(.*?)\1/i, (_match, quote, classes) =>
        'class=' + quote + classes + ' ' + className + quote);
    }
    return '<body class="' + className + '"' + attrs + '>';
  });
}

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function improveHtml(html, slug) {
  const route = slug.join('/').replace(/\.html$/i, '');
  const isHomepage = route === '' || route === 'index';
  const isBlog = route === 'blog' || route.startsWith('blog/');
  if (!isHomepage && !isBlog) return html;

  // This shared stylesheet is copied into public/styles by sync-nextjs-public.mjs.
  html = html.replace(/<\/head>/i,
    '  <link rel="stylesheet" href="/styles/appiex-editorial-polish.css?v=20261106">\n</head>');

  if (isHomepage) {
    html = appendBodyClass(html, 'appiex-home-polished');
    // Remove duplicate heading and unsupported rating language while retaining real project content.
    html = html.replace('★ 4.9 / 5.0 VERIFIED RATING', 'PROJECT STORIES &amp; CLIENT FEEDBACK');
    html = html.replace('50+ GLOBAL SHIPMENTS', 'SELECTED DELIVERY EXAMPLES');
    html = html.replace('50+ Global Shipments', 'Selected Delivery Examples');
    html = html.replace('Dhaka &amp; Global Benchmark 2026', 'Delivery Model Overview');
    html = html.replace('Explore Dedicated Solutions &amp; Pricing Guides',
      'Web Development, AI Automation &amp; Pricing Guides');
    const secondFaqStart = html.indexOf('<section id="faq-knowledge-hub"');
    if (secondFaqStart >= 0) {
      html = html.slice(0, secondFaqStart) + html.slice(secondFaqStart)
        .replace('Frequently Asked Questions', 'More About Working With Appiex');
    }
    return html;
  }

  const isArticle = route.startsWith('blog/') &&
    !BLOG_HUBS.has(route) && !route.endsWith('/index');
  if (!isArticle) return appendBodyClass(html, 'appiex-blog-hub');

  const legacy = /id="cms-article-body"/i.test(html);
  html = appendBodyClass(html, 'appiex-editorial-page ' +
    (legacy ? 'appiex-legacy-article' : 'appiex-modern-article'));

  // Legacy generated layouts reused the same unrelated visible H1 on many
  // URLs. Align the single visible heading with each page's existing title.
  if (legacy) {
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1]
        .replace(/\s*\|\s*Appiex(?: Engineering Blog| Blog)?\s*$/i, '').trim();
      if (title) {
        html = html.replace(/(<h1\b[^>]*\bid="cms-article-h1"[^>]*>)[\s\S]*?(<\/h1>)/i,
          (_match, opening, closing) => opening + title + closing);
      }
    }
  } else if (/<article(?:\s|>)/i.test(html) && !/appiex-article-toc/.test(html)) {
    const sections = [...html.matchAll(/<section\b[^>]*\bid="([a-zA-Z0-9_-]+)"[^>]*>[\s\S]{0,500}?<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map(match => ({ id: match[1], title: stripMarkup(match[2]) }))
      .filter(section => section.title.length > 3 && section.title.length < 110)
      .slice(0, 12);
    if (sections.length >= 3) {
      const links = sections.map(section =>
        '<a href="#' + section.id + '">' + escapeText(section.title) + '</a>').join('');
      const toc = '<details class="appiex-article-toc"><summary>On this page · Jump to a section</summary>' +
        '<nav aria-label="Article table of contents">' + links + '</nav></details>';
      html = html.replace(/<article(?:\s|>)/i, match => toc + '\n' + match);
    }
  }

  // The meter is present in the HTML but performs no tracking or requests.
  html = html.replace(/<body\b[^>]*>/i, match => match +
    '\n<div class="appiex-reading-meter" aria-hidden="true"><span></span></div>');
  html = html.replace(/<\/body>/i,
    '  <script src="/scripts/appiex-reading-progress.js" defer></script>\n</body>');
  return html;
}

export async function GET(request, context) {
  const params = await context.params;
  const slug = (params && params.slug) ? params.slug : [];

  // Block sensitive dotfiles or backup extensions
  const joined = '/' + slug.join('/');
  if (/^\/(?:\.env.*|.*\.(?:bak|sql|log|md)|scratch\/.*|\.git.*)$/i.test(joined)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const htmlFile = resolveHtmlPath(slug);

  if (htmlFile) {
    const htmlContent = improveHtml(fs.readFileSync(htmlFile, 'utf8'), slug);
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  }

  // Fallback to custom 404.html if route doesn't exist
  const notFoundFile = resolveHtmlPath(['404']);
  if (notFoundFile) {
    const html404 = fs.readFileSync(notFoundFile, 'utf8');
    return new NextResponse(html404, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }

  return new NextResponse('404 Not Found', { status: 404 });
}

export async function HEAD(request, context) {
  const res = await GET(request, context);
  return new NextResponse(null, {
    status: res.status,
    headers: res.headers
  });
}
