import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ListingDetailClient } from '@/components/features/listings';
import { getPublicListingBySlug, getPublicListings, type PublicListing } from '@/lib/actions/listings';
import type { Listing, ListingMedia } from '@/types';

interface ListingDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Convert PublicListing to the Listing type expected by the client component
function convertToListing(pl: PublicListing & { similar?: PublicListing[] }, locale: string): Listing {
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
    // Google Merchant Center Felder
    machineType: pl.machine_type || undefined,
    weightKg: pl.weight_kg || undefined,
    dimensionLengthMm: pl.dimension_length_mm || undefined,
    dimensionWidthMm: pl.dimension_width_mm || undefined,
    dimensionHeightMm: pl.dimension_height_mm || undefined,
    mpn: pl.mpn || undefined,
    gtin: pl.gtin || undefined,
    serialNumber: pl.serial_number || undefined,
    googleProductCategory: pl.google_product_category || undefined,
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
      listingCount: (pl.account as any).listing_count || 0,
      phone: (pl.account as any).phone || undefined,
      website: (pl.account as any).website || undefined,
      addressCity: (pl.account as any).address_city || undefined,
      addressCountry: (pl.account as any).address_country || undefined,
      memberSince: (pl.account as any).created_at
        ? new Date((pl.account as any).created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
        : undefined,
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

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'machineDetail' });
  const tConditions = await getTranslations({ locale, namespace: 'conditions' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const result = await getPublicListingBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }

  const listing = result.data;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: listing.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const manufacturerName = listing.manufacturer?.name || tCommon('unknown');
  const conditionLabel = tConditions(listing.condition);
  const title = t('titleMeta', { manufacturer: manufacturerName, model: listing.title, price: listing.price ? formatPrice(listing.price) : 'VB' });
  const description = t('descMeta', {
    manufacturer: manufacturerName,
    model: listing.title,
    year: listing.year_built,
    x: listing.measuring_range_x || 0,
    y: listing.measuring_range_y || 0,
    z: listing.measuring_range_z || 0,
    condition: conditionLabel,
    city: listing.location_city,
    country: listing.location_country,
  });

  return {
    title,
    description,
    keywords: [
      manufacturerName,
      listing.title,
      'gebraucht',
      'Koordinatenmessmaschine',
      'CMM',
      listing.software || '',
      listing.location_city,
    ].filter(Boolean),
    openGraph: {
      title: t('ogTitle', { manufacturer: manufacturerName, model: listing.title }),
      description,
      url: `https://cmm24.de/maschinen/${listing.slug}`,
      siteName: 'CMM24',
      locale,
      type: 'website',
      images: (() => {
        const firstImage = listing.media.find((m) => !m.filename?.toLowerCase().endsWith('.pdf') && m.mime_type !== 'application/pdf');
        return firstImage ? [{
          url: firstImage.url,
          width: 800,
          height: 600,
          alt: t('imageAlt', { manufacturer: manufacturerName, model: listing.title }),
        }] : undefined;
      })(),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle', { manufacturer: manufacturerName, model: listing.title, price: listing.price ? formatPrice(listing.price) : 'VB' }),
      description,
      images: (() => {
        const firstImage = listing.media.find((m) => !m.filename?.toLowerCase().endsWith('.pdf') && m.mime_type !== 'application/pdf');
        return firstImage ? [firstImage.url] : undefined;
      })(),
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
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('machineDetail');
  const tBreadcrumb = await getTranslations('breadcrumb');
  const tConditions = await getTranslations('conditions');
  const tCommon = await getTranslations('common');

  const result = await getPublicListingBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const listingData = result.data;
  const listing = convertToListing(listingData, locale);
  const similarListings = listingData.similar.map((pl) => convertToListing(pl, locale));

  const manufacturerName = listingData.manufacturer?.name || tCommon('unknown');
  const manufacturerSlug = listingData.manufacturer?.slug || '';

  // Hilfsfunktion: Condition auf Schema.org Wert mappen
  const getSchemaCondition = (condition: string) => {
    switch (condition) {
      case 'new': return 'https://schema.org/NewCondition';
      case 'like_new': return 'https://schema.org/UsedCondition';
      case 'good': return 'https://schema.org/UsedCondition';
      case 'fair': return 'https://schema.org/UsedCondition';
      default: return 'https://schema.org/UsedCondition';
    }
  };

  // Hilfsfunktion: Condition fuer Google Merchant Center mappen
  const getGoogleCondition = (condition: string) => {
    return condition === 'new' ? 'new' : 'used';
  };

  const schemaCondition = getSchemaCondition(listing.condition);
  const canonicalUrl = `https://cmm24.de/${locale}/maschinen/${listing.slug}`;

  // JSON-LD Product Schema (per SEO documentation section 6.4, erweitert fuer Google Merchant Center)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: `${manufacturerName} ${listing.title}`,
    description: listing.description.replace(/<[^>]*>/g, '').slice(0, 500),
    image: listing.media.filter((m) => m.type === 'image').map((m) => m.url),
    brand: {
      '@type': 'Brand',
      name: manufacturerName,
      '@id': `https://cmm24.de/${locale}/hersteller/${manufacturerSlug}#brand`,
    },
    manufacturer: {
      '@type': 'Organization',
      name: manufacturerName,
    },
    model: listing.title,
    mpn: listing.mpn || `${manufacturerName}-${listing.title}`.replace(/\s+/g, '-').substring(0, 70),
    ...(listing.gtin ? { gtin: listing.gtin } : {}),
    productionDate: listing.yearBuilt.toString(),
    releaseDate: listing.yearBuilt.toString(),
    category: listing.googleProductCategory || 'Business & Industrial > Industrial Equipment',
    sku: `CMM24-${listing.id}`,
    ...((!listing.mpn && !listing.gtin) ? { identifier_exists: false } : {}),
    itemCondition: schemaCondition,
    ...(listing.weightKg ? {
      weight: {
        '@type': 'QuantitativeValue',
        value: listing.weightKg,
        unitCode: 'KGM',
        unitText: 'kg',
      },
    } : {}),
    ...(listing.dimensionLengthMm && listing.dimensionWidthMm && listing.dimensionHeightMm ? {
      depth: { '@type': 'QuantitativeValue', value: listing.dimensionLengthMm, unitCode: 'MMT', unitText: 'mm' },
      width: { '@type': 'QuantitativeValue', value: listing.dimensionWidthMm, unitCode: 'MMT', unitText: 'mm' },
      height: { '@type': 'QuantitativeValue', value: listing.dimensionHeightMm, unitCode: 'MMT', unitText: 'mm' },
    } : {}),
    offers: {
      '@type': 'Offer',
      '@id': `${canonicalUrl}#offer`,
      url: canonicalUrl,
      priceCurrency: listing.currency,
      // Preis nur setzen wenn vorhanden (nicht bei "Preis auf Anfrage")
      ...(listing.price && listing.price > 0 ? { price: (listing.price / 100).toFixed(2) } : {}),
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: listing.status === 'active' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/SoldOut',
      itemCondition: schemaCondition,
      seller: listing.seller ? {
        '@type': 'Organization',
        name: listing.seller.companyName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: listing.seller.addressCity,
          addressCountry: listing.seller.addressCountry === 'Deutschland' ? 'DE' : listing.seller.addressCountry,
        },
      } : undefined,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['DE', 'AT', 'CH'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 14,
            unitCode: 'DAY',
          },
        },
      },
    },
    additionalProperty: [
      // Messbereiche nur wenn vorhanden
      ...(listing.measuringRangeX ? [{
        '@type': 'PropertyValue',
        name: 'Messbereich X',
        value: listing.measuringRangeX,
        unitCode: 'MMT',
        unitText: 'mm',
      }] : []),
      ...(listing.measuringRangeY ? [{
        '@type': 'PropertyValue',
        name: 'Messbereich Y',
        value: listing.measuringRangeY,
        unitCode: 'MMT',
        unitText: 'mm',
      }] : []),
      ...(listing.measuringRangeZ ? [{
        '@type': 'PropertyValue',
        name: 'Messbereich Z',
        value: listing.measuringRangeZ,
        unitCode: 'MMT',
        unitText: 'mm',
      }] : []),
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
      ...(listing.serialNumber ? [{
        '@type': 'PropertyValue',
        name: 'Seriennummer',
        value: listing.serialNumber,
      }] : []),
      {
        '@type': 'PropertyValue',
        name: 'Baujahr',
        value: listing.yearBuilt,
      },
      {
        '@type': 'PropertyValue',
        name: 'Zustand',
        value: tConditions(listing.condition),
      },
      ...(listing.machineType ? [{
        '@type': 'PropertyValue',
        name: 'Maschinentyp',
        value: listing.machineType,
      }] : []),
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
        name: tBreadcrumb('home'),
        item: `https://cmm24.de/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tBreadcrumb('machines'),
        item: `https://cmm24.de/${locale}/maschinen`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: manufacturerName,
        item: `https://cmm24.de/${locale}/maschinen?hersteller=${manufacturerSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${manufacturerName} ${listing.title}`,
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
          <nav aria-label="Breadcrumb" className="overflow-x-auto scrollbar-hide">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <li className="shrink-0">
                <Link href="/" className="hover:text-foreground transition-colors">
                  {tBreadcrumb('home')}
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="shrink-0">
                <Link href="/maschinen" className="hover:text-foreground transition-colors">
                  {tBreadcrumb('machines')}
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="shrink-0">
                <Link
                  href={`/hersteller/${manufacturerSlug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {manufacturerName}
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="min-w-0">
                <span className="text-foreground truncate block max-w-[200px] sm:max-w-none" aria-current="page">
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
