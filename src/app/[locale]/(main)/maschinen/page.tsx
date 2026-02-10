import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MaschinenPageClient } from '@/components/features/listings';
import { getPublicListings, getManufacturers } from '@/lib/actions/listings';

interface MaschinenPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata based on search params
export async function generateMetadata({ params, searchParams }: MaschinenPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'machinesPage' });
  
  const herstellerParam = typeof sp.hersteller === 'string' ? sp.hersteller : undefined;
  const query = typeof sp.q === 'string' ? sp.q : undefined;
  
  // Get manufacturers from database
  const manufacturersResult = await getManufacturers();
  const manufacturers = manufacturersResult.success ? manufacturersResult.data || [] : [];
  
  // Get manufacturer names if filtered
  const manufacturerNames = herstellerParam
    ? herstellerParam.split(',')
        .map((slug) => {
          const bySlug = manufacturers.find((m) => m.slug === slug);
          const byId = manufacturers.find((m) => m.id === slug);
          return (bySlug || byId)?.name;
        })
        .filter(Boolean)
        .join(', ')
    : null;

  // Get total listing count from database
  const listingsResult = await getPublicListings({ 
    manufacturerSlug: herstellerParam?.split(',')[0],
    limit: 1 
  });
  const filteredCount = listingsResult.success ? listingsResult.data?.total || 0 : 0;

  // Build dynamic title and description
  let title: string;
  let description: string;
  let canonical = 'https://cmm24.de/maschinen';

  if (query) {
    title = t('searchTitle', { query });
    description = t('searchDesc', { query });
    // Don't set canonical for search queries (noindex)
  } else if (manufacturerNames) {
    title = t('manufacturerTitle', { manufacturers: manufacturerNames, count: filteredCount });
    description = t('manufacturerDesc', { count: filteredCount, manufacturers: manufacturerNames });
    canonical = `https://cmm24.de/maschinen?hersteller=${herstellerParam}`;
  } else {
    title = t('defaultTitle', { count: filteredCount });
    description = t('defaultDesc', { count: filteredCount });
  }

  // Determine robots directive based on filters
  const hasMultipleFilters = [
    sp.hersteller,
    sp.zustand,
    sp.land,
    sp.preis_min,
    sp.preis_max,
    sp.jahr_min,
    sp.jahr_max,
  ].filter(Boolean).length >= 3;

  const hasSearchQuery = !!query;
  const hasSorting = !!sp.sortierung;

  // noindex for: search queries, sorting, or 3+ filters
  const shouldNoIndex = hasSearchQuery || hasSorting || hasMultipleFilters;

  return {
    title,
    description,
    keywords: [
      'Koordinatenmessmaschine',
      'gebraucht',
      'CMM',
      'Messmaschine',
      ...(manufacturerNames ? [manufacturerNames] : ['Zeiss', 'Hexagon', 'Wenzel', 'Mitutoyo']),
      'kaufen',
      'B2B',
    ],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'CMM24',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: shouldNoIndex ? undefined : canonical,
    },
    robots: shouldNoIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function MaschinenPage({ params, searchParams }: MaschinenPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations('machinesPage');
  const tBreadcrumb = await getTranslations('breadcrumb');
  const tCommon = await getTranslations('common');
  
  const herstellerParam = typeof sp.hersteller === 'string' ? sp.hersteller : undefined;
  
  // Get manufacturers from database
  const manufacturersResult = await getManufacturers();
  const manufacturers = manufacturersResult.success ? manufacturersResult.data || [] : [];
  
  // Get manufacturer names for breadcrumb
  const manufacturerNames = herstellerParam
    ? herstellerParam.split(',')
        .map((slug) => {
          const bySlug = manufacturers.find((m) => m.slug === slug);
          const byId = manufacturers.find((m) => m.id === slug);
          return (bySlug || byId)?.name;
        })
        .filter(Boolean)
        .join(', ')
    : null;

  // Get listings from database for JSON-LD
  const listingsResult = await getPublicListings({ 
    manufacturerSlug: herstellerParam?.split(',')[0],
    limit: 10 
  });
  const listings = listingsResult.success ? listingsResult.data?.listings || [] : [];
  const filteredCount = listingsResult.success ? listingsResult.data?.total || 0 : 0;

  // JSON-LD ItemList Schema for the listing overview
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: manufacturerNames 
      ? t('itemListName', { manufacturers: manufacturerNames })
      : t('itemListDefaultName'),
    description: t('itemListDesc'),
    numberOfItems: filteredCount,
    itemListElement: listings.slice(0, 10).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        url: `https://cmm24.de/maschinen/${listing.slug}`,
        image: listing.media[0]?.url,
        brand: {
          '@type': 'Brand',
          name: listing.manufacturer?.name || tCommon('unknown'),
        },
        offers: {
          '@type': 'Offer',
          price: listing.price ? listing.price / 100 : undefined,
          priceCurrency: listing.currency || 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  // JSON-LD BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tBreadcrumb('home'),
        item: 'https://cmm24.de',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: manufacturerNames 
          ? t('manufacturerMachines', { manufacturers: manufacturerNames })
          : tBreadcrumb('machines'),
        ...(manufacturerNames ? {} : { item: 'https://cmm24.de/maschinen' }),
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container-page py-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    {tBreadcrumb('home')}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
                {manufacturerNames ? (
                  <>
                    <li>
                      <Link href="/maschinen" className="hover:text-foreground transition-colors">
                        {tBreadcrumb('machines')}
                      </Link>
                    </li>
                    <li aria-hidden="true">
                      <ChevronRight className="h-4 w-4" />
                    </li>
                    <li>
                      <span className="text-foreground" aria-current="page">
                        {manufacturerNames}
                      </span>
                    </li>
                  </>
                ) : (
                  <li>
                    <span className="text-foreground" aria-current="page">
                      {tBreadcrumb('machines')}
                    </span>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </div>

        {/* Client Component with filters and listings */}
        <MaschinenPageClient />
      </div>
    </>
  );
}
