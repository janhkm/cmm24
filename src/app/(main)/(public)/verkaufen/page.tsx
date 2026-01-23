import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  TrendingUp, 
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Globe,
  Clock,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { stats } from '@/data/mock-data';

export const metadata: Metadata = {
  title: 'Messmaschine verkaufen | Jetzt inserieren auf CMM24',
  description: 'Verkaufen Sie Ihre gebrauchte Koordinatenmessmaschine auf CMM24. Erreichen Sie qualifizierte Käufer in ganz Europa. Kostenlos starten, keine Provision.',
  openGraph: {
    title: 'Messmaschine verkaufen auf CMM24',
    description: 'Der einfachste Weg, Ihre gebrauchte Koordinatenmessmaschine zu verkaufen. Starten Sie kostenlos.',
  },
};

const benefits = [
  {
    icon: Globe,
    title: 'Europaweite Reichweite',
    description: 'Erreichen Sie qualifizierte Käufer aus über 12 Ländern. Ihr Inserat wird in 30 Sprachen verfügbar sein.',
  },
  {
    icon: Shield,
    title: 'Geprüfte Anfragen',
    description: 'Keine Spam-Anfragen. Wir filtern und prüfen alle eingehenden Kontakte für Sie.',
  },
  {
    icon: TrendingUp,
    title: 'Keine Provision',
    description: 'CMM24 nimmt keine Provision auf erfolgreiche Verkäufe. Sie behalten 100% des Verkaufspreises.',
  },
  {
    icon: Clock,
    title: 'Schnell verkauft',
    description: 'Im Durchschnitt erhalten unsere Verkäufer die erste Anfrage innerhalb von 48 Stunden.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Registrieren',
    description: 'Erstellen Sie Ihr kostenloses Firmenkonto in nur 2 Minuten.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Inserat erstellen',
    description: 'Unser Assistent führt Sie durch alle Schritte. Bilder und Dokumente einfach hochladen.',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Anfragen erhalten',
    description: 'Qualifizierte Käufer kontaktieren Sie direkt über unser sicheres System.',
    icon: MessageSquare,
  },
  {
    number: '04',
    title: 'Erfolgreich verkaufen',
    description: 'Verhandeln Sie direkt und schließen Sie den Verkauf ab – ohne Provision.',
    icon: CheckCircle,
  },
];

const testimonials = [
  {
    quote: 'Innerhalb einer Woche hatte ich drei ernsthafte Anfragen. Der Verkauf war dann schnell abgeschlossen.',
    author: 'Michael H.',
    company: 'CMM-Trade GmbH',
    role: 'Geschäftsführer',
  },
  {
    quote: 'Endlich eine Plattform, die auf Messtechnik spezialisiert ist. Die Anfragen sind qualitativ hochwertig.',
    author: 'Sandra B.',
    company: 'Precision Parts AG',
    role: 'Vertriebsleiterin',
  },
  {
    quote: 'Einfach zu bedienen und professionell. Genau das, was der Markt gebraucht hat.',
    author: 'Thomas M.',
    company: 'Messtechnik Weber KG',
    role: 'Inhaber',
  },
];

const faqs = [
  {
    question: 'Was kostet es, ein Inserat zu erstellen?',
    answer: 'Sie können kostenlos mit einem aktiven Inserat starten. Für mehr Inserate bieten wir günstige Pakete ab 12,99 €/Monat an.',
  },
  {
    question: 'Nimmt CMM24 eine Provision?',
    answer: 'Nein, wir nehmen keine Provision auf erfolgreiche Verkäufe. Der vereinbarte Preis gehört Ihnen zu 100%.',
  },
  {
    question: 'Wie lange dauert die Freigabe meines Inserats?',
    answer: 'Wir prüfen jedes Inserat innerhalb von 24 Stunden. Bei vollständigen Angaben oft schon nach wenigen Stunden.',
  },
  {
    question: 'Wer kann auf CMM24 verkaufen?',
    answer: 'CMM24 ist ein B2B-Marktplatz. Verkäufer müssen ein Gewerbe nachweisen können.',
  },
];

export default function VerkaufenPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container-page relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
              <Star className="h-4 w-4 fill-primary" />
              Der führende Marktplatz für Messtechnik
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Verkaufen Sie Ihre Messmaschine <span className="text-primary">erfolgreich</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Erreichen Sie qualifizierte Käufer in ganz Europa. 
              Kostenlos starten, keine Provision, keine versteckten Gebühren.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/registrieren">
                  Jetzt inserieren
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/so-funktionierts">So funktioniert&apos;s</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-48 h-48 bg-primary rounded-full blur-2xl" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/30">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Warum auf CMM24 verkaufen?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Der spezialisierte Marktplatz für Koordinatenmessmaschinen bietet Ihnen 
              entscheidende Vorteile gegenüber allgemeinen Plattformen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              In 4 Schritten zum erfolgreichen Verkauf
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unser einfacher Prozess bringt Sie schnell ans Ziel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-border" />
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/registrieren">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Das sagen unsere Verkäufer
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Häufige Fragen
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Weitere Fragen? <Link href="/faq" className="text-primary hover:underline">Alle FAQ ansehen</Link> oder{' '}
              <Link href="/kontakt" className="text-primary hover:underline">Kontakt aufnehmen</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit, Ihre Maschine zu verkaufen?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Starten Sie jetzt kostenlos und erreichen Sie tausende potentielle 
              Käufer in ganz Europa.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/registrieren">
                Jetzt inserieren
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm opacity-70 mt-4">
              Keine Kreditkarte erforderlich • Erstes Inserat kostenlos
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
