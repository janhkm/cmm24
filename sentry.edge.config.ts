import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge-Konfiguration (Middleware, Edge-Functions).
 *
 * Laeuft auf Basis von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
 * PII wird per beforeSend entfernt (Art. 5(1)(c) Datenminimierung).
 */

function stripPii(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  if (event.user) {
    delete event.user.ip_address;
    delete event.user.email;
    delete event.user.username;
    if (Object.keys(event.user).length === 0) {
      delete event.user;
    }
  }

  if (event.request) {
    delete event.request.cookies;
    if (event.request.headers) {
      const safeHeaders: Record<string, string> = {};
      const allowedHeaders = ['content-type', 'accept', 'accept-language', 'user-agent'];
      for (const [key, value] of Object.entries(event.request.headers)) {
        if (allowedHeaders.includes(key.toLowerCase())) {
          safeHeaders[key] = value;
        }
      }
      event.request.headers = safeHeaders;
    }
    delete event.request.query_string;
    delete event.request.data;
  }

  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  environment: process.env.NODE_ENV,
  
  enabled: process.env.NODE_ENV === 'production',

  // Keine PII senden
  sendDefaultPii: false,

  beforeSend(event) {
    return stripPii(event);
  },

  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
});
