'use client';

// AUSKOMMENTIERT: Abo-Seite ist aktuell deaktiviert (alles ist jetzt Free)
// Die komplette originale Seite ist in der Git-History erhalten.
// Redirect zum Dashboard.

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

export default function AboPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/seller/dashboard'); }, [router]);
  return null;
}
