'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle,
  Edit,
  Send,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockListings } from '@/data/mock-data';

export default function InseratVorschauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Find listing by ID (mock)
  const listing = mockListings.find((l) => l.id === id) || mockListings[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const keyFacts = [
    { label: 'Baujahr', value: listing.yearBuilt },
    {
      label: 'Zustand',
      value:
        listing.condition === 'new'
          ? 'Neu'
          : listing.condition === 'like_new'
          ? 'Wie neu'
          : listing.condition === 'good'
          ? 'Gut'
          : 'Akzeptabel',
    },
    {
      label: 'Messbereich',
      value: `${listing.measuringRangeX} × ${listing.measuringRangeY} × ${listing.measuringRangeZ} mm`,
    },
    { label: 'Genauigkeit', value: listing.accuracyUm ? `MPEE: ${listing.accuracyUm} µm` : '-' },
    { label: 'Software', value: listing.software || '-' },
    { label: 'Standort', value: `${listing.locationCity}, ${listing.locationCountry}` },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-yellow-50 border-b border-yellow-200">
        <div className="container-page py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Eye className="h-5 w-5" />
              <span className="font-medium">Vorschau-Modus</span>
              <span className="text-sm">– So wird Ihr Inserat angezeigt</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/seller/inserate/${id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Link>
              </Button>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Send className="h-4 w-4 mr-2" />
                Zur Prüfung einreichen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b bg-background">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Startseite
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/maschinen" className="hover:text-foreground transition-colors">
              Maschinen
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Gallery & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Preview */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              {listing.media.length > 0 ? (
                <Image
                  src={listing.media[0].url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                    <p>Keine Bilder hochgeladen</p>
                    <p className="text-sm">Inserate mit Bildern erhalten 3x mehr Anfragen</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.media.map((media, index) => (
                  <div
                    key={media.id}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 border-primary"
                  >
                    <Image
                      src={media.thumbnailUrl || media.url}
                      alt={`Bild ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Key Facts */}
            <Card>
              <CardHeader>
                <CardTitle>Technische Daten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {keyFacts.map((fact) => (
                    <div key={fact.label} className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">{fact.label}</span>
                      <span className="font-medium">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.description ? (
                  <div className="prose prose-sm max-w-none">
                    {listing.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p>Keine Beschreibung vorhanden</p>
                    <p className="text-sm">Eine gute Beschreibung erhöht die Anfragequote</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price & Seller */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                {/* Manufacturer & Title */}
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {listing.manufacturer.name}
                </p>
                <h1 className="mt-1 text-2xl font-bold">{listing.title}</h1>

                {/* Badge */}
                <div className="mt-3">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Geprüftes Inserat
                  </Badge>
                </div>

                <Separator className="my-4" />

                {/* Price */}
                <div>
                  <p className="text-sm text-muted-foreground">Preis</p>
                  <p className="text-3xl font-bold">{formatPrice(listing.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    zzgl. MwSt. {listing.priceNegotiable && '· VB'}
                  </p>
                </div>

                {/* Preview CTA (disabled) */}
                <div className="mt-6 space-y-3">
                  <Button className="w-full" size="lg" disabled>
                    Anfrage senden
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    CTAs sind in der Vorschau deaktiviert
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Location */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Standort
                  </p>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="font-medium">{listing.locationCity}</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.locationPostalCode}, {listing.locationCountry}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vor Veröffentlichung prüfen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    { done: listing.media.length > 0, text: 'Mindestens 1 Bild hochgeladen' },
                    { done: listing.media.length >= 3, text: '3+ Bilder für mehr Anfragen' },
                    { done: !!listing.description, text: 'Beschreibung ausgefüllt' },
                    { done: listing.description?.length > 100, text: 'Beschreibung ausführlich' },
                    { done: !!listing.software, text: 'Software angegeben' },
                    { done: !!listing.accuracyUm, text: 'Genauigkeit angegeben' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full flex items-center justify-center ${
                          item.done
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                      </div>
                      <span className={item.done ? 'text-green-700' : 'text-yellow-700'}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-background border-t">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href={`/seller/inserate/${id}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Zurück zum Bearbeiten
              </Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Zur Prüfung einreichen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
