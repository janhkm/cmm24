import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Bekannte Bot User-Agents
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /duckduckbot/i,
  /slurp/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /applebot/i,
  /mj12bot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  /uptimerobot/i,
  /pingdom/i,
  /crawler/i,
  /spider/i,
  /bot\b/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // Kein User-Agent = wahrscheinlich Bot
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function hashVisitor(ip: string): string {
  // Taeglich rotierender Salt fuer Anonymitaet (DSGVO-konform)
  const dailySalt = new Date().toISOString().split('T')[0];
  return createHash('sha256')
    .update(ip + dailySalt + (process.env.VIEW_TRACKING_SALT || 'cmm24-views'))
    .digest('hex')
    .substring(0, 16);
}

/**
 * POST /api/track/view
 * Trackt einen Listing-Aufruf mit Deduplizierung und Bot-Filterung
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listingId = body?.listingId;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json({ error: 'listingId required' }, { status: 400 });
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit('trackView');
    if (!rateLimit.success) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Bot-Erkennung via User-Agent
    const userAgent = request.headers.get('user-agent');
    if (isBot(userAgent)) {
      return NextResponse.json({ ok: true, tracked: false });
    }

    // IP-Adresse aus Headers extrahieren (Vercel/Cloudflare setzen diese)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const visitorHash = hashVisitor(ip);

    // View aufzeichnen (Deduplizierung passiert in der DB-Funktion)
    const { data, error } = await supabaseAdmin.rpc('record_listing_view', {
      p_listing_id: listingId,
      p_visitor_hash: visitorHash,
    });

    if (error) {
      // Fehlgeschlagene FK-Referenz = ungueltige listingId, kein Server-Error
      if (error.code === '23503') {
        return NextResponse.json({ ok: false, error: 'Invalid listingId' }, { status: 400 });
      }
      console.error('[TrackView] DB-Fehler:', error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, tracked: data });
  } catch {
    // JSON-Parse-Fehler oder andere unerwartete Fehler
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
