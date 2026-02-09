import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

// ============================================
// Types (keine Objekt-Exports - kompatibel mit 'use server' Dateien)
// ============================================

type RateLimitAction =
  | 'login'
  | 'register'
  | 'passwordReset'
  | 'inquiry'
  | 'listingCreate'
  | 'imageUpload'
  | 'contact'
  | 'api';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

// ============================================
// Redis Client (nur initialisieren wenn konfiguriert)
// ============================================

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

// ============================================
// Rate Limiters
// ============================================

function createLimiter(
  prefix: string,
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1]
): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `rl:${prefix}`,
    analytics: true,
  });
}

// Lazy-initialisierte Limiter
let _limiters: Record<string, Ratelimit | null> | null = null;

function getLimiters() {
  if (!_limiters) {
    _limiters = {
      login: createLimiter('login', 5, '15 m'),
      register: createLimiter('register', 3, '1 h'),
      passwordReset: createLimiter('pw-reset', 3, '1 h'),
      inquiry: createLimiter('inquiry', 5, '1 m'),
      listingCreate: createLimiter('listing-create', 10, '1 h'),
      imageUpload: createLimiter('image-upload', 50, '1 h'),
      contact: createLimiter('contact', 3, '1 h'),
      api: createLimiter('api', 1000, '1 h'),
    };
  }
  return _limiters;
}

// ============================================
// Messages (als Funktion statt Objekt-Export)
// ============================================

const RATE_LIMIT_MESSAGES: Record<RateLimitAction, string> = {
  login: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.',
  register: 'Zu viele Registrierungsversuche. Bitte versuchen Sie es spaeter.',
  passwordReset: 'Zu viele Anfragen. Bitte warten Sie eine Stunde.',
  inquiry: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
  listingCreate: 'Zu viele Inserate erstellt. Bitte warten Sie eine Stunde.',
  imageUpload: 'Zu viele Uploads. Bitte warten Sie eine Stunde.',
  contact: 'Zu viele Kontaktanfragen. Bitte versuchen Sie es spaeter.',
  api: 'API Rate Limit erreicht. Bitte warten Sie.',
};

/**
 * Gibt die Rate-Limit-Fehlermeldung fuer eine Aktion zurueck.
 */
export function getRateLimitMessage(action: RateLimitAction): string {
  return RATE_LIMIT_MESSAGES[action];
}

// ============================================
// Helper: Client-IP ermitteln
// ============================================

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

// ============================================
// Public API
// ============================================

/**
 * Prueft Rate Limit fuer eine bestimmte Aktion.
 * Gibt { success: true } zurueck wenn Upstash nicht konfiguriert ist (Development).
 */
export async function checkRateLimit(
  action: RateLimitAction,
  identifier?: string
): Promise<RateLimitResult> {
  const limiters = getLimiters();
  const limiter = limiters[action];

  // Wenn Upstash nicht konfiguriert: immer erlauben (Development)
  if (!limiter) {
    return { success: true, remaining: 999, reset: 0, limit: 999 };
  }

  const id = identifier || await getClientIP();

  try {
    const result = await limiter.limit(id);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
      limit: result.limit,
    };
  } catch (error) {
    // Bei Redis-Fehlern: In-Memory-Fallback (fail-closed)
    console.error('[RateLimit] Redis error, using in-memory fallback:', error);
    return checkFallbackRateLimit(action, id);
  }
}

// ============================================
// In-Memory Fallback (fail-closed)
// ============================================

// Einfacher In-Memory Counter fuer den Fall dass Redis nicht erreichbar ist.
// Limitiert auf 3 Requests pro Minute pro Aktion+Identifier.
const FALLBACK_LIMIT = 3;
const FALLBACK_WINDOW_MS = 60_000;
const fallbackCounters = new Map<string, { count: number; resetAt: number }>();

// Periodisch alte Eintraege entfernen (Memory-Leak-Schutz)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of fallbackCounters) {
      if (entry.resetAt < now) {
        fallbackCounters.delete(key);
      }
    }
  }, 60_000);
}

function checkFallbackRateLimit(action: string, id: string): RateLimitResult {
  const key = `${action}:${id}`;
  const now = Date.now();
  const entry = fallbackCounters.get(key);

  if (!entry || entry.resetAt < now) {
    fallbackCounters.set(key, { count: 1, resetAt: now + FALLBACK_WINDOW_MS });
    return { success: true, remaining: FALLBACK_LIMIT - 1, reset: now + FALLBACK_WINDOW_MS, limit: FALLBACK_LIMIT };
  }

  entry.count++;

  if (entry.count > FALLBACK_LIMIT) {
    return { success: false, remaining: 0, reset: entry.resetAt, limit: FALLBACK_LIMIT };
  }

  return { success: true, remaining: FALLBACK_LIMIT - entry.count, reset: entry.resetAt, limit: FALLBACK_LIMIT };
}
