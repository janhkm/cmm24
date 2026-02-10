'use client';

// Redirect: /seller/kontakte -> /seller/communication (Kontakte-Tab)
import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

export default function KontakteRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/seller/communication'); }, [router]);
  return null;
}
