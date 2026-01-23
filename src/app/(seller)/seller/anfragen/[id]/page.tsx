'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  FileText,
  Sparkles,
  MailOpen,
  Inbox,
  Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { mockInquiries } from '@/data/mock-data';
import { EmailComposer } from '@/components/features/seller';

const statusConfig = {
  new: { label: 'Neu', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  contacted: { label: 'Kontaktiert', color: 'bg-yellow-100 text-yellow-800', icon: Phone },
  offer_sent: { label: 'Angebot gesendet', color: 'bg-purple-100 text-purple-800', icon: FileText },
  won: { label: 'Gewonnen', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  lost: { label: 'Verloren', color: 'bg-gray-100 text-gray-500', icon: XCircle },
};

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inquiryId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inquiry, setInquiry] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const found = mockInquiries.find((i) => i.id === inquiryId);
      if (found) {
        setInquiry(found);
        setNotes(found.notes || '');
        setStatus(found.status);
      }
      setIsLoading(false);
    }, 500);
  }, [inquiryId]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setInquiry({ ...inquiry, notes, status });
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setInquiry({ ...inquiry, status: newStatus });
    setIsSaving(false);
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Anfrage nicht gefunden</h1>
        <p className="text-muted-foreground mb-6">
          Die angeforderte Anfrage existiert nicht.
        </p>
        <Button asChild>
          <Link href="/seller/anfragen">Zurück zu Anfragen</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = statusConfig[inquiry.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/seller/anfragen">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Anfrage von {inquiry.contactName}</h1>
            <p className="text-muted-foreground">
              {inquiry.contactCompany && `${inquiry.contactCompany} • `}
              {new Date(inquiry.createdAt).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <Badge className={statusInfo.color}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nachricht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Listing Info */}
          {inquiry.listing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Angefragtes Inserat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {inquiry.listing.media?.[0] && (
                    <div className="w-24 h-18 bg-muted rounded overflow-hidden shrink-0">
                      <img
                        src={inquiry.listing.media[0].url}
                        alt={inquiry.listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{inquiry.listing.title}</h3>
                    <p className="text-lg font-bold text-primary">
                      {(inquiry.listing.price / 100).toLocaleString('de-DE')} €
                    </p>
                    <Button variant="link" className="px-0 h-auto" asChild>
                      <Link href={`/maschinen/${inquiry.listing.slug}`} target="_blank">
                        Inserat ansehen
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">E-Mail-Verlauf</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/seller/emails">
                  Alle E-Mails
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample email timeline - would be fetched from API */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Send className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">Sie haben geantwortet</p>
                      <span className="text-xs text-muted-foreground">22.01.26, 16:00</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Vielen Dank für Ihr Interesse. Anbei finden Sie das Kalibrierprotokoll...
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1" asChild>
                      <Link href="/seller/emails">E-Mail anzeigen</Link>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Inbox className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{inquiry?.contactName} hat geschrieben</p>
                      <span className="text-xs text-muted-foreground">22.01.26, 14:15</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {inquiry?.message?.slice(0, 100)}...
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1" asChild>
                      <Link href="/seller/emails">E-Mail anzeigen</Link>
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsEmailComposerOpen(true)}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Antworten
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interne Notizen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notizen zu dieser Anfrage (nur für Sie sichtbar)..."
                rows={4}
              />
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Notizen speichern
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-medium truncate">{inquiry.contactEmail}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(inquiry.contactEmail, 'email')}
                >
                  {copied === 'email' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {inquiry.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{inquiry.contactPhone}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(inquiry.contactPhone!, 'phone')}
                  >
                    {copied === 'phone' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {inquiry.contactCompany && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Firma</p>
                    <p className="font-medium">{inquiry.contactCompany}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => setIsEmailComposerOpen(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  E-Mail mit Vorlage
                </Button>
                {inquiry.contactPhone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${inquiry.contactPhone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${inquiry.contactEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Im E-Mail-Programm öffnen
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status ändern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Eingegangen: {new Date(inquiry.createdAt).toLocaleString('de-DE')}
                </p>
                {inquiry.updatedAt !== inquiry.createdAt && (
                  <p className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Aktualisiert: {new Date(inquiry.updatedAt).toLocaleString('de-DE')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange('contacted')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Als kontaktiert markieren
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange('offer_sent')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Angebot gesendet
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-green-600 hover:text-green-700"
                onClick={() => handleStatusChange('won')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Als gewonnen markieren
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => handleStatusChange('lost')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Als verloren markieren
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposer
        open={isEmailComposerOpen}
        onOpenChange={setIsEmailComposerOpen}
        recipientName={inquiry.contactName}
        recipientEmail={inquiry.contactEmail}
        recipientCompany={inquiry.contactCompany}
        machineName={inquiry.listing?.title}
        machinePrice={inquiry.listing ? `${(inquiry.listing.price / 100).toLocaleString('de-DE')} €` : undefined}
        sellerName="Sandra Becker" // In real app: from user context
      />
    </div>
  );
}
