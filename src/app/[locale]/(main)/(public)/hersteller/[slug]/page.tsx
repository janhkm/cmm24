import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/features/listings';
import { 
  getManufacturerBySlug, 
  getManufacturers, 
  getPublicListings,
  type PublicListing 
} from '@/lib/actions/listings';
import type { Listing } from '@/types';

interface HerstellerDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Convert PublicListing to Listing format
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
      type: 'image' as const,
      url: m.url,
      thumbnailUrl: m.thumbnail_url || m.url,
      filename: m.filename || '',
      sortOrder: m.sort_order || 0,
      isPrimary: m.is_primary || false,
    })),
  };
}

// Generate metadata dynamically
export async function generateMetadata({ params }: HerstellerDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'manufacturersPage' });
  const result = await getManufacturerBySlug(slug);
  
  if (!result.success || !result.data) {
    return {
      title: t('notFoundTitle'),
    };
  }

  const manufacturer = result.data;

  return {
    title: t('metaTitle', { name: manufacturer.name }),
    description: t('metaDesc', { count: manufacturer.listingCount || 0, name: manufacturer.name }),
    openGraph: {
      title: t('metaOgTitle', { name: manufacturer.name }),
      description: t('metaOgDesc', { name: manufacturer.name }),
      locale,
    },
  };
}

export default async function HerstellerDetailPage({ params }: HerstellerDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('manufacturersPage');
  const tBreadcrumb = await getTranslations('breadcrumb');
  
  // Fetch manufacturer and listings in parallel
  const [manufacturerResult, listingsResult, allManufacturersResult] = await Promise.all([
    getManufacturerBySlug(slug),
    getPublicListings({ manufacturerSlug: slug, limit: 6 }),
    getManufacturers(),
  ]);

  if (!manufacturerResult.success || !manufacturerResult.data) {
    notFound();
  }

  const manufacturer = manufacturerResult.data;
  const manufacturerListings = listingsResult.success && listingsResult.data 
    ? listingsResult.data.listings.map(convertToListing) 
    : [];
  const allManufacturers = allManufacturersResult.success ? allManufacturersResult.data || [] : [];

  // JSON-LD for Brand/Organization
  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': `https://cmm24.de/hersteller/${manufacturer.slug}#brand`,
    name: manufacturer.name,
    url: `https://cmm24.de/hersteller/${manufacturer.slug}`,
  };

  // JSON-LD for ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('usedMachines', { name: manufacturer.name }),
    numberOfItems: manufacturer.listingCount,
    itemListElement: manufacturerListings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        url: `https://cmm24.de/maschinen/${listing.slug}`,
        offers: {
          '@type': 'Offer',
          price: listing.price / 100,
          priceCurrency: listing.currency,
        },
      },
    })),
  };

  // Manufacturer descriptions (static data for now)
  const manufacturerInfo: Record<string, { description: string; founded?: string; headquarters?: string }> = {
    zeiss: {
      description: 'Carl Zeiss Industrial Metrology ist der weltweit führende Hersteller von Koordinatenmessmaschinen. Mit über 100 Jahren Erfahrung in der Messtechnik bietet Zeiss höchste Präzision und innovative Technologien wie die VAST Scanning-Technologie und die Calypso Software.',
      founded: '1846',
      headquarters: 'Oberkochen, Deutschland',
    },
    hexagon: {
      description: 'Hexagon Manufacturing Intelligence ist ein globaler Technologieführer mit einem umfassenden Portfolio an Koordinatenmessmaschinen. Die PC-DMIS Software ist die weltweit am häufigsten eingesetzte CMM-Software.',
      founded: '1992',
      headquarters: 'Stockholm, Schweden',
    },
    wenzel: {
      description: 'Wenzel Group ist ein deutscher Hersteller von Koordinatenmessmaschinen mit Fokus auf Preis-Leistung. Die Maschinen zeichnen sich durch robuste Bauweise und zuverlässige Messtechnik aus.',
      founded: '1968',
      headquarters: 'Wiesthal, Deutschland',
    },
    mitutoyo: {
      description: 'Mitutoyo ist ein japanischer Weltmarktführer für Präzisionsmessinstrumente. Die CMM-Sparte bietet kompakte und hochpräzise Koordinatenmessmaschinen mit der MCOSMOS Software.',
      founded: '1934',
      headquarters: 'Kawasaki, Japan',
    },
    coord3: {
      description: 'Coord3 ist ein italienischer Hersteller von Koordinatenmessmaschinen mit Fokus auf innovative Lösungen und kundenspezifische Anpassungen.',
      founded: '1973',
      headquarters: 'Turin, Italien',
    },
    'lk-metrology': {
      description: 'LK Metrology (ehemals LK Tool) ist ein britischer Traditionshersteller von großformatigen Koordinatenmessmaschinen für anspruchsvolle industrielle Anwendungen.',
      founded: '1963',
      headquarters: 'Derby, UK',
    },
    aberlink: {
      description: 'Aberlink ist ein britischer Hersteller, der sich auf erschwingliche und benutzerfreundliche Koordinatenmessmaschinen für KMU spezialisiert hat.',
      founded: '1993',
      headquarters: 'Gloucestershire, UK',
    },
    'nikon-metrology': {
      description: 'Nikon Metrology bietet ein breites Spektrum an Messtechnik-Lösungen, von optischen Systemen bis zu Koordinatenmessmaschinen, mit Fokus auf Innovation und Präzision.',
      founded: '1917',
      headquarters: 'Tokyo, Japan',
    },
  };

  const info = manufacturer.description 
    ? { description: manufacturer.description }
    : (manufacturerInfo[slug] || { description: t('defaultDescription', { name: manufacturer.name }) });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <main className="py-8 md:py-12">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">{tBreadcrumb('home')}</Link></li>
              <li>/</li>
              <li><Link href="/hersteller" className="hover:text-foreground">{tBreadcrumb('manufacturers')}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{manufacturer.name}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/hersteller">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToAll')}
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Logo or Placeholder */}
              <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground shrink-0">
                {manufacturer.logo_url ? (
                  <img 
                    src={manufacturer.logo_url} 
                    alt={manufacturer.name} 
                    className="h-full w-full object-contain rounded-xl"
                  />
                ) : (
                  manufacturer.name.substring(0, 2).toUpperCase()
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {t('usedMachines', { name: manufacturer.name })}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {manufacturer.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {manufacturer.country}
                    </span>
                  )}
                  <Badge variant="secondary">
                    {manufacturer.listingCount} {t('offerCount', { count: manufacturer.listingCount })}
                  </Badge>
                </div>
              </div>

              <Button asChild>
                <Link href={`/maschinen?hersteller=${manufacturer.slug}`}>
                  {t('allMachines', { name: manufacturer.name })}
                </Link>
              </Button>
            </div>
          </header>

          {/* About Section */}
          <section className="mb-12" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-bold mb-4">{t('about', { name: manufacturer.name })}</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground">{info.description}</p>
              {('founded' in info || 'headquarters' in info) && (
                <div className="flex flex-wrap gap-6 mt-4 text-sm">
                  {'founded' in info && info.founded && (
                    <div>
                      <span className="font-medium">{t('founded')}:</span>{' '}
                      <span className="text-muted-foreground">{info.founded}</span>
                    </div>
                  )}
                  {'headquarters' in info && info.headquarters && (
                    <div>
                      <span className="font-medium">{t('headquarters')}:</span>{' '}
                      <span className="text-muted-foreground">{info.headquarters}</span>
                    </div>
                  )}
                </div>
              )}
              {manufacturer.website && (
                <div className="mt-4">
                  <a 
                    href={manufacturer.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {t('visitWebsite')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Listings Section */}
          <section aria-labelledby="listings-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="listings-heading" className="text-2xl font-bold">
                {t('currentOffers', { name: manufacturer.name })}
              </h2>
              {manufacturerListings.length > 0 && (
                <Button variant="outline" asChild>
                  <Link href={`/maschinen?hersteller=${manufacturer.slug}`}>
                    {t('showAll')}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>

            {manufacturerListings.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {manufacturerListings.slice(0, 6).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  {t('noMachinesAvailable', { name: manufacturer.name })}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/maschinen">{t('viewAllMachines')}</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Related Manufacturers */}
          {allManufacturers.length > 1 && (
            <section className="mt-16" aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-xl font-bold mb-6">{t('otherManufacturers')}</h2>
              <div className="flex flex-wrap gap-3">
                {allManufacturers
                  .filter((m) => m.slug !== slug)
                  .slice(0, 6)
                  .map((m) => (
                    <Button key={m.id} variant="outline" size="sm" asChild>
                      <Link href={`/hersteller/${m.slug}`}>{m.name}</Link>
                    </Button>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
