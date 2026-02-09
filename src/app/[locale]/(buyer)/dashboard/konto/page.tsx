'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User, Mail, Lock, Save, Loader2, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { updatePassword } from '@/lib/actions/auth';

export default function BuyerAccountPage() {
  const t = useTranslations('buyerDashboard.account');
  const { profile, account, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const isSeller = !!account;

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (newPassword.length < 8) {
      setPasswordError(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch'));
      return;
    }
    
    setIsChangingPassword(true);
    const result = await updatePassword(newPassword);
    setIsChangingPassword(false);
    
    if (result.success) {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error || t('passwordChangeError'));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground text-xs">{t('name')}</Label>
              <p className="font-medium">{authLoading ? '...' : profile?.full_name || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('email')}</Label>
              <p className="font-medium">{authLoading ? '...' : profile?.email || '-'}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('contactSupport')}
          </p>
        </CardContent>
      </Card>

      {/* Passwort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder={t('newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">{t('passwordChanged')}</p>}
          <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
            {isChangingPassword ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('changingPassword')}</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> {t('changePasswordBtn')}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verkaeufer werden */}
      {!isSeller && (
        <>
          <Separator />
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {t('becomeSeller')}
              </CardTitle>
              <CardDescription>
                {t('becomeSellerDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/seller/registrieren">
                  {t('becomeSellerBtn')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
