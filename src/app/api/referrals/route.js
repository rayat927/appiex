import { NextResponse } from 'next/server';
import { isAdminAuthorized, adminUnauthorized } from '../../../lib/admin-auth.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const KEY = 'appiex:referrals:v1';
const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const maxLen = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const response = (status, payload) => NextResponse.json(payload, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
const limits = new Map();

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('STORE_UNAVAILABLE');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('STORE_UNAVAILABLE');
  const data = await res.json();
  if (data.error) throw new Error('STORE_UNAVAILABLE');
  return data.result;
}

export async function POST(req) {
  // Only consented referrals from our own website may use this endpoint.
  const origin = req.headers.get('origin');
  if (!origin || !/^https:\/\/(?:www\.)?appiex\.com$/i.test(origin) &&
      !/^http:\/\/localhost(?::\\d+)?$/i.test(origin)) {
    return response(403, { success: false, error: 'Request origin not allowed.' });
  }
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 80);
  const now = Date.now();
  const previous = limits.get(ip);
  const current = previous && previous.expiresAt > now ? previous : { count: 0, expiresAt: now + 60000 };
  current.count++;
  limits.set(ip, current);
  if (limits.size > 5000) for (const [key, value] of limits) if (value.expiresAt <= now) limits.delete(key);
  if (current.count > 5) return response(429, { success: false, error: 'Too many requests. Please contact Appiex by email.' });

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
    return response(503, { success: false, error: 'Online submission is temporarily unavailable. Please email contact@appiex.com.' });

  if (!String(req.headers.get('content-type') || '').includes('application/json'))
    return response(415, { success: false, error: 'JSON is required.' });
  if (Number(req.headers.get('content-length') || 0) > 8192)
    return response(413, { success: false, error: 'Request is too large.' });

  try {
    const raw = await req.text();
    if (raw.length > 8192) return response(413, { success: false, error: 'Request is too large.' });
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return response(400, { success: false, error: 'Invalid submission.' });
    if (body.website) return response(400, { success: false, error: 'Invalid submission.' }); // honeypot
    const referrerName = maxLen(body.referrerName, 120);
    const referrerEmail = maxLen(body.referrerEmail, 160);
    const clientName = maxLen(body.clientName, 160);
    const clientContact = maxLen(body.clientContact, 160);
    const projectType = maxLen(body.projectType, 180);
    if (body.consent !== true || referrerName.length < 2 || !emailPattern.test(referrerEmail) ||
        clientName.length < 2 || clientContact.length < 5 || !projectType) {
      return response(400, { success: false, error: 'Enter valid contact information and confirm permission to refer this client.' });
    }
    const id = crypto.randomUUID();
    const record = { id, referrerName, referrerEmail, clientName, clientContact, projectType,
      status: 'pending_review', createdAt: new Date().toISOString(), source: 'Website referral form' };
    await redis(['HSET', KEY, id, JSON.stringify(record)]);
    return response(201, { success: true, reference: id });
  } catch (e) {
    return response(e?.message === 'STORE_UNAVAILABLE' ? 503 : 400, {
      success: false,
      error: e?.message === 'STORE_UNAVAILABLE' ?
        'Online submission is temporarily unavailable. Please email contact@appiex.com.' :
        'Unable to process the referral. Please review your entries.'
    });
  }
}

export async function GET(req) {
  if (!isAdminAuthorized(req)) return adminUnauthorized();
  try {
    const values = await redis(['HGETALL', KEY]);
    const entries = [];
    if (Array.isArray(values)) {
      for (let i = 1; i < values.length; i += 2) {
        try { entries.push(JSON.parse(values[i])); } catch {}
      }
    } else if (values && typeof values === 'object') {
      for (const value of Object.values(values)) {
        try { entries.push(typeof value === 'string' ? JSON.parse(value) : value); } catch {}
      }
    }
    entries.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return response(200, { success: true, referrals: entries });
  } catch {
    return response(503, { success: false, error: 'Referral database unavailable.' });
  }
}
