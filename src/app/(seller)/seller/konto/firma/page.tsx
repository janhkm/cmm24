'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Building2,
  MapPin,
  Globe,
  Phone,
  Upload,
  Trash2,
  Save,
  CheckCircle,
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Mock company data
const mockCompanyData = {
  companyName: 'Musterfirma GmbH',
  legalForm: 'GmbH',
  vatId: 'DE123456789',
  street: 'Industriestraße 15',
  postalCode: '80333',
  city: 'München',
  country: 'DE',
  phone: '+49 89 123456',
  website: 'https://musterfirma.de',
  description: 'Spezialist für gebrauchte Koordinatenmessmaschinen mit über 20 Jahren Erfahrung.',
  logoUrl: null,
};

const countries = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tschechien' },
];

export default function FirmendatenPage() {
  const [formData, setFormData] = useState(mockCompanyData);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast.success('Firmendaten erfolgreich gespeichert');
  };

  return (
    <div className="container-page py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/seller/konto"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück zu Kontoeinstellungen
        </Link>
        <h1 className="text-2xl font-bold">Firmendaten bearbeiten</h1>
        <p className="text-muted-foreground">
          Diese Informationen werden auf Ihren Inseraten angezeigt
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firmenlogo
            </CardTitle>
            <CardDescription>
              Wird auf Ihrem Verkäuferprofil und Ihren Inseraten angezeigt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Logo Preview */}
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                {logoPreview || formData.logoUrl ? (
                  <img
                    src={logoPreview || formData.logoUrl || ''}
                    alt="Firmenlogo"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Logo hochladen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </Button>
                  {(logoPreview || formData.logoUrl) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLogoPreview(null);
                        setFormData((prev) => ({ ...prev, logoUrl: null }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG oder SVG. Maximal 2MB. Empfohlen: 200x200px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Firmendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalForm">Rechtsform</Label>
                <Select
                  value={formData.legalForm}
                  onValueChange={(v) => handleChange('legalForm', v)}
                >
                  <SelectTrigger id="legalForm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GmbH">GmbH</SelectItem>
                    <SelectItem value="AG">AG</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="OHG">OHG</SelectItem>
                    <SelectItem value="Einzelunternehmen">Einzelunternehmen</SelectItem>
                    <SelectItem value="GbR">GbR</SelectItem>
                    <SelectItem value="Sonstige">Sonstige</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatId">USt-IdNr.</Label>
              <Input
                id="vatId"
                value={formData.vatId}
                onChange={(e) => handleChange('vatId', e.target.value)}
                placeholder="DE123456789"
              />
              <p className="text-xs text-muted-foreground">
                Wird für die Rechnungsstellung benötigt (EU Reverse Charge)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Straße und Hausnummer *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">PLZ *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land *</Label>
              <Select
                value={formData.country}
                onValueChange={(v) => handleChange('country', v)}
              >
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
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
              Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://ihre-firma.de"
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
              Über Ihre Firma
            </CardTitle>
            <CardDescription>
              Eine kurze Beschreibung für Ihr Verkäuferprofil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Beschreiben Sie Ihre Firma und Ihre Expertise..."
              rows={4}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Max. 500 Zeichen. {formData.description.length}/500
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/seller/konto">Abbrechen</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">◠</span>
                Wird gespeichert...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Änderungen speichern
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
