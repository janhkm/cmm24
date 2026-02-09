import * as Sentry from '@sentry/nextjs';

/**
 * Sentry nur initialisieren wenn:
 * 1. Production-Umgebung
 * 2. Analytics-Cookie-Consent erteilt wurde
 *
 * Der Cookie-Consent wird in localStorage unter 'cmm24-cookie-consent' gespeichert.
 * Bei nachtraeglichem Consent-Widerruf wird Sentry beim naechsten Seitenaufruf nicht mehr geladen.
 */
function shouldInitSentry(): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  if (typeof window === 'undefined') return false;

  try {
    const consent = localStorage.getItem('cmm24-cookie-consent');
    if (!consent) return false;
    const prefs = JSON.parse(consent);
    return prefs?.analytics === true;
  } catch {
    return false;
  }
}

if (shouldInitSentry()) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 0.1,
    
    // Session Replay
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Bestimmte Fehler ignorieren
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop',
      // Network errors
      'Failed to fetch',
      'NetworkError',
      'AbortError',
      // Next.js internal
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
    ],
  });
}
