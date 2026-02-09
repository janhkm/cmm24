'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { createSellerAccount } from '@/lib/actions/seller-register';

export default function BecomeSellerPage() {
  const router = useRouter();
  const t = useTranslations('sellerRegister');
  const { profile, account, isLoading: authLoading } = useSellerAuth();
  const refreshProfile = () => { window.location.reload(); };
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Wenn schon Seller: Weiterleiten
  if (!authLoading && account) {
    router.push('/seller/dashboard');
    return null;
  }

  const handleSubmit = async () => {
    setError('');
    
    if (!companyName.trim() || companyName.trim().length < 2) {
      setError(t('companyTooShort'));
      return;
    }
    
    setIsSubmitting(true);
    const result = await createSellerAccount(companyName.trim(), phone.trim() || undefined);
    setIsSubmitting(false);
    
    if (result.success) {
      setSuccess(true);
      // Auth-State aktualisieren
      await refreshProfile();
      // Nach kurzer Verzoegerung weiterleiten
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
    } else {
      setError(result.error || t('errorOccurred'));
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">{t('successTitle')}</h2>
            <p className="text-muted-foreground">
              {t('redirecting')}
            </p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">{t('companyLabel')}</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company"
                placeholder={t('companyPlaceholder')}
                className="pl-10"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              {t('phoneLabel')}
              <span className="text-xs text-muted-foreground font-normal">({t('optionalLabel')})</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p>{t('laterNote')}</p>
          </div>
          
          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('submitting')}</>
            ) : (
              <>
                {t('submitButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            {t('freeNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
