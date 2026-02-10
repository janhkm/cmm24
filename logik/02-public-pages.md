# Public Pages – Logik & Schema-Anforderungen

## Übersicht der Seiten

| Seite | Pfad | Beschreibung |
|-------|------|--------------|
| Startseite | `/` | Hero, Featured Listings, Hersteller, FAQ |
| Maschinen-Liste | `/maschinen` | Filterbarer Listing-Katalog |
| Maschinen-Detail | `/maschinen/[slug]` | Einzelnes Inserat |
| Vergleich | `/vergleich` | Bis zu 5 Maschinen vergleichen |
| Kategorien | `/kategorien` | Maschinentypen-Übersicht |
| Kategorie-Detail | `/kategorien/[slug]` | Inserate einer Kategorie |
| Hersteller | `/hersteller` | Alle Hersteller |
| Hersteller-Detail | `/hersteller/[slug]` | Inserate eines Herstellers |
| Ratgeber | `/ratgeber` | Artikel-Übersicht |
| Ratgeber-Detail | `/ratgeber/[slug]` | Einzelner Artikel |
| Glossar | `/glossar` | Begriffserklärungen |
| FAQ | `/faq` | Häufige Fragen |
| Kontakt | `/kontakt` | Kontaktformular |

---

## 1. Startseite (`/`)

### Daten-Anforderungen

#### Featured Listings (4 Stück)
```sql
SELECT * FROM listings
WHERE status = 'active' AND featured = true
ORDER BY published_at DESC
LIMIT 4
```

#### Hersteller mit Listing-Count
```sql
SELECT m.*, COUNT(l.id) as listing_count
FROM manufacturers m
LEFT JOIN listings l ON l.manufacturer_id = m.id AND l.status = 'active'
GROUP BY m.id
ORDER BY listing_count DESC
```

#### FAQ (statisch oder aus DB)
- Aktuell: Hardcoded im Code
- Optional: `faq_entries` Tabelle

### Schema-Anforderungen
- `listings` (für Featured)
- `manufacturers` (für Hersteller-Grid)

---

## 2. Maschinen-Liste (`/maschinen`)

### Daten-Anforderungen

#### Filter-Parameter (URL Query)
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `q` | string | Freitext-Suche |
| `hersteller` | string (comma-sep) | Hersteller-Slugs |
| `kategorie` | string (comma-sep) | Maschinentypen |
| `preis_min` | number | Min. Preis |
| `preis_max` | number | Max. Preis |
| `jahr_min` | number | Min. Baujahr |
| `jahr_max` | number | Max. Baujahr |
| `zustand` | string (comma-sep) | Condition |
| `land` | string (comma-sep) | Länder |
| `sortierung` | string | Sortier-Option |

#### Listings-Query
```sql
SELECT l.*, m.name as manufacturer_name, m.slug as manufacturer_slug,
       (SELECT url FROM listing_media WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
WHERE l.status = 'active'
  AND (m.slug = ANY($hersteller) OR $hersteller IS NULL)
  AND (l.price >= $preis_min OR $preis_min IS NULL)
  AND (l.price <= $preis_max OR $preis_max IS NULL)
  AND (l.year_built >= $jahr_min OR $jahr_min IS NULL)
  AND (l.year_built <= $jahr_max OR $jahr_max IS NULL)
ORDER BY $sortierung
LIMIT 24 OFFSET $page * 24
```

#### Hersteller für Filter-Sidebar
```sql
SELECT m.id, m.name, m.slug, COUNT(l.id) as count
FROM manufacturers m
LEFT JOIN listings l ON l.manufacturer_id = m.id AND l.status = 'active'
GROUP BY m.id
HAVING COUNT(l.id) > 0
ORDER BY m.name
```

### Schema-Anforderungen
- `listings` (Hauptdaten)
- `manufacturers` (Join + Filter)
- `listing_media` (Bilder)

---

## 3. Maschinen-Detail (`/maschinen/[slug]`)

### Daten-Anforderungen

#### Hauptabfrage
```sql
SELECT l.*, 
       m.name as manufacturer_name, m.slug as manufacturer_slug,
       a.company_name as seller_name, a.slug as seller_slug, 
       a.is_verified, a.phone as seller_phone,
       a.address_city, a.address_country
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
JOIN accounts a ON l.account_id = a.id
WHERE l.slug = $slug AND l.status IN ('active', 'sold')
```

#### Medien
```sql
SELECT * FROM listing_media
WHERE listing_id = $listing_id
ORDER BY sort_order
```

#### Ähnliche Listings
```sql
SELECT l.*, m.name as manufacturer_name
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
WHERE l.id != $current_id
  AND l.status = 'active'
  AND (l.manufacturer_id = $manufacturer_id 
       OR ABS(l.price - $price) < $price * 0.3)
LIMIT 4
```

### Aktionen

#### Anfrage senden (Inquiry Modal)
```sql
INSERT INTO inquiries (
  listing_id, account_id, contact_name, contact_email, 
  contact_phone, contact_company, message, status
) VALUES (...)
```

#### View Count erhöhen
```sql
UPDATE listings SET views_count = views_count + 1 WHERE id = $id
```

### Schema-Anforderungen

#### `listings` (Haupttabelle)
```sql
listings
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── manufacturer_id (uuid, FK → manufacturers)
├── model_id (uuid, FK → models, nullable)
├── model_name_custom (text, nullable)
├── title (text)
├── slug (text, unique)
├── description (text)
├── price (integer, cents)
├── price_negotiable (boolean)
├── currency (text) DEFAULT 'EUR'
├── year_built (integer)
├── condition (enum: 'new', 'like_new', 'good', 'fair')
├── -- Technische Daten
├── measuring_range_x (integer, mm)
├── measuring_range_y (integer, mm)
├── measuring_range_z (integer, mm)
├── accuracy_um (text, nullable)
├── software (text, nullable)
├── controller (text, nullable)
├── probe_system (text, nullable)
├── -- Standort
├── location_country (text)
├── location_city (text)
├── location_postal_code (text)
├── latitude (decimal, nullable)
├── longitude (decimal, nullable)
├── -- Status & Meta
├── status (enum: 'draft', 'pending_review', 'active', 'sold', 'archived')
├── featured (boolean) DEFAULT false
├── featured_until (timestamptz, nullable)
├── views_count (integer) DEFAULT 0
├── published_at (timestamptz, nullable)
├── sold_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### `listing_media`
```sql
listing_media
├── id (uuid, PK)
├── listing_id (uuid, FK → listings)
├── type (enum: 'image', 'video', 'document')
├── url (text)
├── thumbnail_url (text, nullable)
├── filename (text)
├── size_bytes (integer)
├── mime_type (text)
├── sort_order (integer)
├── is_primary (boolean) DEFAULT false
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### `inquiries`
```sql
inquiries
├── id (uuid, PK)
├── listing_id (uuid, FK → listings)
├── account_id (uuid, FK → accounts) -- Verkäufer
├── contact_name (text)
├── contact_email (text)
├── contact_phone (text, nullable)
├── contact_company (text, nullable)
├── message (text)
├── status (enum: 'new', 'contacted', 'offer_sent', 'won', 'lost')
├── notes (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

---

## 4. Vergleich (`/vergleich`)

### Daten-Anforderungen
- IDs kommen aus Client-seitigem Zustand Store (Zustand)
- Bis zu 5 Listings laden

```sql
SELECT l.*, m.name as manufacturer_name, a.company_name as seller_name, a.is_verified
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
JOIN accounts a ON l.account_id = a.id
WHERE l.id = ANY($ids) AND l.status = 'active'
```

### Schema-Anforderungen
- Keine zusätzlichen Tabellen
- Nutzt bestehende `listings`, `manufacturers`, `accounts`

---

## 5. Hersteller (`/hersteller` + `/hersteller/[slug]`)

### Daten-Anforderungen

#### Liste aller Hersteller
```sql
SELECT m.*, COUNT(l.id) as listing_count
FROM manufacturers m
LEFT JOIN listings l ON l.manufacturer_id = m.id AND l.status = 'active'
GROUP BY m.id
ORDER BY m.name
```

#### Hersteller-Detail mit Listings
```sql
-- Hersteller-Info
SELECT * FROM manufacturers WHERE slug = $slug

-- Listings dieses Herstellers
SELECT l.* FROM listings l
WHERE l.manufacturer_id = $manufacturer_id AND l.status = 'active'
ORDER BY l.published_at DESC
```

### Schema-Anforderungen

#### `manufacturers`
```sql
manufacturers
├── id (uuid, PK)
├── name (text, unique)
├── slug (text, unique)
├── logo_url (text, nullable)
├── country (text, nullable)
├── description (text, nullable)
├── website (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

---

## 6. Kategorien (`/kategorien` + `/kategorien/[slug]`)

### Daten-Anforderungen

Kategorien sind aktuell als Enum auf dem `listings.condition` bzw. als Maschinentyp definiert.

#### Kategorien mit Count
```sql
SELECT 
  unnest(enum_range(NULL::machine_category)) as category,
  COUNT(l.id) as count
FROM listings l
WHERE l.status = 'active'
GROUP BY category
```

### Schema: Kategorien als Enum
```sql
CREATE TYPE machine_category AS ENUM (
  'portal',        -- Portal-Messmaschine
  'cantilever',    -- Ausleger-Messmaschine
  'horizontal_arm', -- Horizontal-Arm
  'gantry',        -- Gantry
  'optical',       -- Optisches System
  'other'          -- Sonstige
);
```

Optional: Eigene `categories` Tabelle für mehr Flexibilität (SEO-Texte, Bilder)

---

## 7. Content-Seiten (Ratgeber, Glossar, FAQ)

### Option A: Statisch im Code (aktuell)
- Artikel/Einträge in `mock-data.ts`
- Einfach, keine DB

### Option B: CMS-ähnlich in DB

#### `articles` (für Ratgeber)
```sql
articles
├── id (uuid, PK)
├── title (text)
├── slug (text, unique)
├── excerpt (text)
├── content (text) -- Markdown
├── category (text)
├── author_name (text)
├── author_role (text)
├── image_url (text, nullable)
├── reading_time (integer) -- Minuten
├── published_at (timestamptz)
├── updated_at (timestamptz)
└── is_published (boolean)
```

#### `glossary_entries`
```sql
glossary_entries
├── id (uuid, PK)
├── term (text)
├── slug (text, unique)
├── short_definition (text)
├── full_definition (text)
├── related_terms (text[], nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

**Empfehlung**: Für MVP statisch belassen, später CMS hinzufügen.

---

## 8. Kontakt (`/kontakt`)

### Daten-Anforderungen
- Formular-Submission

#### Option A: Email senden (kein DB-Eintrag)
```typescript
await resend.emails.send({
  from: 'CMM24 <kontakt@cmm24.com>',
  to: 'kontakt@cmm24.com',
  subject: `Kontaktanfrage von ${name}`,
  html: `...`
})
```

#### Option B: In DB speichern
```sql
contact_messages
├── id (uuid, PK)
├── name (text)
├── email (text)
├── phone (text, nullable)
├── subject (text)
├── message (text)
├── is_read (boolean) DEFAULT false
├── created_at (timestamptz)
```

---

## Zusammenfassung: Benötigte Tabellen für Public Pages

| Tabelle | Benötigt für | Priorität |
|---------|--------------|-----------|
| `listings` | Maschinen-Liste, Detail, Vergleich, Home | Kritisch |
| `listing_media` | Bilder/Dokumente | Kritisch |
| `manufacturers` | Hersteller-Filter, -Seiten | Kritisch |
| `accounts` | Verkäufer-Info auf Detail | Kritisch |
| `inquiries` | Anfrage-Formular | Kritisch |
| `models` | Modell-Auswahl (optional) | Nice-to-have |
| `articles` | Ratgeber (wenn CMS) | Optional |
| `glossary_entries` | Glossar (wenn CMS) | Optional |
| `contact_messages` | Kontaktformular (wenn DB) | Optional |

## RLS Policies für Public Pages

### `listings`
```sql
-- SELECT: Aktive/Verkaufte Listings öffentlich
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (status IN ('active', 'sold'));
```

### `manufacturers`
```sql
-- SELECT: Alle können lesen
CREATE POLICY "Anyone can view manufacturers" ON manufacturers
  FOR SELECT USING (true);
```

### `inquiries`
```sql
-- INSERT: Jeder kann Anfrage erstellen
CREATE POLICY "Anyone can create inquiry" ON inquiries
  FOR INSERT WITH CHECK (true);
```
