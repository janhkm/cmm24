import type { FAQCategory } from '@/types';

export const faqCategories: FAQCategory[] = [
  {
    title: 'Allgemeine Fragen zu CMM24',
    items: [
      {
        question: 'Was ist CMM24?',
        answer: 'CMM24 ist der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. Wir verbinden Käufer und Verkäufer von Messtechnik und bieten geprüfte Inserate von verifizierten Händlern.',
      },
      {
        question: 'Ist CMM24 kostenlos?',
        answer: 'Die Suche und das Ansehen von Inseraten ist für Käufer komplett kostenlos. Verkäufer können mit dem Free-Plan ein Inserat kostenlos einstellen. Für mehr Inserate und erweiterte Funktionen bieten wir kostenpflichtige Pläne ab 99€/Monat.',
      },
      {
        question: 'Wie werden die Inserate geprüft?',
        answer: 'Jedes Inserat wird vor der Veröffentlichung von unserem Team geprüft. Wir kontrollieren die Vollständigkeit der Angaben, die Plausibilität der technischen Daten und die Qualität der Bilder. Bei Unstimmigkeiten kontaktieren wir den Verkäufer.',
      },
    ],
  },
  {
    title: 'Für Käufer',
    items: [
      {
        question: 'Wie kann ich eine Anfrage stellen?',
        answer: 'Auf jeder Inseratsseite finden Sie ein Anfrageformular. Geben Sie Ihre Kontaktdaten und Ihre Fragen ein, und wir leiten die Anfrage direkt an den Verkäufer weiter. Ihre Daten werden vertraulich behandelt.',
      },
      {
        question: 'Kann ich Maschinen besichtigen?',
        answer: 'Ja, wir empfehlen dringend eine Besichtigung vor dem Kauf. Vereinbaren Sie über das Anfrageformular oder telefonisch einen Termin beim Verkäufer. Viele Verkäufer bieten auch Testmessungen an.',
      },
      {
        question: 'Wer kümmert sich um den Transport?',
        answer: 'Der Transport wird direkt zwischen Käufer und Verkäufer vereinbart. Viele Verkäufer können den Transport organisieren oder Spediteure empfehlen, die auf Messtechnik spezialisiert sind.',
      },
    ],
  },
  {
    title: 'Für Verkäufer',
    items: [
      {
        question: 'Wie erstelle ich ein Inserat?',
        answer: 'Registrieren Sie sich kostenlos, wählen Sie Ihren Plan und folgen Sie unserem 5-Schritte-Wizard. Sie benötigen: Angaben zur Maschine, technische Daten, Standort, Beschreibung und mindestens 3 Fotos.',
      },
      {
        question: 'Welche Gebühren fallen an?',
        answer: 'CMM24 berechnet keine Verkaufsprovision. Sie zahlen nur die monatliche Gebühr Ihres gewählten Plans. Mit dem Free-Plan ist ein Inserat dauerhaft kostenlos.',
      },
      {
        question: 'Wie werde ich verifizierter Verkäufer?',
        answer: 'Zur Verifizierung benötigen wir einen Gewerbenachweis und eine kurze Prüfung Ihres Unternehmens. Verifizierte Verkäufer erhalten ein Vertrauens-Badge und erscheinen bevorzugt in den Suchergebnissen.',
      },
    ],
  },
  {
    title: 'Technische Fragen',
    items: [
      {
        question: 'Was bedeutet MPEE bei der Genauigkeit?',
        answer: 'MPEE (Maximum Permissible Error of Length Measurement) gibt die maximale Längenmessabweichung an. Die Formel (z.B. "1.8 + L/350 µm") besteht aus einer Basisabweichung und einem längenabhängigen Anteil.',
      },
      {
        question: 'Ist die Software im Preis enthalten?',
        answer: 'Das hängt vom Angebot ab. Bei den meisten Inseraten ist die Software (Lizenz) enthalten. Achten Sie auf die Beschreibung und fragen Sie nach, ob die Lizenz übertragbar ist und ob Updates verfügbar sind.',
      },
      {
        question: 'Wie wichtig ist das Kalibrierzertifikat?',
        answer: 'Sehr wichtig! Ein aktuelles Kalibrierzertifikat (max. 12 Monate alt) bestätigt die Genauigkeit der Maschine und ist oft Voraussetzung für ISO-zertifizierte Qualitätssicherung. Achten Sie darauf, dass es von einem akkreditierten Labor stammt.',
      },
    ],
  },
];
