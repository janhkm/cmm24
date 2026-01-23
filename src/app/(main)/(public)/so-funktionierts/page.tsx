import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  Handshake,
  CheckCircle,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Building2,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'So funktioniert CMM24 | Koordinatenmessmaschinen kaufen & verkaufen',
  description: 'Erfahren Sie, wie CMM24 funktioniert: Maschinen suchen, Verkäufer kontaktieren und direkt verhandeln. Für Käufer und Verkäufer von Koordinatenmessmaschinen.',
  openGraph: {
    title: 'So funktioniert CMM24',
    description: 'Der einfache Weg zu Ihrer gebrauchten Koordinatenmessmaschine.',
  },
};

const buyerSteps = [
  {
    icon: Search,
    title: 'Suchen & Filtern',
    description: 'Nutzen Sie unsere umfangreichen Filter, um die perfekte Messmaschine zu finden. Filtern Sie nach Hersteller, Messbereich, Baujahr und mehr.',
  },
  {
    icon: FileText,
    title: 'Vergleichen & Prüfen',
    description: 'Vergleichen Sie bis zu 5 Maschinen direkt miteinander. Alle technischen Daten auf einen Blick – exportierbar als PDF.',
  },
  {
    icon: MessageSquare,
    title: 'Anfrage senden',
    description: 'Kontaktieren Sie den Verkäufer direkt über unser sicheres Anfrageformular. Keine versteckten Gebühren, kein Spam.',
  },
  {
    icon: Handshake,
    title: 'Direkt verhandeln',
    description: 'Verhandeln Sie den Preis und die Konditionen direkt mit dem Verkäufer. CMM24 nimmt keine Provision.',
  },
];

const sellerSteps = [
  {
    icon: Building2,
    title: 'Kostenlos registrieren',
    description: 'Erstellen Sie Ihr Firmenkonto in wenigen Minuten. Starten Sie mit einem kostenlosen Inserat.',
  },
  {
    icon: FileText,
    title: 'Inserat erstellen',
    description: 'Unser Schritt-für-Schritt-Assistent führt Sie durch den Prozess. Laden Sie Bilder und Dokumente hoch.',
  },
  {
    icon: CheckCircle,
    title: 'Qualitätsprüfung',
    description: 'Jedes Inserat wird von uns geprüft. So stellen wir sicher, dass nur seriöse Angebote veröffentlicht werden.',
  },
  {
    icon: MessageSquare,
    title: 'Anfragen erhalten',
    description: 'Erhalten Sie qualifizierte Anfragen direkt in Ihr Dashboard. Verwalten Sie Leads und steigern Sie Ihren Erfolg.',
  },
];

const benefits = [
  {
    icon: Shield,
    title: 'Geprüfte Inserate',
    description: 'Jedes Inserat wird vor Veröffentlichung von unserem Team geprüft.',
  },
  {
    icon: Clock,
    title: 'Schnelle Reaktionszeiten',
    description: 'Verkäufer antworten im Durchschnitt innerhalb von 24 Stunden.',
  },
  {
    icon: Users,
    title: 'B2B-Fokus',
    description: 'Spezialisiert auf Geschäftskunden aus der Messtechnik-Branche.',
  },
  {
    icon: CreditCard,
    title: 'Keine Provision',
    description: 'CMM24 nimmt keine Provision auf erfolgreiche Verkäufe.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '0 €',
    period: 'kostenlos',
    listings: '1 aktives Inserat',
    features: ['Unbegrenzt Entwürfe', 'E-Mail-Support', 'Basis-Statistiken'],
    cta: 'Kostenlos starten',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '12,99 €',
    period: '/ Monat',
    listings: '3 aktive Inserate',
    features: ['Alles aus Free', 'Prioritäts-Support', 'Erweiterte Statistiken', 'Lead-Management'],
    cta: 'Jetzt upgraden',
    highlighted: true,
  },
  {
    name: 'Professional',
    price: '21,99 €',
    period: '/ Monat',
    listings: '7 aktive Inserate',
    features: ['Alles aus Starter', 'Featured Listings', 'Vollständige Statistiken'],
    cta: 'Jetzt upgraden',
    highlighted: false,
  },
  {
    name: 'Business',
    price: '34,99 €',
    period: '/ Monat',
    listings: '10 aktive Inserate',
    features: ['Alles aus Professional', 'Premium-Support', 'API-Zugang'],
    cta: 'Kontakt aufnehmen',
    highlighted: false,
  },
];

export default function SoFunktioniertPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Startseite</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">So funktioniert&apos;s</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              So funktioniert CMM24
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Ob Sie eine Koordinatenmessmaschine suchen oder verkaufen möchten – 
              CMM24 macht den Prozess einfach, transparent und sicher.
            </p>
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Für Käufer
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Ihre Messmaschine in 4 Schritten
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Finden Sie die perfekte gebrauchte Koordinatenmessmaschine – schnell, 
            einfach und ohne versteckte Kosten.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {index < buyerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-8 h-0.5 bg-border" />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/maschinen">
                Maschinen durchsuchen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Für Verkäufer
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Verkaufen Sie Ihre Maschine erfolgreich
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Erreichen Sie qualifizierte Käufer in ganz Europa. 
            Starten Sie kostenlos mit Ihrem ersten Inserat.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellerSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {index < sellerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-8 h-0.5 bg-border" />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/registrieren">
                Jetzt inserieren
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Warum CMM24?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Der spezialisierte Marktplatz für Messtechnik-Profis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Transparente Preise für Verkäufer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Starten Sie kostenlos und upgraden Sie bei Bedarf. 
              Keine versteckten Gebühren, keine Provisionen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Beliebt
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm font-medium text-primary mt-2">{plan.listings}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/registrieren">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Alle Preise zzgl. MwSt. • Jährliche Zahlung: 2 Monate gratis
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit loszulegen?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Ob Käufer oder Verkäufer – starten Sie jetzt und werden Sie Teil 
              des führenden Marktplatzes für Koordinatenmessmaschinen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/maschinen">Maschinen durchsuchen</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/registrieren">Jetzt inserieren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
