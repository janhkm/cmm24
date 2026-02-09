'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Mail,
  ArrowRight,
  Loader2,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resendVerificationEmail } from '@/lib/actions/auth';

function SuccessPageContent() {
  const t = useTranslations('auth.registerSuccess');
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const sessionId = searchParams.get('session_id');

  const handleResendEmail = async () => {
    setIsResending(true);
    const result = await resendVerificationEmail();
    setIsResending(false);
    
    if (result.success) {
      setResendSuccess(true);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <PartyPopper className="h-10 w-10 text-green-600" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold">
              {t('title')} 🎉
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('subtitle')}
            </p>
          </div>

          {/* Payment Confirmation */}
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-left">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {t('paymentSuccess')}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {t('paymentSuccessDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Email Verification Notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20 p-4 text-left">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {t('confirmEmail')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {t('confirmEmailDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="rounded-lg bg-muted/50 p-4 text-left">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t('nextSteps')}</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>1. {t('step1')}</li>
                  <li>2. {t('step2')}</li>
                  <li>3. {t('step3')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button size="lg" className="w-full" asChild>
              <Link href="/login">
                {t('loginNow')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                {t('backToHome')}
              </Link>
            </Button>
          </div>

          {/* Resend Email */}
          <p className="text-sm text-muted-foreground">
            {t('noEmail')}{' '}
            {resendSuccess ? (
              <span className="text-green-600">{t('resent')}</span>
            ) : (
              <button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? t('sending') : t('resend')}
              </button>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
