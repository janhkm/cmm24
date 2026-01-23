import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, MoveHorizontal, Maximize, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryPages } from '@/data/mock-data';

export const metadata: Metadata = {
  title: 'Kategorien | Koordinatenmessmaschinen nach Bauart | CMM24',
  description: 'Finden Sie die passende Koordinatenmessmaschine nach Bauart: Portal-Messmaschinen, Ausleger-CMM, Horizontal-Arm, Gantry und optische Systeme. Alle Kategorien auf CMM24.',
  openGraph: {
    title: 'CMM-Kategorien – Messmaschinen nach Bauart',
    description: 'Portal, Ausleger, Gantry oder optisch? Finden Sie die richtige CMM-Kategorie für Ihre Anforderungen.',
  },
};

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  ArrowRightFromLine: MoveHorizontal,
  MoveHorizontal,
  Maximize,
  Eye,
};

export default function KategorienPage() {
  return (
    <main className="py-12 md:py-16">
      <div className="container-page">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">Kategorien</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Koordinatenmessmaschinen nach Kategorie
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Jede Bauart hat ihre Stärken. Finden Sie den CMM-Typ, der optimal zu Ihren 
            Messaufgaben und Werkstückgrößen passt.
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryPages.map((category) => {
            const IconComponent = iconMap[category.icon || 'Building2'] || Building2;
            
            return (
              <Link key={category.id} href={`/kategorien/${category.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">
                        {category.listingCount} Angebote
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <span className="inline-flex items-center text-primary text-sm font-medium">
                      Maschinen anzeigen
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <section className="mt-16 bg-muted/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Welche Bauart passt zu Ihnen?</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              Die Wahl der richtigen CMM-Bauart hängt von mehreren Faktoren ab:
            </p>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>Werkstückgröße:</strong> Für kleine bis mittlere Teile eignen sich 
                Portal-Maschinen, für sehr große Teile Gantry-Systeme.
              </li>
              <li>
                <strong>Zugänglichkeit:</strong> Ausleger-Maschinen bieten die beste Zugänglichkeit 
                von drei Seiten.
              </li>
              <li>
                <strong>Genauigkeit:</strong> Portal-Maschinen bieten in der Regel die höchste 
                Präzision durch ihre stabile Brückenkonstruktion.
              </li>
              <li>
                <strong>Werkstücktyp:</strong> Flache, großflächige Teile wie Karosserieteile 
                werden oft mit Horizontal-Arm-Maschinen gemessen.
              </li>
              <li>
                <strong>Empfindliche Oberflächen:</strong> Optische Systeme ermöglichen 
                berührungslose Messung.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
