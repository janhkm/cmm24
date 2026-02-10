'use client';

// AUSKOMMENTIERT: Upgrade-Seite ist aktuell deaktiviert (alles ist jetzt Free)
// Die komplette originale Seite ist in der Git-History erhalten.
// Redirect zum Dashboard.

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

export default function UpgradePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/seller/dashboard'); }, [router]);
  return null;
}
