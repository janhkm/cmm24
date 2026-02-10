'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { updatePassword } from '@/lib/actions/account';

export default function PasswortPage() {
  const t = useTranslations('sellerAccount.password');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculator
  const calculatePasswordStrength = (password: string): {
    score: number;
    label: string;
    color: string;
  } => {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    if (score < 30) return { score, label: t('strengthVeryWeak'), color: 'bg-red-500' };
    if (score < 50) return { score, label: t('strengthWeak'), color: 'bg-orange-500' };
    if (score < 70) return { score, label: t('strengthMedium'), color: 'bg-yellow-500' };
    if (score < 90) return { score, label: t('strengthStrong'), color: 'bg-green-500' };
    return { score: 100, label: t('strengthVeryStrong'), color: 'bg-green-600' };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;
    
    setIsLoading(true);
    
    try {
      const result = await updatePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast.success(t('successMessage'));
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.error || t('errorMessage'));
      }
    } catch (error) {
      toast.error(t('errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/seller/konto"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('backToSettings')}
        </Link>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('cardTitle')}
            </CardTitle>
            <CardDescription>
              {t('cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('passwordStrength')}</span>
                    <span className={cn(
                      'font-medium',
                      passwordStrength.score < 50 ? 'text-orange-500' : 'text-green-600'
                    )}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength.score}
                    className={cn('h-1.5', passwordStrength.color)}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    'pr-10',
                    confirmPassword.length > 0 && !passwordsMatch && 'border-destructive'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t('passwordsDontMatch')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">{t('requirements.title')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { check: newPassword.length >= 8, text: t('requirements.minLength') },
                { check: /[A-Z]/.test(newPassword), text: t('requirements.uppercase') },
                { check: /[a-z]/.test(newPassword), text: t('requirements.lowercase') },
                { check: /[0-9]/.test(newPassword), text: t('requirements.number') },
              ].map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full flex items-center justify-center',
                      req.check
                        ? 'bg-green-100 text-green-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {req.check ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </div>
                  <span className={req.check ? 'text-green-600' : 'text-muted-foreground'}>
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/seller/konto">{t('cancelButton')}</Link>
          </Button>
          <Button type="submit" disabled={!canSubmit || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('changing')}
              </>
            ) : (
              t('changePassword')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
