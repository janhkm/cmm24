'use client';

import { useState } from 'react';
import { User, Building2, Bell, Shield, Loader2, CheckCircle, Bot, Crown, Info, Link2, Mail, CheckCircle2, XCircle, ExternalLink, RefreshCw, Pen, Eye } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { plans } from '@/data/mock-data';

// Mock current plan
const currentPlan = plans.find((p) => p.slug === 'business')!;

// Mock user data
const user = {
  id: '1',
  fullName: 'Sandra Becker',
  email: 'sandra@beispiel-gmbh.de',
  phone: '+49 89 123456',
  avatarUrl: null,
  company: {
    name: 'Beispiel GmbH',
    street: 'Musterstraße 1',
    postalCode: '80331',
    city: 'München',
    country: 'Deutschland',
    vatId: 'DE123456789',
    website: 'https://beispiel-gmbh.de',
    phone: '+49 89 123456',
  },
  notifications: {
    emailInquiries: true,
    emailMarketing: false,
    emailNewsletter: true,
  },
  autoReply: {
    enabled: true,
    delayMinutes: 5,
    message: `Vielen Dank für Ihre Anfrage zu {{listing_title}}!

Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.

In der Zwischenzeit können Sie gerne weitere Informationen auf unserer Website finden: {{company_website}}

Mit freundlichen Grüßen,
{{company_name}}`,
  },
  emailSync: {
    connected: true,
    provider: 'outlook',
    email: 'sandra@precision-gmbh.de',
    lastSync: '2026-01-23T10:30:00Z',
  },
  emailSignature: `Mit freundlichen Grüßen,

Sandra Becker
Precision GmbH
Tel: +49 89 123456
Web: https://precision-gmbh.de

--
Besuchen Sie unser Profil auf CMM24: https://cmm24.de/haendler/precision-gmbh`,
};

export default function KontoPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kontoeinstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre persönlichen Daten und Einstellungen.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Firma</span>
          </TabsTrigger>
          <TabsTrigger value="email-sync" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">E-Mail</span>
          </TabsTrigger>
          <TabsTrigger value="autoreply" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Auto-Reply</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sicherheit</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Benachrichtigungen</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
              <CardDescription>
                Ihre persönlichen Kontaktdaten für Anfragen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.fullName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Bild ändern
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG. Max. 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Vollständiger Name</Label>
                  <Input id="fullName" defaultValue={user.fullName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" defaultValue={user.phone} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saveSuccess && <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
                  {saveSuccess ? 'Gespeichert!' : 'Änderungen speichern'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Firmendaten</CardTitle>
              <CardDescription>
                Diese Daten werden in Ihren Inseraten und auf Rechnungen angezeigt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">Firmenname</Label>
                  <Input id="companyName" defaultValue={user.company.name} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Straße & Hausnummer</Label>
                  <Input id="street" defaultValue={user.company.street} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">PLZ</Label>
                  <Input id="postalCode" defaultValue={user.company.postalCode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input id="city" defaultValue={user.company.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Land</Label>
                  <Input id="country" defaultValue={user.company.country} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatId">USt-IdNr.</Label>
                  <Input id="vatId" defaultValue={user.company.vatId} placeholder="DE123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" defaultValue={user.company.website} placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefon (Firma)</Label>
                  <Input id="companyPhone" type="tel" defaultValue={user.company.phone} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Änderungen speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Mail Sync Tab */}
        <TabsContent value="email-sync">
          <div className="space-y-6">
            {/* E-Mail-Konto verbinden */}
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Konto verbinden</CardTitle>
                <CardDescription>
                  Verbinden Sie Ihr E-Mail-Postfach, um E-Mails direkt in CMM24 zu senden und zu empfangen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connected Account */}
                {user.emailSync.connected && (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0078D4]">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Microsoft Outlook</h4>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verbunden
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.emailSync.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Letzter Sync: {new Date(user.emailSync.lastSync).toLocaleString('de-DE')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success('E-Mails synchronisiert')}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success('Outlook wurde getrennt')}
                        >
                          Trennen
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <p className="text-sm font-medium">Anderen Anbieter verbinden:</p>

                {/* Gmail */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border">
                      <svg viewBox="0 0 24 24" className="h-6 w-6">
                        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">Google Gmail</h4>
                      <p className="text-sm text-muted-foreground">
                        Gmail oder Google Workspace
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => toast.info('OAuth-Flow wird gestartet...', { description: 'In Produktion würde hier die Google-Anmeldung erscheinen.' })}
                  >
                    Verbinden
                  </Button>
                </div>

                {/* IMAP */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Andere E-Mail (IMAP/SMTP)</h4>
                      <p className="text-sm text-muted-foreground">
                        Beliebiger E-Mail-Anbieter via IMAP
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">
                    Konfigurieren
                  </Button>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Wie funktioniert der E-Mail-Sync?</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>E-Mails werden automatisch mit Anfragen verknüpft</li>
                      <li>Senden Sie Antworten direkt aus CMM24</li>
                      <li>Alle E-Mails bleiben auch in Ihrem Postfach</li>
                      <li>2-Wege-Sync: Änderungen werden überall sichtbar</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* E-Mail-Signatur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pen className="h-5 w-5" />
                  E-Mail-Signatur
                </CardTitle>
                <CardDescription>
                  Diese Signatur wird automatisch an alle E-Mails angehängt, die Sie über CMM24 senden.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signature">Ihre Signatur</Label>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked id="signature-enabled" />
                      <Label htmlFor="signature-enabled" className="text-sm text-muted-foreground">
                        Signatur aktiviert
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id="signature"
                    defaultValue={user.emailSignature}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="Ihre E-Mail-Signatur..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      {'{{name}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      {'{{company}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      {'{{phone}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      {'{{website}}'}
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      {'{{email}}'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Klicken Sie auf eine Variable, um sie einzufügen. Diese werden automatisch mit Ihren Daten ersetzt.
                  </p>
                </div>

                <Separator />

                {/* Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <Label>Vorschau</Label>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                    {user.emailSignature
                      .replace('{{name}}', user.fullName)
                      .replace('{{company}}', user.company.name)
                      .replace('{{phone}}', user.company.phone)
                      .replace('{{website}}', user.company.website)
                      .replace('{{email}}', user.email)}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Signatur speichern
                </Button>
              </CardContent>
            </Card>

            {/* Sync-Einstellungen */}
            <Card>
              <CardHeader>
                <CardTitle>Sync-Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie, wie E-Mails synchronisiert werden.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatischer Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      E-Mails werden alle 5 Minuten synchronisiert.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nur Anfragen-Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Nur E-Mails importieren, die mit Anfragen verknüpft sind.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lesebestätigungen</Label>
                    <p className="text-sm text-muted-foreground">
                      Tracking-Pixel in ausgehenden E-Mails einfügen.
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Sync-Zeitraum</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Letzte 7 Tage</SelectItem>
                      <SelectItem value="30">Letzte 30 Tage</SelectItem>
                      <SelectItem value="90">Letzte 90 Tage</SelectItem>
                      <SelectItem value="all">Alle E-Mails</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Ältere E-Mails werden nicht importiert.
                  </p>
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Einstellungen speichern
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Auto-Reply Tab */}
        <TabsContent value="autoreply">
          {currentPlan.featureFlags.hasAutoReply ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Automatische Antworten</CardTitle>
                      <CardDescription>
                        Senden Sie automatisch eine Bestätigung bei neuen Anfragen.
                      </CardDescription>
                    </div>
                    <Switch defaultChecked={user.autoReply.enabled} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Verzögerung</Label>
                    <Select defaultValue={String(user.autoReply.delayMinutes)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sofort</SelectItem>
                        <SelectItem value="5">Nach 5 Minuten</SelectItem>
                        <SelectItem value="15">Nach 15 Minuten</SelectItem>
                        <SelectItem value="30">Nach 30 Minuten</SelectItem>
                        <SelectItem value="60">Nach 1 Stunde</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Eine kurze Verzögerung wirkt natürlicher.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Nachricht</Label>
                    <Textarea
                      defaultValue={user.autoReply.message}
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {'{{contact_name}}'}
                      </Badge>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {'{{listing_title}}'}
                      </Badge>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {'{{listing_price}}'}
                      </Badge>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {'{{company_name}}'}
                      </Badge>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {'{{company_website}}'}
                      </Badge>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {'{{company_phone}}'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Klicken Sie auf eine Variable, um sie einzufügen.
                    </p>
                  </div>

                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Einstellungen speichern
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vorschau</CardTitle>
                  <CardDescription>
                    So sieht Ihre automatische Antwort aus.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {user.autoReply.message
                      .replace('{{contact_name}}', 'Max Mustermann')
                      .replace('{{listing_title}}', 'Zeiss Contura 10/12/6')
                      .replace('{{listing_price}}', '45.000 €')
                      .replace('{{company_name}}', user.company.name)
                      .replace('{{company_website}}', user.company.website)
                      .replace('{{company_phone}}', user.company.phone)}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Auto-Reply ist ein Business-Feature</h3>
                    <p className="text-muted-foreground mt-1">
                      Upgraden Sie auf den Business-Plan, um automatische Antworten zu aktivieren.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/seller/abo/upgrade">Jetzt upgraden</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Passwort ändern</CardTitle>
                <CardDescription>
                  Wählen Sie ein sicheres Passwort mit mindestens 8 Zeichen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div />
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Neues Passwort</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Passwort ändern
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
                <CardDescription>
                  Erhöhen Sie die Sicherheit Ihres Kontos mit 2FA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authenticator-App</p>
                    <p className="text-sm text-muted-foreground">
                      Nutzen Sie eine App wie Google Authenticator oder Authy.
                    </p>
                  </div>
                  <Button variant="outline">Einrichten</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Konto löschen</CardTitle>
                <CardDescription>
                  Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Inserate werden gelöscht.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Konto löschen</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Benachrichtigungen</CardTitle>
              <CardDescription>
                Wählen Sie, welche E-Mails Sie erhalten möchten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anfragen</Label>
                    <p className="text-sm text-muted-foreground">
                      Benachrichtigungen bei neuen Anfragen zu Ihren Inseraten.
                    </p>
                  </div>
                  <Switch defaultChecked={user.notifications.emailInquiries} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Produkt-Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Informationen über neue Funktionen und Verbesserungen.
                    </p>
                  </div>
                  <Switch defaultChecked={user.notifications.emailMarketing} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Branchennews und Tipps für erfolgreiche Inserate.
                    </p>
                  </div>
                  <Switch defaultChecked={user.notifications.emailNewsletter} />
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Einstellungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
