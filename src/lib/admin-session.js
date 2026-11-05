/**
 * Short-lived, HttpOnly admin session. No secrets or API admin keys are shipped
 * to the browser. This module works in the Edge middleware and Node route.
 */
export const ADMIN_COOKIE_NAME = '__Host-appiex_admin';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const encoder = new TextEncoder();

async function getSigningKey() {
  const adminKey = process.env.ADMIN_KEY;
  const password = process.env.APPIEX_ADMIN_PASSWORD;
  if (!adminKey || !password || !process.env.APPIEX_ADMIN_USER) return null;
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(adminKey + ':' + password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const input = value.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(input.padEnd(Math.ceil(input.length / 4) * 4, '='));
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function signAdminSession() {
  const key = await getSigningKey();
  if (!key) return null;
  const expires = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = 'v1.' + expires;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return payload + '.' + toBase64Url(signature);
}

export function getAdminCookie(request) {
  if (request.cookies?.get) return request.cookies.get(ADMIN_COOKIE_NAME)?.value || '';
  const match = (request.headers?.get?.('cookie') || '')
    .match(/(?:^|;\s*)__Host-appiex_admin=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function hasValidAdminSession(request) {
  const value = getAdminCookie(request);
  const match = /^v1\.(\d{13})\.([A-Za-z0-9_-]+)$/.exec(value);
  if (!match) return false;
  const expires = Number(match[1]);
  const now = Date.now();
  if (!Number.isSafeInteger(expires) || expires <= now ||
      expires > now + ADMIN_SESSION_MAX_AGE * 1000) return false;
  const key = await getSigningKey();
  if (!key) return false;
  const signature = fromBase64Url(match[2]);
  if (!signature || signature.byteLength !== 32) return false;
  try {
    return await crypto.subtle.verify(
      'HMAC', key, signature, encoder.encode('v1.' + match[1])
    );
  } catch {
    return false;
  }
}
