'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const COOKIE_CONSENT_KEY = 'cmm24-cookie-consent';

/**
 * Laedt Google AdSense NUR wenn der Nutzer Marketing-Cookies akzeptiert hat.
 * Ueberwacht Aenderungen am Consent per Storage-Event und Polling.
 *
 * DSGVO-konform: Kein Tracking ohne Einwilligung (Art. 6 DSGVO, Art. 5(3) ePrivacy).
 */
export function ConsentGatedAdSense({ publisherId }: { publisherId: string }) {
  const [hasMarketingConsent, setHasMarketingConsent] = useState(false);

  useEffect(() => {
    // Consent pruefen
    function checkConsent() {
      try {
        const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!raw) return false;
        const prefs = JSON.parse(raw);
        return prefs?.marketing === true;
      } catch {
        return false;
      }
    }

    setHasMarketingConsent(checkConsent());

    // Storage-Event: reagiert wenn Consent in einem anderen Tab geaendert wird
    function onStorage(e: StorageEvent) {
      if (e.key === COOKIE_CONSENT_KEY) {
        setHasMarketingConsent(checkConsent());
      }
    }

    // Custom Event: reagiert wenn CookieConsent-Komponente Consent aendert
    function onConsentChange() {
      setHasMarketingConsent(checkConsent());
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('cookie-consent-changed', onConsentChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cookie-consent-changed', onConsentChange);
    };
  }, []);

  if (!hasMarketingConsent) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
