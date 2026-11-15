// Next.js 15 App Router — Appiex Real-Time Shared Client Orders API
// GET    /api/orders -> returns list of client orders and inquiries
// POST   /api/orders -> receives new orders from website contact/order forms
// PUT    /api/orders -> updates order status (new, discussion, confirmed, completed)
// DELETE /api/orders -> removes an order

import fs from 'fs';
import { NextResponse } from 'next/server';
import { isAdminAuthorized, adminUnauthorized } from '../../../lib/admin-auth.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TMP_FILE = '/tmp/appiex_client_orders_shared_v2.json';
const REDIS_KEY = 'appiex:client_orders:v2';

// Default initial state: clean 0 orders
if (!globalThis.__APPIEX_ORDERS_STORE_V2) {
  globalThis.__APPIEX_ORDERS_STORE_V2 = {
    updatedAt: 1,
    lastCloudPublishAt: 0,
    orders: [],
    deletedIds: []
  };
  globalThis.__APPIEX_ORDERS_LAST_HYDRATE = 0;
}

function getMemStore() {
  const mem = globalThis.__APPIEX_ORDERS_STORE_V2;
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      const disk = JSON.parse(raw);
      if (disk && typeof disk === 'object' && disk.updatedAt) {
        if (!mem.updatedAt || disk.updatedAt > mem.updatedAt) {
          mem.updatedAt = disk.updatedAt;
          mem.lastCloudPublishAt = disk.lastCloudPublishAt || mem.lastCloudPublishAt || 0;
          mem.orders = Array.isArray(disk.orders) ? disk.orders : mem.orders;
          mem.deletedIds = Array.isArray(disk.deletedIds) ? disk.deletedIds : (mem.deletedIds || []);
        }
      }
    }
  } catch (e) {}
  return mem;
}

function saveMemStore(mem) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify({
      updatedAt: mem.updatedAt,
      lastCloudPublishAt: mem.lastCloudPublishAt || 0,
      orders: mem.orders,
      deletedIds: (mem.deletedIds || []).slice(-200)
    }), 'utf8');
  } catch (e) {}
}

async function readFromUpstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const resp = await fetch(`${url}/get/${REDIS_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data && data.result) {
      return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    }
  } catch (e) {}
  return null;
}

async function writeToUpstash(payload) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Durable lead storage is not configured');
  const response = await fetch(`${url}/set/${REDIS_KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Durable lead storage request failed');
  const result = await response.json();
  if (result.error) throw new Error('Durable lead storage rejected the request');
}

// Do not publish customer contact details to public ntfy topics.
async function publishOrdersSnapshot(store) {
  await writeToUpstash({
    updatedAt: store.updatedAt,
    orders: store.orders,
    deletedIds: store.deletedIds || []
  });
}
async function hydrateFromCloudStream(mem) {
  const saved = await readFromUpstash();
  if (saved && saved.updatedAt && saved.updatedAt > (mem.updatedAt || 0)) {
    mem.updatedAt = saved.updatedAt;
    if (Array.isArray(saved.orders)) mem.orders = saved.orders;
    if (Array.isArray(saved.deletedIds)) mem.deletedIds = saved.deletedIds;
    saveMemStore(mem);
  }
}

export async function GET(req) {
  if (!isAdminAuthorized(req)) return adminUnauthorized();
  const store = getMemStore();
  await hydrateFromCloudStream(store, false);
  return NextResponse.json({
    success: true,
    count: store.orders.length,
    orders: store.orders,
    updatedAt: store.updatedAt
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
}

export async function POST(req) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({ success: false, error: 'Lead storage temporarily unavailable. Please contact us on WhatsApp.' }, { status: 503 });
    }
    const origin = req.headers.get('origin');
    if (origin && !/^https:\/\/(?:www\.)?appiex\.com$/i.test(origin) && !/^http:\/\/localhost(?::\d+)?$/i.test(origin)) {
      return NextResponse.json({ success: false, error: 'Origin not allowed' }, { status: 403 });
    }
    if (Number(req.headers.get('content-length') || 0) > 16000) {
      return NextResponse.json({ success: false, error: 'Request too large' }, { status: 413 });
    }
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Empty payload' }, { status: 400 });
    }

    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'A valid name and email are required' }, { status: 400 });
    }
    const store = getMemStore();
    await hydrateFromCloudStream(store, true);

    const newOrder = {
      id: crypto.randomUUID(),
      name: body.name.trim().slice(0, 120),
      email: body.email.trim().slice(0, 160),
      phone: String(body.phone || '').slice(0, 35),
      service: String(body.service || 'Digital Services').slice(0, 240),
      budget: String(body.budget || 'Not provided').slice(0, 60),
      message: String(body.message || '').slice(0, 5000),
      channel: 'Website Contact Form',
      status: 'new',
      date: body.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }),
      timestamp: body.timestamp || Date.now()
    };

    const deletedSet = new Set(store.deletedIds || []);
    if (!deletedSet.has(newOrder.id) && !store.orders.some(o => o.id === newOrder.id)) {
      store.orders.unshift(newOrder);
    }
    store.updatedAt = Math.max(Date.now(), (store.updatedAt || 0) + 1);
    store.lastCloudPublishAt = store.updatedAt;
    saveMemStore(store);

    await publishOrdersSnapshot(store);

    return NextResponse.json({
      success: true,
      orderId: newOrder.id
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!isAdminAuthorized(req)) return adminUnauthorized();
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const store = getMemStore();
    await hydrateFromCloudStream(store, true);
    const idx = store.orders.findIndex(o => o.id === body.id);
    if (idx !== -1) {
      store.orders[idx] = { ...store.orders[idx], status: ['new', 'discussion', 'confirmed', 'completed'].includes(body.status) ? body.status : store.orders[idx].status };
      store.updatedAt = Math.max(Date.now(), (store.updatedAt || 0) + 1);
      store.lastCloudPublishAt = store.updatedAt;
      saveMemStore(store);
      await publishOrdersSnapshot(store);
      return NextResponse.json({ success: true, order: store.orders[idx] });
    }
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAdminAuthorized(req)) return adminUnauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const store = getMemStore();
    await hydrateFromCloudStream(store, true);
    store.orders = store.orders.filter(o => o.id !== id);
    store.deletedIds = Array.from(new Set([...(store.deletedIds || []), id])).slice(-200);
    store.updatedAt = Math.max(Date.now(), (store.updatedAt || 0) + 1);
    store.lastCloudPublishAt = store.updatedAt;
    saveMemStore(store);
    await publishOrdersSnapshot(store);

    return NextResponse.json({ success: true, remaining: store.orders.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
