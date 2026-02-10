import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  MessageSquare,
  Search,
  TrendingUp,
  Globe,
  Zap,
  BadgeCheck,
  Handshake,
  MapPin,
} from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ListingCard } from '@/components/features/listings';
import { HeroSearch } from '@/components/features/home';
import { getRandomListings, getPublicListings, getManufacturers, type PublicListing } from '@/lib/actions/listings';
import type { Listing } from '@/types';

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    keywords: ['Koordinatenmessmaschine', 'CMM', 'gebraucht', 'Messmaschine', 'Zeiss', 'Hexagon', 'Wenzel', 'Mitutoyo', 'B2B', 'Marktplatz'],
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: 'https://cmm24.de',
      siteName: 'CMM24',
      locale,
      type: 'website',
      images: [
        {
          url: '/og-image.svg',
          width: 1200,
          height: 630,
          alt: 'CMM24 - Marktplatz für Koordinatenmessmaschinen',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('homeTitle'),
      description: t('homeDescription'),
      images: ['/og-image.svg'],
    },
    alternates: {
      canonical: 'https://cmm24.de',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Build JSON-LD Structured Data dynamically
function buildJsonLd(showcaseListings: PublicListing[], faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://cmm24.de/#organization',
        name: 'CMM24',
        legalName: 'Kneissl Messtechnik GmbH',
        url: 'https://cmm24.de',
        logo: {
          '@type': 'ImageObject',
          url: 'https://cmm24.de/logo.svg',
          width: 200,
          height: 50,
        },
        image: 'https://cmm24.de/og-image.svg',
        description: 'CMM24 ist der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. Wir verbinden Käufer und Verkäufer von Messtechnik.',
        foundingDate: '2026',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Mühlstr. 41',
          addressLocality: 'Leonberg',
          postalCode: '71229',
          addressCountry: 'DE',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'info@kneissl-messtechnik.de',
            availableLanguage: ['German', 'English'],
          },
        ],
        sameAs: [
          'https://www.linkedin.com/company/cmm24',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://cmm24.de/#website',
        url: 'https://cmm24.de',
        name: 'CMM24',
        alternateName: 'CMM24 - Marktplatz für Koordinatenmessmaschinen',
        description: 'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.',
        inLanguage: ['de', 'en', 'fr', 'nl', 'it', 'es', 'pl'],
        publisher: {
          '@id': 'https://cmm24.de/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cmm24.de/maschinen?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://cmm24.de/#faq',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'ItemList',
        '@id': 'https://cmm24.de/#featured-listings',
        name: 'Aktuelle Angebote',
        itemListElement: showcaseListings
          .slice(0, 5)
          .map((listing, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: listing.title,
              description: listing.description.slice(0, 200),
              url: `https://cmm24.de/maschinen/${listing.slug}`,
              image: listing.media[0]?.url,
              brand: {
                '@type': 'Brand',
                name: listing.manufacturer?.name || 'Unbekannt',
              },
              offers: {
                '@type': 'Offer',
                price: listing.price / 100,
                priceCurrency: listing.currency || 'EUR',
                availability: 'https://schema.org/InStock',
                seller: listing.account ? {
                  '@type': 'Organization',
                  name: listing.account.company_name,
                } : undefined,
              },
            },
          })),
      },
    ],
  };
}

// PublicListing → Listing Konvertierung für Komponenten-Kompatibilität
function convertToListing(pl: PublicListing): Listing {
  return {
    id: pl.id,
    accountId: pl.account_id,
    manufacturerId: pl.manufacturer_id,
    manufacturer: pl.manufacturer ? {
      id: pl.manufacturer.id,
      name: pl.manufacturer.name,
      slug: pl.manufacturer.slug,
      logoUrl: undefined,
      country: undefined,
      listingCount: 0,
    } : {
      id: '',
      name: 'Unbekannt',
      slug: '',
      logoUrl: undefined,
      country: undefined,
      listingCount: 0,
    },
    title: pl.title,
    slug: pl.slug,
    description: pl.description,
    price: pl.price,
    priceNegotiable: pl.price_negotiable || false,
    currency: pl.currency || 'EUR',
    yearBuilt: pl.year_built,
    condition: pl.condition,
    measuringRangeX: pl.measuring_range_x || undefined,
    measuringRangeY: pl.measuring_range_y || undefined,
    measuringRangeZ: pl.measuring_range_z || undefined,
    accuracyUm: pl.accuracy_um || undefined,
    software: pl.software || undefined,
    controller: pl.controller || undefined,
    probeSystem: pl.probe_system || undefined,
    locationCountry: pl.location_country,
    locationCity: pl.location_city,
    locationPostalCode: pl.location_postal_code,
    status: pl.status || 'active',
    featured: pl.featured || false,
    viewsCount: pl.views_count || 0,
    publishedAt: pl.published_at || undefined,
    createdAt: pl.created_at || '',
    updatedAt: pl.updated_at || '',
    seller: pl.account ? {
      id: pl.account.id,
      companyName: pl.account.company_name,
      slug: pl.account.slug,
      logoUrl: pl.account.logo_url || undefined,
      isVerified: pl.account.is_verified,
      isPremium: pl.account.is_premium || false,
      listingCount: 0,
    } : undefined,
    media: pl.media.map((m) => ({
      id: m.id,
      listingId: pl.id,
      type: ((m as any).type === 'document' ? 'document' : 'image') as 'image' | 'document',
      url: m.url,
      thumbnailUrl: m.thumbnail_url || m.url,
      filename: m.filename || '',
      sortOrder: m.sort_order || 0,
      isPrimary: m.is_primary || false,
    })),
  };
}

// Preis-Formatierung (locale-aware)
function formatPrice(price: number, currency: string = 'EUR', locale: string = 'de') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price / 100);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  // Prozess-Schritte für "So funktioniert CMM24"
  const processSteps = [
    {
      icon: Search,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: MessageSquare,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: Handshake,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ];

  // Vertrauens-Merkmale
  const trustPoints = [
    {
      icon: BadgeCheck,
      title: t('trustVerified'),
      description: t('trustVerifiedDesc'),
    },
    {
      icon: MessageSquare,
      title: t('trustDirect'),
      description: t('trustDirectDesc'),
    },
    {
      icon: Shield,
      title: t('trustGdpr'),
      description: t('trustGdprDesc'),
    },
    {
      icon: Zap,
      title: t('trustNoCommission'),
      description: t('trustNoCommissionDesc'),
    },
    {
      icon: Globe,
      title: t('trustEurope'),
      description: t('trustEuropeDesc'),
    },
    {
      icon: TrendingUp,
      title: t('trustFreeStart'),
      description: t('trustFreeStartDesc'),
    },
  ];

  // FAQ-Daten für SEO und Content
  const faqs = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
  ];

  // Parallele Datenabfrage
  const [randomResult, manufacturersResult, listingsCountResult] = await Promise.all([
    getRandomListings(5),
    getManufacturers(),
    getPublicListings({ limit: 1 }),
  ]);

  const randomListingsData = randomResult.success ? randomResult.data || [] : [];
  const manufacturers = manufacturersResult.success ? manufacturersResult.data || [] : [];
  const totalListings = listingsCountResult.success ? listingsCountResult.data?.total || 0 : 0;

  // Konvertierung für ListingCard-Kompatibilität
  const randomListings = randomListingsData.map(convertToListing);

  // JSON-LD mit echten Daten
  const jsonLd = buildJsonLd(randomListingsData, faqs);

  // Titel-Teile für formatierte Darstellung
  const titleParts = t('title', { highlight: '|||' }).split('|||');

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col">
        {/* ============================================ */}
        {/* HERO SECTION                                 */}
        {/* ============================================ */}
        <section className="relative flex min-h-[calc(100svh-6rem)] items-center overflow-hidden">
          {/* Hintergrund-Effekte */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-primary/[0.02] to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/[0.05] blur-[120px]"
            aria-hidden="true"
          />

          <div className="container-page relative z-10 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                {t('badge')}
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                {titleParts[0]}
                <span className="text-gradient">{t('titleHighlight')}</span>
                <br className="hidden sm:block" />
                {titleParts[1]}
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl text-balance">
                {t('subtitle')}
              </p>

              {/* Suchleiste mit Autocomplete */}
              <div className="mt-10">
                <HeroSearch
                  featuredManufacturers={manufacturers}
                  recentListings={randomListings}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* STATISTIK-LEISTE                             */}
        {/* ============================================ */}
        <section className="border-y bg-card/80 py-10 md:py-12" aria-label="Plattform-Statistiken">
          <div className="container-page">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums md:text-3xl">
                  {totalListings > 0 ? `${totalListings}+` : '—'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{t('stats.activeListings')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums md:text-3xl">
                  {manufacturers.length > 0 ? `${manufacturers.length}+` : '—'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{t('stats.manufacturers')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-primary md:text-3xl">0&nbsp;%</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('stats.commission')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums md:text-3xl">15+</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('stats.countries')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* MASCHINEN-SHOWCASE (max. 5 zufällige)        */}
        {/* ============================================ */}
        <section className="py-16 md:py-24" aria-labelledby="machines-heading">
          <div className="container-page">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-10">
              <div>
                <h2 id="machines-heading" className="text-2xl font-bold md:text-3xl">
                  {t('currentMachines')}
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  {t('currentMachinesDesc')}
                </p>
              </div>
              <Button variant="outline" className="shrink-0 self-start sm:self-auto" asChild>
                <Link href="/maschinen">
                  {t('allMachines')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {randomListings.length >= 3 ? (
              /* Bento-Grid: 1 großes Hero-Bild + bis zu 4 Karten */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Hero-Karte – nimmt auf lg 2 Spalten & 2 Zeilen ein */}
                {randomListingsData[0] && (
                  <Link
                    href={`/maschinen/${randomListingsData[0].slug}`}
                    className="group relative block overflow-hidden rounded-xl border bg-card sm:col-span-2 lg:row-span-2 transition-shadow duration-300 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[460px]">
                      {randomListingsData[0].media[0] ? (
                        <Image
                          src={randomListingsData[0].media[0].url}
                          alt={randomListingsData[0].title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="flex h-full min-h-[280px] items-center justify-center bg-muted">
                          <span className="text-muted-foreground">{tc('noImage')}</span>
                        </div>
                      )}

                      {/* Gradient-Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Badges oben links */}
                      <div className="absolute left-4 top-4 flex flex-col gap-2">
                        {randomListingsData[0].featured && (
                          <Badge className="bg-primary/90 text-primary-foreground">Featured</Badge>
                        )}
                        {randomListingsData[0].published_at &&
                          new Date(randomListingsData[0].published_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                          <Badge className="bg-white/90 text-foreground">{tc('new')}</Badge>
                        )}
                      </div>

                      {/* Inhalt über dem Bild */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                        <p className="text-sm font-medium text-white/80">
                          {randomListingsData[0].manufacturer?.name || tc('unknown')}
                          {randomListingsData[0].year_built ? ` · Bj. ${randomListingsData[0].year_built}` : ''}
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-white md:text-2xl line-clamp-2">
                          {randomListingsData[0].title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="text-xl font-bold text-white md:text-2xl">
                            {formatPrice(randomListingsData[0].price, randomListingsData[0].currency || 'EUR', locale)}
                          </span>
                          {randomListingsData[0].price_negotiable && (
                            <span className="text-sm text-white/60">VB</span>
                          )}
                          {randomListingsData[0].location_city && (
                            <span className="flex items-center gap-1.5 text-sm text-white/70">
                              <MapPin className="h-3.5 w-3.5" />
                              {randomListingsData[0].location_city}, {randomListingsData[0].location_country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Übrige Karten (bis zu 4) */}
                {randomListings.slice(1, 5).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showCompare={false} />
                ))}
              </div>
            ) : randomListings.length > 0 ? (
              /* Einfaches Grid für weniger als 3 Maschinen */
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {randomListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showCompare={false} />
                ))}
              </div>
            ) : (
              /* Leerer Zustand */
              <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center">
                <div className="mx-auto max-w-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{t('noListings')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('noListingsDesc')}
                  </p>
                  <Button className="mt-6" asChild>
                    <Link href="/registrieren">
                      {tc('register')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/* SO FUNKTIONIERT CMM24                        */}
        {/* ============================================ */}
        <section className="bg-muted/30 py-16 md:py-24" aria-labelledby="how-it-works-heading">
          <div className="container-page">
            <div className="mb-12 text-center md:mb-16">
              <h2 id="how-it-works-heading" className="text-2xl font-bold md:text-3xl">
                {t('howItWorks')}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t('howItWorksSubtitle')}
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3 md:gap-12">
              {processSteps.map((step, index) => (
                <div key={step.title} className="relative text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Schritt-Nummer + Titel */}
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>

                  {/* Beschreibung */}
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" asChild>
                <Link href="/so-funktionierts">
                  {tc('more')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* VERTRAUEN & VORTEILE                         */}
        {/* ============================================ */}
        <section className="py-16 md:py-24" aria-labelledby="trust-heading">
          <div className="container-page">
            <div className="mb-12 text-center md:mb-16">
              <h2 id="trust-heading" className="text-2xl font-bold md:text-3xl">
                {t('whyTrust')}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                {t('whyTrustSubtitle')}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trustPoints.map((point) => (
                <Card key={point.title} className="border bg-card transition-colors hover:bg-accent/50">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <point.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {point.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* HERSTELLER                                   */}
        {/* ============================================ */}
        <section className="border-y bg-muted/20 py-16 md:py-24" aria-labelledby="manufacturers-heading">
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="manufacturers-heading" className="text-2xl font-bold md:text-3xl">
                  {t('leadingManufacturers')}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {t('leadingManufacturersDesc')}
                </p>
              </div>
              <Button variant="outline" className="shrink-0 self-start sm:self-auto" asChild>
                <Link href="/hersteller">
                  {t('allManufacturers')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {manufacturers.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {manufacturers.slice(0, 12).map((manufacturer) => (
                  <Link
                    key={manufacturer.id}
                    href={`/hersteller/${manufacturer.slug}`}
                    className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.08] transition-colors group-hover:bg-primary/[0.14]">
                      <span className="text-lg font-bold text-primary/70 group-hover:text-primary transition-colors">
                        {manufacturer.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium leading-tight">
                      {manufacturer.name}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">{t('manufacturersLoading')}</p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/* VERKÄUFER-CTA                                */}
        {/* ============================================ */}
        <section className="py-16 md:py-24" aria-labelledby="seller-cta-heading">
          <div className="container-page">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-5">
                  {/* Linke Seite: Inhalt */}
                  <div className="p-8 md:col-span-3 md:p-12">
                    <Badge variant="secondary" className="mb-4">
                      {t('sellerCta')}
                    </Badge>
                    <h2 id="seller-cta-heading" className="text-2xl font-bold md:text-3xl">
                      {t('sellerCtaTitle')}
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                      {t('sellerCtaDesc')}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {[
                        t('sellerCtaBullet1'),
                        t('sellerCtaBullet2'),
                        t('sellerCtaBullet3'),
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button size="lg" asChild>
                        <Link href="/registrieren">
                          {tc('register')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {tc('noCreditCard')}
                      </span>
                    </div>
                  </div>

                  {/* Rechte Seite: Visuelles Element */}
                  <div className="relative hidden md:col-span-2 md:flex md:items-center md:justify-center bg-primary">
                    {/* Dekorative Elemente */}
                    <div
                      className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.12)_0%,transparent_60%)]"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute bottom-0 right-0 h-32 w-32 rounded-tl-full bg-white/5"
                      aria-hidden="true"
                    />

                    <div className="relative z-10 p-8 text-center text-primary-foreground">
                      <p className="text-6xl font-bold">0&nbsp;%</p>
                      <p className="mt-2 text-lg font-medium text-primary-foreground/80">{t('stats.commission')}</p>
                      <div className="mx-auto my-6 h-px w-16 bg-primary-foreground/20" />
                      <p className="text-sm text-primary-foreground/70">
                        {t('sellerCtaFullPrice')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ============================================ */}
        {/* FAQ-BEREICH (SEO)                            */}
        {/* ============================================ */}
        <section className="bg-muted/30 py-16 md:py-24" aria-labelledby="faq-heading">
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <div className="mb-12 text-center">
                <h2 id="faq-heading" className="text-2xl font-bold md:text-3xl">
                  {t('faqTitle')}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {t('faqSubtitle')}
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link href="/faq">
                    {t('allFaqs')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
