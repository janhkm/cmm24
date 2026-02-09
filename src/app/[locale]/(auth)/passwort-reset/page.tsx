'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function PasswordResetContent() {
  const t = useTranslations('auth.resetPassword');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('minLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('noMatch'));
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
  };

  // Check for valid token
  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('invalidLink')}</CardTitle>
          <CardDescription>
            {t('invalidLinkDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('requestNewLink')}
          </p>
          <Button className="w-full" asChild>
            <Link href="/passwort-vergessen">{t('requestNew')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{t('successTitle')}</CardTitle>
          <CardDescription>
            {t('successDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('canLogin')}
          </p>
          <Button className="w-full" asChild>
            <Link href="/login">{t('goToLogin')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">{t('newPassword')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('newPasswordHint')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('newPasswordHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('saving') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <CardTitle className="text-2xl">Laden...</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function PasswortResetPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PasswordResetContent />
    </Suspense>
  );
}
