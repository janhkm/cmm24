import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Server-Konfiguration.
 *
 * Serverseitiges Error-Monitoring laeuft auf Basis von Art. 6 Abs. 1 lit. f DSGVO
 * (berechtigtes Interesse an Systemstabilitaet). Um die Datenminimierung (Art. 5(1)(c))
 * sicherzustellen, werden alle personenbezogenen Daten (PII) vor dem Senden entfernt.
 */

/**
 * Entfernt personenbezogene Daten aus Sentry-Events (DSGVO Art. 5(1)(c) Datenminimierung).
 * - IP-Adressen
 * - E-Mail-Adressen
 * - User-Daten
 * - Cookies
 * - Authorization-Header
 */
function stripPii(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  // IP-Adresse entfernen
  if (event.user) {
    delete event.user.ip_address;
    delete event.user.email;
    delete event.user.username;
    // Nur anonyme ID behalten (falls vorhanden)
    if (Object.keys(event.user).length === 0) {
      delete event.user;
    }
  }

  // Request-Daten bereinigen
  if (event.request) {
    // Cookies entfernen
    delete event.request.cookies;
    // Sensible Header entfernen
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
    // Query-Parameter bereinigen (koennten E-Mails/Tokens enthalten)
    delete event.request.query_string;
    // Request-Body entfernen (koennte PII enthalten)
    delete event.request.data;
  }

  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Nur in Production senden
  enabled: process.env.NODE_ENV === 'production',

  // Keine PII senden (DSGVO-konform)
  sendDefaultPii: false,

  // PII aus Events entfernen bevor sie gesendet werden
  beforeSend(event) {
    return stripPii(event);
  },

  // Bestimmte Fehler ignorieren
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
});
