import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MaschinenPageClient } from '@/components/features/listings';
import { mockListings, manufacturers } from '@/data/mock-data';

interface MaschinenPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata based on search params
export async function generateMetadata({ searchParams }: MaschinenPageProps): Promise<Metadata> {
  const params = await searchParams;
  
  const herstellerParam = typeof params.hersteller === 'string' ? params.hersteller : undefined;
  const query = typeof params.q === 'string' ? params.q : undefined;
  
  // Get manufacturer names if filtered
  const manufacturerNames = herstellerParam
    ? herstellerParam.split(',')
        .map((slug) => {
          // Try to find by slug first, then by id
          const bySlug = manufacturers.find((m) => m.slug === slug);
          const byId = manufacturers.find((m) => m.id === slug);
          return (bySlug || byId)?.name;
        })
        .filter(Boolean)
        .join(', ')
    : null;

  // Count active listings (would be dynamic in production)
  const activeListings = mockListings.filter((l) => l.status === 'active');
  
  // Count manufacturer-specific listings
  const filteredCount = herstellerParam
    ? activeListings.filter((l) => {
        const slugs = herstellerParam.split(',');
        return slugs.includes(l.manufacturer.slug) || slugs.includes(l.manufacturerId);
      }).length
    : activeListings.length;

  // Build dynamic title and description
  let title: string;
  let description: string;
  let canonical = 'https://cmm24.de/maschinen';

  if (query) {
    title = `Suchergebnisse für "${query}" | Koordinatenmessmaschinen | CMM24`;
    description = `Finden Sie Koordinatenmessmaschinen für "${query}" auf CMM24. ✓ Geprüfte Angebote ✓ Faire Preise ✓ Direkt vom Händler.`;
    // Don't set canonical for search queries (noindex)
  } else if (manufacturerNames) {
    title = `Gebrauchte ${manufacturerNames} Messmaschinen | ${filteredCount} Angebote | CMM24`;
    description = `${filteredCount} gebrauchte ${manufacturerNames} Koordinatenmessmaschinen auf CMM24. ✓ Alle Modelle ✓ Geprüfte Händler ✓ Faire Preise. Jetzt entdecken!`;
    canonical = `https://cmm24.de/maschinen?hersteller=${herstellerParam}`;
  } else {
    title = `Gebrauchte Koordinatenmessmaschinen | ${filteredCount}+ Angebote | CMM24`;
    description = `Finden Sie ${filteredCount}+ gebrauchte Koordinatenmessmaschinen. ✓ Geprüfte Angebote ✓ Direkt vom Händler ✓ Faire Preise. Zeiss, Hexagon, Wenzel und mehr. Jetzt vergleichen!`;
  }

  // Determine robots directive based on filters
  const hasMultipleFilters = [
    params.hersteller,
    params.zustand,
    params.land,
    params.preis_min,
    params.preis_max,
    params.jahr_min,
    params.jahr_max,
  ].filter(Boolean).length >= 3;

  const hasSearchQuery = !!query;
  const hasSorting = !!params.sortierung;

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
      locale: 'de_DE',
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

export default async function MaschinenPage({ searchParams }: MaschinenPageProps) {
  const params = await searchParams;
  
  const herstellerParam = typeof params.hersteller === 'string' ? params.hersteller : undefined;
  
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

  // Count active listings
  const activeListings = mockListings.filter((l) => l.status === 'active');
  
  const filteredCount = herstellerParam
    ? activeListings.filter((l) => {
        const slugs = herstellerParam.split(',');
        return slugs.includes(l.manufacturer.slug) || slugs.includes(l.manufacturerId);
      }).length
    : activeListings.length;

  // JSON-LD ItemList Schema for the listing overview
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: manufacturerNames 
      ? `Gebrauchte ${manufacturerNames} Koordinatenmessmaschinen`
      : 'Gebrauchte Koordinatenmessmaschinen',
    description: `Liste verfügbarer gebrauchter Koordinatenmessmaschinen auf CMM24`,
    numberOfItems: filteredCount,
    itemListElement: activeListings.slice(0, 10).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        url: `https://cmm24.de/maschinen/${listing.slug}`,
        image: listing.media[0]?.url,
        brand: {
          '@type': 'Brand',
          name: listing.manufacturer.name,
        },
        offers: {
          '@type': 'Offer',
          price: listing.price / 100,
          priceCurrency: listing.currency,
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
        name: 'Startseite',
        item: 'https://cmm24.de',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: manufacturerNames 
          ? `${manufacturerNames} Maschinen`
          : 'Maschinen',
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
                    Startseite
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
                {manufacturerNames ? (
                  <>
                    <li>
                      <Link href="/maschinen" className="hover:text-foreground transition-colors">
                        Maschinen
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
                      Maschinen
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
