'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CheckCircle, Loader2, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resendVerificationEmail } from '@/lib/actions/auth';

/**
 * Email-Bestaetigungs-Seite.
 *
 * Use-Case: User wird von der Middleware hierher umgeleitet weil
 * email_verified_at in seinem Profil NULL ist. Die Seite zeigt
 * eine Aufforderung die Email zu pruefen und bietet einen
 * "Erneut senden"-Button.
 *
 * Die eigentliche Verifizierung erfolgt ueber den Link in der Email,
 * der zu /auth/callback?type=signup fuehrt. Dort wird email_verified_at
 * gesetzt und der User zum Dashboard weitergeleitet.
 */
export default function EmailBestaetigungenPage() {
  const t = useTranslations('auth.verifyEmail');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setResendError(null);

    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        setResendSuccess(true);
      } else {
        setResendError(result.error || t('sendError'));
      }
    } catch {
      setResendError(t('unexpectedError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hinweise */}
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-2">
          <p>{t.rich('checkSpam', {
            bold: (chunks) => <strong>{chunks}</strong>,
          })}</p>
          <p>{t('validFor')}</p>
        </div>

        {/* Erfolg nach erneutem Senden */}
        {resendSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800">
              {t('resent')}
            </p>
          </div>
        )}

        {/* Fehler nach erneutem Senden */}
        {resendError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <p className="text-sm text-destructive">{resendError}</p>
          </div>
        )}

        {/* Erneut senden Button */}
        {!resendSuccess && (
          <Button
            className="w-full"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sending')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('resend')}
              </>
            )}
          </Button>
        )}

        {/* Zurueck-Links */}
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          {t('problems')}{' '}
          <a href="mailto:support@cmm24.com" className="text-primary hover:underline">
            {t('contactUs')}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
