import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { glossaryEntries } from '@/data/mock-data';

export const metadata: Metadata = {
  title: 'Glossar | Fachbegriffe Koordinatenmessmaschinen | CMM24',
  description: 'Das CMM24 Glossar erklärt alle wichtigen Fachbegriffe rund um Koordinatenmessmaschinen: MPEE, Tastkopf, Calypso, PC-DMIS und mehr. Verständlich und praxisnah.',
  openGraph: {
    title: 'CMM24 Glossar – Messtechnik-Begriffe erklärt',
    description: 'Von A bis Z: Alle Fachbegriffe rund um Koordinatenmessmaschinen verständlich erklärt.',
  },
};

// JSON-LD for Glossary
const glossarySchema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'CMM24 Glossar',
  description: 'Fachbegriffe rund um Koordinatenmessmaschinen',
  hasDefinedTerm: glossaryEntries.map((entry) => ({
    '@type': 'DefinedTerm',
    name: entry.term,
    description: entry.shortDefinition,
    url: `https://cmm24.de/glossar/${entry.slug}`,
  })),
};

export default function GlossarPage() {
  // Group entries by first letter
  const entriesByLetter = glossaryEntries.reduce((acc, entry) => {
    const firstLetter = entry.term[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(entry);
    return acc;
  }, {} as Record<string, typeof glossaryEntries>);

  // Get all letters that have entries
  const availableLetters = Object.keys(entriesByLetter).sort();

  // Alphabet for navigation
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
      />

      <main className="py-12 md:py-16">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Glossar</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Glossar
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Alle wichtigen Fachbegriffe rund um Koordinatenmessmaschinen – 
              verständlich erklärt. Von MPEE bis Calypso.
            </p>
          </header>

          {/* Search (placeholder - would need client component for functionality) */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Begriff suchen..." 
              className="pl-10"
              disabled
            />
          </div>

          {/* Alphabet Navigation */}
          <nav className="mb-8" aria-label="Alphabet-Navigation">
            <div className="flex flex-wrap gap-1">
              {alphabet.map((letter) => {
                const hasEntries = availableLetters.includes(letter);
                return hasEntries ? (
                  <a
                    key={letter}
                    href={`#${letter}`}
                    className="h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {letter}
                  </a>
                ) : (
                  <span
                    key={letter}
                    className="h-9 w-9 flex items-center justify-center rounded-md text-sm text-muted-foreground/50"
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </nav>

          {/* Glossary Entries */}
          <div className="space-y-12">
            {availableLetters.map((letter) => (
              <section key={letter} id={letter} className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-primary mb-6">{letter}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {entriesByLetter[letter].map((entry) => (
                    <Link key={entry.id} href={`/glossar/${entry.slug}`}>
                      <Card className="h-full hover:shadow-md hover:border-primary transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{entry.term}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.shortDefinition}
                          </p>
                          <span className="inline-flex items-center text-primary text-sm mt-3">
                            Mehr erfahren
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA Section */}
          <section className="mt-16 bg-muted/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Begriff nicht gefunden?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              In unserem Ratgeber finden Sie ausführliche Artikel zu allen Themen 
              rund um Koordinatenmessmaschinen.
            </p>
            <Button asChild>
              <Link href="/ratgeber">
                Zum Ratgeber
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}
