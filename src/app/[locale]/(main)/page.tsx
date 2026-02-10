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
  Building2,
  ChevronRight,
  Ruler,
  Euro,
  Factory,
} from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HeroSearch } from '@/components/features/home';
import { ListingGrid } from '@/components/features/listings';
import { getPublicListings, getManufacturers, getPublicCompanies, type PublicListing } from '@/lib/actions/listings';
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
      url: 'https://cmm24.com',
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
      canonical: 'https://cmm24.com',
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
        '@id': 'https://cmm24.com/#organization',
        name: 'CMM24',
        legalName: 'Kneissl Messtechnik GmbH',
        url: 'https://cmm24.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://cmm24.com/logo.svg',
          width: 200,
          height: 50,
        },
        image: 'https://cmm24.com/og-image.svg',
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
        '@id': 'https://cmm24.com/#website',
        url: 'https://cmm24.com',
        name: 'CMM24',
        alternateName: 'CMM24 - Marktplatz für Koordinatenmessmaschinen',
        description: 'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.',
        inLanguage: ['de', 'en', 'fr', 'nl', 'it', 'es', 'pl'],
        publisher: {
          '@id': 'https://cmm24.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cmm24.com/maschinen?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://cmm24.com/#faq',
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
        '@id': 'https://cmm24.com/#featured-listings',
        name: 'Aktuelle Angebote',
        itemListElement: showcaseListings
          .slice(0, 10)
          .map((listing, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: listing.title,
              description: listing.description.slice(0, 200),
              url: `https://cmm24.com/maschinen/${listing.slug}`,
              image: listing.media[0]?.url,
              brand: {
                '@type': 'Brand',
                name: listing.manufacturer?.name || 'Unbekannt',
              },
              offers: {
                '@type': 'Offer',
                price: listing.price ? listing.price / 100 : undefined,
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

// PublicListing -> Listing Konvertierung fuer Komponenten-Kompatibilitaet
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

// Sidebar-Filterdaten (max. 5 pro Kategorie)
const PRICE_RANGES = [
  { label: 'Unter 5.000 €', min: 0, max: 5000 },
  { label: '5.000 – 10.000 €', min: 5000, max: 10000 },
  { label: '10.000 – 30.000 €', min: 10000, max: 30000 },
  { label: '30.000 – 50.000 €', min: 30000, max: 50000 },
  { label: 'Ab 50.000 €', min: 50000, max: 0 },
];

const MEASURING_RANGES = [
  { label: '500 × 500 × 500', x: 500, y: 500, z: 500 },
  { label: '700 × 1000 × 500', x: 700, y: 1000, z: 500 },
  { label: '1000 × 1000 × 800', x: 1000, y: 1000, z: 800 },
  { label: '1200 × 2000 × 1000', x: 1200, y: 2000, z: 1000 },
  { label: '2000 × 4000 × 1500', x: 2000, y: 4000, z: 1500 },
];

// Top-Hersteller die immer zuerst angezeigt werden
const PRIORITY_MANUFACTURERS = ['zeiss', 'hexagon', 'mitutoyo'];

const CONDITIONS = [
  { label: 'Neu', value: 'new' },
  { label: 'Neuwertig', value: 'like_new' },
  { label: 'Gut', value: 'good' },
  { label: 'Gebraucht', value: 'fair' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  // FAQ-Daten fuer SEO und Content
  const faqs = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
  ];

  // Prozess-Schritte fuer "So funktioniert CMM24"
  const processSteps = [
    { icon: Search, title: t('step1Title'), description: t('step1Desc') },
    { icon: MessageSquare, title: t('step2Title'), description: t('step2Desc') },
    { icon: Handshake, title: t('step3Title'), description: t('step3Desc') },
  ];

  // Vertrauens-Merkmale
  const trustPoints = [
    { icon: BadgeCheck, title: t('trustVerified'), description: t('trustVerifiedDesc') },
    { icon: MessageSquare, title: t('trustDirect'), description: t('trustDirectDesc') },
    { icon: Shield, title: t('trustGdpr'), description: t('trustGdprDesc') },
    { icon: Zap, title: t('trustNoCommission'), description: t('trustNoCommissionDesc') },
    { icon: Globe, title: t('trustEurope'), description: t('trustEuropeDesc') },
    { icon: TrendingUp, title: t('trustFreeStart'), description: t('trustFreeStartDesc') },
  ];

  // Parallele Datenabfrage
  const [listingsResult, manufacturersResult, companiesResult] = await Promise.all([
    getPublicListings({ limit: 20, sortBy: 'newest' }),
    getManufacturers(),
    getPublicCompanies(12),
  ]);

  const listings = listingsResult.success ? (listingsResult.data?.listings || []) : [];
  const allManufacturers = manufacturersResult.success ? manufacturersResult.data || [] : [];
  const companies = companiesResult.success ? companiesResult.data || [] : [];
  const totalListings = listingsResult.success ? (listingsResult.data?.total || 0) : 0;

  // Hersteller sortieren: Zeiss, Hexagon, Mitutoyo zuerst, dann Rest, max. 5
  const sortedManufacturers = [
    ...allManufacturers.filter((m) => PRIORITY_MANUFACTURERS.includes(m.slug.toLowerCase())),
    ...allManufacturers.filter((m) => !PRIORITY_MANUFACTURERS.includes(m.slug.toLowerCase())),
  ].slice(0, 5);

  // Konvertierung fuer ListingGrid-Kompatibilitaet
  const convertedListings = listings.map(convertToListing);

  // JSON-LD mit echten Daten
  const jsonLd = buildJsonLd(listings, faqs);

  // Titel-Teile fuer formatierte Darstellung
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
                  featuredManufacturers={allManufacturers}
                  recentListings={convertedListings.slice(0, 5)}
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
            <div className="grid grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-primary md:text-3xl">{t('stats.freeListingsValue')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('stats.freeListings')}</p>
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
        {/* HAUPTBEREICH: SIDEBAR + INSERATE             */}
        {/* ============================================ */}
        <section className="py-12 md:py-16" aria-labelledby="browse-heading">
          <div className="container-page">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* ---- SIDEBAR (Filter-Navigation) ---- */}
              <aside className="w-full lg:w-64 xl:w-72 shrink-0">
                {/* Desktop: immer sichtbar, sticky */}
                <nav className="hidden lg:block space-y-6 lg:sticky lg:top-20">
                  {/* Hersteller */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      <Factory className="h-4 w-4" />
                      Hersteller
                    </h3>
                    <ul className="space-y-1">
                      {sortedManufacturers.map((m) => (
                        <li key={m.id}>
                          <Link
                            href={`/maschinen?hersteller=${m.slug}`}
                            className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                          >
                            <span className="group-hover:text-primary transition-colors">{m.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </Link>
                        </li>
                      ))}
                      {allManufacturers.length > 5 && (
                        <li>
                          <Link href="/hersteller" className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-primary hover:underline">
                            Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                  <Separator />
                  {/* Messgroesse */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      <Ruler className="h-4 w-4" />
                      Messgröße (mm)
                    </h3>
                    <ul className="space-y-1">
                      {MEASURING_RANGES.map((range) => (
                        <li key={range.label}>
                          <Link
                            href={`/maschinen?q=${range.x}+${range.y}+${range.z}`}
                            className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                          >
                            <span className="group-hover:text-primary transition-colors">{range.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  {/* Preis */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      <Euro className="h-4 w-4" />
                      Preis
                    </h3>
                    <ul className="space-y-1">
                      {PRICE_RANGES.map((range) => (
                        <li key={range.label}>
                          <Link
                            href={`/maschinen?preis_min=${range.min}${range.max > 0 ? `&preis_max=${range.max}` : ''}`}
                            className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                          >
                            <span className="group-hover:text-primary transition-colors">{range.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  {/* Zustand */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      <Shield className="h-4 w-4" />
                      Zustand
                    </h3>
                    <ul className="space-y-1">
                      {CONDITIONS.map((c) => (
                        <li key={c.value}>
                          <Link
                            href={`/maschinen?zustand=${c.value}`}
                            className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                          >
                            <span className="group-hover:text-primary transition-colors">{c.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>

                {/* Mobile: eingeklappte Accordion-Filter */}
                <Accordion type="multiple" className="lg:hidden">
                  <AccordionItem value="hersteller">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="flex items-center gap-2"><Factory className="h-4 w-4" /> Hersteller</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {sortedManufacturers.map((m) => (
                          <li key={m.id}>
                            <Link
                              href={`/maschinen?hersteller=${m.slug}`}
                              className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                            >
                              <span className="group-hover:text-primary transition-colors">{m.name}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </Link>
                          </li>
                        ))}
                        {allManufacturers.length > 5 && (
                          <li>
                            <Link href="/hersteller" className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-primary hover:underline">
                              Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="messgroesse">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Messgröße (mm)</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {MEASURING_RANGES.map((range) => (
                          <li key={range.label}>
                            <Link
                              href={`/maschinen?q=${range.x}+${range.y}+${range.z}`}
                              className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                            >
                              <span className="group-hover:text-primary transition-colors">{range.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="preis">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="flex items-center gap-2"><Euro className="h-4 w-4" /> Preis</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {PRICE_RANGES.map((range) => (
                          <li key={range.label}>
                            <Link
                              href={`/maschinen?preis_min=${range.min}${range.max > 0 ? `&preis_max=${range.max}` : ''}`}
                              className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                            >
                              <span className="group-hover:text-primary transition-colors">{range.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="zustand">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Zustand</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                        {CONDITIONS.map((c) => (
                          <li key={c.value}>
                            <Link
                              href={`/maschinen?zustand=${c.value}`}
                              className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted transition-colors group"
                            >
                              <span className="group-hover:text-primary transition-colors">{c.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </aside>

              {/* ---- HAUPTBEREICH (Inserate) ---- */}
              <div className="flex-1 min-w-0">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 id="browse-heading" className="text-2xl font-bold">
                      Neueste Inserate
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {totalListings} Maschinen verfügbar
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/maschinen">
                      Alle anzeigen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {convertedListings.length > 0 ? (
                  <ListingGrid listings={convertedListings} showCompare={false} viewMode="list" />
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Search className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">{t('noListings')}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('noListingsDesc')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* UNTERNEHMEN IN DEUTSCHLAND                   */}
        {/* ============================================ */}
        {companies.length > 0 && (
          <section className="border-t bg-muted/20 py-12 md:py-16" aria-labelledby="companies-heading">
            <div className="container-page">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 id="companies-heading" className="text-xl font-bold md:text-2xl">
                    Unternehmen auf CMM24
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entdecken Sie verifizierte Händler und Hersteller
                  </p>
                </div>
                <Link
                  href="/unternehmen"
                  className="text-sm font-medium text-primary hover:underline hidden sm:flex items-center gap-1"
                >
                  Alle anzeigen
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/unternehmen/${company.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                  >
                    {/* Logo / Initialen */}
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {company.logo_url ? (
                        <Image
                          src={company.logo_url}
                          alt={company.company_name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
                        {company.company_name}
                      </p>
                      {company.address_city && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {company.address_city}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile: Alle anzeigen */}
              <div className="mt-4 text-center sm:hidden">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/unternehmen">
                    Alle Unternehmen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================ */}
        {/* SO FUNKTIONIERT CMM24                        */}
        {/* ============================================ */}
        <section className="py-16 md:py-24" aria-labelledby="how-it-works-heading">
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
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* VERTRAUEN & VORTEILE                         */}
        {/* ============================================ */}
        <section className="bg-muted/30 py-16 md:py-24" aria-labelledby="trust-heading">
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
        {/* VERKÄUFER-CTA                                */}
        {/* ============================================ */}
        <section className="py-16 md:py-24" aria-labelledby="seller-cta-heading">
          <div className="container-page">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-5">
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

                  <div className="relative hidden md:col-span-2 md:flex md:items-center md:justify-center bg-primary">
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
