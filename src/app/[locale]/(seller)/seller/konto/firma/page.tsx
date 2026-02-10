'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  Building2,
  MapPin,
  Globe,
  Phone,
  Upload,
  Trash2,
  Save,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccountSettingsSkeleton } from '@/components/ui/skeletons';
import { toast } from 'sonner';
import { useSellerAuth } from '@/hooks/use-seller-auth';
import { updateAccount, uploadAccountLogo, deleteAccountLogo } from '@/lib/actions/account';

const legalForms = [
  'GmbH',
  'AG',
  'KG',
  'OHG',
  'Einzelunternehmen',
  'GbR',
  'UG (haftungsbeschränkt)',
  'Sonstige',
];

export default function FirmendatenPage() {
  const t = useTranslations('sellerAccount.firma');
  const tCountries = useTranslations('countries');
  const { account, isLoading: authLoading } = useSellerAuth();
  const refreshProfile = () => { window.location.reload(); };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const countryKeys = ['DE', 'AT', 'CH', 'NL', 'BE', 'FR', 'IT', 'PL', 'CZ', 'UK'] as const;
  
  const [formData, setFormData] = useState({
    company_name: '',
    legal_form: '',
    vat_id: '',
    address_street: '',
    address_postal_code: '',
    address_city: '',
    address_country: '',
    phone: '',
    website: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Initialize form data when account is loaded
  useEffect(() => {
    if (account) {
      setFormData({
        company_name: account.company_name || '',
        legal_form: account.legal_form || '',
        vat_id: account.vat_id || '',
        address_street: account.address_street || '',
        address_postal_code: account.address_postal_code || '',
        address_city: account.address_city || '',
        address_country: account.address_country || '',
        phone: account.phone || '',
        website: account.website || '',
        description: account.description || '',
      });
      setLogoUrl(account.logo_url);
    }
  }, [account]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadAccountLogo(formData);
      if (result.success && result.data) {
        setLogoUrl(result.data.url);
        toast.success(t('logoUploaded'));
        refreshProfile();
      } else {
        toast.error(result.error || t('errorUploading'));
      }
    } catch (error) {
      toast.error(t('errorUploading'));
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const result = await deleteAccountLogo();
      if (result.success) {
        setLogoUrl(null);
        toast.success(t('logoDeleted'));
        refreshProfile();
      } else {
        toast.error(result.error || t('errorDeleting'));
      }
    } catch (error) {
      toast.error(t('errorDeleting'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await updateAccount(formData);
      if (result.success) {
        toast.success(t('dataSaved'));
        refreshProfile();
      } else {
        toast.error(result.error || t('errorSaving'));
      }
    } catch (error) {
      toast.error(t('errorSaving'));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <AccountSettingsSkeleton />;
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-3xl">
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
        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('logo.title')}
            </CardTitle>
            <CardDescription>
              {t('logo.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Logo Preview */}
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={t('logo.altText')}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={isUploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {t('logo.upload')}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteLogo}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('logo.hint')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('details.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t('details.companyName')} *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_form">{t('details.legalForm')}</Label>
                <Select
                  value={formData.legal_form}
                  onValueChange={(v) => handleChange('legal_form', v)}
                >
                  <SelectTrigger id="legal_form">
                    <SelectValue placeholder={t('details.selectLegalForm')} />
                  </SelectTrigger>
                  <SelectContent>
                    {legalForms.map((form) => (
                      <SelectItem key={form} value={form}>
                        {form}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_id">{t('details.vatId')}</Label>
              <Input
                id="vat_id"
                value={formData.vat_id}
                onChange={(e) => handleChange('vat_id', e.target.value)}
                placeholder="DE123456789"
              />
              <p className="text-xs text-muted-foreground">
                {t('details.vatIdHint')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('address.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_street">{t('address.street')}</Label>
              <Input
                id="address_street"
                value={formData.address_street}
                onChange={(e) => handleChange('address_street', e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="address_postal_code">{t('address.postalCode')}</Label>
                <Input
                  id="address_postal_code"
                  value={formData.address_postal_code}
                  onChange={(e) => handleChange('address_postal_code', e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address_city">{t('address.city')}</Label>
                <Input
                  id="address_city"
                  value={formData.address_city}
                  onChange={(e) => handleChange('address_city', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_country">{t('address.country')}</Label>
              <Select
                value={formData.address_country}
                onValueChange={(v) => handleChange('address_country', v)}
              >
                <SelectTrigger id="address_country">
                  <SelectValue placeholder={t('address.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {countryKeys.map((code) => (
                    <SelectItem key={code} value={tCountries(code)}>
                      {tCountries(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t('contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('contact.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">{t('contact.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder={t('contact.websitePlaceholder')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('about.title')}
            </CardTitle>
            <CardDescription>
              {t('about.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('about.placeholder')}
              rows={4}
              maxLength={1000}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t('about.maxChars', { current: formData.description.length })}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/seller/konto">{t('cancelButton')}</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('saveButton')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
