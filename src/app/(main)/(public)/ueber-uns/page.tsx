import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Users, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers, stats } from '@/data/mock-data';

export const metadata: Metadata = {
  title: 'Über uns | CMM24 – Marktplatz für Koordinatenmessmaschinen',
  description: 'Lernen Sie CMM24 kennen: Wir sind der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. Unsere Mission, unser Team und unsere Werte.',
  openGraph: {
    title: 'Über CMM24 – Unser Team und unsere Mission',
    description: 'CMM24 verbindet Käufer und Verkäufer von Koordinatenmessmaschinen. Erfahren Sie mehr über unsere Vision und das Team dahinter.',
  },
};

// JSON-LD for About Page
const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'CMM24',
    description: 'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.',
    foundingDate: '2026',
    founders: teamMembers.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
    })),
  },
};

const values = [
  {
    icon: Target,
    title: 'Transparenz',
    description: 'Klare Preise, ehrliche Beschreibungen und geprüfte Inserate für informierte Entscheidungen.',
  },
  {
    icon: Users,
    title: 'Expertise',
    description: 'Tiefes Branchenwissen und persönlicher Service für Käufer und Verkäufer.',
  },
  {
    icon: Shield,
    title: 'Vertrauen',
    description: 'Verifizierte Verkäufer und qualitätsgeprüfte Angebote für sichere Transaktionen.',
  },
  {
    icon: Globe,
    title: 'Reichweite',
    description: 'Europaweites Netzwerk mit Maschinen und Händlern aus über 12 Ländern.',
  },
];

export default function UeberUnsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      
      <main>
        {/* Hero Section */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container-page">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Der Marktplatz für Messtechnik-Profis
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                CMM24 verbindet Käufer und Verkäufer von Koordinatenmessmaschinen in ganz Europa. 
                Wir machen den Gebrauchtmaschinenmarkt transparenter, effizienter und sicherer.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Unsere Mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Der Markt für gebrauchte Koordinatenmessmaschinen war lange Zeit intransparent und 
                  fragmentiert. Käufer mussten mühsam recherchieren, Verkäufer hatten Schwierigkeiten, 
                  die richtigen Interessenten zu finden.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  CMM24 ändert das. Wir haben eine spezialisierte Plattform geschaffen, die:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Angebot und Nachfrage effizient zusammenbringt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Transparenz bei Preisen und technischen Daten schafft</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Vertrauen durch geprüfte Inserate aufbaut</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Unsere Werte</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Diese Prinzipien leiten uns bei allem, was wir tun.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Das Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Menschen mit Leidenschaft für Messtechnik und Technologie.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-primary mb-2">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                        {member.linkedin && (
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                          >
                            LinkedIn →
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              Haben Sie Fragen?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Wir helfen Ihnen gerne weiter – ob Sie eine Maschine suchen, verkaufen möchten 
              oder einfach mehr über CMM24 erfahren wollen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/kontakt">Kontakt aufnehmen</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                <Link href="/faq">Häufige Fragen</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
