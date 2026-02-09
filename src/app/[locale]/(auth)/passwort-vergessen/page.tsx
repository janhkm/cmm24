'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending reset email
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{t('emailSent')}</CardTitle>
          <CardDescription>
            {t.rich('emailSentDesc', {
              email,
              bold: (chunks) => <strong>{chunks}</strong>,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t.rich('checkSpam', {
              retry: (chunks) => (
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  {chunks}
                </button>
              ),
            })}
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sending')}
              </>
            ) : (
              <>
                {t('submit')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
