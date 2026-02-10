'use client';

// AUSKOMMENTIERT: Statistiken-Seite ist aktuell deaktiviert (wird spaeter Pay-Feature)
// Die komplette originale Seite ist in der Git-History erhalten.
// Redirect zum Dashboard.

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

export default function StatistikenPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/seller/dashboard'); }, [router]);
  return null;
}
