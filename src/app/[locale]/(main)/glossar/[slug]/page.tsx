import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { glossaryEntries } from '@/data/content/glossary';

interface GlossarDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate static params for all glossary entries
export async function generateStaticParams() {
  return glossaryEntries.map((entry) => ({
    slug: entry.slug,
  }));
}

// Generate metadata dynamically
export async function generateMetadata({ params }: GlossarDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'glossaryPage' });
  const entry = glossaryEntries.find((e) => e.slug === slug);
  
  if (!entry) {
    return {
      title: t('notFoundTitle'),
    };
  }

  return {
    title: t('termTitle', { term: entry.term }),
    description: entry.shortDefinition,
    openGraph: {
      title: t('termOgTitle', { term: entry.term }),
      description: entry.shortDefinition,
      locale,
    },
  };
}

export default async function GlossarDetailPage({ params }: GlossarDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('glossaryPage');
  const tBreadcrumb = await getTranslations('breadcrumb');

  const entry = glossaryEntries.find((e) => e.slug === slug);

  if (!entry) {
    notFound();
  }

  // Get related terms
  const relatedEntries = entry.relatedTerms
    ? glossaryEntries.filter((e) => entry.relatedTerms?.includes(e.slug))
    : [];

  // Get see also entries
  const seeAlsoEntries = entry.seeAlso
    ? glossaryEntries.filter((e) => entry.seeAlso?.includes(e.slug))
    : [];

  // JSON-LD for Definition
  const definitionSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: entry.term,
    description: entry.fullDefinition,
    url: `https://cmm24.com/glossar/${entry.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'CMM24 Glossar',
      url: 'https://cmm24.com/glossar',
    },
  };

  // FAQ Schema for featured snippet potential
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: t('whatIs', { term: entry.term }),
        acceptedAnswer: {
          '@type': 'Answer',
          text: entry.shortDefinition,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="py-8 md:py-12">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">{tBreadcrumb('home')}</Link></li>
              <li>/</li>
              <li><Link href="/glossar" className="hover:text-foreground">{tBreadcrumb('glossary')}</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{entry.term}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/glossar">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToAll')}
            </Link>
          </Button>

          <article className="max-w-3xl">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary">{tBreadcrumb('glossary')}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {entry.term}
              </h1>
              
              {/* Short Definition - optimized for featured snippets */}
              <p className="text-xl text-muted-foreground border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r-lg">
                {entry.shortDefinition}
              </p>
            </header>

            {/* Full Definition */}
            <section className="prose prose-neutral dark:prose-invert max-w-none mb-12">
              <h2>{t('whatIs', { term: entry.term })}</h2>
              <p>{entry.fullDefinition}</p>
            </section>

            {/* Related Terms */}
            {relatedEntries.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">{t('relatedTerms')}</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedEntries.map((related) => (
                    <Button key={related.id} variant="outline" size="sm" asChild>
                      <Link href={`/glossar/${related.slug}`}>
                        {related.term}
                      </Link>
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {/* See Also */}
            {seeAlsoEntries.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">{t('seeAlso')}</h2>
                <div className="space-y-3">
                  {seeAlsoEntries.map((seeAlso) => (
                    <Link key={seeAlso.id} href={`/glossar/${seeAlso.slug}`}>
                      <Card className="hover:border-primary transition-colors">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{seeAlso.term}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {seeAlso.shortDefinition}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTA - Find Machines */}
            <section className="bg-primary text-primary-foreground rounded-xl p-6">
              <h3 className="text-lg font-bold mb-2">
                {t('onCmm24', { term: entry.term })}
              </h3>
              <p className="opacity-90 mb-4 text-sm">
                {t('findMachines')}
              </p>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/maschinen">
                  {t('discoverMachines')}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </section>
          </article>

          {/* Other Glossary Entries */}
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">{t('otherEntries')}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {glossaryEntries
                .filter((e) => e.id !== entry.id)
                .slice(0, 6)
                .map((other) => (
                  <Link key={other.id} href={`/glossar/${other.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{other.term}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {other.shortDefinition}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
