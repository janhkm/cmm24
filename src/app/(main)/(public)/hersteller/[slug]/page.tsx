import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { manufacturers, mockListings } from '@/data/mock-data';
import { ListingCard } from '@/components/features/listings';

interface HerstellerDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all manufacturers
export async function generateStaticParams() {
  return manufacturers.map((manufacturer) => ({
    slug: manufacturer.slug,
  }));
}

// Generate metadata dynamically
export async function generateMetadata({ params }: HerstellerDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const manufacturer = manufacturers.find((m) => m.slug === slug);
  
  if (!manufacturer) {
    return {
      title: 'Hersteller nicht gefunden | CMM24',
    };
  }

  return {
    title: `Gebrauchte ${manufacturer.name} Koordinatenmessmaschinen | CMM24`,
    description: `${manufacturer.listingCount || 0} gebrauchte ${manufacturer.name} Messmaschinen auf CMM24. ✓ Geprüfte Angebote ✓ Faire Preise ✓ Verifizierte Händler. Jetzt entdecken!`,
    openGraph: {
      title: `Gebrauchte ${manufacturer.name} Messmaschinen kaufen`,
      description: `Finden Sie gebrauchte ${manufacturer.name} Koordinatenmessmaschinen auf CMM24 – Europas Marktplatz für Messtechnik.`,
    },
  };
}

export default async function HerstellerDetailPage({ params }: HerstellerDetailPageProps) {
  const { slug } = await params;
  const manufacturer = manufacturers.find((m) => m.slug === slug);

  if (!manufacturer) {
    notFound();
  }

  // Filter listings by this manufacturer
  const manufacturerListings = mockListings.filter(
    (listing) => listing.manufacturer.slug === slug && listing.status === 'active'
  );

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
    name: `Gebrauchte ${manufacturer.name} Koordinatenmessmaschinen`,
    numberOfItems: manufacturerListings.length,
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

  // Manufacturer descriptions
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

  const info = manufacturerInfo[slug] || { description: `${manufacturer.name} ist ein etablierter Hersteller von Koordinatenmessmaschinen.` };

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
              <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
              <li>/</li>
              <li><Link href="/hersteller" className="hover:text-foreground">Hersteller</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{manufacturer.name}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/hersteller">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Alle Hersteller
            </Link>
          </Button>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Logo Placeholder */}
              <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground shrink-0">
                {manufacturer.name.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Gebrauchte {manufacturer.name} Koordinatenmessmaschinen
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {manufacturer.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {manufacturer.country}
                    </span>
                  )}
                  <Badge variant="secondary">
                    {manufacturerListings.length} {manufacturerListings.length === 1 ? 'Angebot' : 'Angebote'}
                  </Badge>
                </div>
              </div>

              <Button asChild>
                <Link href={`/maschinen?hersteller=${manufacturer.slug}`}>
                  Alle {manufacturer.name} Maschinen
                </Link>
              </Button>
            </div>
          </header>

          {/* About Section */}
          <section className="mb-12" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-bold mb-4">Über {manufacturer.name}</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground">{info.description}</p>
              {(info.founded || info.headquarters) && (
                <div className="flex flex-wrap gap-6 mt-4 text-sm">
                  {info.founded && (
                    <div>
                      <span className="font-medium">Gegründet:</span>{' '}
                      <span className="text-muted-foreground">{info.founded}</span>
                    </div>
                  )}
                  {info.headquarters && (
                    <div>
                      <span className="font-medium">Hauptsitz:</span>{' '}
                      <span className="text-muted-foreground">{info.headquarters}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Listings Section */}
          <section aria-labelledby="listings-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="listings-heading" className="text-2xl font-bold">
                Aktuelle {manufacturer.name} Angebote
              </h2>
              <Button variant="outline" asChild>
                <Link href={`/maschinen?hersteller=${manufacturer.slug}`}>
                  Alle anzeigen
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
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
                  Aktuell keine {manufacturer.name} Maschinen verfügbar.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/maschinen">Alle Maschinen ansehen</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Related Manufacturers */}
          <section className="mt-16" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold mb-6">Weitere Hersteller</h2>
            <div className="flex flex-wrap gap-3">
              {manufacturers
                .filter((m) => m.slug !== slug)
                .slice(0, 6)
                .map((m) => (
                  <Button key={m.id} variant="outline" size="sm" asChild>
                    <Link href={`/hersteller/${m.slug}`}>{m.name}</Link>
                  </Button>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
