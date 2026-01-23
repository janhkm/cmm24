'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  CheckCircle,
  Share2,
  Heart,
  FileText,
  Download,
  Building2,
  Clock,
  Zap,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ListingCard } from '@/components/features/listings';
import { ShareDialog } from '@/components/shared/share-dialog';
import { StickyMobileCTA } from '@/components/shared/sticky-mobile-cta';
import { PdfExportButton } from '@/components/shared/pdf-export-button';
import { VideoEmbed } from '@/components/shared/video-embed';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Listing } from '@/types';

interface ListingDetailClientProps {
  listing: Listing;
  similarListings: Listing[];
}

export function ListingDetailClient({ listing, similarListings }: ListingDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: listing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const conditionLabels: Record<string, string> = {
    new: 'Neu',
    like_new: 'Wie neu',
    good: 'Gut',
    fair: 'Akzeptabel',
  };

  const keyFacts = [
    { label: 'Baujahr', value: listing.yearBuilt },
    { label: 'Zustand', value: conditionLabels[listing.condition] || listing.condition },
    {
      label: 'Messbereich',
      value: `${listing.measuringRangeX} × ${listing.measuringRangeY} × ${listing.measuringRangeZ} mm`,
    },
    { label: 'Genauigkeit', value: listing.accuracyUm ? `MPEE: ${listing.accuracyUm} µm` : '-' },
    { label: 'Software', value: listing.software || '-' },
    { label: 'Steuerung', value: listing.controller || '-' },
    { label: 'Tastsystem', value: listing.probeSystem || '-' },
    { label: 'Standort', value: `${listing.locationCity}, ${listing.locationCountry}` },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === listing.media.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.media.length - 1 : prev - 1
    );
  };

  // Generate optimized alt text for images
  const getImageAlt = (index: number) => {
    const perspectives = ['Frontansicht', 'Seitenansicht', 'Detailansicht', 'Messbereich', 'Steuerung'];
    const perspective = perspectives[index] || `Bild ${index + 1}`;
    return `${listing.manufacturer.name} ${listing.title} Koordinatenmessmaschine - ${perspective}`;
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                {listing.media.length > 0 ? (
                  <>
                    <Image
                      src={listing.media[currentImageIndex].url}
                      alt={getImageAlt(currentImageIndex)}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    />

                    {/* Navigation Arrows */}
                    {listing.media.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                          aria-label="Vorheriges Bild"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                          aria-label="Nächstes Bild"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      {currentImageIndex + 1} / {listing.media.length}
                    </div>

                    {/* Badges */}
                    {listing.status === 'sold' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Badge variant="secondary" className="text-lg px-6 py-2">
                          VERKAUFT
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-muted-foreground">Kein Bild verfügbar</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {listing.media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {listing.media.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                        currentImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground'
                      )}
                      aria-label={`Bild ${index + 1} anzeigen`}
                    >
                      <Image
                        src={media.thumbnailUrl || media.url}
                        alt={`${listing.manufacturer.name} ${listing.title} - Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

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

            {/* Video Section (if video URL exists in description or as media) */}
            {listing.media.some((m) => m.type === 'video') && (
              <Card>
                <CardHeader>
                  <CardTitle>Video</CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.media
                    .filter((m) => m.type === 'video')
                    .map((video) => (
                      <VideoEmbed
                        key={video.id}
                        url={video.url}
                        title={`${listing.manufacturer.name} ${listing.title} - Video`}
                        className="w-full"
                      />
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Description & Equipment */}
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Beschreibung</TabsTrigger>
                <TabsTrigger value="equipment">Lieferumfang</TabsTrigger>
                <TabsTrigger value="documents">Dokumente</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {listing.description.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="equipment" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Messmaschine komplett
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Software-Lizenz
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Tasterkopf
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Dokumentation
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Datenblatt.pdf</p>
                            <p className="text-sm text-muted-foreground">2.3 MB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Price & Seller */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                {/* Manufacturer & Title */}
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {listing.manufacturer.name}
                </p>
                <h1 className="mt-1 text-2xl font-bold">{listing.title}</h1>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.seller?.isVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Geprüftes Inserat
                    </Badge>
                  )}
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

                {/* CTA Buttons */}
                <div className="mt-6 space-y-3">
                  <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={listing.status === 'sold'}>
                        Anfrage senden
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Anfrage an Verkäufer</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4 mt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" placeholder="Ihr Name" />
                          </div>
                          <div>
                            <Label htmlFor="company">Firma</Label>
                            <Input id="company" placeholder="Firmenname" />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="email">E-Mail *</Label>
                            <Input id="email" type="email" placeholder="name@firma.de" />
                          </div>
                          <div>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" type="tel" placeholder="+49 123 456789" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="message">Nachricht *</Label>
                          <Textarea
                            id="message"
                            placeholder="Ihre Nachricht an den Verkäufer..."
                            rows={4}
                            defaultValue={`Guten Tag,\n\nich interessiere mich für ${listing.title}.\n\nIst die Maschine noch verfügbar?\n\nMit freundlichen Grüßen`}
                          />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInquiryDialogOpen(false)}
                          >
                            Abbrechen
                          </Button>
                          <Button type="submit">Anfrage senden</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-2">
                    <PdfExportButton listing={listing} className="flex-1" />
                    <ShareDialog
                      url={`/maschinen/${listing.slug}`}
                      title={listing.title}
                      description={`${listing.manufacturer.name} ${listing.title} - ${formatPrice(listing.price)}`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toast.success('Zu Favoriten hinzugefügt')}
                      aria-label="Zu Favoriten hinzufügen"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Seller Info */}
                {listing.seller && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Verkäufer
                    </p>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {listing.seller.companyName}
                            </span>
                            {listing.seller.isVerified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {listing.seller.addressCity}, {listing.seller.addressCountry}
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {listing.seller.listingCount} Inserate
                            </div>
                            {listing.seller.responseTime && (
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                {listing.seller.responseTime}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Mitglied seit {listing.seller.memberSince}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="mt-6">
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
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <section className="mt-16" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="text-2xl font-bold mb-6">Ähnliche Maschinen</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarListings.map((similar) => (
                <ListingCard key={similar.id} listing={similar} showCompare={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Galerie schließen"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-[90vh] w-full">
            {listing.media[currentImageIndex] && (
              <Image
                src={listing.media[currentImageIndex].url}
                alt={getImageAlt(currentImageIndex)}
                fill
                className="object-contain"
                sizes="95vw"
              />
            )}
            {listing.media.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                  aria-label="Vorheriges Bild"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                  aria-label="Nächstes Bild"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {listing.media.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Mobile CTA */}
      {listing.status !== 'sold' && (
        <StickyMobileCTA
          primaryLabel="Anfrage senden"
          onPrimaryClick={() => setInquiryDialogOpen(true)}
          showPhone={false}
          showScrollTop={false}
        />
      )}
    </div>
  );
}
