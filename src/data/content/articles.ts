import type { Article } from '@/types';

export const articles: Article[] = [
  {
    id: '1',
    title: 'Koordinatenmessmaschine kaufen: Der ultimative Ratgeber 2026',
    slug: 'koordinatenmessmaschine-kaufen-ratgeber',
    excerpt: 'Alles, was Sie beim Kauf einer neuen oder gebrauchten Koordinatenmessmaschine beachten müssen. Von der Bedarfsanalyse über die Herstellerwahl bis zur Inbetriebnahme.',
    content: `
# Koordinatenmessmaschine kaufen: Der ultimative Ratgeber

Der Kauf einer Koordinatenmessmaschine ist eine bedeutende Investition. Dieser Ratgeber hilft Ihnen, die richtige Entscheidung zu treffen.

## 1. Bedarfsanalyse: Welche Anforderungen haben Sie?

Bevor Sie sich auf die Suche nach einer CMM begeben, sollten Sie Ihre Anforderungen klar definieren:

- **Messbereich**: Wie groß sind Ihre typischen Werkstücke?
- **Genauigkeit**: Welche Toleranzen müssen Sie einhalten?
- **Durchsatz**: Wie viele Teile müssen pro Schicht gemessen werden?
- **Umgebung**: Messraum oder fertigungsnahe Messung?

## 2. Neu oder gebraucht?

### Vorteile einer neuen Maschine:
- Aktuelle Technologie
- Volle Garantie
- Maßgeschneiderte Konfiguration

### Vorteile einer gebrauchten Maschine:
- Erhebliche Kostenersparnis (40-70%)
- Schnelle Verfügbarkeit
- Bewährte Technologie

## 3. Die wichtigsten Hersteller

| Hersteller | Stärken | Preissegment |
|------------|---------|--------------|
| Zeiss | Höchste Präzision, Calypso Software | Premium |
| Hexagon | Breites Portfolio, PC-DMIS | Premium-Mittel |
| Wenzel | Gutes Preis-Leistungs-Verhältnis | Mittel |
| Mitutoyo | Kompakte Maschinen, Japan-Qualität | Mittel |

## 4. Worauf beim Gebrauchtkauf achten?

1. **Kalibrierzertifikat**: Aktuell (max. 12 Monate alt)?
2. **Wartungshistorie**: Regelmäßige Wartung dokumentiert?
3. **Software-Lizenz**: Übertragbar?
4. **Besichtigung**: Maschine unter Last testen
5. **Transport**: Professioneller Spezialtransport eingeplant?

## Fazit

Der Kauf einer Koordinatenmessmaschine erfordert sorgfältige Planung. Auf CMM24 finden Sie geprüfte Angebote von verifizierten Händlern.
    `,
    category: 'kaufratgeber',
    author: {
      name: 'Jan Hemkemeier',
      role: 'Gründer CMM24',
    },
    publishedAt: '2026-01-15',
    updatedAt: '2026-01-20',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    tags: ['Kaufratgeber', 'CMM', 'Investition'],
  },
  {
    id: '2',
    title: 'Zeiss vs. Hexagon: Welcher Hersteller passt zu Ihnen?',
    slug: 'zeiss-vs-hexagon-vergleich',
    excerpt: 'Ein detaillierter Vergleich der beiden führenden CMM-Hersteller Zeiss und Hexagon. Technik, Software, Service und Preise im direkten Vergleich.',
    content: `
# Zeiss vs. Hexagon: Der große Vergleich

Zeiss und Hexagon sind die beiden größten Hersteller von Koordinatenmessmaschinen weltweit. Beide bieten exzellente Qualität, unterscheiden sich aber in wichtigen Aspekten.

## Hardware-Vergleich

### Zeiss
- Deutsche Ingenieurskunst
- Eigene Fertigung von Optik und Mechanik
- Bekannt für höchste Langzeitstabilität

### Hexagon
- Schwedisches Unternehmen mit globaler Präsenz
- Breites Portfolio durch Akquisitionen
- Innovation bei Scanning-Technologie

## Software

| Kriterium | Zeiss (Calypso) | Hexagon (PC-DMIS) |
|-----------|-----------------|-------------------|
| Benutzerfreundlichkeit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| CAD-Integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Marktverbreitung | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Offline-Programmierung | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Preise auf dem Gebrauchtmarkt

Basierend auf CMM24-Daten (Stand Januar 2026):

- **Zeiss Contura**: Ø 35.000 - 55.000 €
- **Hexagon Global**: Ø 28.000 - 48.000 €

## Fazit

Beide Hersteller bieten hervorragende Maschinen. Zeiss punktet bei Präzision und Software-Komfort, Hexagon bei Preis-Leistung und Flexibilität.
    `,
    category: 'vergleich',
    author: {
      name: 'Jan Hemkemeier',
      role: 'Gründer CMM24',
    },
    publishedAt: '2026-01-10',
    updatedAt: '2026-01-10',
    readingTime: 6,
    image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800',
    tags: ['Vergleich', 'Zeiss', 'Hexagon'],
  },
  {
    id: '3',
    title: 'CMM-Genauigkeit verstehen: MPEE, MPEp und mehr',
    slug: 'cmm-genauigkeit-mpee-erklaert',
    excerpt: 'Was bedeuten die Genauigkeitsangaben einer Koordinatenmessmaschine? Wir erklären MPEE, MPEp und wie Sie die richtige Genauigkeit für Ihre Anforderungen wählen.',
    content: `
# CMM-Genauigkeit verstehen

Die Genauigkeit ist das wichtigste Kriterium einer Koordinatenmessmaschine. Doch was bedeuten die Angaben wie "1.8 + L/350 µm"?

## MPEE - Längenmessabweichung

MPEE steht für "Maximum Permissible Error of Length Measurement". Die Formel besteht aus zwei Teilen:

- **Konstanter Anteil** (z.B. 1.8 µm): Basisabweichung
- **Längenabhängiger Anteil** (z.B. L/350): Zusätzliche Abweichung pro Messlänge

### Beispielrechnung

Bei MPEE = 1.8 + L/350 µm und einer Messlänge von 500 mm:
- 1.8 + 500/350 = 1.8 + 1.43 = **3.23 µm maximale Abweichung**

## Genauigkeitsklassen

| Klasse | MPEE | Anwendung |
|--------|------|-----------|
| Ultrapräzision | < 1 µm | Optik, Uhren |
| Hochgenau | 1-2 µm | Automotive A-Teile |
| Standard | 2-4 µm | Allgemeine QS |
| Werkstatt | > 4 µm | Fertigungsnah |

## Einflussfaktoren

1. **Temperatur**: 1°C Abweichung = mehrere µm Fehler
2. **Schwingungen**: Fundament und Umgebung
3. **Luftfeuchtigkeit**: Besonders bei optischen Systemen
4. **Wartungszustand**: Regelmäßige Kalibrierung wichtig
    `,
    category: 'technik',
    author: {
      name: 'Jan Hemkemeier',
      role: 'Gründer CMM24',
    },
    publishedAt: '2025-12-20',
    updatedAt: '2026-01-05',
    readingTime: 5,
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800',
    tags: ['Technik', 'Genauigkeit', 'MPEE'],
  },
];
