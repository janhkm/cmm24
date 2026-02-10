'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User, Mail, Lock, Save, Loader2, ArrowRight, Package, Download, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { updatePassword } from '@/lib/actions/auth';
import { deleteAccount, exportUserData } from '@/lib/actions/account';

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
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

      {/* Datenschutz & Daten (DSGVO) */}
      <Separator />
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" />
          Datenschutz & Daten
        </h2>
        
        {/* Datenexport */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Datenexport (Art. 15 + Art. 20 DSGVO)
            </CardTitle>
            <CardDescription>
              Laden Sie eine Kopie aller Ihrer personenbezogenen Daten im maschinenlesbaren JSON-Format herunter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                setIsExporting(true);
                try {
                  const result = await exportUserData();
                  if (result.success && result.data) {
                    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cmm24-datenexport-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Datenexport wurde heruntergeladen');
                  } else {
                    toast.error(result.error || 'Fehler beim Export');
                  }
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Meine Daten herunterladen
            </Button>
          </CardContent>
        </Card>

        {/* Account loeschen */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Account löschen (Art. 17 DSGVO)
            </CardTitle>
            <CardDescription>
              Löschen Sie Ihren Account und alle damit verbundenen Daten unwiderruflich.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Account endgültig löschen
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden unwiderruflich gelöscht.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label>Geben Sie <strong>LOESCHEN</strong> ein, um die Löschung zu bestätigen</Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="LOESCHEN"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setIsDeletingAccount(true);
                      try {
                        const result = await deleteAccount(deleteConfirmText);
                        if (result.success) {
                          toast.success('Account wurde gelöscht.');
                          window.location.href = '/';
                        } else {
                          toast.error(result.error || 'Fehler bei der Löschung');
                        }
                      } finally {
                        setIsDeletingAccount(false);
                      }
                    }}
                    disabled={deleteConfirmText !== 'LOESCHEN' || isDeletingAccount}
                  >
                    {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Unwiderruflich löschen
                  </Button>
                  <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
