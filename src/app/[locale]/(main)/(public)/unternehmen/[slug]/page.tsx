import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, ExternalLink, CheckCircle, Building2, Globe, Phone, Clock, FileText, Crown, Award, Image as ImageIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListingCard } from '@/components/features/listings';
import {
  getPublicCompanyBySlug,
  getPublicListings,
  type PublicListing,
} from '@/lib/actions/listings';
import type { Listing } from '@/types';

interface CompanyProfilePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// PublicListing in Listing-Format konvertieren
function convertToListing(pl: PublicListing, locale: string): Listing {
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

// SEO Metadata
export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'companyProfile' });
  const result = await getPublicCompanyBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }

  const company = result.data;

  return {
    title: t('metaTitle', { name: company.company_name }),
    description: t('metaDesc', { count: company.listing_count, name: company.company_name }),
    openGraph: {
      title: t('metaTitle', { name: company.company_name }),
      description: t('metaDesc', { count: company.listing_count, name: company.company_name }),
      locale,
      ...(company.logo_url ? { images: [{ url: company.logo_url }] } : {}),
    },
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('companyProfile');
  const tBreadcrumb = await getTranslations('breadcrumb');

  // Unternehmen und Inserate parallel laden
  const [companyResult, listingsResult] = await Promise.all([
    getPublicCompanyBySlug(slug),
    getPublicListings({ accountSlug: slug, limit: 12, sortBy: 'newest' }),
  ]);

  if (!companyResult.success || !companyResult.data) {
    notFound();
  }

  const company = companyResult.data;
  const listings = listingsResult.success && listingsResult.data
    ? listingsResult.data.listings.map((l) => convertToListing(l, locale))
    : [];
  const totalListings = listingsResult.success && listingsResult.data
    ? listingsResult.data.total
    : 0;

  const memberSince = company.created_at
    ? new Date(company.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    : null;

  // JSON-LD Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `https://cmm24.de/unternehmen/${company.slug}#organization`,
    name: company.company_name,
    url: `https://cmm24.de/unternehmen/${company.slug}`,
    ...(company.logo_url ? { logo: company.logo_url } : {}),
    ...(company.website ? { sameAs: [company.website] } : {}),
    ...(company.address_city ? {
      address: {
        '@type': 'PostalAddress',
        addressLocality: company.address_city,
        ...(company.address_country ? { addressCountry: company.address_country } : {}),
      },
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main className="py-8 md:py-12">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">{tBreadcrumb('home')}</Link></li>
              <li>/</li>
              <li><Link href="/maschinen" className="hover:text-foreground">{tBreadcrumb('machines')}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{company.company_name}</li>
            </ol>
          </nav>

          {/* Zurueck-Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/maschinen">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToMachines')}
            </Link>
          </Button>

          {/* Header-Bereich */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Unternehmens-Info-Card */}
              <Card className="md:w-80 shrink-0">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.company_name}
                        width={96}
                        height={96}
                        className="rounded-xl object-contain border mb-4"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Building2 className="h-12 w-12 text-primary" />
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold">{company.company_name}</h1>
                      {/* AUSKOMMENTIERT: Verified/Premium Badges
                      {company.is_verified && (
                        <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      )}
                      */}
                    </div>
                    {/* AUSKOMMENTIERT: Premium/Verified Badges
                    {company.is_premium && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 mb-2">
                        <Crown className="h-3 w-3 mr-1" />
                        {t('premiumDealer')}
                      </Badge>
                    )}
                    {company.is_verified && (
                      <p className="text-xs text-blue-600 font-medium mb-3">{t('verifiedDealer')}</p>
                    )}
                    */}

                    {/* Inserate-Badge */}
                    <Badge variant="secondary" className="mb-4">
                      <FileText className="h-3 w-3 mr-1" />
                      {t('offerCount', { count: company.listing_count })}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    {(company.address_city || company.address_country) && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>
                          {company.address_city}
                          {company.address_city && company.address_country ? ', ' : ''}
                          {company.address_country}
                        </span>
                      </div>
                    )}
                    {memberSince && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{t('memberSince', { date: memberSince })}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Globe className="h-4 w-4 shrink-0" />
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors truncate"
                        >
                          {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                          {company.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rechte Seite: Beschreibung */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-4">{t('about', { name: company.company_name })}</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {company.description || t('noDescription', { name: company.company_name })}
                  </p>
                </div>

                {/* Galerie (jetzt fuer alle, ehemals nur Premium) */}
                {Array.isArray(company.gallery_urls) && company.gallery_urls.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      {t('gallery')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {company.gallery_urls.map((img, idx) => (
                        <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-[4/3] overflow-hidden rounded-lg border">
                          <Image
                            src={img.url}
                            alt={img.caption || `${company.company_name} Bild ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          {img.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">
                              {img.caption}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zertifikate (jetzt fuer alle, ehemals nur Premium) */}
                {Array.isArray(company.certificates) && company.certificates.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      {t('certificates')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.certificates.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1.5 text-sm">
                          <Award className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                          {cert.name}
                          {cert.issued_by && (
                            <span className="text-muted-foreground ml-1">({cert.issued_by})</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Inserate-Bereich */}
          <section aria-labelledby="listings-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="listings-heading" className="text-2xl font-bold">
                {t('currentOffers', { name: company.company_name })}
              </h2>
              {totalListings > 12 && (
                <Button variant="outline" asChild>
                  <Link href={`/maschinen?unternehmen=${company.slug}`}>
                    {t('showAll')}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>

            {listings.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  {t('noMachinesAvailable', { name: company.company_name })}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/maschinen">{t('viewAllMachines')}</Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
