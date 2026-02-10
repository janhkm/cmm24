'use client';

// Redirect: /seller/emails -> /seller/communication
import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

export default function EmailsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/seller/communication'); }, [router]);
  return null;
}
