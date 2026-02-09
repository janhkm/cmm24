'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { signInWithPassword, signInWithMagicLink } from '@/lib/actions/auth';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // State für Formulardaten
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signInWithPassword({ email, password });

    if (!result.success) {
      setError(result.error || t('failed'));
      setIsLoading(false);
      return;
    }

    // Weiterleitung zum Dashboard
    router.push('/seller/dashboard');
    router.refresh();
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signInWithMagicLink(magicEmail);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || t('magicLinkError'));
      return;
    }

    setMagicLinkSent(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Fehlermeldung */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">{t('withPassword')}</TabsTrigger>
            <TabsTrigger value="magic-link">{t('magicLink')}</TabsTrigger>
          </TabsList>

          {/* Password Login */}
          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="pl-10"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Link
                    href="/passwort-vergessen"
                    className="text-sm text-primary hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    className="pl-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    {t('submit')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Magic Link Login */}
          <TabsContent value="magic-link">
            {magicLinkSent ? (
              <div className="text-center py-8">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">{t('magicLinkSent')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('magicLinkSentDesc')}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setMagicLinkSent(false)}
                >
                  {t('resend')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      className="pl-10"
                      required
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {t('magicLinkDesc')}
                </p>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('magicLinkSending')}
                    </>
                  ) : (
                    <>
                      {t('magicLinkSubmit')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/registrieren" className="text-primary hover:underline font-medium">
            {t('registerNow')}
          </Link>
        </p>
      </CardContent>
    </Card>
    </div>
  );
}
