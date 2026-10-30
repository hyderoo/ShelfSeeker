// Vercel serverless proxy for the ISBN fallback lookup.
//
// The Kakao (Daum) Book API requires a REST API key in an Authorization header.
// That key must never ship to the browser, so the client calls this same-origin
// endpoint instead and this function calls Kakao server-side. The key lives in
// the KAKAO_REST_API_KEY environment variable (Vercel project settings).
//
// Until KAKAO_REST_API_KEY is configured this returns 503 and the client falls
// back to its normal "not in the catalog" panel - no user-facing change.
//
// Abuse controls for a public endpoint: strict ISBN-only input, a single fixed
// upstream URL, per-IP rate limiting, a conservative global daily guard below
// the free quota, and a short in-memory cache. Limits are per warm instance
// (best-effort on serverless), which is sufficient for this app's traffic.

const UPSTREAM = 'https://dapi.kakao.com/v3/search/book?target=isbn&size=1&query=';
const PER_IP_LIMIT = 30;          // requests per minute per IP
const PER_IP_WINDOW_MS = 60 * 1000;
const DAILY_GUARD = 800;          // global calls/day guard: Kakao book search free quota is 30,000/MONTH (official quota doc), so a per-day guard of 800 (~24k/month worst case) keeps sustained use free
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 500;

const ipHits = new Map();   // ip -> { count, resetAt }
const cache = new Map();    // isbn -> { at, payload }
let daily = { day: '', count: 0 };

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (typeof fwd === 'string' && fwd.split(',')[0].trim()) || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const rec = ipHits.get(ip);
  if (!rec || now > rec.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + PER_IP_WINDOW_MS });
    if (ipHits.size > 10000) ipHits.clear();
    return false;
  }
  rec.count += 1;
  return rec.count > PER_IP_LIMIT;
}

function dailyGuardHit() {
  const day = new Date().toISOString().slice(0, 10);
  if (daily.day !== day) daily = { day, count: 0 };
  daily.count += 1;
  return daily.count > DAILY_GUARD;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const isbn = String(req.query.isbn || '');
  if (!/^\d{10}$|^\d{13}$/.test(isbn)) {
    res.status(400).json({ error: 'invalid_isbn' });
    return;
  }

  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) {
    // Fallback source not configured yet - client shows its normal not-found panel.
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }
  if (dailyGuardHit()) {
    res.status(503).json({ error: 'daily_limit' });
    return;
  }

  const hit = cache.get(isbn);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(hit.payload);
    return;
  }

  try {
    const upstream = await fetch(UPSTREAM + isbn, {
      headers: { Authorization: `KakaoAK ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) {
      res.status(502).json({ error: 'upstream_error', status: upstream.status });
      return;
    }
    const body = await upstream.json();
    const doc = body && body.documents && body.documents[0];
    if (!doc) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    const isbns = String(doc.isbn || '').split(' ').filter(Boolean);
    const payload = {
      source: 'kakao',
      title: doc.title || '',
      authors: Array.isArray(doc.authors) ? doc.authors : [],
      publisher: doc.publisher || '',
      publishDate: doc.datetime ? String(doc.datetime).slice(0, 10) : '',
      isbn10: isbns.find(v => v.length === 10) || '',
      isbn13: isbns.find(v => v.length === 13) || '',
      description: doc.contents || '',
      coverUrl: doc.thumbnail || '',
      url: doc.url || '',
    };
    cache.set(isbn, { at: Date.now(), payload });
    if (cache.size > CACHE_MAX) cache.clear();
    res.status(200).json(payload);
  } catch (err) {
    res.status(502).json({ error: 'upstream_unreachable' });
  }
}
