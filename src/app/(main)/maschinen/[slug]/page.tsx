import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ListingDetailClient } from '@/components/features/listings';
import { mockListings } from '@/data/mock-data';

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all listings (SSG)
export async function generateStaticParams() {
  return mockListings
    .filter((listing) => listing.status === 'active' || listing.status === 'sold')
    .map((listing) => ({
      slug: listing.slug,
    }));
}

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = mockListings.find((l) => l.slug === slug);

  if (!listing) {
    return {
      title: 'Inserat nicht gefunden | CMM24',
      robots: { index: false, follow: false },
    };
  }

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

  const title = `${listing.manufacturer.name} ${listing.title} gebraucht | ${formatPrice(listing.price)} | CMM24`;
  const description = `✓ ${listing.manufacturer.name} ${listing.title} Bj. ${listing.yearBuilt} ✓ Messbereich ${listing.measuringRangeX}×${listing.measuringRangeY}×${listing.measuringRangeZ} mm ✓ ${conditionLabels[listing.condition]} ✓ ${listing.locationCity}, ${listing.locationCountry}. Jetzt anfragen!`;

  return {
    title,
    description,
    keywords: [
      listing.manufacturer.name,
      listing.title,
      'gebraucht',
      'Koordinatenmessmaschine',
      'CMM',
      listing.software || '',
      listing.locationCity,
    ].filter(Boolean),
    openGraph: {
      title: `${listing.manufacturer.name} ${listing.title} gebraucht kaufen`,
      description,
      url: `https://cmm24.de/maschinen/${listing.slug}`,
      siteName: 'CMM24',
      locale: 'de_DE',
      type: 'website',
      images: listing.media.length > 0 ? [
        {
          url: listing.media[0].url,
          width: 800,
          height: 600,
          alt: `${listing.manufacturer.name} ${listing.title} Koordinatenmessmaschine`,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.manufacturer.name} ${listing.title} | ${formatPrice(listing.price)}`,
      description,
      images: listing.media.length > 0 ? [listing.media[0].url] : undefined,
    },
    alternates: {
      canonical: `https://cmm24.de/maschinen/${listing.slug}`,
    },
    robots: listing.status === 'sold' 
      ? { index: false, follow: true } 
      : { index: true, follow: true },
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = mockListings.find((l) => l.slug === slug);

  if (!listing) {
    notFound();
  }

  // Find similar listings
  const similarListings = mockListings
    .filter(
      (l) =>
        l.id !== listing.id &&
        l.status === 'active' &&
        (l.manufacturerId === listing.manufacturerId ||
          Math.abs(l.price - listing.price) < listing.price * 0.3)
    )
    .slice(0, 4);

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

  // JSON-LD Product Schema (per SEO documentation section 6.4)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://cmm24.de/maschinen/${listing.slug}#product`,
    name: `${listing.manufacturer.name} ${listing.title}`,
    description: listing.description.slice(0, 500),
    image: listing.media.map((m) => m.url),
    brand: {
      '@type': 'Brand',
      name: listing.manufacturer.name,
      '@id': `https://cmm24.de/hersteller/${listing.manufacturer.slug}#brand`,
    },
    manufacturer: {
      '@type': 'Organization',
      name: listing.manufacturer.name,
    },
    model: listing.title,
    productionDate: listing.yearBuilt.toString(),
    category: 'Koordinatenmessmaschinen',
    sku: `CMM24-${listing.id}`,
    itemCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      '@id': `https://cmm24.de/maschinen/${listing.slug}#offer`,
      url: `https://cmm24.de/maschinen/${listing.slug}`,
      priceCurrency: listing.currency,
      price: listing.price / 100,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: listing.status === 'active' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: listing.seller ? {
        '@type': 'Organization',
        name: listing.seller.companyName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: listing.seller.addressCity,
          addressCountry: listing.seller.addressCountry === 'Deutschland' ? 'DE' : listing.seller.addressCountry,
        },
      } : undefined,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Messbereich X',
        value: listing.measuringRangeX,
        unitCode: 'MMT',
        unitText: 'mm',
      },
      {
        '@type': 'PropertyValue',
        name: 'Messbereich Y',
        value: listing.measuringRangeY,
        unitCode: 'MMT',
        unitText: 'mm',
      },
      {
        '@type': 'PropertyValue',
        name: 'Messbereich Z',
        value: listing.measuringRangeZ,
        unitCode: 'MMT',
        unitText: 'mm',
      },
      ...(listing.accuracyUm ? [{
        '@type': 'PropertyValue',
        name: 'Genauigkeit (MPEE)',
        value: listing.accuracyUm,
      }] : []),
      ...(listing.software ? [{
        '@type': 'PropertyValue',
        name: 'Software',
        value: listing.software,
      }] : []),
      ...(listing.controller ? [{
        '@type': 'PropertyValue',
        name: 'Steuerung',
        value: listing.controller,
      }] : []),
      ...(listing.probeSystem ? [{
        '@type': 'PropertyValue',
        name: 'Tastsystem',
        value: listing.probeSystem,
      }] : []),
      {
        '@type': 'PropertyValue',
        name: 'Baujahr',
        value: listing.yearBuilt,
      },
      {
        '@type': 'PropertyValue',
        name: 'Zustand',
        value: conditionLabels[listing.condition],
      },
    ],
  };

  // JSON-LD BreadcrumbList Schema (per SEO documentation section 6.6)
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
        name: 'Maschinen',
        item: 'https://cmm24.de/maschinen',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.manufacturer.name,
        item: `https://cmm24.de/maschinen?hersteller=${listing.manufacturer.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${listing.manufacturer.name} ${listing.title}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
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
              <li>
                <Link href="/maschinen" className="hover:text-foreground transition-colors">
                  Maschinen
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li>
                <Link
                  href={`/hersteller/${listing.manufacturer.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {listing.manufacturer.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li>
                <span className="text-foreground truncate max-w-[200px]" aria-current="page">
                  {listing.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Client Component with interactive features */}
      <ListingDetailClient listing={listing} similarListings={similarListings} />
    </>
  );
}
