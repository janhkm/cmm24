import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { categoryPages, mockListings, manufacturers } from '@/data/mock-data';
import { ListingCard } from '@/components/features/listings';

interface KategorieDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  return categoryPages.map((category) => ({
    slug: category.slug,
  }));
}

// Generate metadata dynamically
export async function generateMetadata({ params }: KategorieDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryPages.find((c) => c.slug === slug);
  
  if (!category) {
    return {
      title: 'Kategorie nicht gefunden | CMM24',
    };
  }

  return {
    title: `Gebrauchte ${category.name} | ${category.listingCount} Angebote | CMM24`,
    description: `${category.listingCount} gebrauchte ${category.name} auf CMM24. ${category.description} ✓ Geprüfte Angebote ✓ Faire Preise.`,
    openGraph: {
      title: `Gebrauchte ${category.name} kaufen`,
      description: category.longDescription || category.description,
    },
  };
}

export default async function KategorieDetailPage({ params }: KategorieDetailPageProps) {
  const { slug } = await params;
  const category = categoryPages.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // For demo purposes, show all active listings (in real app, filter by category)
  const categoryListings = mockListings.filter((listing) => listing.status === 'active');

  // JSON-LD for ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Gebrauchte ${category.name}`,
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
          price: listing.price / 100,
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
              <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
              <li>/</li>
              <li><Link href="/kategorien" className="hover:text-foreground">Kategorien</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{category.name}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/kategorien">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Alle Kategorien
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                Gebrauchte {category.name}
              </h1>
              <Badge variant="secondary" className="text-base">
                {category.listingCount} Angebote
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {category.longDescription || category.description}
            </p>
          </header>

          {/* Filter by Manufacturer */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Nach Hersteller filtern:</h2>
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
            <h2 id="listings-heading" className="sr-only">Verfügbare {category.name}</h2>
            
            {categoryListings.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Aktuell keine {category.name} verfügbar.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/maschinen">Alle Maschinen ansehen</Link>
                </Button>
              </div>
            )}
          </section>

          {/* SEO Content */}
          <section className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
            <h2>Was sind {category.name}?</h2>
            <p>{category.longDescription || category.description}</p>
            
            <h3>Typische Anwendungen</h3>
            <ul>
              <li>Qualitätssicherung in der Fertigung</li>
              <li>Erstbemusterung und Serienprüfung</li>
              <li>Reverse Engineering</li>
              <li>Werkzeug- und Formenbau</li>
            </ul>

            <h3>Worauf beim Kauf achten?</h3>
            <p>
              Beim Kauf einer gebrauchten Messmaschine sollten Sie besonders auf das 
              Kalibrierzertifikat, die Wartungshistorie und den allgemeinen Zustand achten. 
              Auf CMM24 werden alle Inserate vor der Veröffentlichung geprüft.
            </p>
          </section>

          {/* Other Categories */}
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Weitere Kategorien</h2>
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
