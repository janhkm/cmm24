'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Building2, Bell, Shield, Loader2, CheckCircle, Bot, Crown, Info, Mail, Pen, Eye, AlertCircle, Zap, Plus, Trash2, Edit2, ImageIcon, Award, Upload } from 'lucide-react';
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
import { getProfileWithAccount, updateProfile, updateAccount, updatePremiumProfile, uploadProfileAvatar, uploadGalleryImage, type UserProfileData } from '@/lib/actions/account';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import {
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  type MessageTemplate,
} from '@/lib/actions/message-templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

  // Template States
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Erweitertes Profil States
  const [galleryUrls, setGalleryUrls] = useState<{ url: string; caption?: string }[]>([]);
  const [certificates, setCertificates] = useState<{ name: string; url?: string; issued_by?: string }[]>([]);
  const [companyDescription, setCompanyDescription] = useState('');
  const [isSavingProfile2, setIsSavingProfile2] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');

  // ALLES IST JETZT FREE - alle Features freigeschaltet
  // AUSKOMMENTIERT: const featureFlags = plan?.feature_flags as Record<string, boolean> | null;
  const hasTemplatesFeature = true;
  const hasPremiumProfile = true;

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
      const rawGallery = result.data.account.galleryUrls;
      setGalleryUrls(Array.isArray(rawGallery) ? rawGallery : []);
      const rawCerts = result.data.account.certificates;
      setCertificates(Array.isArray(rawCerts) ? rawCerts : []);
      setCompanyDescription(result.data.account.description || '');
    } else {
      setError(result.error || t('errorLoadingProfile'));
    }
    
    setIsLoading(false);

    // Nachrichtenvorlagen laden wenn Feature aktiv
    if (hasTemplatesFeature && result.success && result.data?.account?.id) {
      loadTemplates(result.data.account.id);
    }
  };

  const loadTemplates = async (accountId: string) => {
    setIsLoadingTemplates(true);
    const result = await getMessageTemplates(accountId);
    if (result.success && result.data) {
      setTemplates(result.data);
    }
    setIsLoadingTemplates(false);
  };

  const handleOpenTemplateDialog = (template?: MessageTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateTitle(template.title);
      setTemplateContent(template.content);
    } else {
      setEditingTemplate(null);
      setTemplateTitle('');
      setTemplateContent('');
    }
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!profile?.account?.id) return;
    setIsSavingTemplate(true);

    if (editingTemplate) {
      const result = await updateMessageTemplate(editingTemplate.id, templateTitle, templateContent);
      if (result.success) {
        toast.success(t('templates.saved'));
        loadTemplates(profile.account.id);
      } else {
        toast.error(result.error || t('errorSaving'));
      }
    } else {
      const result = await createMessageTemplate(profile.account.id, templateTitle, templateContent);
      if (result.success) {
        toast.success(t('templates.created'));
        loadTemplates(profile.account.id);
      } else {
        toast.error(result.error || t('errorSaving'));
      }
    }

    setIsSavingTemplate(false);
    setTemplateDialogOpen(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!profile?.account?.id) return;
    const result = await deleteMessageTemplate(templateId);
    if (result.success) {
      toast.success(t('templates.deleted'));
      loadTemplates(profile.account.id);
    } else {
      toast.error(result.error || t('errorSaving'));
    }
  };

  // Erweitertes Profil speichern
  const handleSavePremiumProfile = async () => {
    setIsSavingProfile2(true);
    const result = await updatePremiumProfile({
      description: companyDescription,
      gallery_urls: galleryUrls,
      certificates: certificates,
    });
    if (result.success) {
      toast.success(t('premiumProfile.saved'));
    } else {
      toast.error(result.error || t('errorSaving'));
    }
    setIsSavingProfile2(false);
  };

  // Profilbild hochladen (via Server Action)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProfileAvatar(formData);
      if (result.success && result.data) {
        setProfile((prev) => prev ? { ...prev, avatarUrl: result.data!.url } : prev);
        toast.success('Profilbild aktualisiert');
      } else {
        toast.error(result.error || 'Upload fehlgeschlagen');
      }
    } catch (err) {
      console.error('[handleAvatarUpload] Error:', err);
      toast.error('Unerwarteter Fehler beim Upload');
    }
    setIsUploadingAvatar(false);
  };

  // Galerie-Bild hochladen (via Server Action)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadGalleryImage(formData);
      if (result.success && result.data) {
        setGalleryUrls((prev) => [...prev, { url: result.data!.url }]);
        toast.success(t('premiumProfile.imageUploaded'));
      } else {
        toast.error(result.error || 'Upload fehlgeschlagen');
      }
    } catch (err) {
      console.error('[handleGalleryUpload] Error:', err);
      toast.error('Unerwarteter Fehler beim Upload');
    }
    setIsUploadingGallery(false);
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddCertificate = () => {
    if (!newCertName.trim()) return;
    setCertificates((prev) => [...prev, {
      name: newCertName.trim(),
      issued_by: newCertIssuer.trim() || undefined,
    }]);
    setNewCertName('');
    setNewCertIssuer('');
  };

  const handleRemoveCertificate = (idx: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== idx));
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
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.company')}</span>
          </TabsTrigger>
          {/* AUSKOMMENTIERT: E-Mail-Tab (Email komplett ausgeklammert)
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.email')}</span>
          </TabsTrigger>
          */}
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.notifications')}</span>
          </TabsTrigger>
          {hasTemplatesFeature && (
            <TabsTrigger value="templates" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tabs.templates')}</span>
            </TabsTrigger>
          )}
          {/* AUSKOMMENTIERT: Premium-Profil Tab (zusammengefuehrt mit Firma)
          {hasPremiumProfile && (
            <TabsTrigger value="premium-profile" className="gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tabs.premiumProfile')}</span>
            </TabsTrigger>
          )}
          */}
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
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird hochgeladen...</>
                    ) : (
                      t('profile.changeImage')
                    )}
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

        {/* Company Tab (inkl. ehemaliges Premium-Profil) */}
        <TabsContent value="company">
          <div className="space-y-6">
            {/* Firmendaten */}
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

            {/* Unternehmensbeschreibung (ehemals Premium-Profil) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('premiumProfile.descriptionTitle')}
                </CardTitle>
                <CardDescription>{t('premiumProfile.descriptionHint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder={t('premiumProfile.descriptionPlaceholder')}
                  rows={5}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {companyDescription.length}/2000
                </p>
              </CardContent>
            </Card>

            {/* Galerie (ehemals Premium-Profil) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {t('premiumProfile.galleryTitle')}
                </CardTitle>
                <CardDescription>{t('premiumProfile.galleryDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {(Array.isArray(galleryUrls) ? galleryUrls : []).map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] overflow-hidden rounded-lg border group">
                      <img
                        src={img.url}
                        alt={img.caption || `Bild ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveGalleryImage(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(Array.isArray(galleryUrls) ? galleryUrls : []).length < 6 && (
                    <label className="aspect-[4/3] flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={isUploadingGallery}
                      />
                      {isUploadingGallery ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">{t('premiumProfile.addImage')}</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('premiumProfile.galleryHint', { count: (Array.isArray(galleryUrls) ? galleryUrls : []).length, max: 6 })}
                </p>
              </CardContent>
            </Card>

            {/* Zertifikate (ehemals Premium-Profil) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {t('premiumProfile.certificatesTitle')}
                </CardTitle>
                <CardDescription>{t('premiumProfile.certificatesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {certificates.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-md border">
                        <Award className="h-4 w-4 text-amber-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{cert.name}</span>
                          {cert.issued_by && (
                            <span className="text-xs text-muted-foreground ml-1">({cert.issued_by})</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleRemoveCertificate(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    placeholder={t('premiumProfile.certName')}
                    className="flex-1"
                  />
                  <Input
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder={t('premiumProfile.certIssuer')}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddCertificate}
                    disabled={!newCertName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('premiumProfile.addCert')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profil speichern */}
            <Button
              onClick={handleSavePremiumProfile}
              disabled={isSavingProfile2}
              className="w-full sm:w-auto"
            >
              {isSavingProfile2 && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('premiumProfile.save')}
            </Button>
          </div>
        </TabsContent>

        {/* AUSKOMMENTIERT: E-Mail Tab (Email komplett ausgeklammert) */}

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
        {/* Templates Tab (Business only) */}
        {hasTemplatesFeature && (
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {t('templates.title')}
                    </CardTitle>
                    <CardDescription>{t('templates.description')}</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenTemplateDialog()} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('templates.create')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-sm text-muted-foreground">{t('templates.empty')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleOpenTemplateDialog()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('templates.createFirst')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{tpl.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{tpl.content}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenTemplateDialog(tpl)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Dialog */}
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? t('templates.edit') : t('templates.create')}
                  </DialogTitle>
                  <DialogDescription>
                    {t('templates.dialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('templates.titleLabel')}</Label>
                    <Input
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      placeholder={t('templates.titlePlaceholder')}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('templates.contentLabel')}</Label>
                    <Textarea
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      placeholder={t('templates.contentPlaceholder')}
                      rows={6}
                      maxLength={5000}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setTemplateDialogOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={!templateTitle.trim() || !templateContent.trim() || isSavingTemplate}
                  >
                    {isSavingTemplate ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {editingTemplate ? t('save') : t('templates.create')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}
        {/* AUSKOMMENTIERT: Premium-Profil Tab (zusammengefuehrt mit Firma-Tab oben) */}
      </Tabs>
    </div>
  );
}
