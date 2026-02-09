'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-destructive/20 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('description')}
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-muted-foreground mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('retry')}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              {t('backToHome')}
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          {t('persistsNote')}
        </p>
      </div>
    </div>
  );
}
