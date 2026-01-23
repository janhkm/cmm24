import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const faqCategories = [
  {
    title: 'Für Käufer',
    items: [
      {
        question: 'Wie finde ich die passende Messmaschine?',
        answer:
          'Nutzen Sie unsere umfangreichen Filteroptionen, um nach Hersteller, Messbereich, Preis und Standort zu suchen. Sie können bis zu 5 Maschinen direkt vergleichen, um die beste Wahl zu treffen.',
      },
      {
        question: 'Sind die Inserate geprüft?',
        answer:
          'Ja, jedes Inserat wird von unserem Team auf Vollständigkeit und Plausibilität geprüft, bevor es veröffentlicht wird. Achten Sie auf das "Geprüft"-Badge für zusätzliche Sicherheit.',
      },
      {
        question: 'Wie kontaktiere ich einen Verkäufer?',
        answer:
          'Über das Anfrageformular auf der Detailseite können Sie den Verkäufer direkt kontaktieren. Ihre Daten werden verschlüsselt übertragen und nur an den Verkäufer weitergegeben.',
      },
      {
        question: 'Gibt es eine Garantie auf die Maschinen?',
        answer:
          'CMM24 ist ein Marktplatz und vermittelt zwischen Käufer und Verkäufer. Garantien und Gewährleistungen werden direkt zwischen den Parteien vereinbart. Wir empfehlen, vor dem Kauf eine Besichtigung durchzuführen.',
      },
    ],
  },
  {
    title: 'Für Verkäufer',
    items: [
      {
        question: 'Was kostet das Inserieren?',
        answer:
          'Der Einstieg ist kostenlos! Mit dem Free-Plan können Sie ein aktives Inserat erstellen. Für mehr Inserate bieten wir Starter (3), Professional (7) und Business (10) Pläne ab 12,99 €/Monat.',
      },
      {
        question: 'Wie erstelle ich ein Inserat?',
        answer:
          'Nach der Registrierung führt Sie unser Wizard in 6 einfachen Schritten durch den Prozess: Stammdaten, Technische Daten, Standort, Beschreibung, Medien und Vorschau.',
      },
      {
        question: 'Wie lange dauert die Freigabe?',
        answer:
          'Wir prüfen neue Inserate in der Regel innerhalb von 24 Stunden. Sie werden per E-Mail benachrichtigt, sobald Ihr Inserat freigeschaltet wurde.',
      },
      {
        question: 'Kann ich mein Abo jederzeit kündigen?',
        answer:
          'Ja, Sie können Ihr Abo jederzeit kündigen. Es läuft dann bis zum Ende der bezahlten Periode weiter und wird nicht verlängert.',
      },
    ],
  },
  {
    title: 'Technisches',
    items: [
      {
        question: 'Welche Bildformate werden unterstützt?',
        answer:
          'Sie können Bilder in den Formaten JPG, PNG und WebP hochladen. Die maximale Dateigröße beträgt 10 MB pro Bild. Wir empfehlen mindestens 5 aussagekräftige Fotos.',
      },
      {
        question: 'Kann ich Dokumente hochladen?',
        answer:
          'Ja, Sie können PDF-Dokumente wie Datenblätter, Kalibrierzertifikate oder Wartungsprotokolle hinzufügen. Die maximale Dateigröße beträgt 25 MB pro Dokument.',
      },
      {
        question: 'Ist die Plattform DSGVO-konform?',
        answer:
          'Ja, CMM24 ist vollständig DSGVO-konform. Wir speichern nur notwendige Daten und geben diese nicht an Dritte weiter. Details finden Sie in unserer Datenschutzerklärung.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Startseite
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">FAQ</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold md:text-4xl">Häufig gestellte Fragen</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Finden Sie Antworten auf die häufigsten Fragen zu CMM24.
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category) => (
              <Card key={category.title}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="py-8 text-center">
              <h2 className="text-xl font-semibold">Noch Fragen?</h2>
              <p className="mt-2 text-muted-foreground">
                Unser Support-Team hilft Ihnen gerne weiter.
              </p>
              <Button asChild className="mt-4">
                <Link href="/kontakt">Kontakt aufnehmen</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
