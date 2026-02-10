'use client';

import { useState, use, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize-html';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  AlertTriangle,
  FileText,
  Eye,
  Calendar,
  Ruler,
  Cpu,
  Settings,
  Target,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getAdminListings } from '@/lib/actions/admin';
import { mockListings } from '@/data/mock-data';

interface ModerationDetailPageProps {
  params: Promise<{ id: string }>;
}

// Extended mock data with pending listings
const allListings = [
  ...mockListings,
  {
    ...mockListings[0],
    id: 'pending-1',
    title: 'Zeiss ACCURA II 12/18/10',
    status: 'pending_review' as const,
    createdAt: '2026-01-22T10:30:00Z',
  },
  {
    ...mockListings[1],
    id: 'pending-2',
    title: 'Hexagon Optiv 443',
    status: 'pending_review' as const,
    createdAt: '2026-01-22T09:15:00Z',
  },
];

export default function ModerationDetailPage({ params }: ModerationDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [checklist, setChecklist] = useState({
    hasImages: false,
    imagesValid: false,
    descriptionValid: false,
    technicalDataValid: false,
    noContactInfo: false,
    noDuplicate: false,
  });

  const listing = allListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="p-6 md:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="font-semibold text-lg">Inserat nicht gefunden</h3>
            <p className="text-muted-foreground mt-1">
              Das Inserat existiert nicht oder wurde bereits bearbeitet.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/admin/moderation">Zurück zur Übersicht</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const conditionLabels: Record<string, string> = {
    new: 'Neu',
    like_new: 'Wie neu',
    good: 'Gut',
    fair: 'Akzeptabel',
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Inserat freigegeben', {
        description: `"${listing.title}" ist jetzt online.`,
      });
      router.push('/admin/moderation');
    } catch {
      toast.error('Fehler beim Freigeben');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Bitte geben Sie einen Grund an');
      return;
    }

    setIsRejecting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Inserat abgelehnt', {
        description: 'Der Verkäufer wurde per E-Mail informiert.',
      });
      router.push('/admin/moderation');
    } catch {
      toast.error('Fehler beim Ablehnen');
    } finally {
      setIsRejecting(false);
    }
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/moderation">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inserat prüfen</h1>
            <p className="text-muted-foreground">
              Eingereicht am {formatDate(listing.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 self-start">
          Ausstehend
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Bilder ({listing.media.filter((m) => m.type === 'image').length})</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.media.filter((m) => m.type === 'image').length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.media
                    .filter((m) => m.type === 'image')
                    .map((media, index) => (
                      <div
                        key={media.id}
                        className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted"
                      >
                        <Image
                          src={media.url}
                          alt={`Bild ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {media.isPrimary && (
                          <Badge className="absolute top-2 left-2">Hauptbild</Badge>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <p>Keine Bilder vorhanden!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Titel</Label>
                  <p className="font-medium">{listing.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hersteller</Label>
                  <p className="font-medium">{listing.manufacturer.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preis</Label>
                  <p className="font-medium">
                    {listing.price ? formatPrice(listing.price) : 'VB'}
                    {listing.price && listing.priceNegotiable && ' (VB)'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Baujahr</Label>
                  <p className="font-medium">{listing.yearBuilt}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Zustand</Label>
                  <p className="font-medium">{conditionLabels[listing.condition]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Standort</Label>
                  <p className="font-medium">
                    {listing.locationCity}, {listing.locationCountry}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Data */}
          <Card>
            <CardHeader>
              <CardTitle>Technische Daten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Messbereich</Label>
                    <p className="font-medium">
                      {listing.measuringRangeX} × {listing.measuringRangeY} × {listing.measuringRangeZ} mm
                    </p>
                  </div>
                </div>
                {listing.accuracyUm && (
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Genauigkeit</Label>
                      <p className="font-medium">{listing.accuracyUm}</p>
                    </div>
                  </div>
                )}
                {listing.software && (
                  <div className="flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Software</Label>
                      <p className="font-medium">{listing.software}</p>
                    </div>
                  </div>
                )}
                {listing.controller && (
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Steuerung</Label>
                      <p className="font-medium">{listing.controller}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(listing.description) }} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Verkäufer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{listing.seller?.companyName || 'Unbekannt'}</p>
                  <div className="flex items-center gap-1">
                    {listing.seller?.isVerified ? (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Verifiziert
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Nicht verifiziert
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {listing.seller?.addressCity}, {listing.seller?.addressCountry}
                  </span>
                </div>
                {listing.seller?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.seller.phone}</span>
                  </div>
                )}
                {listing.seller?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={listing.seller.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/accounts/${listing.seller?.id}`}>
                  Account ansehen
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Prüfliste</CardTitle>
              <CardDescription>
                Alle Punkte müssen erfüllt sein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'hasImages', label: 'Mindestens 1 Bild vorhanden' },
                { key: 'imagesValid', label: 'Bilder zeigen echte Maschine' },
                { key: 'descriptionValid', label: 'Beschreibung ist plausibel' },
                { key: 'technicalDataValid', label: 'Technische Daten realistisch' },
                { key: 'noContactInfo', label: 'Keine Kontaktdaten im Text' },
                { key: 'noDuplicate', label: 'Kein Duplikat' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      checklist[item.key as keyof typeof checklist]
                        ? 'bg-green-500 border-green-500'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {checklist[item.key as keyof typeof checklist] && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Entscheidung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!allChecked || isApproving}
                onClick={handleApprove}
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Freigeben
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <XCircle className="h-4 w-4 mr-2" />
                    Ablehnen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Inserat ablehnen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Geben Sie den Grund für die Ablehnung an. Der Verkäufer wird per E-Mail informiert.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <Label htmlFor="reason">Grund für Ablehnung</Label>
                    <Textarea
                      id="reason"
                      placeholder="z.B. Bilder zeigen nicht die tatsächliche Maschine..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      disabled={isRejecting || !rejectionReason.trim()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isRejecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Ablehnen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {!allChecked && (
                <p className="text-xs text-muted-foreground text-center">
                  Bitte prüfen Sie alle Punkte der Checkliste.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/maschinen/${listing.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Vorschau ansehen
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
