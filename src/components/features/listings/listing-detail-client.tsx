'use client';

import { useState } from 'react';
import { useTrackView } from '@/hooks/use-track-view';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  CheckCircle,
  Heart,
  FileText,
  Download,
  Building2,
  Clock,
  X,
  Globe,
  Phone,
  Eye,
  Calendar,
  Ruler,
  Crown,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { createInquiry } from '@/lib/actions/inquiries';
import { getCurrentUser } from '@/lib/actions/auth';
import { useRouter } from '@/i18n/navigation';
import { RichTextContent } from '@/components/ui/rich-text-editor';

interface ListingDetailClientProps {
  listing: Listing;
  similarListings: Listing[];
}

export function ListingDetailClient({ listing, similarListings }: ListingDetailClientProps) {
  const t = useTranslations('listing');
  const ti = useTranslations('inquiry');
  const tc = useTranslations('common');
  const tm = useTranslations('machines');
  const tCond = useTranslations('conditions');
  const locale = useLocale();

  // View-Tracking: einmal pro Mount, dedupliziert serverseitig
  useTrackView(listing.id);

  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ti('defaultMessageAvailability', { listing: listing.title }),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inquiryForm.name.trim()) {
      toast.error(ti('enterName'));
      return;
    }
    if (!inquiryForm.email.trim() || !inquiryForm.email.includes('@')) {
      toast.error(ti('enterValidEmail'));
      return;
    }
    if (!inquiryForm.message.trim()) {
      toast.error(ti('enterMessage'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createInquiry({
        listingId: listing.id,
        contactName: inquiryForm.name.trim(),
        contactEmail: inquiryForm.email.trim(),
        contactPhone: inquiryForm.phone.trim() || undefined,
        contactCompany: inquiryForm.company.trim() || undefined,
        message: inquiryForm.message.trim(),
      });

      if (result.success) {
        setInquirySuccess(true);
        toast.success(ti('sent'));
      } else {
        toast.error(result.error || ti('sentError'));
      }
    } catch (error) {
      console.error('Inquiry submit error:', error);
      toast.error(ti('tryAgain'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth-Check bevor der Dialog geoeffnet wird
  const handleInquiryClick = async () => {
    setIsCheckingAuth(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        // Nicht eingeloggt: Auth-Dialog anzeigen
        setAuthDialogOpen(true);
        return;
      }
      // User eingeloggt: Formular mit Daten vorbefuellen
      setInquiryForm((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
      }));
      setInquiryDialogOpen(true);
    } catch {
      // Fehler beim Auth-Check: Auth-Dialog anzeigen
      setAuthDialogOpen(true);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const resetInquiryForm = () => {
    setInquiryForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      message: ti('defaultMessageAvailability', { listing: listing.title }),
    });
    setInquirySuccess(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: listing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const conditionLabels: Record<string, string> = {
    new: tCond('new'),
    like_new: tCond('like_new'),
    good: tCond('good'),
    fair: tCond('fair'),
  };

  const conditionColors: Record<string, string> = {
    new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    like_new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    fair: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };

  // Bilder und Dokumente trennen
  const images = listing.media.filter((m) => m.type === 'image');
  const documents = listing.media.filter((m) => m.type === 'document');

  // Technische Daten fuer die Tabelle - nur Werte die vorhanden sind
  const technicalSpecs = [
    { label: t('specs.manufacturer'), value: listing.manufacturer.name },
    { label: t('specs.model'), value: listing.title },
    { label: t('specs.yearBuilt'), value: listing.yearBuilt.toString() },
    { label: t('specs.condition'), value: conditionLabels[listing.condition] || listing.condition },
    {
      label: t('specs.measuringRange'),
      value: listing.measuringRangeX
        ? `${listing.measuringRangeX} × ${listing.measuringRangeY} × ${listing.measuringRangeZ} mm`
        : null,
    },
    { label: t('specs.accuracy'), value: listing.accuracyUm ? `${listing.accuracyUm} µm` : null },
    { label: t('specs.software'), value: listing.software || null },
    { label: t('specs.controller'), value: listing.controller || null },
    { label: t('specs.probeSystem'), value: listing.probeSystem || null },
    { label: t('specs.location'), value: `${listing.locationCity}, ${listing.locationCountry}` },
  ].filter((spec): spec is { label: string; value: string } => spec.value !== null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Optimierte Alt-Texte fuer Bilder (SEO)
  const getImageAlt = (index: number) => {
    const perspectives = [
      t('perspectives.front'),
      t('perspectives.side'),
      t('perspectives.detail'),
      t('perspectives.measuringRange'),
      t('perspectives.controller'),
    ];
    const perspective = perspectives[index] || t('showImage', { index: index + 1 });
    return `${listing.manufacturer.name} ${listing.title} - ${perspective}`;
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container-page py-6 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ===== LINKE SPALTE: Galerie + Inhalt ===== */}
          <div className="lg:col-span-2 space-y-8">

            {/* Mobil: Titel + Preis ueber der Galerie */}
            <div className="lg:hidden">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                <Link
                  href={`/hersteller/${listing.manufacturer.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {listing.manufacturer.name}
                </Link>
              </p>
              <h1 className="mt-1 text-2xl font-bold">{listing.title}</h1>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{listing.price ? formatPrice(listing.price) : (tm('priceOnRequest') || 'VB')}</span>
                {!!listing.price && (
                  <span className="text-sm text-muted-foreground">
                    {tm('vatExcl')}{listing.priceNegotiable && ` · ${tm('negotiable')}`}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={cn('font-medium', conditionColors[listing.condition])}>
                  {conditionLabels[listing.condition]}
                </Badge>
                <Badge variant="outline">{tm('yearBuilt', { year: listing.yearBuilt })}</Badge>
                {listing.featured && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    {tm('premium')}
                  </Badge>
                )}
                {listing.status === 'sold' && (
                  <Badge variant="secondary" className="bg-neutral-800 text-white">
                    {tm('sold')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bildergalerie */}
            <div className="space-y-3">
              {/* Hauptbild */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex].url}
                      alt={getImageAlt(currentImageIndex)}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    />

                    {/* Navigationspfeile */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-neutral-700 shadow-md hover:bg-white transition-colors"
                          aria-label={t('prevImage')}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-neutral-700 shadow-md hover:bg-white transition-colors"
                          aria-label={t('nextImage')}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    {/* Bildzaehler */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>

                    {/* Verkauft-Overlay */}
                    {listing.status === 'sold' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Badge variant="secondary" className="text-lg px-6 py-2 bg-white text-neutral-800 font-bold">
                          {tm('sold')}
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-muted-foreground">{tc('noImage')}</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                        currentImageIndex === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-muted-foreground/50'
                      )}
                      aria-label={t('showImage', { index: index + 1 })}
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

            {/* Video-Bereich */}
            {listing.media.some((m) => m.type === 'video') && (
              <section>
                <h2 className="text-lg font-semibold mb-4">{t('video')}</h2>
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
              </section>
            )}

            {/* Technische Daten */}
            <section id="technische-daten">
              <h2 className="text-lg font-semibold mb-4">{t('technicalData')}</h2>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {technicalSpecs.map((spec, i) => (
                      <tr
                        key={spec.label}
                        className={cn(
                          'border-b last:border-b-0',
                          i % 2 === 0 ? 'bg-muted/40' : 'bg-background'
                        )}
                      >
                        <td className="px-4 py-3 text-muted-foreground font-medium w-2/5">
                          {spec.label}
                        </td>
                        <td className="px-4 py-3 font-medium">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Beschreibung */}
            <section id="beschreibung">
              <h2 className="text-lg font-semibold mb-4">{t('description')}</h2>
              <RichTextContent
                content={listing.description}
                className="prose-sm prose-p:leading-relaxed"
              />
            </section>

            {/* Dokumente */}
            {documents.length > 0 && (
              <section id="dokumente">
                <h2 className="text-lg font-semibold mb-4">{t('documents')}</h2>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.filename || 'Dokument.pdf'}</p>
                          <p className="text-xs text-muted-foreground">PDF-Dokument</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.url;
                          link.download = doc.filename || 'dokument.pdf';
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===== RECHTE SPALTE: Sticky Sidebar ===== */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-20 space-y-6">

              {/* Preis-Karte */}
              <Card className="shadow-lg border-0 ring-1 ring-border">
                <CardContent className="p-6">
                  {/* Desktop: Titel */}
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      <Link
                        href={`/hersteller/${listing.manufacturer.slug}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {listing.manufacturer.name}
                      </Link>
                    </p>
                    <h1 className="mt-1 text-xl font-bold leading-tight">{listing.title}</h1>

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className={cn('font-medium', conditionColors[listing.condition])}>
                        {conditionLabels[listing.condition]}
                      </Badge>
                      <Badge variant="outline">{tm('yearBuilt', { year: listing.yearBuilt })}</Badge>
                      {listing.featured && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          {tm('premium')}
                        </Badge>
                      )}
                      {listing.status === 'sold' && (
                        <Badge variant="secondary" className="bg-neutral-800 text-white">
                          {tm('sold')}
                        </Badge>
                      )}
                    </div>

                    <Separator className="my-4" />
                  </div>

                  {/* Preis */}
                  <div>
                    <p className="text-3xl font-bold hidden lg:block">
                      {listing.price ? formatPrice(listing.price) : (tm('priceOnRequest') || 'VB')}
                    </p>
                    {!!listing.price && (
                      <p className="text-sm text-muted-foreground mt-0.5 hidden lg:block">
                        {tm('vatExcl')}{listing.priceNegotiable && ` · ${tm('negotiableFull')}`}
                      </p>
                    )}
                  </div>

                  {/* Kurzinfos */}
                  <div className="mt-4 space-y-2.5">
                    {listing.measuringRangeX && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>
                          {listing.measuringRangeX} × {listing.measuringRangeY} × {listing.measuringRangeZ} mm
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        {listing.locationCity}, {listing.locationCountry}
                      </span>
                    </div>
                    {listing.publishedAt && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {tm('publishedAt', {
                            date: new Date(listing.publishedAt).toLocaleDateString(locale, {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }),
                          })}
                        </span>
                      </div>
                    )}
                    {listing.viewsCount > 0 && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4 shrink-0" />
                        <span>{tm('views', { count: listing.viewsCount })}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-6 space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={listing.status === 'sold' || isCheckingAuth}
                      onClick={handleInquiryClick}
                    >
                      {isCheckingAuth ? (
                        <span className="animate-spin mr-2">⏳</span>
                      ) : null}
                      {ti('title')}
                    </Button>
                    <Dialog
                      open={inquiryDialogOpen}
                      onOpenChange={(open) => {
                        setInquiryDialogOpen(open);
                        if (!open) resetInquiryForm();
                      }}
                    >
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>{ti('titleToSeller')}</DialogTitle>
                        </DialogHeader>
                        {inquirySuccess ? (
                          <div className="py-8 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{ti('successTitle')}</h3>
                            <p className="text-muted-foreground mb-6">
                              {ti('successDesc')}
                            </p>
                            <Button onClick={() => setInquiryDialogOpen(false)}>{tc('close')}</Button>
                          </div>
                        ) : (
                          <form className="space-y-4 mt-4" onSubmit={handleInquirySubmit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <Label htmlFor="name">{ti('name')} *</Label>
                                <Input
                                  id="name"
                                  placeholder={ti('yourName')}
                                  value={inquiryForm.name}
                                  onChange={(e) =>
                                    setInquiryForm((prev) => ({ ...prev, name: e.target.value }))
                                  }
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div>
                                <Label htmlFor="company">{ti('company')}</Label>
                                <Input
                                  id="company"
                                  placeholder={ti('companyPlaceholder')}
                                  value={inquiryForm.company}
                                  onChange={(e) =>
                                    setInquiryForm((prev) => ({ ...prev, company: e.target.value }))
                                  }
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <Label htmlFor="email">{ti('email')} *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder={ti('emailPlaceholder')}
                                  value={inquiryForm.email}
                                  onChange={(e) =>
                                    setInquiryForm((prev) => ({ ...prev, email: e.target.value }))
                                  }
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">{ti('phone')}</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder={ti('phonePlaceholder')}
                                  value={inquiryForm.phone}
                                  onChange={(e) =>
                                    setInquiryForm((prev) => ({ ...prev, phone: e.target.value }))
                                  }
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="message">{ti('message')} *</Label>
                              <Textarea
                                id="message"
                                placeholder={ti('messagePlaceholder')}
                                rows={4}
                                value={inquiryForm.message}
                                onChange={(e) =>
                                  setInquiryForm((prev) => ({ ...prev, message: e.target.value }))
                                }
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {ti('submitConsent')}
                            </p>
                            <div className="flex gap-3 justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInquiryDialogOpen(false)}
                                disabled={isSubmitting}
                              >
                                {tc('cancel')}
                              </Button>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                  <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    {ti('sending')}
                                  </>
                                ) : (
                                  ti('title')
                                )}
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Auth-Dialog fuer nicht eingeloggte User */}
                    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                      <DialogContent className="sm:max-w-[420px]">
                        <DialogHeader>
                          <DialogTitle className="text-center">{ti('loginRequiredTitle')}</DialogTitle>
                        </DialogHeader>
                        <div className="py-6 text-center">
                          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <LogIn className="h-7 w-7 text-primary" />
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed px-2">
                            {ti('loginRequiredDesc')}
                          </p>
                          <div className="mt-6 space-y-3">
                            <Button
                              className="w-full"
                              size="lg"
                              onClick={() => {
                                setAuthDialogOpen(false);
                                router.push('/login' as any);
                              }}
                            >
                              <LogIn className="mr-2 h-4 w-4" />
                              {ti('loginNow')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="lg"
                              onClick={() => {
                                setAuthDialogOpen(false);
                                router.push('/registrieren' as any);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              {ti('registerFree')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex gap-2">
                      <PdfExportButton listing={listing} className="flex-1" />
                      <ShareDialog
                        url={`/maschinen/${listing.slug}`}
                        title={listing.title}
                        description={`${listing.manufacturer.name} ${listing.title} - ${listing.price ? formatPrice(listing.price) : 'VB'}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toast.success(t('addedToFavorites'))}
                        aria-label={t('addToFavorites')}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verkäufer-Karte */}
              {listing.seller && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      {t('seller')}
                    </p>
                    <div className="flex items-start gap-4">
                      <Link href={`/unternehmen/${listing.seller.slug}` as any} className="shrink-0">
                        {listing.seller.logoUrl ? (
                          <Image
                            src={listing.seller.logoUrl}
                            alt={listing.seller.companyName}
                            width={48}
                            height={48}
                            className="rounded-lg object-contain border hover:border-primary transition-colors"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/unternehmen/${listing.seller.slug}` as any} className="font-semibold truncate hover:text-primary transition-colors hover:underline">
                            {listing.seller.companyName}
                          </Link>
                          {/* AUSKOMMENTIERT: Verified Badge
                          {listing.seller.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                          )}
                          */}
                        </div>
                        {/* AUSKOMMENTIERT: Premium/Verified Badges
                        {listing.seller.isPremium && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 mt-1">
                            <Crown className="h-3 w-3 mr-1" />
                            {t('premiumDealer')}
                          </Badge>
                        )}
                        {listing.seller.isVerified && !listing.seller.isPremium && (
                          <p className="text-xs text-blue-600 font-medium mt-0.5">
                            {t('verifiedDealer')}
                          </p>
                        )}
                        */}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5 text-sm">
                      {listing.seller.addressCity && (
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>
                            {listing.seller.addressCity}
                            {listing.seller.addressCountry
                              ? `, ${listing.seller.addressCountry}`
                              : ''}
                          </span>
                        </div>
                      )}
                      {listing.seller.listingCount > 0 && (
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span>
                            {t('activeListings', { count: listing.seller.listingCount })}{' '}
                            {listing.seller.listingCount === 1 ? tm('listingSingular') : tm('listings')}
                          </span>
                        </div>
                      )}
                      {listing.seller.memberSince && (
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span>{t('memberSince', { date: listing.seller.memberSince })}</span>
                        </div>
                      )}
                      {listing.seller.website && (
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <Globe className="h-4 w-4 shrink-0" />
                          <a
                            href={
                              listing.seller.website.startsWith('http')
                                ? listing.seller.website
                                : `https://${listing.seller.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors truncate"
                          >
                            {listing.seller.website
                              .replace(/^https?:\/\//, '')
                              .replace(/\/$/, '')}
                          </a>
                        </div>
                      )}
                    </div>

                    {listing.seller.phone && (
                      <>
                        <Separator className="my-4" />
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`tel:${listing.seller.phone.replace(/\s/g, '')}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            {listing.seller.phone}
                          </a>
                        </Button>
                      </>
                    )}

                    <Separator className="my-4" />
                    <Button variant="secondary" className="w-full" asChild>
                      <Link href={`/unternehmen/${listing.seller.slug}` as any}>
                        <Building2 className="mr-2 h-4 w-4" />
                        {t('viewSellerProfile')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Standort-Karte */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">{t('location')}</h3>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="font-medium">{listing.locationCity}</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.locationPostalCode && `${listing.locationPostalCode}, `}
                          {listing.locationCountry}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Aehnliche Maschinen */}
        {similarListings.length > 0 && (
          <section className="mt-16" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="text-2xl font-bold mb-6">
              {t('similarMachines')}
            </h2>
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
            aria-label={t('closeGallery')}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-[90vh] w-full">
            {images[currentImageIndex] && (
              <Image
                src={images[currentImageIndex].url}
                alt={getImageAlt(currentImageIndex)}
                fill
                className="object-contain"
                sizes="95vw"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                  aria-label={t('prevImage')}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                  aria-label={t('nextImage')}
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 rounded-full px-4 py-1.5 backdrop-blur-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Mobile CTA */}
      {listing.status !== 'sold' && (
        <StickyMobileCTA
          primaryLabel={ti('title')}
          onPrimaryClick={handleInquiryClick}
          showPhone={false}
          showScrollTop={false}
        />
      )}
    </div>
  );
}
