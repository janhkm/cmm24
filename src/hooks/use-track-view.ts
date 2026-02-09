import { useEffect, useRef } from 'react';

/**
 * Hook zum Tracken von Listing-Aufrufen.
 * Wird nur einmal pro Mount aufgerufen (Fire-and-Forget).
 * Bot-Erkennung und Deduplizierung passieren serverseitig.
 */
export function useTrackView(listingId: string | undefined) {
  const tracked = useRef(false);

  useEffect(() => {
    // Nur einmal pro Page-Load tracken
    if (!listingId || tracked.current) return;
    tracked.current = true;

    // Fire-and-forget - Tracking soll nie die UX blockieren
    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    }).catch(() => {
      // Silent fail
    });
  }, [listingId]);
}
