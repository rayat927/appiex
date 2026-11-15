// Server-only administrative authentication. Configure both credentials in Vercel.
// Never put these values in HTML, browser bundles, or repository secrets.
export function adminAuthConfigured() {
  return Boolean(process.env.APPIEX_ADMIN_BASIC_USER && process.env.APPIEX_ADMIN_BASIC_PASSWORD);
}

function constantTimeStringEqual(left, right) {
  const a = String(left);
  const b = String(right);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function isAdminAuthorized(request) {
  if (!adminAuthConfigured()) return false;
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  try {
    const decoded = atob(header.slice(6).trim());
    const separator = decoded.indexOf(':');
    if (separator < 1) return false;
    return constantTimeStringEqual(decoded.slice(0, separator), process.env.APPIEX_ADMIN_BASIC_USER)
      && constantTimeStringEqual(decoded.slice(separator + 1), process.env.APPIEX_ADMIN_BASIC_PASSWORD);
  } catch {
    return false;
  }
}

export function adminUnauthorized() {
  const configured = adminAuthConfigured();
  return new Response(configured ? 'Admin authentication required' : 'Admin credentials not configured', {
    status: configured ? 401 : 503,
    headers: {
      ...(configured ? { 'WWW-Authenticate': 'Basic realm="Appiex Admin", charset="UTF-8"' } : {}),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
