import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle, Shield, MessageSquare, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ListingCard } from '@/components/features/listings';
import { HeroSearch } from '@/components/features/home';
import { mockListings, manufacturers } from '@/data/mock-data';

// Alle unterstützten Sprachen für hreflang
const supportedLanguages = {
  'de': 'https://cmm24.de',
  'en': 'https://cmm24.de/en',
  'fr': 'https://cmm24.de/fr',
  'nl': 'https://cmm24.de/nl',
  'it': 'https://cmm24.de/it',
  'es': 'https://cmm24.de/es',
  'pl': 'https://cmm24.de/pl',
  'cs': 'https://cmm24.de/cs',
  'sk': 'https://cmm24.de/sk',
  'hu': 'https://cmm24.de/hu',
  'ro': 'https://cmm24.de/ro',
  'bg': 'https://cmm24.de/bg',
  'el': 'https://cmm24.de/el',
  'tr': 'https://cmm24.de/tr',
  'hr': 'https://cmm24.de/hr',
  'sr': 'https://cmm24.de/sr',
  'bs': 'https://cmm24.de/bs',
  'sl': 'https://cmm24.de/sl',
  'sq': 'https://cmm24.de/sq',
  'mk': 'https://cmm24.de/mk',
  'sv': 'https://cmm24.de/sv',
  'da': 'https://cmm24.de/da',
  'et': 'https://cmm24.de/et',
  'lv': 'https://cmm24.de/lv',
  'lt': 'https://cmm24.de/lt',
  'pt': 'https://cmm24.de/pt',
  'ka': 'https://cmm24.de/ka',
  'x-default': 'https://cmm24.de',
};

// SEO Metadata
export const metadata: Metadata = {
  title: 'CMM24 – Marktplatz für gebrauchte Koordinatenmessmaschinen',
  description: 'Der führende B2B-Marktplatz für gebrauchte 3D-Koordinatenmessmaschinen in Europa. Finden Sie Messmaschinen von Zeiss, Hexagon, Wenzel, Mitutoyo und mehr. Geprüfte Inserate, seriöse Händler.',
  keywords: ['Koordinatenmessmaschine', 'CMM', 'gebraucht', 'Messmaschine', 'Zeiss', 'Hexagon', 'Wenzel', 'Mitutoyo', 'B2B', 'Marktplatz'],
  openGraph: {
    title: 'CMM24 – Marktplatz für gebrauchte Koordinatenmessmaschinen',
    description: 'Der führende B2B-Marktplatz für gebrauchte 3D-Koordinatenmessmaschinen in Europa.',
    url: 'https://cmm24.de',
    siteName: 'CMM24',
    locale: 'de_DE',
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
    title: 'CMM24 – Marktplatz für gebrauchte Koordinatenmessmaschinen',
    description: 'Der führende B2B-Marktplatz für gebrauchte 3D-Koordinatenmessmaschinen in Europa.',
    images: ['/og-image.svg'],
  },
  alternates: {
    canonical: 'https://cmm24.de',
    languages: supportedLanguages,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// FAQ-Daten für SEO und Content
const faqs = [
  {
    question: 'Was kostet eine gebrauchte Koordinatenmessmaschine?',
    answer: 'Der Preis für eine gebrauchte Koordinatenmessmaschine liegt typischerweise zwischen 10.000 € und 150.000 €, abhängig von Hersteller, Alter, Messbereich und Zustand. Zeiss Maschinen kosten im Durchschnitt 40.000-80.000 €, Hexagon 30.000-70.000 €. Auf CMM24 finden Sie aktuelle Marktpreise und können Angebote direkt vergleichen.',
  },
  {
    question: 'Welche Hersteller von Koordinatenmessmaschinen gibt es?',
    answer: 'Die führenden Hersteller von Koordinatenmessmaschinen sind: Zeiss (Deutschland), Hexagon (Schweden), Wenzel (Deutschland), Mitutoyo (Japan), Coord3 (Italien), LK Metrology (UK), Nikon Metrology (Japan) und Aberlink (UK). Auf CMM24 finden Sie gebrauchte Maschinen aller großen Hersteller.',
  },
  {
    question: 'Sind die Inserate auf CMM24 geprüft?',
    answer: 'Ja, alle Inserate auf CMM24 werden vor der Veröffentlichung von unserem Team geprüft. Wir kontrollieren die Vollständigkeit der Angaben, die Plausibilität der technischen Daten und die Qualität der Bilder. Zusätzlich können Verkäufer ihren Account verifizieren lassen.',
  },
  {
    question: 'Wie funktioniert der Kaufprozess auf CMM24?',
    answer: 'Der Kaufprozess ist einfach: 1. Suchen Sie die passende Maschine mit unseren Filtern, 2. Senden Sie eine Anfrage direkt an den Verkäufer, 3. Verhandeln Sie direkt ohne Provision, 4. Vereinbaren Sie eine Besichtigung vor Ort. CMM24 vermittelt nur – der eigentliche Kauf erfolgt direkt zwischen Käufer und Verkäufer.',
  },
  {
    question: 'Kann ich meine Messmaschine auf CMM24 verkaufen?',
    answer: 'Ja, Sie können Ihre gebrauchte Koordinatenmessmaschine kostenlos auf CMM24 inserieren. Erstellen Sie einfach ein Konto, geben Sie die technischen Daten ein, laden Sie Bilder hoch und Ihr Inserat wird nach Prüfung freigeschaltet. Mit einem kostenpflichtigen Plan können Sie mehrere Maschinen gleichzeitig anbieten.',
  },
];

// JSON-LD Structured Data mit erweiterten Informationen
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cmm24.de/#organization',
      name: 'CMM24',
      legalName: 'CMM24 GmbH',
      url: 'https://cmm24.de',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cmm24.de/logo.svg',
        width: 200,
        height: 50,
      },
      image: 'https://cmm24.de/og-image.svg',
      description: 'CMM24 ist der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. Wir verbinden Käufer und Verkäufer von Messtechnik.',
      foundingDate: '2026',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Musterstraße 1',
        addressLocality: 'München',
        postalCode: '80331',
        addressCountry: 'DE',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'kontakt@cmm24.de',
          availableLanguage: ['German', 'English'],
        },
      ],
      sameAs: [
        'https://www.linkedin.com/company/cmm24',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://cmm24.de/#website',
      url: 'https://cmm24.de',
      name: 'CMM24',
      alternateName: 'CMM24 - Marktplatz für Koordinatenmessmaschinen',
      description: 'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.',
      inLanguage: ['de', 'en', 'fr', 'nl', 'it', 'es', 'pl'],
      publisher: {
        '@id': 'https://cmm24.de/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cmm24.de/maschinen?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://cmm24.de/#faq',
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
      '@id': 'https://cmm24.de/#featured-listings',
      name: 'Aktuelle Angebote',
      itemListElement: mockListings
        .filter((l) => l.featured && l.status === 'active')
        .slice(0, 4)
        .map((listing, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: listing.title,
            description: listing.description.slice(0, 200),
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
              seller: {
                '@type': 'Organization',
                name: listing.seller?.companyName,
              },
            },
          },
        })),
    },
  ],
};

const featuredListings = mockListings.filter((l) => l.featured && l.status === 'active').slice(0, 4);

const trustFeatures = [
  {
    icon: CheckCircle,
    title: 'Geprüfte Inserate',
    description: 'Jedes Inserat wird auf Vollständigkeit geprüft.',
  },
  {
    icon: Shield,
    title: 'Sichere Zahlung',
    description: 'Sichere Transaktionen über bewährte Zahlungsanbieter.',
  },
  {
    icon: Lock,
    title: 'DSGVO-konform',
    description: 'Ihre Daten sind bei uns sicher und geschützt.',
  },
  {
    icon: MessageSquare,
    title: 'Direkter Kontakt',
    description: 'Kommunizieren Sie direkt mit Verkäufern.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col">
        {/* Hero Section - Full viewport height minus header */}
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-20">
          <div className="container-page relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                Der B2B-Marktplatz für Messtechnik
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
                Gebrauchte Messmaschinen{' '}
                <span className="text-primary">einfach finden & verkaufen</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl text-balance">
                Der führende Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. 
                Geprüfte Inserate, seriöse Händler, faire Preise.
              </p>

              {/* Search Bar with Autocomplete */}
              <div className="mt-10">
                <HeroSearch 
                  featuredManufacturers={manufacturers} 
                  recentListings={mockListings.filter(l => l.status === 'active')}
                />
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        </section>

        {/* Featured Listings */}
        <section className="py-16 md:py-24" aria-labelledby="featured-heading">
          <div className="container-page">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 id="featured-heading" className="text-2xl font-bold md:text-3xl">
                  Aktuelle Angebote
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Entdecken Sie unsere neuesten Maschinen
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/maschinen">
                  Alle anzeigen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showCompare={false} />
              ))}
            </div>
          </div>
        </section>

        {/* Manufacturers with Logos */}
        <section className="py-16 md:py-24" aria-labelledby="manufacturers-heading">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 id="manufacturers-heading" className="text-2xl font-bold md:text-3xl">
                Hersteller
              </h2>
              <p className="mt-2 text-muted-foreground">
                Maschinen aller führenden Hersteller
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
              {manufacturers.map((manufacturer) => (
                <Link
                  key={manufacturer.id}
                  href={`/hersteller/${manufacturer.slug}`}
                  className="group flex flex-col items-center justify-center rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  {/* Manufacturer Initial - logos would be added as actual files */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-2">
                    <span className="text-lg font-bold text-primary/80 group-hover:text-primary transition-colors">
                      {manufacturer.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-center">
                    {manufacturer.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {manufacturer.listingCount} Maschinen
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - für SEO */}
        <section className="bg-muted/30 py-16 md:py-24" aria-labelledby="faq-heading">
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <div className="text-center mb-12">
                <h2 id="faq-heading" className="text-2xl font-bold md:text-3xl">
                  Häufige Fragen
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Antworten auf die wichtigsten Fragen zu Koordinatenmessmaschinen
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
                    Alle Fragen ansehen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section with 4 Indicators */}
        <section className="border-t py-16 md:py-24" aria-labelledby="trust-heading">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 id="trust-heading" className="text-2xl font-bold md:text-3xl">
                Warum CMM24?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Der vertrauenswürdige Marktplatz für Messtechnik
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              {trustFeatures.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Social Proof */}
            <p className="mt-12 text-center text-muted-foreground">
              <span className="font-semibold text-foreground">Über 500 erfolgreiche Vermittlungen</span> seit 2024
            </p>
          </div>
        </section>

        {/* CTA Section for Sellers */}
        <section className="py-16 md:py-24 bg-muted/30" aria-labelledby="seller-cta-heading">
          <div className="container-page">
            <Card className="overflow-hidden bg-primary text-primary-foreground">
              <CardContent className="p-8 md:p-12">
                <div className="grid gap-8 md:grid-cols-2 md:items-center">
                  <div>
                    <h2 id="seller-cta-heading" className="text-2xl font-bold md:text-3xl">
                      Verkaufen Sie Ihre Messmaschine auf CMM24
                    </h2>
                    <p className="mt-4 text-primary-foreground/80">
                      Erreichen Sie qualifizierte Käufer in ganz Europa. 
                      Kostenlos starten mit einem Inserat.
                    </p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" aria-hidden="true" />
                        <span>Kostenlos starten</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" aria-hidden="true" />
                        <span>Geprüfte Anfragen</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" aria-hidden="true" />
                        <span>Kein Risiko</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-4 md:items-end">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/registrieren">
                        Jetzt inserieren
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="text-sm text-primary-foreground/70">
                      Keine Kreditkarte erforderlich
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
