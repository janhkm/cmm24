# SEO-Strategie für CMM24

## Inhaltsverzeichnis

1. [Übersicht & Ziele](#1-übersicht--ziele)
2. [Keyword-Strategie](#2-keyword-strategie)
3. [URL-Struktur & Informationsarchitektur](#3-url-struktur--informationsarchitektur)
4. [Technisches SEO](#4-technisches-seo)
5. [On-Page SEO](#5-on-page-seo)
6. [Schema.org / Structured Data](#6-schemaorg--structured-data)
7. [Core Web Vitals & Performance](#7-core-web-vitals--performance)
8. [International SEO (hreflang)](#8-international-seo-hreflang)
9. [E-E-A-T Strategie](#9-e-e-a-t-strategie)
10. [Content-Strategie](#10-content-strategie)
11. [AEO (Answer Engine Optimization)](#11-aeo-answer-engine-optimization)
12. [GEO & LLM-Optimierung](#12-geo--llm-optimierung)
13. [Internal Linking](#13-internal-linking)
14. [Off-Page SEO & Backlinks](#14-off-page-seo--backlinks)
15. [Local SEO](#15-local-seo)
16. [Monitoring & Tools](#16-monitoring--tools)
17. [SEO-Checkliste für Launch](#17-seo-checkliste-für-launch)

---

## 1. Übersicht & Ziele

### 1.1 SEO-Vision

CMM24 soll die **autoritative Quelle** für alle Suchanfragen rund um gebrauchte Koordinatenmessmaschinen in Europa werden. Organischer Traffic ist der primäre Wachstumstreiber für einen B2B-Marktplatz.

### 1.2 Primäre SEO-Ziele

| Ziel | KPI | Zeithorizont |
|------|-----|--------------|
| Organische Sichtbarkeit aufbauen | Top 10 für 50 Keywords | 6 Monate |
| Domain Authority etablieren | DA 30+ | 12 Monate |
| Organischer Traffic | 5.000 Sessions/Monat | 6 Monate |
| Organischer Traffic | 20.000 Sessions/Monat | 12 Monate |
| Featured Snippets | 10+ Snippets | 12 Monate |
| AI/LLM Zitierungen | CMM24 als Quelle in AI-Antworten | 12 Monate |

### 1.3 Zielgruppen & Suchintention

| Zielgruppe | Suchintention | Beispiel-Query |
|------------|---------------|----------------|
| Käufer (informational) | Recherche | "koordinatenmessmaschine kaufen worauf achten" |
| Käufer (commercial) | Vergleich | "zeiss vs hexagon messmaschine" |
| Käufer (transactional) | Kauf | "gebrauchte zeiss contura kaufen" |
| Verkäufer | Verkauf | "messmaschine verkaufen" |
| Techniker | Fachwissen | "mpee genauigkeit erklärung" |

---

## 2. Keyword-Strategie

### 2.1 Keyword-Kategorien

#### A. Head Keywords (hohes Volumen, hohe Konkurrenz)

```
koordinatenmessmaschine kaufen          500-1000/Monat
messmaschine gebraucht                  200-500/Monat
3d messmaschine                         500-1000/Monat
cmm maschine                            100-200/Monat
```

#### B. Mid-Tail Keywords (mittleres Volumen)

```
gebrauchte koordinatenmessmaschine      100-200/Monat
zeiss messmaschine gebraucht            50-100/Monat
hexagon messmaschine kaufen             50-100/Monat
portal messmaschine                     50-100/Monat
messmaschine 3d preis                   50-100/Monat
```

#### C. Long-Tail Keywords (niedriges Volumen, hohe Conversion)

```
zeiss contura gebraucht kaufen          10-50/Monat
hexagon global s gebraucht              10-50/Monat
koordinatenmessmaschine messbereich 1000 mm   <10/Monat
messmaschine mit renishaw tastkopf      <10/Monat
cmm mit calypso software                <10/Monat
```

#### D. Hersteller-Keywords (pro Hersteller)

```
zeiss messmaschine
zeiss contura
zeiss accura
zeiss prismo
hexagon messmaschine
hexagon global
hexagon tigo
wenzel messmaschine
wenzel lh
mitutoyo messmaschine
mitutoyo crysta
```

#### E. Informational Keywords (für Content)

```
was ist eine koordinatenmessmaschine
wie funktioniert eine messmaschine
koordinatenmessmaschine genauigkeit
mpee erklärung
messmaschine kalibrierung
cmm software vergleich
```

### 2.2 Keyword-Mapping pro Seitentyp

| Seitentyp | Primäres Keyword | Sekundäre Keywords |
|-----------|------------------|-------------------|
| Startseite | koordinatenmessmaschine gebraucht | cmm marktplatz, messmaschine kaufen |
| Listing-Übersicht | gebrauchte koordinatenmessmaschinen | messmaschinen kaufen, cmm gebraucht |
| Hersteller-Seite (Zeiss) | zeiss messmaschine gebraucht | zeiss cmm, zeiss contura kaufen |
| Kategorie (Portal) | portal messmaschine gebraucht | portal cmm, brückenmessmaschine |
| Listing-Detail | [hersteller] [modell] gebraucht | [modell] kaufen, [modell] preis |
| Ratgeber | koordinatenmessmaschine kaufen ratgeber | cmm kaufberatung |
| Glossar | [begriff] erklärung | was ist [begriff] |

### 2.3 Keyword-Recherche Prozess

```
1. Seed Keywords definieren
   → "koordinatenmessmaschine", "messmaschine", "cmm"

2. Tools verwenden
   → Google Keyword Planner
   → Ahrefs / SEMrush
   → Google Search Console (nach Launch)
   → Google Suggest / People Also Ask

3. Konkurrenz analysieren
   → Welche Keywords ranken Wettbewerber?
   → Gaps identifizieren

4. Keywords clustern
   → Nach Suchintention
   → Nach Seitentyp

5. Priorisieren
   → Volumen × Relevanz × Machbarkeit
```

---

## 3. URL-Struktur & Informationsarchitektur

### 3.1 URL-Schema

```
Grundstruktur:
https://cmm24.com/{locale}/{content-type}/{slug}

Beispiele:
/de/                                    → Startseite (DE)
/en/                                    → Startseite (EN)

/de/maschinen                           → Listing-Übersicht
/de/maschinen/zeiss-contura-10-12-6-abc123  → Listing-Detail

/de/hersteller                          → Hersteller-Übersicht
/de/hersteller/zeiss                    → Zeiss-Seite
/de/hersteller/zeiss/portal             → Zeiss Portal-Maschinen

/de/kategorien/portal-messmaschinen     → Kategorie-Seite
/de/kategorien/ausleger-messmaschinen   → Kategorie-Seite

/de/ratgeber                            → Ratgeber-Übersicht
/de/ratgeber/messmaschine-kaufen        → Ratgeber-Artikel
/de/ratgeber/zeiss-vs-hexagon           → Vergleichs-Artikel

/de/glossar                             → Glossar-Übersicht
/de/glossar/mpee                        → Glossar-Eintrag

/de/ueber-uns                           → Über uns
/de/kontakt                             → Kontakt
/de/faq                                 → FAQ
```

### 3.2 URL Best Practices

```
✓ Lowercase nur
✓ Bindestriche statt Unterstriche
✓ Keine Sonderzeichen (ä→ae, ü→ue, ß→ss)
✓ Keine Session-IDs oder Parameter in URLs
✓ Max. 3-4 Verzeichnisebenen
✓ Sprechende URLs (keine IDs)
✓ Locale immer als erstes Segment

✗ NICHT: /de/maschinen?id=123&sort=price
✓ RICHTIG: /de/maschinen/zeiss-contura-10-12-6-abc123
```

### 3.3 Informationsarchitektur

```
CMM24.de
├── Startseite
│   ├── Hero + Suche
│   ├── Featured Listings
│   ├── Hersteller-Logos
│   └── Trust Signals
│
├── Maschinen (Listings)
│   ├── Übersicht mit Filter
│   ├── Nach Hersteller gefiltert
│   ├── Nach Kategorie gefiltert
│   └── Detail-Seiten
│
├── Hersteller
│   ├── Übersicht aller Hersteller
│   └── Einzelne Hersteller-Seiten
│       ├── Hersteller-Info
│       ├── Alle Maschinen
│       └── Nach Modell gefiltert
│
├── Kategorien
│   ├── Portal-Messmaschinen
│   ├── Ausleger-Messmaschinen
│   ├── Horizontal-Arm
│   ├── Gantry
│   └── Optische Systeme
│
├── Ratgeber (Content Hub)
│   ├── Kaufratgeber
│   ├── Vergleiche
│   ├── How-To Guides
│   └── Marktberichte
│
├── Glossar
│   └── A-Z Fachbegriffe
│
├── Unternehmen
│   ├── Über uns
│   ├── Kontakt
│   ├── FAQ
│   └── Presse
│
└── Legal
    ├── Impressum
    ├── Datenschutz
    ├── AGB
    └── Cookie-Richtlinie
```

### 3.4 Crawl Depth

```
Ziel: Jede wichtige Seite in max. 3 Klicks erreichbar

Startseite (Level 0)
    ↓
Listing-Übersicht / Hersteller-Übersicht (Level 1)
    ↓
Gefilterte Ansicht / Hersteller-Seite (Level 2)
    ↓
Listing-Detail / Modell-Seite (Level 3)
```

---

## 4. Technisches SEO

### 4.1 Crawling & Indexierung

#### robots.txt

```
# robots.txt für CMM24

User-agent: *
Allow: /

# Geschützte Bereiche blockieren
Disallow: /seller/
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

# Suchergebnisse mit Parametern
Disallow: /*?*sortierung=
Disallow: /*?*seite=1$
Disallow: /*?*q=

# Vermeidung von Duplicate Content bei Filtern
# Erlauben: Hauptfilter (Hersteller)
Allow: /*?hersteller=
# Blockieren: Kombinierte Filter
Disallow: /*?*&*&*&*

# Preview/Draft URLs
Disallow: /*?preview=
Disallow: /*?draft=

# Auth-Seiten
Disallow: /*/login
Disallow: /*/registrieren
Disallow: /*/passwort-vergessen

# Sitemaps
Sitemap: https://cmm24.com/sitemap.xml
```

#### Meta Robots Tags

```html
<!-- Standard (indexierbar) -->
<meta name="robots" content="index, follow">

<!-- Listing-Übersicht mit Filtern -->
<!-- Wenn 1-2 Filter: index, follow -->
<!-- Wenn 3+ Filter: noindex, follow -->
<meta name="robots" content="noindex, follow">

<!-- Seller Portal -->
<meta name="robots" content="noindex, nofollow">

<!-- Pagination Seite 2+ (optional) -->
<meta name="robots" content="index, follow">
<!-- ODER für thin content: -->
<meta name="robots" content="noindex, follow">

<!-- Verkaufte Inserate (30 Tage Übergang) -->
<meta name="robots" content="noindex, follow">
<!-- Nach 30 Tagen: 410 Gone -->
```

### 4.2 XML Sitemaps

#### Sitemap-Index

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://cmm24.com/sitemap-static.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://cmm24.com/sitemap-listings-1.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://cmm24.com/sitemap-listings-2.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://cmm24.com/sitemap-manufacturers.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://cmm24.com/sitemap-content.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
</sitemapindex>
```

#### Sitemap für Listings

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123</loc>
    <lastmod>2026-01-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <!-- hreflang für alle Sprachen -->
    <xhtml:link rel="alternate" hreflang="de" href="https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://cmm24.com/en/machines/zeiss-contura-10-12-6-abc123"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://cmm24.com/fr/machines/zeiss-contura-10-12-6-abc123"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123"/>
    <!-- Bilder -->
    <image:image>
      <image:loc>https://cmm24.com/images/listings/abc123/main.jpg</image:loc>
      <image:title>Zeiss Contura 10/12/6 Koordinatenmessmaschine</image:title>
    </image:image>
  </url>
</urlset>
```

#### Sitemap-Regeln

```
- Max. 50.000 URLs pro Sitemap-Datei
- Max. 50 MB pro Datei
- Nur indexierbare URLs (keine noindex)
- Nur kanonische URLs
- Tägliche Aktualisierung für Listings
- lastmod nur bei echten Änderungen setzen
- Bilder in Image Sitemap inkludieren
- hreflang in Sitemap ODER im HTML (nicht beides)
```

### 4.3 Canonical Tags

#### Implementierung

```html
<!-- Jede Seite braucht einen Canonical -->
<link rel="canonical" href="https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123" />

<!-- Regel: Canonical zeigt auf sich selbst ODER auf die Hauptversion -->
```

#### Szenarien

```
Szenario 1: Listing-Detail
Canonical: Die eigene URL
/de/maschinen/zeiss-contura → canonical auf /de/maschinen/zeiss-contura

Szenario 2: Listing-Übersicht ohne Filter
Canonical: Die eigene URL
/de/maschinen → canonical auf /de/maschinen

Szenario 3: Listing-Übersicht mit Filter
Canonical: Auf sich selbst (Filter sind unique content)
/de/maschinen?hersteller=zeiss → canonical auf /de/maschinen?hersteller=zeiss
ABER: Bei 3+ Filtern noindex setzen

Szenario 4: Pagination
Canonical: Auf sich selbst (jede Seite ist unique)
/de/maschinen?seite=2 → canonical auf /de/maschinen?seite=2

Szenario 5: Sortierung
Canonical: Auf Version ohne Sortierung
/de/maschinen?sortierung=preis → canonical auf /de/maschinen

Szenario 6: Trailing Slashes
Canonical: Immer OHNE trailing slash
/de/maschinen/ → canonical auf /de/maschinen
```

### 4.4 Redirects

#### Redirect-Strategie

```
301 Permanent Redirect:
- URL-Änderungen
- Verkaufte Inserate → ähnliche Maschinen oder Hersteller-Seite
- Alte Domain → neue Domain
- HTTP → HTTPS
- www → non-www (oder umgekehrt)

302 Temporary Redirect:
- A/B Tests
- Temporäre Weiterleitungen (z.B. Wartung)

410 Gone:
- Gelöschte Inserate nach 30 Tagen
- Entfernte Inhalte ohne Ersatz
```

#### Redirect-Regeln

```javascript
// next.config.js

module.exports = {
  async redirects() {
    return [
      // Trailing Slash entfernen
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // www zu non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.cmm24.com' }],
        destination: 'https://cmm24.com/:path*',
        permanent: true,
      },
      // Alte URL-Struktur
      {
        source: '/listings/:id',
        destination: '/de/maschinen/:id',
        permanent: true,
      },
      // Sprachweiterleitung ohne Locale
      {
        source: '/maschinen/:path*',
        destination: '/de/maschinen/:path*',
        permanent: true,
      },
    ];
  },
};
```

### 4.5 HTTPS & Security

```
✓ HTTPS auf allen Seiten (Vercel automatisch)
✓ HSTS Header aktivieren
✓ Keine Mixed Content Warnings
✓ Gültiges SSL-Zertifikat
✓ HTTP → HTTPS Redirect
```

#### Security Headers

```javascript
// next.config.js headers

{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
},
{
  key: 'X-Frame-Options',
  value: 'DENY'
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
}
```

### 4.6 Mobile SEO

```
✓ Mobile-First Indexing (Google indexiert Mobile-Version)
✓ Responsive Design (keine separate Mobile-Site)
✓ Viewport Meta Tag
✓ Keine Interstitials (außer Cookie-Banner)
✓ Touch-Targets min. 48x48px
✓ Lesbare Schriftgröße (min. 16px)
✓ Kein horizontales Scrollen
```

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

## 5. On-Page SEO

### 5.1 Title Tags

#### Struktur & Regeln

```
Länge: 50-60 Zeichen (max. 600px Pixel-Breite)
Format: Primäres Keyword | Sekundäres Keyword | Brand
Position: Primäres Keyword möglichst am Anfang
```

#### Title Templates

```
Startseite:
"Gebrauchte Koordinatenmessmaschinen kaufen | CMM24"

Listing-Übersicht:
"Gebrauchte Koordinatenmessmaschinen | {Anzahl}+ Angebote | CMM24"

Listing-Übersicht mit Filter (Hersteller):
"Gebrauchte {Hersteller} Messmaschinen | {Anzahl} Angebote | CMM24"
→ "Gebrauchte Zeiss Messmaschinen | 45 Angebote | CMM24"

Listing-Übersicht mit Filter (Kategorie):
"Gebrauchte {Kategorie} | {Anzahl} Angebote | CMM24"
→ "Gebrauchte Portal-Messmaschinen | 78 Angebote | CMM24"

Listing-Detail:
"{Hersteller} {Modell} gebraucht | {Preis} € | CMM24"
→ "Zeiss Contura 10/12/6 gebraucht | 45.000 € | CMM24"

Hersteller-Übersicht:
"Messmaschinen-Hersteller | Zeiss, Hexagon, Wenzel & mehr | CMM24"

Hersteller-Detail:
"Gebrauchte {Hersteller} Koordinatenmessmaschinen | CMM24"
→ "Gebrauchte Zeiss Koordinatenmessmaschinen | CMM24"

Ratgeber-Artikel:
"{Titel} | Ratgeber | CMM24"
→ "Koordinatenmessmaschine kaufen: Darauf müssen Sie achten | Ratgeber | CMM24"

Glossar-Eintrag:
"{Begriff}: Definition & Erklärung | CMM24 Glossar"
→ "MPEE: Definition & Erklärung | CMM24 Glossar"

FAQ:
"Häufige Fragen zu Koordinatenmessmaschinen | CMM24 FAQ"
```

### 5.2 Meta Descriptions

#### Struktur & Regeln

```
Länge: 150-160 Zeichen (max. 960px Pixel-Breite)
Inhalt: Zusammenfassung + Call-to-Action
Elemente: ✓ Checkmarks, € Preise, → Pfeile für CTR
Unique: Jede Seite braucht eine einzigartige Description
```

#### Meta Description Templates

```
Startseite:
"Der B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen. ✓ Geprüfte Inserate ✓ Zeiss, Hexagon, Wenzel ✓ Europaweit. Jetzt Maschine finden!"

Listing-Übersicht:
"Finden Sie {Anzahl}+ gebrauchte Koordinatenmessmaschinen. ✓ Geprüfte Angebote ✓ Direkt vom Händler ✓ Faire Preise. Jetzt vergleichen!"

Listing-Übersicht mit Filter:
"{Anzahl} gebrauchte {Hersteller} Messmaschinen auf CMM24. ✓ Alle Modelle ✓ Geprüfte Händler ✓ Preise ab {Min-Preis} €. Jetzt entdecken!"
→ "45 gebrauchte Zeiss Messmaschinen auf CMM24. ✓ Alle Modelle ✓ Geprüfte Händler ✓ Preise ab 15.000 €. Jetzt entdecken!"

Listing-Detail:
"✓ {Hersteller} {Modell} Bj. {Jahr} ✓ Messbereich {X}×{Y}×{Z} mm ✓ {Zustand} ✓ {Stadt}, {Land}. Jetzt anfragen!"
→ "✓ Zeiss Contura 10/12/6 Bj. 2019 ✓ Messbereich 1000×1200×600 mm ✓ Sehr gut ✓ München, DE. Jetzt anfragen!"

Hersteller-Seite:
"Gebrauchte {Hersteller} Messmaschinen kaufen. {Anzahl} Angebote: {Modell 1}, {Modell 2}, {Modell 3}. ✓ Geprüfte Händler ✓ Faire Preise."
→ "Gebrauchte Zeiss Messmaschinen kaufen. 45 Angebote: Contura, Accura, Prismo. ✓ Geprüfte Händler ✓ Faire Preise."

Ratgeber:
"{Kurze Zusammenfassung des Artikels in 150-160 Zeichen}. Jetzt lesen!"

Glossar:
"{Begriff}: {Kurze Definition}. ✓ Einfach erklärt ✓ Mit Beispielen. Mehr im CMM24 Glossar."
```

### 5.3 Heading-Struktur

#### H1-H6 Hierarchie

```html
<!-- Jede Seite hat genau EINE H1 -->
<h1>Gebrauchte Zeiss Koordinatenmessmaschinen</h1>

<!-- H2 für Hauptabschnitte -->
<h2>Aktuelle Angebote</h2>
<h2>Beliebte Zeiss Modelle</h2>
<h2>Über Zeiss Messtechnik</h2>

<!-- H3 für Unterabschnitte -->
<h3>Zeiss Contura Serie</h3>
<h3>Zeiss Accura Serie</h3>

<!-- H4-H6 für weitere Unterteilungen -->
<h4>Technische Details</h4>
```

#### H1 Templates

```
Startseite:
<h1>Gebrauchte Koordinatenmessmaschinen kaufen & verkaufen</h1>

Listing-Übersicht:
<h1>Gebrauchte Koordinatenmessmaschinen</h1>

Listing-Übersicht mit Filter:
<h1>Gebrauchte {Hersteller} Messmaschinen</h1>
<h1>Gebrauchte {Kategorie}</h1>

Listing-Detail:
<h1>{Hersteller} {Modell}</h1>
→ <h1>Zeiss Contura 10/12/6</h1>

Hersteller-Seite:
<h1>Gebrauchte {Hersteller} Koordinatenmessmaschinen</h1>

Ratgeber:
<h1>{Artikel-Titel}</h1>
→ <h1>Koordinatenmessmaschine kaufen: Der ultimative Ratgeber</h1>

Glossar:
<h1>{Begriff}: Definition und Erklärung</h1>
→ <h1>MPEE: Definition und Erklärung</h1>
```

### 5.4 Bilder-SEO

#### Alt-Tags

```
Format: Beschreibender Text mit Keyword (wenn relevant)
Länge: Max. 125 Zeichen

Listing-Bilder:
alt="{Hersteller} {Modell} Koordinatenmessmaschine - {Perspektive/Detail}"
→ alt="Zeiss Contura 10/12/6 Koordinatenmessmaschine - Frontansicht"
→ alt="Zeiss Contura Tasterkopf VAST XXT Nahaufnahme"

Hersteller-Logos:
alt="{Hersteller} Logo"
→ alt="Zeiss Logo"

Icons/Decorative:
alt="" (leer für dekorative Bilder)
```

#### Dateinamen

```
Format: keyword-beschreibung.jpg
Keine: Leerzeichen, Sonderzeichen, Großbuchstaben

✓ zeiss-contura-10-12-6-frontansicht.jpg
✓ hexagon-global-messbereich.jpg
✗ IMG_20260121_123456.jpg
✗ Bild 1.jpg
```

#### Bildformate & Größen

```
Format: WebP mit JPEG-Fallback
Kompression: 80-85% Qualität
Max. Größe: 200KB für Listings, 100KB für Thumbnails

Responsive Images:
srcset="
  /images/listing-sm.webp 400w,
  /images/listing-md.webp 800w,
  /images/listing-lg.webp 1200w
"
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

### 5.5 Content-Optimierung

#### Keyword-Platzierung

```
1. Title Tag (wichtigste Position)
2. H1 Überschrift
3. Erster Absatz / erste 100 Wörter
4. H2/H3 Überschriften (natürlich einbauen)
5. Alt-Tags (bei relevanten Bildern)
6. URL (Slug)
7. Meta Description (kein Ranking-Faktor, aber CTR)
```

#### Content-Länge

```
Listing-Detail: 300-500 Wörter (Beschreibung + Specs)
Hersteller-Seite: 500-1000 Wörter (Über Hersteller + Modelle)
Ratgeber-Artikel: 1500-3000 Wörter (umfassend)
Glossar-Eintrag: 300-600 Wörter (Definition + Beispiele)
Kategorie-Seite: 300-500 Wörter (Einleitung + Listings)
```

---

## 6. Schema.org / Structured Data

### 6.1 Implementierung

```
Methode: JSON-LD (empfohlen von Google)
Position: Im <head> oder am Ende von <body>
Validierung: Google Rich Results Test + Schema.org Validator
```

### 6.2 Website Schema (Global)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://cmm24.com/#website",
  "name": "CMM24",
  "alternateName": "CMM24 - Marktplatz für Koordinatenmessmaschinen",
  "url": "https://cmm24.com",
  "description": "Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.",
  "inLanguage": ["de", "en", "fr", "nl", "it", "es", "pl"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://cmm24.com/de/maschinen?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 6.3 Organization Schema (Global)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://cmm24.com/#organization",
  "name": "CMM24",
  "legalName": "CMM24 GmbH",
  "url": "https://cmm24.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://cmm24.com/logo.png",
    "width": 600,
    "height": 60
  },
  "image": "https://cmm24.com/og-image.jpg",
  "description": "CMM24 ist der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. Wir verbinden Käufer und Verkäufer von Messtechnik.",
  "foundingDate": "2026",
  "founders": [
    {
      "@type": "Person",
      "name": "Jan Hemkemeier"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Musterstraße 1",
    "addressLocality": "München",
    "postalCode": "80331",
    "addressCountry": "DE"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "kontakt@cmm24.com",
      "availableLanguage": ["German", "English"]
    }
  ],
  "sameAs": [
    "https://www.linkedin.com/company/cmm24",
    "https://twitter.com/cmm24"
  ]
}
```

### 6.4 Product Schema (Listing-Detail)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123#product",
  "name": "Zeiss Contura 10/12/6",
  "description": "Gebrauchte Koordinatenmessmaschine Zeiss Contura 10/12/6, Baujahr 2019, in sehr gutem Zustand. Messbereich 1000 x 1200 x 600 mm, Genauigkeit MPEE 1.8 + L/350 µm. Inklusive Software Calypso 6.8 und Tasterkopf VAST XXT.",
  "image": [
    "https://cmm24.com/images/listings/abc123/1.jpg",
    "https://cmm24.com/images/listings/abc123/2.jpg",
    "https://cmm24.com/images/listings/abc123/3.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "Zeiss",
    "@id": "https://cmm24.com/de/hersteller/zeiss#brand"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "Carl Zeiss Industrielle Messtechnik GmbH",
    "url": "https://www.zeiss.de/messtechnik"
  },
  "model": "Contura 10/12/6",
  "productionDate": "2019",
  "releaseDate": "2019",
  "category": "Koordinatenmessmaschinen > Portal-Messmaschinen",
  "sku": "CMM24-ABC123",
  "mpn": "CONTURA-10-12-6",
  "itemCondition": "https://schema.org/UsedCondition",
  "offers": {
    "@type": "Offer",
    "@id": "https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123#offer",
    "url": "https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123",
    "priceCurrency": "EUR",
    "price": "45000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/UsedCondition",
    "seller": {
      "@type": "Organization",
      "name": "CMM-Trade GmbH",
      "url": "https://cmm24.com/de/verkaeufer/cmm-trade",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "München",
        "addressCountry": "DE"
      }
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": ["DE", "AT", "CH"]
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 5,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 3,
          "maxValue": 14,
          "unitCode": "DAY"
        }
      }
    }
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Messbereich X",
      "value": "1000",
      "unitCode": "MMT",
      "unitText": "mm"
    },
    {
      "@type": "PropertyValue",
      "name": "Messbereich Y",
      "value": "1200",
      "unitCode": "MMT",
      "unitText": "mm"
    },
    {
      "@type": "PropertyValue",
      "name": "Messbereich Z",
      "value": "600",
      "unitCode": "MMT",
      "unitText": "mm"
    },
    {
      "@type": "PropertyValue",
      "name": "Genauigkeit (MPEE)",
      "value": "1.8 + L/350 µm"
    },
    {
      "@type": "PropertyValue",
      "name": "Software",
      "value": "Calypso 6.8"
    },
    {
      "@type": "PropertyValue",
      "name": "Steuerung",
      "value": "C99"
    },
    {
      "@type": "PropertyValue",
      "name": "Tastsystem",
      "value": "VAST XXT"
    },
    {
      "@type": "PropertyValue",
      "name": "Baujahr",
      "value": "2019"
    },
    {
      "@type": "PropertyValue",
      "name": "Zustand",
      "value": "Sehr gut"
    }
  ]
}
```

### 6.5 ItemList Schema (Listing-Übersicht)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Gebrauchte Koordinatenmessmaschinen",
  "description": "Liste aller verfügbaren gebrauchten Koordinatenmessmaschinen auf CMM24",
  "numberOfItems": 123,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Zeiss Contura 10/12/6",
        "url": "https://cmm24.com/de/maschinen/zeiss-contura-10-12-6-abc123",
        "image": "https://cmm24.com/images/listings/abc123/thumb.jpg",
        "offers": {
          "@type": "Offer",
          "price": "45000",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Product",
        "name": "Hexagon Global S 9.15.9",
        "url": "https://cmm24.com/de/maschinen/hexagon-global-s-def456",
        "image": "https://cmm24.com/images/listings/def456/thumb.jpg",
        "offers": {
          "@type": "Offer",
          "price": "38000",
          "priceCurrency": "EUR"
        }
      }
    }
  ]
}
```

### 6.6 BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Startseite",
      "item": "https://cmm24.com/de"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Maschinen",
      "item": "https://cmm24.com/de/maschinen"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Zeiss",
      "item": "https://cmm24.com/de/maschinen?hersteller=zeiss"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Zeiss Contura 10/12/6"
    }
  ]
}
```

### 6.7 FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was kostet eine gebrauchte Koordinatenmessmaschine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Der Preis für eine gebrauchte Koordinatenmessmaschine liegt typischerweise zwischen 10.000 € und 150.000 €, abhängig von Hersteller, Alter, Messbereich und Zustand. Zeiss Maschinen kosten im Durchschnitt 40.000-80.000 €, Hexagon 30.000-70.000 €. Auf CMM24 finden Sie aktuelle Marktpreise."
      }
    },
    {
      "@type": "Question",
      "name": "Welche Hersteller von Koordinatenmessmaschinen gibt es?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die führenden Hersteller von Koordinatenmessmaschinen sind: Zeiss (Deutschland), Hexagon (Schweden), Wenzel (Deutschland), Mitutoyo (Japan), Coord3 (Italien), LK Metrology (UK), Nikon Metrology (Japan) und Aberlink (UK). Auf CMM24 finden Sie Maschinen aller großen Hersteller."
      }
    },
    {
      "@type": "Question",
      "name": "Sind die Inserate auf CMM24 geprüft?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, alle Inserate auf CMM24 werden vor der Veröffentlichung von unserem Team geprüft. Wir kontrollieren die Vollständigkeit der Angaben, die Plausibilität der technischen Daten und die Qualität der Bilder. Zusätzlich können Verkäufer ihren Account verifizieren lassen."
      }
    }
  ]
}
```

### 6.8 HowTo Schema (Ratgeber)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Koordinatenmessmaschine kaufen: Schritt-für-Schritt Anleitung",
  "description": "So finden und kaufen Sie die richtige gebrauchte Koordinatenmessmaschine für Ihr Unternehmen.",
  "image": "https://cmm24.com/images/ratgeber/cmm-kaufen.jpg",
  "totalTime": "P1D",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": "10000-150000"
  },
  "step": [
    {
      "@type": "HowToStep",
      "name": "Anforderungen definieren",
      "text": "Bestimmen Sie den benötigten Messbereich, die erforderliche Genauigkeit und die gewünschte Software.",
      "image": "https://cmm24.com/images/ratgeber/step1.jpg",
      "url": "https://cmm24.com/de/ratgeber/messmaschine-kaufen#anforderungen"
    },
    {
      "@type": "HowToStep",
      "name": "Angebote vergleichen",
      "text": "Nutzen Sie die Filter auf CMM24, um passende Maschinen zu finden und die Vergleichsfunktion für bis zu 5 Maschinen.",
      "image": "https://cmm24.com/images/ratgeber/step2.jpg",
      "url": "https://cmm24.com/de/ratgeber/messmaschine-kaufen#vergleichen"
    },
    {
      "@type": "HowToStep",
      "name": "Verkäufer kontaktieren",
      "text": "Senden Sie eine Anfrage über CMM24. Fragen Sie nach dem Kalibrierprotokoll, der Wartungshistorie und einem Termin zur Besichtigung.",
      "image": "https://cmm24.com/images/ratgeber/step3.jpg",
      "url": "https://cmm24.com/de/ratgeber/messmaschine-kaufen#kontakt"
    },
    {
      "@type": "HowToStep",
      "name": "Maschine besichtigen und testen",
      "text": "Vereinbaren Sie einen Termin beim Verkäufer, um die Maschine vor Ort zu prüfen und Testmessungen durchzuführen.",
      "image": "https://cmm24.com/images/ratgeber/step4.jpg",
      "url": "https://cmm24.com/de/ratgeber/messmaschine-kaufen#besichtigung"
    },
    {
      "@type": "HowToStep",
      "name": "Kaufvertrag abschließen",
      "text": "Verhandeln Sie den Preis, klären Sie Transport und Installation, und schließen Sie den Kaufvertrag ab.",
      "image": "https://cmm24.com/images/ratgeber/step5.jpg",
      "url": "https://cmm24.com/de/ratgeber/messmaschine-kaufen#kauf"
    }
  ]
}
```

### 6.9 LocalBusiness Schema (für Verkäufer-Profile)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://cmm24.com/de/verkaeufer/cmm-trade#business",
  "name": "CMM-Trade GmbH",
  "description": "Spezialist für gebrauchte Koordinatenmessmaschinen. Verkauf, Wartung und Service.",
  "url": "https://cmm24.com/de/verkaeufer/cmm-trade",
  "image": "https://cmm24.com/images/verkaeufer/cmm-trade-logo.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Industriestraße 10",
    "addressLocality": "München",
    "postalCode": "80339",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 48.1351,
    "longitude": 11.5820
  },
  "telephone": "+49-89-123456",
  "email": "info@cmm-trade.de",
  "priceRange": "€€€",
  "makesOffer": {
    "@type": "Offer",
    "itemOffered": {
      "@type": "Product",
      "name": "Gebrauchte Koordinatenmessmaschinen"
    }
  }
}
```

### 6.10 Schema Validierung

```
Tools zur Validierung:

1. Google Rich Results Test
   https://search.google.com/test/rich-results

2. Schema.org Validator
   https://validator.schema.org/

3. Google Search Console
   → Verbesserungen → Rich-Suchergebnisse

Regeln:
✓ Keine Syntaxfehler
✓ Alle required Properties vorhanden
✓ Korrekte Datentypen
✓ URLs erreichbar
✓ Konsistent mit sichtbarem Content
```

---

## 7. Core Web Vitals & Performance

### 7.1 Metriken & Ziele

| Metrik | Beschreibung | Ziel (Gut) | Ziel CMM24 |
|--------|--------------|------------|------------|
| **LCP** | Largest Contentful Paint | < 2.5s | < 2.0s |
| **FID** | First Input Delay | < 100ms | < 50ms |
| **INP** | Interaction to Next Paint | < 200ms | < 150ms |
| **CLS** | Cumulative Layout Shift | < 0.1 | < 0.05 |
| **TTFB** | Time to First Byte | < 800ms | < 400ms |
| **FCP** | First Contentful Paint | < 1.8s | < 1.5s |

### 7.2 LCP Optimierung

```
LCP-Elemente auf CMM24:
- Startseite: Hero-Bild oder H1
- Listing-Übersicht: Erste Listing-Card
- Listing-Detail: Hauptbild der Maschine

Optimierungen:

1. Hero-Bild preloaden
   <link rel="preload" as="image" href="/hero.webp" />

2. Kritisches CSS inline
   Inline first-fold CSS im <head>

3. Server-Side Rendering
   Alle public Pages mit Next.js SSR

4. CDN für Bilder
   Supabase Storage + Vercel Edge

5. Bildoptimierung
   - WebP Format
   - Responsive images (srcset)
   - Lazy loading für below-fold

6. Font Loading
   font-display: swap
   Preload kritische Fonts
```

### 7.3 FID/INP Optimierung

```
1. JavaScript minimieren
   - Code Splitting
   - Dynamic Imports
   - Tree Shaking

2. Third-Party Scripts
   - Async/Defer loading
   - Plausible statt GA (leichtgewichtig)

3. Event Handler
   - Passive Event Listeners
   - Debouncing für Scroll/Resize

4. Main Thread freihalten
   - Web Workers für schwere Berechnungen
   - RequestIdleCallback für nicht-kritische Tasks
```

### 7.4 CLS Optimierung

```
1. Bildgrößen reservieren
   <img width="600" height="450" ... />
   aspect-ratio: 4 / 3;

2. Font Loading
   font-display: optional; (wenn möglich)
   Fallback-Fonts mit ähnlichen Metriken

3. Keine dynamischen Inhalte über bestehendem Content
   - Skeleton Screens statt Spinner
   - Platzhalter für Ads (falls vorhanden)

4. Keine Layout-Shifts durch:
   - Cookie Banner (von unten einschieben)
   - Lazy-loaded Content (Höhe reservieren)
   - Async-loaded Embeds
```

### 7.5 TTFB Optimierung

```
1. Edge Caching (Vercel)
   - Static Pages: Cache-Control headers
   - Dynamic Pages: Stale-While-Revalidate

2. Database Optimierung
   - Indizes (siehe Abschnitt 39 PRD)
   - Connection Pooling
   - Query Optimierung

3. Serverless Cold Starts minimieren
   - Keep-Alive Connections
   - Edge Functions wo möglich

4. ISR (Incremental Static Regeneration)
   - Listing-Details: ISR 60s
   - Hersteller-Seiten: ISR 3600s
   - Statische Seiten: Full Static
```

### 7.6 Next.js Performance Config

```javascript
// next.config.js

module.exports = {
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['supabase.co', 'cmm24.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Strict Mode für besseres Debugging
  reactStrictMode: true,
  
  // SWC Minifier (schneller)
  swcMinify: true,
  
  // Experimental Features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Headers für Caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## 8. International SEO (hreflang)

### 8.1 Sprachstrategie

```
Primärsprache: Deutsch (de)
Fallback: Deutsch (x-default)

URL-Struktur: Subdirectory
https://cmm24.com/de/... (Deutsch)
https://cmm24.com/en/... (Englisch)
https://cmm24.com/fr/... (Französisch)
...
```

### 8.2 hreflang Implementation

#### Im HTML <head>

```html
<head>
  <!-- Selbstreferenz -->
  <link rel="alternate" hreflang="de" href="https://cmm24.com/de/maschinen" />
  
  <!-- Alle anderen Sprachen -->
  <link rel="alternate" hreflang="en" href="https://cmm24.com/en/machines" />
  <link rel="alternate" hreflang="fr" href="https://cmm24.com/fr/machines" />
  <link rel="alternate" hreflang="nl" href="https://cmm24.com/nl/machines" />
  <link rel="alternate" hreflang="it" href="https://cmm24.com/it/macchine" />
  <link rel="alternate" hreflang="es" href="https://cmm24.com/es/maquinas" />
  <link rel="alternate" hreflang="pl" href="https://cmm24.com/pl/maszyny" />
  <link rel="alternate" hreflang="cs" href="https://cmm24.com/cs/stroje" />
  <link rel="alternate" hreflang="sk" href="https://cmm24.com/sk/stroje" />
  <link rel="alternate" hreflang="hu" href="https://cmm24.com/hu/gepek" />
  <link rel="alternate" hreflang="ro" href="https://cmm24.com/ro/masini" />
  <link rel="alternate" hreflang="bg" href="https://cmm24.com/bg/mashini" />
  <link rel="alternate" hreflang="el" href="https://cmm24.com/el/michanimata" />
  <link rel="alternate" hreflang="tr" href="https://cmm24.com/tr/makineler" />
  <link rel="alternate" hreflang="hr" href="https://cmm24.com/hr/strojevi" />
  <link rel="alternate" hreflang="sr" href="https://cmm24.com/sr/masine" />
  <link rel="alternate" hreflang="bs" href="https://cmm24.com/bs/masine" />
  <link rel="alternate" hreflang="sl" href="https://cmm24.com/sl/stroji" />
  <link rel="alternate" hreflang="sq" href="https://cmm24.com/sq/makina" />
  <link rel="alternate" hreflang="mk" href="https://cmm24.com/mk/mashini" />
  <link rel="alternate" hreflang="sv" href="https://cmm24.com/sv/maskiner" />
  <link rel="alternate" hreflang="da" href="https://cmm24.com/da/maskiner" />
  <link rel="alternate" hreflang="et" href="https://cmm24.com/et/masinad" />
  <link rel="alternate" hreflang="lv" href="https://cmm24.com/lv/masinas" />
  <link rel="alternate" hreflang="lt" href="https://cmm24.com/lt/masinos" />
  <link rel="alternate" hreflang="pt" href="https://cmm24.com/pt/maquinas" />
  <link rel="alternate" hreflang="ka" href="https://cmm24.com/ka/mankanebi" />
  
  <!-- x-default für Sprachauswahl/Fallback -->
  <link rel="alternate" hreflang="x-default" href="https://cmm24.com/de/maschinen" />
</head>
```

### 8.3 hreflang Regeln

```
1. Jede Seite verweist auf ALLE Sprachversionen (inkl. sich selbst)
2. hreflang ist bidirektional (A→B und B→A)
3. URLs müssen exakt übereinstimmen (inkl. Trailing Slash)
4. Nur für indexierbare Seiten verwenden
5. x-default für Fallback/Startseite ohne Sprache

Häufige Fehler vermeiden:
✗ hreflang auf noindex-Seiten
✗ Fehlende Rück-Referenzen
✗ Falsche URL-Formate
✗ 404-Seiten als hreflang-Ziel
```

### 8.4 Content-Strategie pro Sprache

```
Phase 1 (MVP):
- DE: Vollständig übersetzt, lokalisiert
- EN: Vollständig übersetzt

Phase 2:
- FR, NL, IT, ES, PL: UI übersetzt
- Listing-Inhalte: Originalsprache des Verkäufers

Phase 3:
- Alle 30 Sprachen: UI übersetzt
- Ratgeber/Content: Nur DE + EN, andere zeigen EN-Fallback
```

### 8.5 Locale-spezifische Anpassungen

```
Datumsformate:
DE: 21.01.2026
EN: Jan 21, 2026
FR: 21/01/2026

Zahlenformate:
DE: 45.000,00 €
EN: €45,000.00
FR: 45 000,00 €

Währung:
DE, AT, FR, etc.: EUR (€)
CH: CHF (Fr.)
UK: GBP (£)
→ Aktuell: Nur EUR, andere Phase 2+
```

---

## 9. E-E-A-T Strategie

### 9.1 Was ist E-E-A-T?

```
E - Experience (Erfahrung)
E - Expertise (Fachwissen)
A - Authoritativeness (Autorität)
T - Trustworthiness (Vertrauenswürdigkeit)

Google nutzt E-E-A-T zur Qualitätsbewertung, besonders für:
- YMYL-Seiten (Your Money, Your Life)
- B2B-Transaktionen (wie CMM24)
```

### 9.2 Experience (Erfahrung)

#### Maßnahmen

```
1. Über-uns-Seite mit Gründerstory
   - Wer steckt hinter CMM24?
   - Welche Erfahrung haben die Gründer?
   - Warum haben wir CMM24 gegründet?

2. Team-Seite
   - Fotos und Kurzbiografien
   - Branchenerfahrung hervorheben

3. Case Studies / Erfolgsgeschichten
   - "Wie Firma X ihre Zeiss Contura gefunden hat"
   - Echte Käufer-/Verkäuferstimmen

4. "Mitglied seit" Badge für Verkäufer
   - Zeigt Plattformerfahrung
```

### 9.3 Expertise (Fachwissen)

#### Content-Hub aufbauen

```
/de/ratgeber/
├── Kaufratgeber
│   ├── koordinatenmessmaschine-kaufen-ratgeber
│   ├── worauf-achten-beim-cmm-kauf
│   ├── neu-vs-gebraucht-messmaschine
│   └── messbereich-bestimmen
│
├── Hersteller-Vergleiche
│   ├── zeiss-vs-hexagon-vergleich
│   ├── wenzel-vs-mitutoyo
│   └── beste-cmm-hersteller-2026
│
├── Technische Guides
│   ├── cmm-genauigkeit-verstehen
│   ├── kalibrierung-erklaert
│   ├── software-calypso-vs-pc-dmis
│   └── tastsysteme-ueberblick
│
└── Marktberichte
    ├── cmm-markt-2026
    └── preisentwicklung-gebrauchte-cmm

/de/glossar/
├── koordinatenmessmaschine
├── mpee-genauigkeit
├── messbereich
├── tastkopf
├── calypso-software
├── portal-messmaschine
└── ... (50+ Begriffe)
```

#### Autor-Profile (für Blog/Ratgeber)

```
Schema.org Person für Autoren:
{
  "@type": "Person",
  "name": "Jan Hemkemeier",
  "jobTitle": "Gründer CMM24",
  "description": "15 Jahre Erfahrung in der Messtechnik-Branche",
  "image": "...",
  "sameAs": ["LinkedIn-URL"]
}
```

### 9.4 Authoritativeness (Autorität)

#### Trust Signals einbauen

```
1. Partnerschaften sichtbar machen
   - "Offizieller Partner von [Verband]"
   - Hersteller-Logos (mit Genehmigung)

2. Presse & Medien
   - "Bekannt aus: [Fachmagazine]"
   - Pressemitteilungen bei Launch

3. Externe Erwähnungen
   - Gastartikel in Fachmagazinen
   - Zitate in Branchenartikeln
   - Wikipedia-Eintrag (langfristig)

4. Social Proof
   - "500+ erfolgreiche Vermittlungen"
   - "Geprüft von X Käufern"

5. Backlinks von autoritativen Quellen
   - Branchenverbände
   - Hersteller-Websites
   - Fachmagazine
```

### 9.5 Trustworthiness (Vertrauenswürdigkeit)

#### On-Site Trust Signals

```
1. Kontaktinformationen prominent
   - Telefon, E-Mail, Adresse
   - Reaktionszeit angeben

2. Impressum vollständig
   - Firmenname, Geschäftsführer
   - USt-ID, Handelsregister
   - Ladungsfähige Anschrift

3. Datenschutz & AGB
   - DSGVO-konform
   - Verständlich geschrieben

4. SSL/HTTPS
   - Überall aktiv
   - Schloss-Symbol sichtbar

5. Verifizierte Verkäufer
   - "✓ Verifiziert" Badge
   - Erklärung was geprüft wurde

6. Geprüfte Inserate
   - "✓ Geprüft" Badge
   - Transparenz über Prüfprozess

7. Sichere Zahlung
   - Stripe Badge
   - Keine unsicheren Methoden

8. Bewertungen (Phase 2)
   - Verkäufer-Bewertungen
   - Nicht manipulierbar
```

### 9.6 E-E-A-T Checkliste

```
□ Über-uns-Seite mit Team und Geschichte
□ Kontaktseite mit echten Kontaktdaten
□ Vollständiges Impressum
□ Verständliche AGB und Datenschutz
□ HTTPS auf allen Seiten
□ Autor-Informationen bei Ratgebern
□ Trust-Badges für Verkäufer
□ Prüfsiegel für Inserate
□ Quellen bei Statistiken/Fakten
□ Aktualität (Datum bei Content)
□ Keine irreführenden Inhalte
□ Klare Preisangaben
```

---

## 10. Content-Strategie

### 10.1 Content-Typen

| Typ | Zweck | SEO-Ziel | Frequenz |
|-----|-------|----------|----------|
| Listing-Seiten | Transaktional | Long-Tail Keywords | Fortlaufend (User Generated) |
| Hersteller-Seiten | Commercial | Brand Keywords | Statisch + Updates |
| Kategorie-Seiten | Commercial | Mid-Tail Keywords | Statisch + Updates |
| Ratgeber | Informational | Informational Keywords | 2-4x/Monat |
| Glossar | Informational | Definition Keywords | Initial 50, dann erweitern |
| News/Blog | Aktualität | Trending Keywords | 1-2x/Monat |

### 10.2 Ratgeber-Content

#### Content-Kalender (Beispiel erstes Halbjahr)

```
Januar:
- Koordinatenmessmaschine kaufen: Der ultimative Ratgeber 2026
- Die 10 besten CMM-Hersteller im Vergleich

Februar:
- Gebrauchte vs. neue Messmaschine: Was lohnt sich?
- Zeiss vs. Hexagon: Welcher Hersteller passt zu Ihnen?

März:
- CMM-Genauigkeit verstehen: MPEE, MPEp erklärt
- Der richtige Messbereich: So bestimmen Sie Ihre Anforderungen

April:
- Software-Vergleich: Calypso vs. PC-DMIS vs. Metrosoft
- Tastsysteme im Überblick: Scanning vs. Taktil

Mai:
- CMM-Kalibrierung: Warum, wann und wie?
- Gebrauchte Messmaschine: Checkliste für die Besichtigung

Juni:
- Marktreport: Gebrauchte Koordinatenmessmaschinen 2026
- Transport und Installation einer CMM: Was Sie wissen müssen
```

#### Ratgeber-Struktur (Template)

```markdown
# [Titel mit Keyword]

**Zusammenfassung** (für Featured Snippet)
[2-3 Sätze, die die Hauptfrage beantworten]

## Inhaltsverzeichnis
[Automatisch generiert]

## Einleitung
[Warum ist dieses Thema wichtig? Pain Point des Lesers]

## [Hauptabschnitt 1 mit H2]
[Detaillierte Erklärung]

### [Unterabschnitt mit H3]
[Spezifische Details]

## [Hauptabschnitt 2 mit H2]
...

## Häufige Fragen (FAQ)
[3-5 Fragen mit kurzen Antworten → FAQ Schema]

## Fazit
[Zusammenfassung + CTA zu CMM24]

---
**Autor:** [Name]
**Letzte Aktualisierung:** [Datum]
**Quellen:** [Falls zutreffend]
```

### 10.3 Glossar-Content

#### Glossar-Einträge (Priorisiert)

```
Priorität 1 (Launch):
- Koordinatenmessmaschine (CMM)
- Messbereich
- MPEE / MPEp (Genauigkeit)
- Tastkopf / Taster
- Portal-Messmaschine
- Ausleger-Messmaschine
- Calypso (Software)
- PC-DMIS (Software)
- Kalibrierung

Priorität 2:
- Scanning-Taster
- Renishaw
- Zeiss VAST
- 3D-Messtechnik
- GD&T
- Messprogramm
- CNC-Messmaschine
...

Priorität 3:
- Spezifische Modellnamen
- Historische Begriffe
- Nischen-Fachbegriffe
```

#### Glossar-Eintrag Struktur

```markdown
# [Begriff]: Definition und Erklärung

**Kurzedefinition** (1 Satz für Featured Snippet)
[Begriff] bezeichnet/ist [klare Definition].

## Was ist [Begriff]?
[Ausführliche Erklärung in 2-3 Absätzen]

## [Begriff] im Detail
[Technische Details, Varianten, etc.]

## Beispiel
[Konkretes Beispiel aus der Praxis]

## Verwandte Begriffe
- [Link zu verwandtem Glossar-Eintrag]
- [Link zu verwandtem Glossar-Eintrag]

## [Begriff] auf CMM24
[Wie kann der User dieses Wissen auf CMM24 anwenden?]
→ CTA: Maschinen mit [Begriff] finden
```

### 10.4 Hersteller-Seiten

#### Struktur

```markdown
# Gebrauchte [Hersteller] Koordinatenmessmaschinen

[Hero-Bereich mit Hersteller-Logo und Key Facts]

## Über [Hersteller]
[Kurze Geschichte, Marktposition, Besonderheiten]

## Beliebte [Hersteller] Modelle
[Grid mit Modell-Karten: Contura, Accura, Prismo, etc.]

## Aktuelle Angebote
[Listing-Grid mit Filter auf diesen Hersteller]

## Warum [Hersteller]?
[Vorteile, typische Anwendungen, Zielgruppen]

## Häufige Fragen zu [Hersteller]
[FAQ mit Schema]

## Verwandte Hersteller
[Links zu ähnlichen Herstellern]
```

### 10.5 Content-Optimierung Prozess

```
1. Keyword-Recherche
   → Haupt- und Neben-Keywords identifizieren

2. Konkurrenz-Analyse
   → Was rankt aktuell? Wie können wir besser sein?

3. Content-Briefing erstellen
   → Struktur, Keywords, Wortanzahl, Quellen

4. Content erstellen
   → Nach SEO-Guidelines

5. On-Page Optimierung
   → Title, Description, H1-H6, Alt-Tags

6. Schema hinzufügen
   → FAQ, HowTo, Article, etc.

7. Internal Links setzen
   → Zu relevanten Seiten verlinken

8. Veröffentlichen & Indexierung anfordern
   → GSC URL Inspection

9. Performance tracken
   → Rankings, Traffic, Conversions

10. Content aktualisieren
    → Regelmäßig prüfen und verbessern
```

---

## 11. AEO (Answer Engine Optimization)

### 11.1 Was ist AEO?

```
AEO = Optimierung für Answer Engines wie:
- Google Featured Snippets
- Google "People Also Ask"
- Google SGE (Search Generative Experience)
- Voice Search (Alexa, Google Assistant)
- Bing AI Answers

Ziel: Direkte Antworten in den SERPs liefern
```

### 11.2 Featured Snippet Strategien

#### Snippet-Typen & Optimierung

```
1. Paragraph Snippet (Textantwort)
   Frage: "Was ist eine Koordinatenmessmaschine?"
   Format: 40-60 Wörter direkte Antwort
   
   Beispiel:
   <p>Eine Koordinatenmessmaschine (CMM) ist ein Messgerät, 
   das die physischen Geometrien eines Objekts erfasst. 
   Sie verwendet einen beweglichen Tastkopf, um Punkte 
   auf der Oberfläche abzutasten und deren X-, Y- und 
   Z-Koordinaten zu messen.</p>

2. List Snippet (Aufzählung)
   Frage: "Welche CMM-Hersteller gibt es?"
   Format: Nummerierte oder unnummerierte Liste
   
   Beispiel:
   <h2>Die wichtigsten CMM-Hersteller</h2>
   <ol>
     <li>Zeiss (Deutschland)</li>
     <li>Hexagon (Schweden)</li>
     <li>Wenzel (Deutschland)</li>
     <li>Mitutoyo (Japan)</li>
     <li>Coord3 (Italien)</li>
   </ol>

3. Table Snippet (Tabelle)
   Frage: "Was kostet eine gebrauchte Messmaschine?"
   Format: HTML-Tabelle mit klaren Spalten
   
   Beispiel:
   <table>
     <tr><th>Hersteller</th><th>Preisbereich</th></tr>
     <tr><td>Zeiss</td><td>30.000 - 100.000 €</td></tr>
     <tr><td>Hexagon</td><td>25.000 - 80.000 €</td></tr>
   </table>
```

#### Ziel-Fragen für CMM24

```
Informational (Glossar/Ratgeber):
□ "Was ist eine Koordinatenmessmaschine?"
□ "Wie funktioniert eine CMM?"
□ "Was bedeutet MPEE bei Messmaschinen?"
□ "Welche CMM-Hersteller gibt es?"
□ "Was ist der Unterschied zwischen Portal- und Ausleger-CMM?"

Commercial (Ratgeber):
□ "Was kostet eine gebrauchte Koordinatenmessmaschine?"
□ "Welche Messmaschine ist die beste?"
□ "Zeiss oder Hexagon - was ist besser?"
□ "Worauf achten beim CMM-Kauf?"

Transactional (Listings):
□ "Gebrauchte Zeiss Contura kaufen"
□ "Hexagon Messmaschine Preis"
```

### 11.3 People Also Ask (PAA) Optimierung

```
Strategie:
1. PAA-Fragen in Google recherchieren
2. Diese Fragen als H2/H3 in Content einbauen
3. Direkt unter der Frage eine prägnante Antwort geben
4. FAQ-Schema hinzufügen

Beispiel-Struktur:
<h2>Häufige Fragen zu Koordinatenmessmaschinen</h2>

<h3>Was kostet eine Koordinatenmessmaschine?</h3>
<p>Eine neue Koordinatenmessmaschine kostet zwischen 
50.000 € und 500.000 €. Gebrauchte CMMs sind ab 
10.000 € erhältlich, typische Preise liegen bei 
30.000 - 80.000 €.</p>

<h3>Wie genau ist eine Koordinatenmessmaschine?</h3>
<p>Die Genauigkeit einer CMM wird mit MPEE angegeben, 
typisch 1-5 µm + L/300 bis L/500. Das bedeutet bei 
einem 1m Messobjekt eine Abweichung von ca. 3-7 µm.</p>
```

### 11.4 Voice Search Optimierung

```
Eigenschaften von Voice Queries:
- Längere, natürlichsprachliche Anfragen
- Oft Fragen ("Wie", "Was", "Wo")
- Lokale Absicht ("in meiner Nähe")

Optimierung:
1. Conversational Keywords integrieren
   "Wie finde ich eine gebrauchte Messmaschine?"
   statt nur "Messmaschine gebraucht"

2. Frage-Antwort-Format
   Frage als H2, Antwort direkt darunter

3. Speakable Schema (optional)
   Markiert Content, der für TTS geeignet ist
```

---

## 12. GEO & LLM-Optimierung

### 12.1 Was ist GEO?

```
GEO = Generative Engine Optimization
Optimierung für KI-gestützte Sucherfahrungen:
- Google SGE (Search Generative Experience)
- ChatGPT mit Browsing
- Bing AI
- Perplexity AI
- Claude mit Web-Zugriff

Diese Systeme:
- Zitieren Quellen
- Bevorzugen autoritative, strukturierte Inhalte
- Fassen Informationen zusammen
```

### 12.2 GEO-Strategien

#### 1. Unique Data erstellen

```
CMM24 Preisindex:
- Durchschnittspreise nach Hersteller
- Preisentwicklung über Zeit
- Preise nach Alter/Zustand

Beispiel-Content:
"Laut CMM24 Preisindex (Q1 2026) liegt der 
Durchschnittspreis für eine gebrauchte Zeiss Contura 
bei 45.000 €. Im Vergleich zum Vorjahr ist das ein 
Rückgang von 8%."

→ Zitierbarer Fakt mit Quellenangabe
```

#### 2. Zitierbare Statistiken

```
Auf der Startseite oder in Ratgebern:
- "500+ aktive Inserate auf CMM24"
- "Über 50 verifizierte Händler"
- "12 Länder abgedeckt"
- "Durchschnittlich 48h bis zur ersten Anfrage"

Format für Zitierbarkeit:
"[Statistik] (Quelle: CMM24, Stand: Januar 2026)"
```

#### 3. Klar strukturierte Inhalte

```
LLMs bevorzugen:
✓ Klare Hierarchien (H1 → H2 → H3)
✓ Listen und Tabellen
✓ Definitionen am Anfang
✓ Fakten statt Marketing-Sprache
✓ Aktuelle Daten mit Datum

LLMs meiden:
✗ Vages Marketing-Sprech
✗ Überlange Absätze
✗ Fehlende Struktur
✗ Veraltete Informationen
```

#### 4. Entity Optimization

```
CMM24 als Entity etablieren:
- Konsistente Namensnennung: "CMM24"
- Verknüpfung mit bekannten Entities (Hersteller)
- Schema.org Organization
- Wikidata-Eintrag (langfristig)
- Google Knowledge Panel anstreben

Beispiel-Satz für LLM-Optimierung:
"CMM24 ist ein B2B-Marktplatz für gebrauchte 
Koordinatenmessmaschinen von Herstellern wie 
Zeiss, Hexagon und Wenzel."

→ Verknüpft CMM24 mit bekannten Entities
```

#### 5. Source Attribution

```
Bei allen Fakten und Statistiken:
- Quelle angeben
- Datum angeben
- Methodik erklären (wenn relevant)

Beispiel:
"Der Gebrauchtmaschinenmarkt für CMMs wächst 
jährlich um ca. 5-7% (Quelle: VDMA Branchenreport 2025). 
Auf CMM24 beobachten wir einen Anstieg der Inserate 
um 12% im Vergleich zum Vormonat (Stand: Januar 2026)."
```

### 12.3 Content für LLMs schreiben

#### Template: LLM-optimierter Abschnitt

```markdown
## [Frage als H2]

[1-2 Sätze direkte Antwort - Featured Snippet optimiert]

[Ausführlichere Erklärung in 2-3 Absätzen]

**Wichtige Fakten:**
- [Fakt 1 mit Zahl]
- [Fakt 2 mit Zahl]
- [Fakt 3 mit Zahl]

| Kategorie | Wert | Quelle |
|-----------|------|--------|
| [Daten]   | [X]  | CMM24  |

*Stand: [Monat Jahr]*
```

#### Beispiel

```markdown
## Was kostet eine gebrauchte Koordinatenmessmaschine?

Eine gebrauchte Koordinatenmessmaschine kostet typischerweise 
zwischen 15.000 € und 150.000 €, abhängig von Hersteller, 
Alter und Ausstattung.

Der Preis wird hauptsächlich durch den Hersteller, das 
Baujahr und den Messbereich bestimmt. Premium-Hersteller 
wie Zeiss und Hexagon erzielen höhere Preise als 
Budget-Alternativen.

**Durchschnittspreise nach Hersteller (CMM24 Preisindex):**
- Zeiss: 40.000 - 80.000 €
- Hexagon: 35.000 - 70.000 €
- Wenzel: 25.000 - 50.000 €
- Mitutoyo: 20.000 - 45.000 €

| Alter | Ø Preisabschlag |
|-------|-----------------|
| 0-5 Jahre | 20-40% unter Neupreis |
| 5-10 Jahre | 50-70% unter Neupreis |
| >10 Jahre | 70-85% unter Neupreis |

*Quelle: CMM24 Marktanalyse, Stand: Januar 2026*
```

### 12.4 Monitoring für AI-Suchmaschinen

```
Überprüfen, ob CMM24 zitiert wird:
1. ChatGPT Fragen stellen über CMMs
2. Perplexity.ai für Messtechnik-Fragen nutzen
3. Google SGE beobachten (wenn verfügbar)
4. Bing AI Chat testen

Ziel-Queries:
- "Wo kann ich eine gebrauchte Koordinatenmessmaschine kaufen?"
- "Was kostet eine Zeiss Contura gebraucht?"
- "Beste Marktplätze für gebrauchte Messmaschinen"
```

---

## 13. Internal Linking

### 13.1 Link-Hierarchie

```
Startseite (höchste Autorität)
    ↓
Hersteller-Übersicht / Kategorien (hohe Autorität)
    ↓
Hersteller-Seiten / Kategorie-Seiten (mittlere Autorität)
    ↓
Listing-Details (viele Seiten, einzeln weniger Autorität)

Prinzip: Autorität fließt von oben nach unten
→ Wichtige Seiten sollten viele interne Links erhalten
```

### 13.2 Link-Strategie

#### Von Startseite

```
- Zu Hersteller-Übersicht
- Zu Top-Herstellern (Zeiss, Hexagon, Wenzel)
- Zu Kategorien
- Zu Featured Listings
- Zu Ratgeber-Highlights
```

#### Von Listing-Übersicht

```
- Zu einzelnen Listings
- Zu Hersteller-Seiten (bei Hersteller-Logo/Name)
- Zu Kategorie-Seiten
- Zu Ratgeber (kontextuell)
```

#### Von Listing-Detail

```
- Zu Hersteller-Seite
- Zu Kategorie-Seite
- Zu ähnlichen Listings (gleicher Hersteller/Preisklasse)
- Zu Glossar (bei Fachbegriffen)
- Zu Ratgeber (kontextuell)
```

#### Von Ratgeber-Artikeln

```
- Zu relevanten Listings (z.B. "Zeiss Maschinen ansehen")
- Zu Hersteller-Seiten
- Zu Glossar-Einträgen (bei Fachbegriffen)
- Zu anderen Ratgebern (verwandte Themen)
```

#### Von Glossar-Einträgen

```
- Zu verwandten Glossar-Einträgen
- Zu Ratgebern (tiefergehende Info)
- Zu Listings (bei Produktbegriffen)
```

### 13.3 Anchor Text Strategie

```
✓ Beschreibende Anchor Texte
  "Zeiss Messmaschinen ansehen"
  "mehr über MPEE erfahren"
  "alle gebrauchten Contura"

✗ Vermeiden
  "hier klicken"
  "mehr erfahren"
  "Link"

Variationen nutzen:
- "Zeiss Koordinatenmessmaschinen"
- "Zeiss CMM"
- "Messmaschinen von Zeiss"
→ Nicht immer exakt gleichen Text
```

### 13.4 Breadcrumbs

```
Implementation auf allen Seiten:

Startseite > Maschinen > Zeiss > Zeiss Contura 10/12/6

HTML:
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/de">Startseite</a></li>
    <li><a href="/de/maschinen">Maschinen</a></li>
    <li><a href="/de/maschinen?hersteller=zeiss">Zeiss</a></li>
    <li aria-current="page">Zeiss Contura 10/12/6</li>
  </ol>
</nav>

+ BreadcrumbList Schema (siehe Abschnitt 6.6)
```

### 13.5 Verwandte Inhalte / Related Links

```
Auf Listing-Detail:
┌─────────────────────────────────────────────────────┐
│ Ähnliche Maschinen                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Zeiss   │ │ Zeiss   │ │ Hexagon │ │ Wenzel  │   │
│ │ Contura │ │ Accura  │ │ Global  │ │ LH 87   │   │
│ │ G2      │ │         │ │ S       │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────┘

Logik für "ähnlich":
1. Gleicher Hersteller, anderes Modell
2. Ähnlicher Preisbereich (±20%)
3. Ähnlicher Messbereich
4. Gleiche Kategorie
```

---

## 14. Off-Page SEO & Backlinks

### 14.1 Backlink-Strategie

```
Ziel: Hochwertige, themenrelevante Backlinks aufbauen

Qualität > Quantität
1 Link von branchenrelevanter Seite > 100 Links von Random-Blogs
```

### 14.2 Link-Building Taktiken

#### 1. Content-Marketing

```
- Einzigartige Daten veröffentlichen (CMM24 Preisindex)
- Infografiken erstellen (CMM-Markt Übersicht)
- Studien/Umfragen durchführen
→ Wird natürlich verlinkt
```

#### 2. Gastbeiträge

```
Ziel-Publikationen:
- Fachmagazine (QZ, Inspect, Messtechnik-News)
- Branchen-Blogs
- LinkedIn Pulse Artikel

Themen:
- Marktentwicklung gebrauchte Messtechnik
- Digitalisierung in der Qualitätssicherung
- Nachhaltigkeit durch Gebrauchtmaschinen
```

#### 3. Partnerschaften

```
- Hersteller (Zeiss, Hexagon, Wenzel)
  → "Gebrauchte Maschinen auf CMM24 finden"
- Branchenverbände (VDMA, etc.)
- Messtechnik-Dienstleister
- Maschinentransport-Firmen
```

#### 4. Digital PR

```
- Pressemitteilungen bei Launch
- Interviews mit Gründer
- Branchenmeldungen bei Meilensteinen
```

#### 5. Verzeichnisse & Listings

```
Relevante Branchenverzeichnisse:
- Wer liefert was (wlw.de)
- Kompass
- Europages
- IndustryStock

Qualitätskriterien:
✓ Thematisch relevant
✓ Seriös/etabliert
✓ DoFollow Link (wenn möglich)
```

### 14.3 Linkprofil-Monitoring

```
Tools:
- Ahrefs / SEMrush für Backlink-Analyse
- Google Search Console (eingehende Links)

Metriken:
- Anzahl verweisender Domains
- Domain Rating / Domain Authority
- Anchor Text Verteilung
- Dofollow vs. Nofollow Ratio
- Toxische Links identifizieren
```

### 14.4 Anchor Text Verteilung (Ziel)

```
Brand Anchors: 40%
  "CMM24", "cmm24.com"

URL Anchors: 20%
  "https://cmm24.com", "cmm24.com/maschinen"

Generic Anchors: 15%
  "hier", "Website", "Quelle"

Keyword Anchors: 15%
  "gebrauchte Messmaschinen", "CMM kaufen"

LSI/Variationen: 10%
  "Marktplatz Messtechnik", "Koordinatenmessmaschinen finden"
```

---

## 15. Local SEO

### 15.1 Relevanz für CMM24

```
CMM24 ist primär ein Online-Marktplatz, aber:
- Verkäufer haben lokale Standorte
- Käufer suchen oft regional ("Messmaschine München")
- Besichtigungen sind lokal

→ Local SEO für Verkäufer-Profile relevant
```

### 15.2 Google Business Profile

```
Für CMM24 selbst:
- GBP für Firmensitz erstellen
- Kategorie: "Maschinenhandel" o.ä.
- Beschreibung mit Keywords
- Fotos vom Team/Büro
- Posts mit neuen Listings/Content

Für Verkäufer (Phase 2):
- Verkäufer ermutigen, eigenes GBP zu haben
- Auf CMM24-Profil verlinken
```

### 15.3 Lokale Keywords

```
Seiten-Optimierung für lokale Suchen:
/de/maschinen?standort=muenchen
→ "Koordinatenmessmaschinen in München"

/de/maschinen?standort=nrw
→ "Gebrauchte Messmaschinen in NRW"

Meta-Optimierung:
Title: "Gebrauchte Messmaschinen in München | X Angebote | CMM24"
```

### 15.4 LocalBusiness Schema für Verkäufer

```
Siehe Abschnitt 6.9 - LocalBusiness Schema
Auf Verkäufer-Profilen implementieren
```

---

## 16. Monitoring & Tools

### 16.1 Essentielle SEO-Tools

| Tool | Zweck | Priorität |
|------|-------|-----------|
| **Google Search Console** | Indexierung, Performance, Fehler | Must-Have |
| **Google Analytics 4** | Traffic, Conversions, Verhalten | Must-Have |
| **Ahrefs / SEMrush** | Backlinks, Keywords, Wettbewerb | Wichtig |
| **Screaming Frog** | Technische Audits, Crawling | Wichtig |
| **PageSpeed Insights** | Core Web Vitals | Wichtig |
| **Schema Validator** | Structured Data Prüfung | Wichtig |

### 16.2 KPIs & Reporting

#### Wöchentlich tracken

```
- Indexierte Seiten (GSC)
- Crawl-Fehler (GSC)
- Core Web Vitals Status (GSC)
- Ranking für Top-10 Keywords
```

#### Monatlich tracken

```
- Organischer Traffic (GA4)
- Keyword-Rankings (Ahrefs)
- Backlink-Wachstum
- Domain Authority
- Conversions aus Organic
- Featured Snippets gewonnen/verloren
- Click-Through-Rate (GSC)
```

#### Quartalsweise

```
- Umfassender SEO-Audit
- Content-Performance Review
- Wettbewerbs-Analyse
- Strategie-Anpassung
```

### 16.3 Google Search Console Setup

```
1. Property einrichten
   - Domain-Property (empfohlen): cmm24.com
   - Verifizierung: DNS-Eintrag

2. Sitemap einreichen
   - https://cmm24.com/sitemap.xml

3. Wichtige Berichte:
   - Leistung (Klicks, Impressionen, CTR, Position)
   - Abdeckung (Indexierungsstatus)
   - Core Web Vitals
   - Nutzerfreundlichkeit auf Mobilgeräten
   - Rich-Suchergebnisse

4. Alerts einrichten
   - E-Mail-Benachrichtigung bei Fehlern
```

### 16.4 Automatisiertes Monitoring

```javascript
// Beispiel: Täglicher Check für kritische SEO-Metriken

// 1. Indexierte Seiten zählen
site:cmm24.com → Anzahl merken

// 2. robots.txt erreichbar?
fetch('https://cmm24.com/robots.txt')

// 3. Sitemap erreichbar?
fetch('https://cmm24.com/sitemap.xml')

// 4. Core Web Vitals API
// PageSpeed Insights API für Stichproben

// Alert bei:
// - Indexierte Seiten sinken >10%
// - robots.txt nicht erreichbar
// - Sitemap nicht erreichbar
// - CWV schlechter als "needs improvement"
```

---

## 17. SEO-Checkliste für Launch

### 17.1 Pre-Launch (1-2 Wochen vorher)

```
Technisches SEO:
□ robots.txt konfiguriert und getestet
□ XML-Sitemaps generiert
□ Canonical Tags auf allen Seiten
□ hreflang implementiert (DE + EN)
□ HTTPS aktiv
□ Redirects konfiguriert
□ 404-Seite erstellt
□ Meta Robots korrekt gesetzt

On-Page SEO:
□ Title Tags für alle Seitentypen
□ Meta Descriptions für alle Seitentypen
□ H1-Struktur geprüft
□ Bilder Alt-Tags
□ Breadcrumbs implementiert

Structured Data:
□ Organization Schema
□ WebSite Schema mit SearchAction
□ Product Schema für Listings
□ BreadcrumbList Schema
□ Schema validiert (keine Fehler)

Content:
□ Startseite optimiert
□ Hersteller-Seiten erstellt (Top 5)
□ Kategorie-Seiten erstellt
□ FAQ-Seite mit Schema
□ Über-uns, Kontakt, Impressum
□ Mindestens 3-5 Ratgeber-Artikel
□ Glossar (20+ Einträge)

Performance:
□ Core Web Vitals alle "Gut"
□ Mobile-Friendly Test bestanden
□ PageSpeed Score >90

Tracking:
□ GA4 implementiert
□ GSC Property erstellt
□ Events konfiguriert (Anfrage, Signup)
```

### 17.2 Launch Day

```
□ robots.txt: Crawling erlauben (falls vorher blockiert)
□ Sitemap in GSC einreichen
□ Wichtige URLs in GSC zur Indexierung anfordern
□ Startseite
□ Listing-Übersicht
□ Top-Hersteller-Seiten
□ Top-Ratgeber
□ Social Media Announcement (für erste Backlinks/Signals)
```

### 17.3 Post-Launch (Erste 4 Wochen)

```
Woche 1:
□ Indexierung prüfen (site:cmm24.com)
□ Crawl-Fehler in GSC beheben
□ 404-Fehler finden und beheben
□ Erste Rankings tracken

Woche 2:
□ Core Web Vitals im Feld prüfen (GSC)
□ Mobile Usability Fehler beheben
□ Rich Results Status prüfen
□ Erste Content-Updates basierend auf Daten

Woche 3:
□ Keyword-Rankings analysieren
□ Content-Lücken identifizieren
□ Backlink-Outreach starten
□ Interne Verlinkung optimieren

Woche 4:
□ Erster monatlicher SEO-Report
□ Strategie für Monat 2 planen
□ Technische Issues priorisieren
□ Content-Kalender für nächsten Monat
```

### 17.4 Ongoing (Monatlich)

```
□ Ranking-Report erstellen
□ Traffic-Analyse
□ Neue Inhalte veröffentlichen (2-4 Ratgeber)
□ Bestehende Inhalte aktualisieren
□ Backlink-Aufbau fortsetzen
□ Technische Fehler beheben
□ Neue Keywords identifizieren
□ Wettbewerber beobachten
□ Schema-Updates bei Bedarf
□ Core Web Vitals monitoren
```

---

## Anhang: SEO-Ressourcen

### Offizielle Dokumentation

```
Google:
- Search Central: https://developers.google.com/search
- Search Console Help: https://support.google.com/webmasters
- Core Web Vitals: https://web.dev/vitals/

Schema.org:
- Dokumentation: https://schema.org
- Google Structured Data: https://developers.google.com/search/docs/appearance/structured-data
```

### Tools (kostenlos)

```
- Google Search Console
- Google Analytics 4
- PageSpeed Insights
- Rich Results Test
- Mobile-Friendly Test
- Lighthouse (Chrome DevTools)
- Ahrefs Webmaster Tools (eingeschränkt)
- Ubersuggest (eingeschränkt)
```

### Tools (kostenpflichtig, empfohlen)

```
- Ahrefs (Backlinks, Keywords)
- SEMrush (All-in-One)
- Screaming Frog (Technische Audits)
- Surfer SEO (Content-Optimierung)
```

---

**Dokument-Version:** 1.0
**Erstellt:** Januar 2026
**Autor:** SEO-Strategie für CMM24
**Letzte Aktualisierung:** Januar 2026
