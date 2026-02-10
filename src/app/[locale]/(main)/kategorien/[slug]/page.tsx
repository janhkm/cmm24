import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { categoryPages } from '@/data/content/categories';
import { ListingCard } from '@/components/features/listings';
import { getPublicListings, getManufacturersWithCounts } from '@/lib/actions/listings';

interface KategorieDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  return categoryPages.map((category) => ({
    slug: category.slug,
  }));
}

// Generate metadata dynamically
export async function generateMetadata({ params }: KategorieDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'categoriesPage' });
  const category = categoryPages.find((c) => c.slug === slug);
  
  if (!category) {
    return {
      title: t('notFoundTitle'),
    };
  }

  return {
    title: t('metaTitle', { name: category.name, count: category.listingCount }),
    description: t('metaDesc', { count: category.listingCount, name: category.name, description: category.description }),
    openGraph: {
      title: t('metaOgTitle', { name: category.name }),
      description: category.longDescription || category.description,
      locale,
    },
  };
}

export default async function KategorieDetailPage({ params }: KategorieDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('categoriesPage');
  const tBreadcrumb = await getTranslations('breadcrumb');

  const category = categoryPages.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Echte Listings und Hersteller aus der Datenbank laden
  const [listingsResult, manufacturersResult] = await Promise.all([
    getPublicListings({ limit: 12, sortBy: 'newest' }),
    getManufacturersWithCounts(),
  ]);
  const categoryListings = listingsResult.success ? listingsResult.data!.listings : [];
  const manufacturers = manufacturersResult.success ? manufacturersResult.data! : [];

  // JSON-LD for ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('usedCategory', { name: category.name }),
    description: category.longDescription || category.description,
    numberOfItems: categoryListings.length,
    itemListElement: categoryListings.slice(0, 10).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        url: `https://cmm24.de/maschinen/${listing.slug}`,
        offers: {
          '@type': 'Offer',
          price: listing.price ? listing.price / 100 : undefined,
          priceCurrency: listing.currency,
        },
      },
    })),
  };

  return (
    <>
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
              <li><Link href="/kategorien" className="hover:text-foreground">{tBreadcrumb('categories')}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{category.name}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/kategorien">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToAll')}
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                {t('usedCategory', { name: category.name })}
              </h1>
              <Badge variant="secondary" className="text-base">
                {t('offers', { count: category.listingCount })}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {category.longDescription || category.description}
            </p>
          </header>

          {/* Filter by Manufacturer */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('filterByManufacturer')}</h2>
            <div className="flex flex-wrap gap-2">
              {manufacturers.slice(0, 6).map((manufacturer) => (
                <Button key={manufacturer.id} variant="outline" size="sm" asChild>
                  <Link href={`/maschinen?kategorie=${slug}&hersteller=${manufacturer.slug}`}>
                    {manufacturer.name}
                  </Link>
                </Button>
              ))}
            </div>
          </section>

          {/* Listings Grid */}
          <section aria-labelledby="listings-heading">
            <h2 id="listings-heading" className="sr-only">{t('available', { name: category.name })}</h2>
            
            {categoryListings.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  {t('noMachines', { name: category.name })}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/maschinen">{t('viewAllMachines')}</Link>
                </Button>
              </div>
            )}
          </section>

          {/* SEO Content */}
          <section className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
            <h2>{t('whatAre', { name: category.name })}</h2>
            <p>{category.longDescription || category.description}</p>
            
            <h3>{t('typicalApplications')}</h3>
            <ul>
              <li>{t('app1')}</li>
              <li>{t('app2')}</li>
              <li>{t('app3')}</li>
              <li>{t('app4')}</li>
            </ul>

            <h3>{t('buyingTips')}</h3>
            <p>
              {t('buyingTipsDesc')}
            </p>
          </section>

          {/* Other Categories */}
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">{t('otherCategories')}</h2>
            <div className="flex flex-wrap gap-3">
              {categoryPages
                .filter((c) => c.slug !== slug)
                .map((c) => (
                  <Button key={c.id} variant="outline" size="sm" asChild>
                    <Link href={`/kategorien/${c.slug}`}>{c.name}</Link>
                  </Button>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
