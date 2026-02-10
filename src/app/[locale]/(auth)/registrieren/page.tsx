'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { signUp, resendVerificationEmail } from '@/lib/actions/auth';

// =============================================================================
// Vereinfachte Registrierung — nur noch Free, kein Plan-Step, kein Welcome-Step
// Flow: Formular -> Registrieren -> Erfolg (E-Mail bestaetigen -> Login)
// =============================================================================

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const tc = useTranslations('common');

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('nameRequired');
    if (!email.trim()) newErrors.email = t('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t('invalidEmail');
    if (!password) newErrors.password = t('passwordRequired');
    else if (password.length < 8) newErrors.password = t('minChars');
    if (!passwordConfirm) newErrors.passwordConfirm = t('confirmPasswordRequired');
    else if (password !== passwordConfirm) newErrors.passwordConfirm = t('passwordsDontMatch');
    if (!acceptedTerms) newErrors.acceptedTerms = t('acceptTermsRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGeneralError(null);

    const result = await signUp({
      email,
      password,
      fullName: name,
      companyName: company || '',
      phone: phone || '',
      acceptedTerms,
      acceptedMarketing,
      userIntent: company ? 'sell' : 'buy',
    });

    if (!result.success) {
      setIsLoading(false);
      if (result.error?.includes('E-Mail') || result.error?.includes('email')) {
        setErrors({ email: result.error });
      } else {
        setGeneralError(result.error || t('errorOccurred'));
      }
      return;
    }

    setIsLoading(false);
    setSuccess(true);
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    await resendVerificationEmail();
    setIsResending(false);
  };

  // ---- Erfolgsseite ----
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">{t('successTitle')}</h2>
              <p className="text-muted-foreground mt-2">{t('successDesc')}</p>
            </div>

            {/* E-Mail bestaetigen */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20 p-4 text-left">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">{t('confirmEmail')}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t.rich('confirmEmailDesc', {
                      email,
                      bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button size="lg" className="w-full" onClick={() => router.push('/login')}>
                {t('loginNow') || 'Zum Login'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('noEmailReceived')}{' '}
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? tc('sending') : t('resendLink')}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Registrierungsformular ----
  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('createAccount')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('yourName')} *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={t('namePlaceholder')}
                  className={cn('pl-10', errors.name && 'border-destructive')}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => { const { name, ...rest } = prev; return rest; }); }}
                />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Company (optional) */}
            <div className="space-y-2">
              <Label htmlFor="company">
                {t('companyName')} <span className="text-xs text-muted-foreground font-normal">({tc('optional')})</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder={t('companyPlaceholder')}
                  className="pl-10"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')} *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className={cn('pl-10', errors.email && 'border-destructive')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => { const { email, ...rest } = prev; return rest; }); }}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')} *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordHint')}
                  className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => { const { password, ...rest } = prev; return rest; }); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              {password && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength =
                      (password.length >= 8 ? 1 : 0) +
                      (/[A-Z]/.test(password) ? 1 : 0) +
                      (/[0-9]/.test(password) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                    return (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          level <= strength
                            ? strength <= 1 ? 'bg-red-500'
                              : strength === 2 ? 'bg-orange-500'
                              : strength === 3 ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-muted'
                        )}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Password Confirm */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t('confirmPassword')} *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={cn('pl-10 pr-10', errors.passwordConfirm && 'border-destructive')}
                  value={passwordConfirm}
                  onChange={(e) => { setPasswordConfirm(e.target.value); setErrors(prev => { const { passwordConfirm, ...rest } = prev; return rest; }); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm}</p>}
              {passwordConfirm && password === passwordConfirm && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {t('passwordsMatch')}
                </p>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneLabel')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Separator />

            {/* Terms */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => { setAcceptedTerms(checked as boolean); setErrors(prev => { const { acceptedTerms, ...rest } = prev; return rest; }); }}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                  {t.rich('acceptTerms', {
                    agb: (chunks) => <Link href="/agb" className="text-primary hover:underline">{chunks}</Link>,
                    datenschutz: (chunks) => <Link href="/datenschutz" className="text-primary hover:underline">{chunks}</Link>,
                  })} *
                </label>
              </div>
              {errors.acceptedTerms && <p className="text-sm text-destructive">{errors.acceptedTerms}</p>}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={acceptedMarketing}
                  onCheckedChange={(checked) => setAcceptedMarketing(checked as boolean)}
                />
                <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                  {t('acceptNewsletter')}
                </label>
              </div>
            </div>

            {/* General Error */}
            {generalError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{generalError}</p>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tc('processing')}
                </>
              ) : (
                <>
                  {tc('register')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('alreadyRegistered')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('loginNow')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
