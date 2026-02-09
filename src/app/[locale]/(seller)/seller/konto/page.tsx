'use client';

import { useState, useEffect } from 'react';
import { User, Building2, Bell, Shield, Loader2, CheckCircle, Bot, Crown, Info, Mail, Pen, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getProfileWithAccount, updateProfile, updateAccount, type UserProfileData } from '@/lib/actions/account';
import { useSellerAuth } from '@/hooks/use-seller-auth';

export default function KontoPage() {
  const t = useTranslations('sellerAccount');
  const { plan } = useSellerAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  
  // Form values
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [vatId, setVatId] = useState('');
  const [website, setWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [emailSignature, setEmailSignature] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getProfileWithAccount();
    
    if (result.success && result.data) {
      setProfile(result.data);
      // Initialize form values
      setFullName(result.data.fullName || '');
      setPhone(result.data.phone || '');
      setCompanyName(result.data.account.companyName || '');
      setAddressStreet(result.data.account.addressStreet || '');
      setAddressPostalCode(result.data.account.addressPostalCode || '');
      setAddressCity(result.data.account.addressCity || '');
      setAddressCountry(result.data.account.addressCountry || '');
      setVatId(result.data.account.vatId || '');
      setWebsite(result.data.account.website || '');
      setCompanyPhone(result.data.account.phone || '');
      setEmailSignature(result.data.account.emailSignature || '');
    } else {
      setError(result.error || t('errorLoadingProfile'));
    }
    
    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    
    const result = await updateProfile({
      full_name: fullName,
      phone: phone,
    });
    
    if (result.success) {
      toast.success(t('profileSaved'));
    } else {
      toast.error(result.error || t('errorSaving'));
    }
    
    setIsSavingProfile(false);
  };

  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    
    const result = await updateAccount({
      company_name: companyName,
      address_street: addressStreet,
      address_postal_code: addressPostalCode,
      address_city: addressCity,
      address_country: addressCountry,
      vat_id: vatId,
      website: website,
      phone: companyPhone,
    });
    
    if (result.success) {
      toast.success(t('companyDataSaved'));
    } else {
      toast.error(result.error || t('errorSaving'));
    }
    
    setIsSavingCompany(false);
  };

  const handleSaveSignature = async () => {
    setIsSavingSignature(true);
    
    const result = await updateAccount({
      company_name: companyName,
      email_signature: emailSignature,
    });
    
    if (result.success) {
      toast.success(t('signatureSaved'));
    } else {
      toast.error(result.error || t('errorSaving'));
    }
    
    setIsSavingSignature(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || t('profileLoadError')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.company')}</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.email')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.notifications')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
              <CardDescription>
                {t('profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    {t('profile.changeImage')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.imageHint')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.emailAddress')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('profile.emailCannotChange')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('profile.phone')}</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>{t('company.title')}</CardTitle>
              <CardDescription>
                {t('company.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">{t('company.companyName')}</Label>
                  <Input 
                    id="companyName" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">{t('company.streetAddress')}</Label>
                  <Input 
                    id="street" 
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('company.postalCode')}</Label>
                  <Input 
                    id="postalCode" 
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('company.city')}</Label>
                  <Input 
                    id="city" 
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t('company.country')}</Label>
                  <Input 
                    id="country" 
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatId">{t('company.vatId')}</Label>
                  <Input 
                    id="vatId" 
                    value={vatId}
                    onChange={(e) => setVatId(e.target.value)}
                    placeholder="DE123456789" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t('company.website')}</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">{t('company.companyPhone')}</Label>
                  <Input 
                    id="companyPhone" 
                    type="tel" 
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveCompany} disabled={isSavingCompany}>
                  {isSavingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Mail Tab */}
        <TabsContent value="email">
          <div className="space-y-6">
            {/* E-Mail-Signatur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pen className="h-5 w-5" />
                  {t('email.signatureTitle')}
                </CardTitle>
                <CardDescription>
                  {t('email.signatureDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signature">{t('email.yourSignature')}</Label>
                  <Textarea
                    id="signature"
                    value={emailSignature}
                    onChange={(e) => setEmailSignature(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder={t('email.signaturePlaceholder')}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => setEmailSignature(prev => prev + '{{name}}')}
                    >
                      {'{{name}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => setEmailSignature(prev => prev + '{{company}}')}
                    >
                      {'{{company}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => setEmailSignature(prev => prev + '{{phone}}')}
                    >
                      {'{{phone}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => setEmailSignature(prev => prev + '{{website}}')}
                    >
                      {'{{website}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => setEmailSignature(prev => prev + '{{email}}')}
                    >
                      {'{{email}}'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('email.variableHint')}
                  </p>
                </div>

                <Separator />

                {/* Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <Label>{t('email.preview')}</Label>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                    {emailSignature
                      .replace('{{name}}', fullName || t('email.placeholderName'))
                      .replace('{{company}}', companyName || t('email.placeholderCompany'))
                      .replace('{{phone}}', companyPhone || t('email.placeholderPhone'))
                      .replace('{{website}}', website || t('email.placeholderWebsite'))
                      .replace('{{email}}', profile.email)}
                  </div>
                </div>

                <Button onClick={handleSaveSignature} disabled={isSavingSignature}>
                  {isSavingSignature && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('email.saveSignature')}
                </Button>
              </CardContent>
            </Card>

            {/* Auto-Reply Link */}
            {(plan?.feature_flags as { auto_reply?: boolean } | null)?.auto_reply && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    {t('email.autoReplyTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('email.autoReplyDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href="/seller/emails">{t('email.configureAutoReply')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('security.changePasswordTitle')}</CardTitle>
                <CardDescription>
                  {t('security.changePasswordDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/passwort-vergessen">{t('security.resetPassword')}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('security.twoFactorTitle')}</CardTitle>
                <CardDescription>
                  {t('security.twoFactorDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('security.authenticatorApp')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('security.authenticatorDescription')}
                    </p>
                  </div>
                  <Badge variant="outline">{t('security.comingSoon')}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">{t('security.deleteAccountTitle')}</CardTitle>
                <CardDescription>
                  {t('security.deleteAccountDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => toast.info(t('security.contactSupport'))}>
                  {t('security.deleteAccount')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>
                {t('notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.inquiries')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.inquiriesDescription')}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.productUpdates')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.productUpdatesDescription')}
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.newsletter')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.newsletterDescription')}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('notifications.notSavedNote')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
