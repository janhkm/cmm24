# Product Requirements Document (PRD)

## Produktname

**CMM24** – Marktplatz für gebrauchte Koordinatenmessmaschinen (CMM)

## 1. Ziel & Vision

CMM24 ist eine spezialisierte B2B‑Plattform für den Kauf und Verkauf gebrauchter 3D‑Koordinatenmessmaschinen. Ziel ist es, Käufer und Verkäufer effizient, transparent und vertrauenswürdig zusammenzubringen – vergleichbar mit *mobile.de*, jedoch fokussiert auf industrielle Messtechnik.

Langfristige Vision:

* Führende europäische Plattform für gebrauchte Messtechnik
* Standardisierte Vergleichbarkeit von CMMs
* Hoher Vertrauensstandard durch geprüfte Inserate

---

## 2. Zielgruppen

### Käufer

* Produktionsunternehmen (10–1000 MA)
* Qualitätsmanagement / Messtechnik-Abteilungen
* Anforderungen: Vergleichbarkeit, Sicherheit, Service, Dokumentation

### Verkäufer

* Gebrauchtmaschinenhändler
* Maschinenhersteller (Refurbished)
* Servicefirmen / Kalibrierlabore
* Einzelunternehmen mit gelegentlichen Maschinen

---

## 3. Kernfunktionen (MVP)

### 3.1 Öffentlicher Marktplatz (Frontend)

#### Startseite

* Hero mit Value Proposition
* Featured Listings
* Erklärung „So funktioniert CMM24"
* Vertrauen (Herstellerlogos, geprüfte Inserate)

#### Inserate-Liste / Suche

* Filter:

  * Hersteller (aus Master-Daten)
  * Modell (abhängig von Hersteller)
  * Maschinentyp (Portal, Ausleger, Horizontal-Arm, etc.)
  * Baujahr
  * Preis (Min/Max)
  * Messbereich X/Y/Z (mm, Range-Slider)
  * Genauigkeit (µm, Range-Slider)
  * Software / Steuerung
  * Taster / Scanner
  * **Standort:**
    * Land
    * PLZ / Umkreis (km)
* Sortierung (Preis, Datum, Relevanz)
* SEO‑fähige URLs (`/maschinen/zeiss/contura`)

#### Inserat-Detailseite

* Bildergalerie mit Lightbox
* Video-Embed (YouTube / Vimeo)
* Key Facts (kompakt, tabellarisch)
* Beschreibung & Lieferumfang
* Dokumente (PDF-Download)
* Standort-Karte (ohne exakte Adresse)
* Verkäufer-Info (Firmenname, verifiziert-Badge)
* CTA: Anfrage senden, Angebot als PDF

#### Vergleichsfunktion

* Bis zu 5 Maschinen
* Tabellarischer Vergleich aller Specs
* Export als PDF

---

### 3.2 Verkäuferbereich (Seller Portal)

#### Auth & Accounts

* Registrierung / Login (E-Mail + Passwort)
* Magic Link als Alternative
* Firmenkonto (Account)
* Ein Benutzer = ein Account (MVP)

#### Dashboard

* Übersicht aktive Inserate (x / Limit)
* Anfragen / Leads (neu hervorgehoben)
* Abo-Status & Verlängerungsdatum
* Schnellaktionen (Neues Inserat, Alle Inserate)

#### Inserat anlegen

* Wizard:

  1. Stammdaten (Hersteller, Modell, Baujahr, Preis)
  2. Technische Daten (Messbereich, Genauigkeit, Software)
  3. Standort (Land, PLZ, Stadt)
  4. Medien & Dokumente
  5. Vorschau
  6. Veröffentlichen

* Status-Flow:

  * `draft` – Entwurf, nicht sichtbar
  * `pending_review` – Eingereicht, wartet auf Freigabe
  * `active` – Öffentlich sichtbar
  * `sold` – Verkauft (30 Tage sichtbar mit Badge)
  * `archived` – Nicht mehr sichtbar

#### Leadverwaltung

* Anfragen pro Inserat
* Status: neu → kontaktiert → Angebot → gewonnen / verloren
* Notizen zu jedem Lead
* E-Mail-Verlauf (Phase 2)

---

### 3.3 Admin-Bereich (Backoffice)

#### Dashboard

* Übersicht: Neue Inserate zur Prüfung
* Statistiken: Inserate, User, Anfragen
* System-Health (Stripe, Supabase)

#### Inserat-Moderation

* Queue: Inserate mit Status `pending_review`
* Prüfkriterien:
  * Bilder vorhanden & angemessen
  * Beschreibung plausibel
  * Keine Duplikate
  * Kontaktdaten nicht im Freitext
* Aktionen: Freigeben, Ablehnen (mit Begründung), Bearbeiten

#### User- & Account-Verwaltung

* Liste aller Accounts
* Account sperren / entsperren
* Abo manuell anpassen (Support-Fall)
* Impersonate (Login als User für Support)

#### Stammdaten-Verwaltung

* Hersteller hinzufügen / bearbeiten
* Modelle pflegen
* Maschinentypen / Kategorien

#### Reports & Meldungen

* Gemeldete Inserate prüfen
* Spam-Anfragen markieren

---

## 4. Monetarisierung & Pläne

### 4.1 Inseratskontingente

| Plan | Aktive Inserate | Preis monatlich | Preis jährlich  |
| ---- | --------------- | --------------- | --------------- |
| Free | 1               | kostenlos       | kostenlos       |
| S    | 3               | 12,99 €         | 9,99 € / Monat  |
| M    | 7               | 21,99 €         | 17,99 € / Monat |
| L    | 10              | 34,99 €         | 29,99 € / Monat |

Regeln:

* Limit gilt nur für **aktive** Inserate
* Unbegrenzt viele Entwürfe
* Downgrade greift zum Periodenende
* Bei Überschreitung: Blockieren neuer Aktivierungen
* Upgrade sofort wirksam

### 4.2 Zahlungsabwicklung

* Stripe Checkout (Hosted Payment Page)
* Monatlich oder jährlich (Rabatt bei jährlich)
* Webhook-basierte Synchronisation:
  * `checkout.session.completed` → Abo aktivieren
  * `invoice.paid` → Verlängerung
  * `invoice.payment_failed` → Grace Period (7 Tage)
  * `customer.subscription.deleted` → Downgrade auf Free

---

## 5. Backend & Datenmodell (Supabase)

### 5.1 Zentrale Entitäten

#### Master-Daten (Admin-gepflegt)

```
manufacturers
├── id (uuid, PK)
├── name (text, unique)
├── slug (text, unique)
├── logo_url (text, nullable)
├── country (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

models
├── id (uuid, PK)
├── manufacturer_id (uuid, FK → manufacturers)
├── name (text)
├── slug (text)
├── category (enum: portal, cantilever, horizontal_arm, gantry, optical, other)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### User & Accounts

```
profiles
├── id (uuid, PK, = auth.users.id)
├── email (text)
├── full_name (text)
├── avatar_url (text, nullable)
├── role (enum: user, admin, super_admin)
├── created_at (timestamptz)
└── updated_at (timestamptz)

accounts
├── id (uuid, PK)
├── owner_id (uuid, FK → profiles)
├── company_name (text)
├── slug (text, unique)
├── logo_url (text, nullable)
├── website (text, nullable)
├── phone (text, nullable)
├── address_street (text)
├── address_city (text)
├── address_postal_code (text)
├── address_country (text)
├── is_verified (boolean, default false)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### Listings

```
listings
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── manufacturer_id (uuid, FK → manufacturers)
├── model_id (uuid, FK → models, nullable)
├── model_name_custom (text, nullable) -- falls Modell nicht in DB
├── title (text)
├── slug (text, unique)
├── description (text)
├── price (integer, cents)
├── price_negotiable (boolean)
├── currency (text, default 'EUR')
├── year_built (integer)
├── condition (enum: new, like_new, good, fair)
├── -- Technische Daten
├── measuring_range_x (integer, mm)
├── measuring_range_y (integer, mm)
├── measuring_range_z (integer, mm)
├── accuracy_um (decimal) -- µm
├── software (text)
├── controller (text)
├── probe_system (text)
├── -- Standort
├── location_country (text)
├── location_city (text)
├── location_postal_code (text)
├── latitude (decimal, nullable)
├── longitude (decimal, nullable)
├── -- Status & Meta
├── status (enum: draft, pending_review, active, sold, archived)
├── featured (boolean, default false)
├── views_count (integer, default 0)
├── published_at (timestamptz, nullable)
├── sold_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

listing_media
├── id (uuid, PK)
├── listing_id (uuid, FK → listings)
├── type (enum: image, video, document)
├── url (text)
├── thumbnail_url (text, nullable)
├── filename (text)
├── size_bytes (integer)
├── mime_type (text)
├── sort_order (integer)
├── is_primary (boolean, default false)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### Inquiries & Leads

```
inquiries
├── id (uuid, PK)
├── listing_id (uuid, FK → listings)
├── account_id (uuid, FK → accounts) -- Verkäufer
├── -- Anfragesteller
├── contact_name (text)
├── contact_email (text)
├── contact_phone (text, nullable)
├── contact_company (text, nullable)
├── message (text)
├── -- Status
├── status (enum: new, contacted, offer_sent, won, lost)
├── notes (text, nullable) -- interne Notizen
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### Subscriptions & Plans

```
plans
├── id (uuid, PK)
├── name (text)
├── slug (text, unique)
├── listing_limit (integer)
├── price_monthly (integer, cents)
├── price_yearly (integer, cents)
├── stripe_price_id_monthly (text)
├── stripe_price_id_yearly (text)
├── is_active (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)

subscriptions
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── plan_id (uuid, FK → plans)
├── stripe_subscription_id (text, unique)
├── stripe_customer_id (text)
├── status (enum: active, past_due, canceled, trialing)
├── billing_interval (enum: monthly, yearly)
├── current_period_start (timestamptz)
├── current_period_end (timestamptz)
├── cancel_at_period_end (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### Audit & Notifications

```
audit_logs
├── id (uuid, PK)
├── entity_type (text) -- 'listing', 'account', etc.
├── entity_id (uuid)
├── action (text) -- 'created', 'updated', 'status_changed'
├── old_values (jsonb, nullable)
├── new_values (jsonb, nullable)
├── performed_by (uuid, FK → profiles)
├── created_at (timestamptz)

notifications
├── id (uuid, PK)
├── profile_id (uuid, FK → profiles)
├── type (text) -- 'new_inquiry', 'listing_approved', etc.
├── title (text)
├── body (text)
├── data (jsonb, nullable)
├── read_at (timestamptz, nullable)
├── created_at (timestamptz)
```

### 5.2 Kernregeln

* Listings gehören zu Accounts
* Nur `active` Listings zählen gegen das Kontingent
* Öffentliche Sichtbarkeit nur bei `status = active`
* `sold` Listings bleiben 30 Tage sichtbar (SEO)
* Archivierte Listings nach 365 Tagen löschen (DSGVO)

### 5.3 Row Level Security (RLS)

| Tabelle | Select | Insert | Update | Delete |
|---------|--------|--------|--------|--------|
| manufacturers | Public | Admin | Admin | Admin |
| models | Public | Admin | Admin | Admin |
| listings (active) | Public | Owner | Owner | Owner |
| listings (andere) | Owner/Admin | Owner | Owner | Owner |
| listing_media | Public (via listing) | Owner | Owner | Owner |
| inquiries | Owner (Verkäufer) | Public | Owner | Owner |
| accounts | Owner | Auth User | Owner | - |
| profiles | Own | - | Own | - |
| subscriptions | Owner | System | System | - |

---

## 6. Rollen & Rechte

### MVP

| Rolle | Beschreibung | Rechte |
|-------|--------------|--------|
| `user` | Registrierter Verkäufer | Eigene Inserate, Leads, Abo verwalten |
| `admin` | CMM24 Mitarbeiter | Inserate moderieren, User verwalten |
| `super_admin` | Technischer Admin | Alles + Stammdaten + System |

### Phase 2

* `editor` – Inserate erstellen/bearbeiten, keine Abo-Verwaltung
* `sales` – Nur Leads einsehen
* `viewer` – Nur Dashboard-Zugriff

---

## 7. Nicht‑funktionale Anforderungen

### Performance

* Seitenaufbau < 2s (LCP)
* Suche mit 10.000 Inseraten < 500ms
* Bilder via CDN (Supabase Storage + Transform)

### SEO

* Server-Side Rendering für alle öffentlichen Seiten
* Strukturierte Daten (JSON-LD: Product, Organization)
* XML-Sitemap (dynamisch generiert)
* Meta-Tags für Social Sharing (OG, Twitter)

### Caching

* Static Pages: ISR mit 60s Revalidation
* API: SWR / React Query mit Stale-While-Revalidate
* Supabase: Connection Pooling via Supavisor

### Mobile

* Mobile-First Design
* Touch-optimierte Filter
* PWA-fähig (Phase 2)

### Monitoring & Error Tracking

* Sentry für Frontend + Edge Functions
* Supabase Dashboard für DB-Monitoring
* Uptime-Monitoring (z.B. BetterStack)

### DSGVO & Compliance

* Cookie-Banner mit Consent-Management
* Datenschutzerklärung & Impressum
* Recht auf Löschung (Account-Deletion mit Daten-Anonymisierung)
* Auftragsverarbeitungsverträge (Supabase, Stripe, etc.)

---

## 8. Internationalisierung & Sprachen

### Verfügbare Sprachen (30 Sprachen)

Die Plattform wird in folgenden Sprachen zur Verfügung stehen:

| Sprache | Code | Region |
|---------|------|--------|
| Deutsch | `de` | DACH |
| Englisch | `en` | International |
| Französisch | `fr` | Frankreich, Belgien, Schweiz |
| Niederländisch | `nl` | Niederlande, Belgien |
| Italienisch | `it` | Italien, Schweiz |
| Spanisch | `es` | Spanien |
| Portugiesisch | `pt` | Portugal |
| Polnisch | `pl` | Polen |
| Tschechisch | `cs` | Tschechien |
| Slowakisch | `sk` | Slowakei |
| Ungarisch | `hu` | Ungarn |
| Rumänisch | `ro` | Rumänien |
| Bulgarisch | `bg` | Bulgarien |
| Griechisch | `el` | Griechenland |
| Türkisch | `tr` | Türkei |
| Kroatisch | `hr` | Kroatien |
| Serbisch | `sr` | Serbien |
| Bosnisch | `bs` | Bosnien-Herzegowina |
| Slowenisch | `sl` | Slowenien |
| Albanisch | `sq` | Albanien, Kosovo |
| Mazedonisch | `mk` | Nordmazedonien |
| Montenegrinisch | `cnr` | Montenegro |
| Schwedisch | `sv` | Schweden |
| Dänisch | `da` | Dänemark |
| Estnisch | `et` | Estland |
| Lettisch | `lv` | Lettland |
| Litauisch | `lt` | Litauen |
| Luxemburgisch | `lb` | Luxemburg |
| Georgisch | `ka` | Georgien |

### Technische Umsetzung

* **Framework:** next-intl
* **URL-Struktur:** Subdirectory-basiert (`/de/maschinen`, `/en/machines`)
* **Default:** Deutsch (`de`)
* **Fallback:** Englisch (`en`) für fehlende Übersetzungen

### Übersetzungs-Workflow

* JSON-basierte Übersetzungsdateien (`/messages/{locale}.json`)
* Professionelle Übersetzung für Haupt-UI
* Inserat-Inhalte bleiben in Originalsprache (Verkäufer-Input)
* Automatische Browser-Spracherkennung mit Override-Option

### Rollout-Plan

**Phase 1 (MVP):**
* Deutsch (Primär)
* Englisch (International)

**Phase 2:**
* Französisch, Niederländisch, Italienisch, Spanisch, Polnisch

**Phase 3:**
* Alle weiteren Sprachen

---

## 9. Tech Stack

### Frontend

* **Framework:** Next.js 14+ (App Router)
* **Styling:** Tailwind CSS
* **Components:** shadcn/ui
* **Forms:** React Hook Form + Zod
* **State:** Zustand (global), React Query (server state)
* **i18n:** next-intl (vorbereitet für Phase 3)

### Backend

* **Database:** Supabase (PostgreSQL 15)
* **Auth:** Supabase Auth (E-Mail, Magic Link)
* **Storage:** Supabase Storage (Bilder, PDFs)
* **Edge Functions:** Supabase Edge Functions (Deno)
* **Realtime:** Supabase Realtime (Notifications, Phase 2)

### Integrationen

* **Payments:** Stripe (Checkout, Webhooks, Customer Portal)
* **E-Mail:** Resend (Transactional Emails)
* **Maps:** Mapbox oder Leaflet (Standort-Anzeige)
* **Analytics:** Plausible oder PostHog
* **PDF:** @react-pdf/renderer (Server-side)

### DevOps

* **Hosting:** Vercel
* **CI/CD:** GitHub Actions
* **Preview:** Vercel Preview Deployments
* **Secrets:** Vercel Environment Variables

---

## 10. Benachrichtigungen & E-Mails

### Transaktionale E-Mails (Resend)

| Trigger | Empfänger | Template |
|---------|-----------|----------|
| Registrierung | User | `welcome` |
| Passwort vergessen | User | `password_reset` |
| Neue Anfrage | Verkäufer | `new_inquiry` |
| Inserat freigegeben | Verkäufer | `listing_approved` |
| Inserat abgelehnt | Verkäufer | `listing_rejected` |
| Abo bestätigt | Account Owner | `subscription_confirmed` |
| Abo läuft aus (7 Tage) | Account Owner | `subscription_expiring` |
| Zahlung fehlgeschlagen | Account Owner | `payment_failed` |

### In-App Notifications (Phase 2)

* Benachrichtigungs-Center im Header
* Ungelesen-Counter
* Realtime-Updates via Supabase Realtime

---

## 11. Import / Export

### MVP

* **Einzelnes Inserat:** PDF-Export (Angebot)
* **Leads:** CSV-Export

### Phase 2

* **Bulk-Import:** CSV/Excel für Händler mit vielen Maschinen
  * Template zum Download
  * Validierung & Fehler-Report
  * Mapping-UI für Spalten
* **API:** REST-API für Drittsysteme
  * API-Keys pro Account
  * Rate Limiting (100 req/min)
  * Endpoints: Listings CRUD, Inquiries Read

---

## 12. Sicherheit

### Authentifizierung

* Supabase Auth mit sicherer Session-Verwaltung
* Passwort-Policy: Min. 8 Zeichen
* Magic Link als passwortlose Alternative
* Session-Timeout: 7 Tage (Remember Me: 30 Tage)

### Autorisierung

* Row Level Security (RLS) auf allen Tabellen
* Server-side Validation in Edge Functions
* RBAC über `profiles.role`

### Input Validation

* Zod-Schemas für alle Formulare
* Server-side Re-Validation
* SQL-Injection: Verhindert durch Supabase Client
* XSS: React's JSX Escaping + DOMPurify für Rich-Text

### Rate Limiting

* Login-Versuche: 5/min pro IP
* Anfragen-Formular: 10/h pro IP
* API (Phase 2): 100 req/min pro API-Key

### File Upload Security

* Erlaubte Typen: JPEG, PNG, WebP, PDF
* Max. Größe: Bilder 10MB, PDFs 25MB
* Virus-Scan (Phase 2)
* Automatische Bild-Optimierung (Supabase Transform)

### Datenschutz

* Verschlüsselung at-rest (Supabase)
* TLS 1.3 für alle Verbindungen
* Keine sensiblen Daten in Logs
* PII-Anonymisierung bei Account-Löschung

---

## 13. Analytics & Tracking

### Tools

* **Web Analytics:** Plausible (DSGVO-konform, kein Cookie-Banner nötig)
* **Product Analytics:** PostHog (Self-hosted oder Cloud)
* **Error Tracking:** Sentry

### Zu trackende Events

| Event | Properties |
|-------|------------|
| `page_view` | path, referrer |
| `listing_view` | listing_id, manufacturer, model |
| `search_performed` | filters, result_count |
| `inquiry_submitted` | listing_id |
| `signup_started` | source |
| `signup_completed` | plan |
| `subscription_started` | plan, interval |
| `subscription_canceled` | plan, reason |

### Dashboards

* **Public Metrics:** Anzahl Inserate, Hersteller-Verteilung
* **Internal:** Conversion Funnels, Churn-Analyse, Revenue

---

## 14. Edge Cases & Regeln

### Account-Löschung

1. User fordert Löschung an
2. 14-Tage Wartezeit (Widerruf möglich)
3. Alle Inserate → `archived`
4. Personenbezogene Daten anonymisieren
5. Anfragen: E-Mail durch Hash ersetzen
6. Audit-Logs bleiben (anonymisiert)

### Abo-Downgrade bei Überschreitung

1. User hat Plan M (7 Inserate), 7 aktiv
2. Downgrade auf S (3 Inserate)
3. Zum Periodenende: Warnung per E-Mail
4. User muss 4 Inserate archivieren/löschen
5. Falls nicht: Älteste 4 Inserate → `archived`

### Inserat-Duplikate

* Prüfung bei Freigabe (Admin)
* Kriterien: Gleiche Seriennummer, gleiche Bilder
* Automatische Warnung (Phase 2)

### Verkaufte Maschinen

* 30 Tage sichtbar mit "VERKAUFT"-Badge
* Danach automatisch `archived`
* SEO-Redirect auf ähnliche Inserate (Phase 2)

---

## 15. Roadmap

### Phase 1 – MVP (3-4 Monate)

* Öffentlicher Marktplatz (Suche, Detail, Vergleich)
* Seller Portal (Dashboard, Wizard, Leads)
* Admin-Bereich (Moderation, Stammdaten)
* Abo-System (Stripe Integration)
* Transaktionale E-Mails
* Analytics-Grundsetup
* Sprachen: Deutsch + Englisch

### Phase 2 (2-3 Monate)

* Nutzerkonten für Käufer
* Favoriten & Suchaufträge
* Team-Mitglieder je Account
* Featured Listings / Boosts
* Bulk-Import (CSV)
* In-App Notifications
* API für Drittsysteme
* Erweiterung auf 7 Sprachen (+ FR, NL, IT, ES, PL)

### Phase 3 (3-4 Monate)

* Vollständige Mehrsprachigkeit (alle 30 Sprachen, siehe Abschnitt 8)
* Bewertungs-/Trust-System
* Internationale Expansion (gesamte EU + Balkan + Türkei + Georgien)
* Erweiterte Suche (Meilisearch)
* Mobile App (React Native)

---

## 16. Erfolgskennzahlen (KPIs)

### Growth

* Anzahl aktiver Inserate (Ziel MVP: 100)
* Anzahl registrierter Verkäufer (Ziel MVP: 50)
* Monatliche neue Inserate

### Engagement

* Conversion: Inserat-View → Anfrage (Ziel: 3%)
* Durchschnittliche Session-Dauer
* Vergleichs-Nutzung

### Revenue

* MRR (Monthly Recurring Revenue)
* Abo-Conversion Free → Paid (Ziel: 20%)
* Churn Rate (Ziel: < 5%/Monat)
* ARPU (Average Revenue Per User)

### Quality

* Durchschnittliche Inseratslaufzeit
* Anfragen pro Inserat
* Time-to-First-Response (Verkäufer)

---

## 17. Testing-Strategie

### Test-Pyramide

```
         ┌─────────┐
         │  E2E    │  ← Wenige, kritische User Flows
        ┌┴─────────┴┐
        │Integration│  ← API Routes, DB Queries
       ┌┴───────────┴┐
       │    Unit     │  ← Utils, Hooks, Validations
       └─────────────┘
```

### Unit Tests (Vitest)

* **Ziel-Coverage:** 80% für `/lib`, `/hooks`, `/utils`
* **Fokus:**
  * Zod-Validation-Schemas
  * Utility-Funktionen (Preis-Formatierung, Slug-Generierung)
  * Custom Hooks
  * Zustand-Stores

### Integration Tests (Vitest + Testing Library)

* **Fokus:**
  * API Route Handlers
  * Supabase Queries (mit Test-DB)
  * Stripe Webhook Handling
  * React Components mit Server-Daten

### E2E Tests (Playwright)

* **Kritische Flows:**

| Flow | Priorität |
|------|-----------|
| Registrierung → Account-Erstellung | P0 |
| Login (E-Mail + Magic Link) | P0 |
| Inserat-Wizard komplett durchspielen | P0 |
| Anfrage an Inserat senden | P0 |
| Stripe Checkout → Abo aktiv | P0 |
| Filter & Suche funktioniert | P1 |
| Vergleichsfunktion | P1 |
| Lead-Status ändern | P1 |
| Account-Einstellungen speichern | P2 |

### CI/CD Integration

```yaml
# GitHub Actions Pipeline
on: [push, pull_request]

jobs:
  test:
    - Lint (ESLint, Prettier)
    - Type Check (tsc)
    - Unit Tests (Vitest)
    - Integration Tests (Vitest)
    - E2E Tests (Playwright) # nur auf main/staging
  
  deploy:
    - Preview (PR) → Vercel Preview
    - Staging (develop) → staging.cmm24.de
    - Production (main) → cmm24.de
```

---

## 18. Environments & Deployment

### Environment-Übersicht

| Environment | Branch | URL | Supabase | Stripe |
|-------------|--------|-----|----------|--------|
| Local | - | localhost:3000 | Local (Docker) | Test Mode |
| Preview | PR branches | pr-123.vercel.app | Staging Project | Test Mode |
| Staging | `develop` | staging.cmm24.de | Staging Project | Test Mode |
| Production | `main` | cmm24.de | Production Project | Live Mode |

### Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CMM24

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (E-Mail)
RESEND_API_KEY=
EMAIL_FROM=noreply@cmm24.de

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=cmm24.de

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

### Database Migrations

* **Tool:** Supabase CLI (`supabase db diff`, `supabase db push`)
* **Migrations-Ordner:** `/supabase/migrations/`
* **Workflow:**
  1. Lokale Änderungen in Supabase Studio
  2. `supabase db diff -f migration_name` generiert SQL
  3. PR mit Migration-File
  4. Review & Merge
  5. `supabase db push` auf Staging/Production

### Seed Data

Initiale Daten für alle Environments:

```sql
-- /supabase/seed.sql

-- Hersteller
INSERT INTO manufacturers (name, slug) VALUES
  ('Zeiss', 'zeiss'),
  ('Hexagon', 'hexagon'),
  ('Wenzel', 'wenzel'),
  ('Mitutoyo', 'mitutoyo'),
  ('Coord3', 'coord3'),
  ('LK Metrology', 'lk-metrology'),
  ('Aberlink', 'aberlink'),
  ('Nikon Metrology', 'nikon-metrology');

-- Pläne
INSERT INTO plans (name, slug, listing_limit, price_monthly, price_yearly) VALUES
  ('Free', 'free', 1, 0, 0),
  ('Starter', 's', 3, 1299, 11988),
  ('Professional', 'm', 7, 2199, 21588),
  ('Business', 'l', 10, 3499, 35988);
```

### Deployment Checklist (Production)

- [ ] Alle Environment Variables gesetzt
- [ ] Supabase Migrations angewendet
- [ ] Stripe Webhooks konfiguriert
- [ ] DNS & SSL konfiguriert
- [ ] Sentry Project erstellt
- [ ] Plausible Domain hinzugefügt
- [ ] Resend Domain verifiziert
- [ ] Legal Pages vorhanden (Impressum, AGB, etc.)

---

## 19. API-Spezifikation

### Public API (Keine Auth erforderlich)

#### Listings

```
GET /api/listings
  Query: ?page=1&limit=20&manufacturer=zeiss&min_price=10000&max_price=50000
  Response: { data: Listing[], meta: { total, page, pages } }

GET /api/listings/[slug]
  Response: { data: ListingDetail }

GET /api/listings/[slug]/similar
  Response: { data: Listing[] }  # Max 4
```

#### Stammdaten

```
GET /api/manufacturers
  Response: { data: Manufacturer[] }

GET /api/models?manufacturer_id=uuid
  Response: { data: Model[] }
```

#### Anfragen

```
POST /api/inquiries
  Body: { listing_id, name, email, phone?, company?, message }
  Response: { success: true, id: uuid }
  Rate Limit: 10/h pro IP
```

### Protected API (Auth erforderlich)

#### Seller - Listings

```
GET /api/seller/listings
  Response: { data: Listing[], meta: { active_count, limit } }

POST /api/seller/listings
  Body: ListingCreateInput
  Response: { data: Listing }

GET /api/seller/listings/[id]
  Response: { data: ListingDetail }

PUT /api/seller/listings/[id]
  Body: ListingUpdateInput
  Response: { data: Listing }

DELETE /api/seller/listings/[id]
  Response: { success: true }

POST /api/seller/listings/[id]/publish
  Response: { data: Listing }  # Status → pending_review

POST /api/seller/listings/[id]/archive
  Response: { data: Listing }  # Status → archived

POST /api/seller/listings/[id]/mark-sold
  Response: { data: Listing }  # Status → sold
```

#### Seller - Media

```
POST /api/seller/listings/[id]/media
  Body: FormData (files)
  Response: { data: Media[] }

DELETE /api/seller/listings/[id]/media/[media_id]
  Response: { success: true }

PUT /api/seller/listings/[id]/media/reorder
  Body: { order: [media_id, media_id, ...] }
  Response: { success: true }
```

#### Seller - Inquiries

```
GET /api/seller/inquiries
  Query: ?status=new&listing_id=uuid
  Response: { data: Inquiry[] }

GET /api/seller/inquiries/[id]
  Response: { data: InquiryDetail }

PUT /api/seller/inquiries/[id]
  Body: { status, notes }
  Response: { data: Inquiry }
```

#### Seller - Account & Subscription

```
GET /api/seller/account
  Response: { data: Account, subscription: Subscription }

PUT /api/seller/account
  Body: AccountUpdateInput
  Response: { data: Account }

POST /api/seller/subscription/checkout
  Body: { plan_id, interval: 'monthly' | 'yearly' }
  Response: { checkout_url: string }

POST /api/seller/subscription/portal
  Response: { portal_url: string }  # Stripe Customer Portal
```

### Admin API

```
GET /api/admin/listings/pending
  Response: { data: Listing[] }

POST /api/admin/listings/[id]/approve
  Response: { data: Listing }

POST /api/admin/listings/[id]/reject
  Body: { reason: string }
  Response: { data: Listing }

GET /api/admin/accounts
  Query: ?search=company_name
  Response: { data: Account[] }

POST /api/admin/accounts/[id]/verify
  Response: { data: Account }

POST /api/admin/accounts/[id]/suspend
  Body: { reason: string }
  Response: { data: Account }
```

### Webhooks

```
POST /api/webhooks/stripe
  Headers: Stripe-Signature
  Events:
    - checkout.session.completed → Subscription erstellen
    - invoice.paid → Subscription verlängern
    - invoice.payment_failed → Grace Period starten
    - customer.subscription.updated → Plan-Änderung
    - customer.subscription.deleted → Auf Free downgraden
```

---

## 20. Sitemap & Routes

### Öffentliche Seiten

```
/                                    → Startseite
/[locale]/maschinen                  → Listing-Übersicht mit Filter
/[locale]/maschinen/[slug]           → Listing-Detailseite
/[locale]/vergleich                  → Vergleichsseite (bis 5 Maschinen)
/[locale]/hersteller                 → Hersteller-Übersicht
/[locale]/hersteller/[slug]          → Hersteller-Seite mit deren Maschinen
/[locale]/ueber-uns                  → Über CMM24
/[locale]/so-funktionierts           → Wie es funktioniert
/[locale]/kontakt                    → Kontaktformular
/[locale]/faq                        → Häufige Fragen
```

### Legal Pages

```
/[locale]/impressum                  → Impressum
/[locale]/datenschutz                → Datenschutzerklärung
/[locale]/agb                        → Allgemeine Geschäftsbedingungen
/[locale]/widerrufsbelehrung         → Widerrufsrecht für Abos
/[locale]/cookie-richtlinie          → Cookie Policy
```

### Auth Pages

```
/[locale]/login                      → Login (E-Mail/Passwort + Magic Link)
/[locale]/registrieren               → Registrierung
/[locale]/passwort-vergessen         → Passwort zurücksetzen
/[locale]/passwort-reset             → Neues Passwort setzen (mit Token)
/[locale]/email-bestaetigen          → E-Mail-Bestätigung
```

### Seller Portal (Auth required)

```
/seller                              → Redirect zu /seller/dashboard
/seller/dashboard                    → Dashboard mit Übersicht
/seller/inserate                     → Alle eigenen Inserate
/seller/inserate/neu                 → Neues Inserat (Wizard)
/seller/inserate/[id]                → Inserat bearbeiten
/seller/inserate/[id]/vorschau       → Vorschau vor Veröffentlichung
/seller/anfragen                     → Alle Anfragen/Leads
/seller/anfragen/[id]                → Anfrage-Detail
/seller/konto                        → Account-Einstellungen
/seller/konto/firma                  → Firmendaten bearbeiten
/seller/konto/passwort               → Passwort ändern
/seller/abo                          → Abo-Verwaltung
/seller/abo/upgrade                  → Plan-Upgrade
/seller/rechnungen                   → Rechnungshistorie
```

### Admin Panel (Admin role required)

```
/admin                               → Redirect zu /admin/dashboard
/admin/dashboard                     → Admin-Dashboard
/admin/moderation                    → Inserate zur Freigabe
/admin/moderation/[id]               → Inserat prüfen
/admin/inserate                      → Alle Inserate
/admin/accounts                      → Alle Verkäufer-Accounts
/admin/accounts/[id]                 → Account-Detail
/admin/stammdaten                    → Hersteller & Modelle
/admin/stammdaten/hersteller         → Hersteller verwalten
/admin/stammdaten/modelle            → Modelle verwalten
```

### Error Pages

```
/404                                 → Seite nicht gefunden
/500                                 → Server Error
/maintenance                         → Wartungsmodus
```

### XML Sitemaps (Auto-generiert)

```
/sitemap.xml                         → Index Sitemap
/sitemap-static.xml                  → Statische Seiten
/sitemap-listings.xml                → Alle aktiven Inserate
/sitemap-manufacturers.xml           → Hersteller-Seiten
```

---

## 21. Legal & Compliance

### Erforderliche Legal Pages

| Seite | Inhalt | Verantwortlich |
|-------|--------|----------------|
| **Impressum** | Firmenangaben, USt-ID, Kontakt, Vertretungsberechtigte | Rechtsanwalt |
| **AGB** | Nutzungsbedingungen, Haftung, Vertragsschluss | Rechtsanwalt |
| **Datenschutz** | DSGVO-konforme Erklärung, Cookies, Drittanbieter | Rechtsanwalt |
| **Widerrufsbelehrung** | 14-Tage Widerruf für Abos | Rechtsanwalt |
| **Cookie-Richtlinie** | Cookie-Typen, Opt-out | Rechtsanwalt |

### Rechnungsstellung & Steuern

#### Invoicing

* **Tool:** Stripe Invoicing (automatisch)
* **Rechnungsnummer:** Fortlaufend, Format `CMM-2026-00001`
* **PDF-Download:** Im Seller Portal unter `/seller/rechnungen`

#### USt/VAT Handling

| Kunde | Standort | Behandlung |
|-------|----------|------------|
| B2B | Deutschland | 19% MwSt |
| B2B | EU (mit USt-ID) | Reverse Charge (0%) |
| B2B | EU (ohne USt-ID) | 19% MwSt |
| B2B | Drittland | Steuerfrei |

* **USt-ID Validierung:** VIES API bei Registrierung
* **Stripe Tax:** Automatische Steuerberechnung aktivieren

### DSGVO-Compliance

| Anforderung | Umsetzung |
|-------------|-----------|
| Einwilligung | Cookie-Banner (nur bei Analytics mit Cookies) |
| Auskunftsrecht | Daten-Export im Account-Bereich |
| Löschrecht | Account-Löschung mit 14-Tage Frist |
| Datenportabilität | JSON-Export der eigenen Daten |
| Auftragsverarbeitung | AVV mit Supabase, Stripe, Resend, Vercel |

### Cookie-Consent

* **Tool:** Eigene Implementierung oder Cookiebot
* **Kategorien:**
  * Notwendig (Session, Auth) – immer aktiv
  * Funktional (Sprache, Vergleich) – Opt-in
  * Analytik (Plausible) – kein Cookie, kein Consent nötig

---

## 22. Design System & UI States

### Component Library

* **Basis:** shadcn/ui
* **Erweiterungen:** Eigene Components in `/components/ui/`

### UI States

Jede interaktive Komponente muss folgende States haben:

| State | Beschreibung | Beispiel |
|-------|--------------|----------|
| **Default** | Normalzustand | Button blau |
| **Hover** | Mouse-over | Button dunkler |
| **Focus** | Keyboard-Fokus | Outline Ring |
| **Active** | Während Klick | Button eingedrückt |
| **Disabled** | Nicht verfügbar | Grau, cursor: not-allowed |
| **Loading** | Aktion läuft | Spinner, disabled |

### Page States

| State | Komponente | Wann |
|-------|------------|------|
| **Loading** | Skeleton | Daten werden geladen |
| **Empty** | EmptyState | Keine Daten vorhanden |
| **Error** | ErrorState | Fehler beim Laden |
| **Success** | Toast/Alert | Aktion erfolgreich |

### Empty States

```tsx
// Beispiel-Texte für Empty States

/seller/inserate (keine Inserate):
  Icon: FileX
  Titel: "Noch keine Inserate"
  Text: "Erstellen Sie Ihr erstes Inserat und erreichen Sie Käufer in ganz Europa."
  CTA: "Inserat erstellen"

/seller/anfragen (keine Anfragen):
  Icon: MessageSquare
  Titel: "Noch keine Anfragen"
  Text: "Sobald Interessenten Ihre Maschinen anfragen, erscheinen diese hier."

/maschinen (keine Ergebnisse):
  Icon: SearchX
  Titel: "Keine Maschinen gefunden"
  Text: "Versuchen Sie, Ihre Filter anzupassen oder die Suche zu erweitern."
  CTA: "Filter zurücksetzen"
```

### Toast Notifications

| Typ | Farbe | Icon | Beispiel |
|-----|-------|------|----------|
| Success | Grün | CheckCircle | "Inserat erfolgreich gespeichert" |
| Error | Rot | XCircle | "Fehler beim Speichern" |
| Warning | Gelb | AlertTriangle | "Abo läuft in 7 Tagen ab" |
| Info | Blau | Info | "Neue Anfrage erhalten" |

### Accessibility (a11y)

* **Standard:** WCAG 2.1 Level AA
* **Anforderungen:**
  * Farbkontrast min. 4.5:1 (Text), 3:1 (große Elemente)
  * Alle Bilder mit Alt-Text
  * Formulare mit Labels
  * Keyboard-Navigation vollständig
  * Focus-Indicator sichtbar
  * Skip-to-Content Link
  * ARIA-Labels wo nötig

---

## 23. Projektstruktur

### Ordnerstruktur

```
/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, Test, Type-Check
│       └── deploy.yml          # Vercel Deployment
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── robots.txt
│
├── src/
│   ├── app/
│   │   ├── [locale]/           # i18n Routing
│   │   │   ├── (public)/       # Öffentliche Seiten
│   │   │   │   ├── page.tsx    # Startseite
│   │   │   │   ├── maschinen/
│   │   │   │   └── ...
│   │   │   ├── (auth)/         # Auth-Seiten (eigenes Layout)
│   │   │   │   ├── login/
│   │   │   │   └── registrieren/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (seller)/           # Seller Portal (eigenes Layout)
│   │   │   ├── seller/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── inserate/
│   │   │   │   └── ...
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (admin)/            # Admin Panel
│   │   │   ├── admin/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                # API Route Handlers
│   │   │   ├── listings/
│   │   │   ├── seller/
│   │   │   ├── admin/
│   │   │   └── webhooks/
│   │   │
│   │   ├── layout.tsx          # Root Layout
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui + eigene Basis-Components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout-Components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── features/           # Feature-spezifische Components
│   │   │   ├── listings/
│   │   │   │   ├── listing-card.tsx
│   │   │   │   ├── listing-grid.tsx
│   │   │   │   ├── listing-filters.tsx
│   │   │   │   └── listing-detail.tsx
│   │   │   ├── seller/
│   │   │   ├── admin/
│   │   │   └── ...
│   │   │
│   │   └── shared/             # Shared Components
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Client
│   │   │   ├── server.ts       # Server Client
│   │   │   ├── admin.ts        # Service Role Client
│   │   │   └── queries/        # Type-safe Queries
│   │   │       ├── listings.ts
│   │   │       ├── accounts.ts
│   │   │       └── ...
│   │   │
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   │
│   │   ├── resend/
│   │   │   ├── client.ts
│   │   │   └── templates/
│   │   │
│   │   └── utils/
│   │       ├── format.ts       # Preis, Datum, etc.
│   │       ├── slug.ts
│   │       └── cn.ts           # classNames helper
│   │
│   ├── hooks/
│   │   ├── use-listings.ts
│   │   ├── use-auth.ts
│   │   └── use-media-upload.ts
│   │
│   ├── stores/                 # Zustand Stores
│   │   ├── compare-store.ts
│   │   └── filter-store.ts
│   │
│   ├── types/
│   │   ├── database.ts         # Supabase generated types
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── validations/            # Zod Schemas
│   │   ├── listing.ts
│   │   ├── account.ts
│   │   └── inquiry.ts
│   │
│   └── messages/               # i18n Übersetzungen
│       ├── de.json
│       ├── en.json
│       └── ...
│
├── supabase/
│   ├── migrations/             # SQL Migrations
│   ├── seed.sql               # Seed Data
│   └── config.toml
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

### Naming Conventions

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Dateien (Components) | kebab-case | `listing-card.tsx` |
| Dateien (Utils) | kebab-case | `format-price.ts` |
| Components | PascalCase | `ListingCard` |
| Hooks | camelCase mit `use` | `useListings` |
| Types/Interfaces | PascalCase | `ListingDetail` |
| Enums | PascalCase | `ListingStatus` |
| Constants | SCREAMING_SNAKE | `MAX_IMAGES` |
| CSS Classes | Tailwind | `text-gray-900` |

### Code Style

* **ESLint:** Next.js defaults + custom rules
* **Prettier:** 2 Spaces, Single Quotes, Trailing Comma
* **TypeScript:** Strict Mode

---

## 24. Dokumentation

### Repository-Dokumentation

```
/docs
├── README.md                   # Projekt-Übersicht
├── CONTRIBUTING.md             # Contribution Guidelines
├── DEVELOPMENT.md              # Lokales Setup
├── DEPLOYMENT.md               # Deployment Guide
├── ARCHITECTURE.md             # Architektur-Übersicht
└── API.md                      # API-Dokumentation
```

### README.md Struktur

```markdown
# CMM24

B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen.

## Quick Start

1. Clone repo
2. Copy .env.example to .env.local
3. npm install
4. npm run dev

## Tech Stack
- Next.js 14 (App Router)
- Supabase (Postgres, Auth, Storage)
- Stripe
- Tailwind + shadcn/ui

## Commands
- npm run dev - Development Server
- npm run build - Production Build
- npm run test - Run Tests
- npm run lint - Linting

## Documentation
- [Development Guide](./docs/DEVELOPMENT.md)
- [API Documentation](./docs/API.md)
- [Deployment](./docs/DEPLOYMENT.md)
```

### API-Dokumentation

* **Tool:** OpenAPI 3.0 Spec oder Markdown
* **Location:** `/docs/API.md` oder Swagger UI

### Onboarding-Dokumentation

Für neue Entwickler:

1. Projekt-Kontext & PRD lesen
2. Lokales Setup (DEVELOPMENT.md)
3. Architektur verstehen (ARCHITECTURE.md)
4. Erste Issues bearbeiten (good-first-issue Label)

---

## 25. User Personas

### Persona 1: Der Qualitätsmanager (Käufer)

| Attribut | Beschreibung |
|----------|--------------|
| **Name** | Thomas Meier |
| **Alter** | 45 Jahre |
| **Rolle** | Leiter Qualitätsmanagement |
| **Unternehmen** | Mittelständischer Automobilzulieferer, 250 MA |
| **Erfahrung** | 15 Jahre in der Messtechnik |

**Ziele:**
- Gebrauchte CMM finden, die ins Budget passt (max. 80.000 €)
- Technische Spezifikationen schnell vergleichen
- Vertrauenswürdige Verkäufer identifizieren
- Zeit sparen durch strukturierte Informationen

**Pain Points:**
- Unübersichtliche eBay-Kleinanzeigen
- Fehlende technische Details bei anderen Plattformen
- Schwer einzuschätzen, ob Verkäufer seriös ist
- Keine Vergleichsmöglichkeit

**Verhalten:**
- Recherchiert gründlich vor Kontaktaufnahme
- Vergleicht 3-5 Maschinen
- Entscheidet nicht allein (Geschäftsführung involviert)
- Braucht PDF für interne Präsentation

**Technologie:**
- Desktop im Büro (80%)
- Tablet in Meetings (15%)
- Smartphone unterwegs (5%)

---

### Persona 2: Der Gelegenheitsverkäufer (Verkäufer)

| Attribut | Beschreibung |
|----------|--------------|
| **Name** | Sandra Becker |
| **Alter** | 38 Jahre |
| **Rolle** | Geschäftsführerin |
| **Unternehmen** | Präzisionsfertigung GmbH, 45 MA |
| **Erfahrung** | Erstes Mal CMM verkaufen |

**Ziele:**
- Alte Maschine verkaufen (Upgrade auf neue)
- Fairen Preis erzielen
- Möglichst wenig Aufwand
- Seriöse Käufer erreichen

**Pain Points:**
- Weiß nicht, welcher Preis realistisch ist
- Keine Erfahrung mit Maschinenverkauf
- Will keine Spam-Anfragen
- Zeitdruck durch laufendes Geschäft

**Verhalten:**
- Nutzt Plattform 1-2x pro Jahr
- Braucht klare Anleitung
- Will schnell Inserat erstellen
- Reagiert auf Anfragen per E-Mail

**Technologie:**
- Desktop primär
- Smartphone für Benachrichtigungen

---

### Persona 3: Der Profi-Händler (Verkäufer)

| Attribut | Beschreibung |
|----------|--------------|
| **Name** | Michael Hoffmann |
| **Alter** | 52 Jahre |
| **Rolle** | Inhaber Gebrauchtmaschinenhandel |
| **Unternehmen** | CMM-Trade GmbH, 8 MA |
| **Erfahrung** | 20 Jahre Maschinenhandel |

**Ziele:**
- Mehrere Maschinen gleichzeitig inserieren
- Professionelles Erscheinungsbild
- Leads effizient verwalten
- ROI der Plattform maximieren

**Pain Points:**
- Jede Plattform hat anderes Format
- Zu viele Kanäle zu pflegen
- Unqualifizierte Anfragen kosten Zeit
- Keine Übersicht über alle Leads

**Verhalten:**
- 5-10 aktive Inserate gleichzeitig
- Aktualisiert Preise regelmäßig
- Reagiert schnell auf Anfragen (<24h)
- Will Bulk-Funktionen

**Technologie:**
- Desktop 90%
- Smartphone für Lead-Benachrichtigungen

---

## 26. User Journeys

### Journey 1: Maschine suchen & anfragen (Käufer)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PHASE       │  AWARENESS    │  SEARCH       │  EVALUATE     │  CONTACT        │
├──────────────┼───────────────┼───────────────┼───────────────┼─────────────────┤
│  Touchpoint  │  Google       │  Startseite   │  Detailseite  │  Anfrageform    │
│              │  Empfehlung   │  Suche/Filter │  Vergleich    │  E-Mail         │
├──────────────┼───────────────┼───────────────┼───────────────┼─────────────────┤
│  Aktion      │  "gebrauchte  │  Filter       │  Specs prüfen │  Formular       │
│              │   CMM kaufen" │  setzen       │  PDF laden    │  ausfüllen      │
├──────────────┼───────────────┼───────────────┼───────────────┼─────────────────┤
│  Gedanken    │  "Wo finde    │  "Gibt es     │  "Passt die   │  "Ist der       │
│              │   ich was?"   │  was für      │  zu uns?"     │  Verkäufer      │
│              │               │  mich?"       │               │  seriös?"       │
├──────────────┼───────────────┼───────────────┼───────────────┼─────────────────┤
│  Emotion     │  🤔 Unsicher  │  😊 Hoffnung  │  🧐 Prüfend   │  😰 Nervös      │
├──────────────┼───────────────┼───────────────┼───────────────┼─────────────────┤
│  Pain Point  │  Zu viele     │  Filter zu    │  Vergleich    │  Spam-Angst     │
│              │  Quellen      │  kompliziert  │  umständlich  │  (Verkäufer)    │
├──────────────┼───────────────┼───────────────┼───────────────┼─────────────────┤
│  Lösung      │  SEO, klare   │  Smart        │  Vergleichs-  │  "Geprüft"-     │
│              │  Value Prop   │  Defaults     │  funktion     │  Badge, DSGVO   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Journey 2: Inserat erstellen (Verkäufer)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE       │  REGISTER     │  CREATE       │  UPLOAD       │  PUBLISH      │ MANAGE │
├──────────────┼───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│  Touchpoint  │  Registrier-  │  Wizard       │  Media-       │  Vorschau &   │ Dash-  │
│              │  ung          │  Step 1-3     │  Upload       │  Freigabe     │ board  │
├──────────────┼───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│  Aktion      │  Account      │  Daten        │  Fotos        │  Prüfen &     │ Leads  │
│              │  erstellen    │  eingeben     │  hochladen    │  absenden     │ bearb. │
├──────────────┼───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│  Gedanken    │  "Muss ich    │  "Wie viel    │  "Welche      │  "Sieht das   │ "Wer   │
│              │  zahlen?"     │  ausfüllen?"  │  Fotos?"      │  gut aus?"    │ ist    │
│              │               │               │               │               │ seriös?│
├──────────────┼───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│  Emotion     │  😟 Skepsis   │  😓 Aufwand   │  😊 Fast      │  😄 Stolz     │ 😃     │
│              │               │               │  fertig!      │               │ Erfolg │
├──────────────┼───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│  Pain Point  │  Abo-Zwang?   │  Zu viele     │  Bilder zu    │  Wartezeit    │ Spam-  │
│              │               │  Felder       │  groß         │  bei Prüfung  │ Leads  │
├──────────────┼───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│  Lösung      │  Free-Plan    │  Auto-Save,   │  Auto-Resize  │  Status-      │ Lead-  │
│              │  prominent    │  Progress     │  Drag & Drop  │  Anzeige      │ Status │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### Kritische Momente (Moments of Truth)

| Moment | Beschreibung | Erfolgskriterium |
|--------|--------------|------------------|
| **First Impression** | Startseite laden | <2s, Value Prop sofort klar |
| **First Search** | Filter nutzen, Ergebnisse sehen | Relevante Ergebnisse, kein Leerlauf |
| **First Inquiry** | Anfrage absenden | Einfaches Formular, Bestätigung |
| **First Listing** | Inserat fertigstellen | <10 min, alle Daten erfasst |
| **First Lead** | Anfrage erhalten | Sofortige Benachrichtigung |

---

## 27. Visual Design System

### Farbpalette

#### Primary Colors

```css
--color-primary-50:  #E8F4FD;   /* Backgrounds */
--color-primary-100: #C5E4FA;
--color-primary-200: #9DD2F7;
--color-primary-300: #6EBDF3;
--color-primary-400: #47ABEF;
--color-primary-500: #1E90E6;   /* Main Brand */
--color-primary-600: #1876C4;
--color-primary-700: #125C9E;
--color-primary-800: #0D4478;
--color-primary-900: #082C52;   /* Dark variant */
```

#### Neutral Colors

```css
--color-neutral-0:   #FFFFFF;   /* White */
--color-neutral-50:  #F9FAFB;   /* Page Background */
--color-neutral-100: #F3F4F6;   /* Card Background */
--color-neutral-200: #E5E7EB;   /* Borders */
--color-neutral-300: #D1D5DB;   /* Disabled */
--color-neutral-400: #9CA3AF;   /* Placeholder */
--color-neutral-500: #6B7280;   /* Secondary Text */
--color-neutral-600: #4B5563;   /* Body Text */
--color-neutral-700: #374151;   /* Headings */
--color-neutral-800: #1F2937;   /* Strong Text */
--color-neutral-900: #111827;   /* Black Text */
```

#### Semantic Colors

```css
/* Success */
--color-success-50:  #ECFDF5;
--color-success-500: #10B981;
--color-success-700: #047857;

/* Warning */
--color-warning-50:  #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-700: #B45309;

/* Error */
--color-error-50:    #FEF2F2;
--color-error-500:   #EF4444;
--color-error-700:   #B91C1C;

/* Info */
--color-info-50:     #EFF6FF;
--color-info-500:    #3B82F6;
--color-info-700:    #1D4ED8;
```

### Typography

#### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

#### Font Sizes (Type Scale)

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `xs` | 12px | 16px | 400 | Captions, Badges |
| `sm` | 14px | 20px | 400 | Secondary text, Labels |
| `base` | 16px | 24px | 400 | Body text |
| `lg` | 18px | 28px | 500 | Lead paragraphs |
| `xl` | 20px | 28px | 600 | Card titles |
| `2xl` | 24px | 32px | 600 | Section headers |
| `3xl` | 30px | 36px | 700 | Page titles |
| `4xl` | 36px | 40px | 700 | Hero headlines |
| `5xl` | 48px | 48px | 800 | Marketing headlines |

### Spacing System (8px Grid)

```css
--space-0:  0;
--space-1:  4px;    /* 0.25rem */
--space-2:  8px;    /* 0.5rem  */
--space-3:  12px;   /* 0.75rem */
--space-4:  16px;   /* 1rem    */
--space-5:  20px;   /* 1.25rem */
--space-6:  24px;   /* 1.5rem  */
--space-8:  32px;   /* 2rem    */
--space-10: 40px;   /* 2.5rem  */
--space-12: 48px;   /* 3rem    */
--space-16: 64px;   /* 4rem    */
--space-20: 80px;   /* 5rem    */
--space-24: 96px;   /* 6rem    */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm:   4px;   /* Inputs, small buttons */
--radius-md:   8px;   /* Cards, buttons */
--radius-lg:   12px;  /* Modals, large cards */
--radius-xl:   16px;  /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows

```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Icons

* **Library:** Lucide React
* **Sizes:** 16px (sm), 20px (md), 24px (lg), 32px (xl)
* **Stroke:** 2px
* **Style:** Outline (nicht filled)

---

## 28. Responsive Design

### Breakpoints

| Name | Min-Width | Typical Device | Columns |
|------|-----------|----------------|---------|
| `xs` | 0px | Small phones | 1 |
| `sm` | 640px | Large phones | 1-2 |
| `md` | 768px | Tablets | 2-3 |
| `lg` | 1024px | Small laptops | 3-4 |
| `xl` | 1280px | Desktops | 4 |
| `2xl` | 1536px | Large screens | 4-6 |

### Container Widths

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1400px;  /* Max content width */
```

### Layout-Verhalten

#### Header

| Breakpoint | Verhalten |
|------------|-----------|
| Mobile (<768px) | Logo + Hamburger + Search-Icon |
| Tablet (768-1024px) | Logo + Compact Nav + Search |
| Desktop (>1024px) | Logo + Full Nav + Search + User Menu |

#### Listing Grid

| Breakpoint | Spalten | Card-Größe |
|------------|---------|------------|
| xs (<640px) | 1 | Full width |
| sm (640-768px) | 2 | ~300px |
| md (768-1024px) | 2-3 | ~280px |
| lg (1024-1280px) | 3 | ~300px |
| xl (>1280px) | 4 | ~280px |

#### Filter Sidebar

| Breakpoint | Verhalten |
|------------|-----------|
| Mobile (<1024px) | Bottom Sheet / Full-Screen Modal |
| Desktop (>1024px) | Sticky Sidebar (280px) |

### Touch Targets

* **Minimum:** 44x44px für alle interaktiven Elemente
* **Recommended:** 48x48px für primäre Aktionen
* **Spacing:** Mindestens 8px zwischen Touch-Targets

### Mobile Navigation

```
┌─────────────────────────────────┐
│ [≡]    CMM24 Logo      [🔍][👤]│
└─────────────────────────────────┘

Mobile Menu (Hamburger):
┌─────────────────────────────────┐
│                           [✕]  │
│ ─────────────────────────────  │
│ 🏠  Startseite                 │
│ 📦  Maschinen                  │
│ 🏭  Hersteller                 │
│ ❓  Wie es funktioniert        │
│ ─────────────────────────────  │
│ 🌐  Sprache: Deutsch      [▼]  │
│ ─────────────────────────────  │
│ [    Einloggen    ]            │
│ [   Registrieren  ]            │
└─────────────────────────────────┘
```

---

## 29. Component Specifications

### Listing Card

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │           [Hauptbild]               │ │  Aspect Ratio: 4:3
│ │            300x225px                │ │
│ │                                     │ │
│ │  ┌───────┐                   [♡]   │ │  Badge: NEU/VERKAUFT
│ │  │ NEU   │                         │ │  Favorit-Button (Phase 2)
│ │  └───────┘                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  ZEISS                                  │  text-xs, text-neutral-500, uppercase
│  Contura 10/12/6                        │  text-lg, font-semibold, truncate
│  ─────────────────────────────────────  │
│  📅 Baujahr: 2019                       │  text-sm, text-neutral-600
│  📍 München, Deutschland                │  text-sm, text-neutral-500
│  ─────────────────────────────────────  │
│                                         │
│  45.000 €                    [Anfrage]  │  text-xl, font-bold | Button sm
│                                         │
└─────────────────────────────────────────┘

Width: 280-320px (responsive)
Padding: 0 (image) / 16px (content)
Gap: 8px between elements
Border: 1px solid neutral-200
Border-radius: 12px
Shadow: shadow-sm, shadow-md on hover
Transition: transform 0.2s, shadow 0.2s
Hover: translateY(-4px), shadow-lg
```

### Filter Sidebar (Desktop)

```
┌─────────────────────────────────┐
│  Filter                 [Reset] │  Header mit Reset-Link
│ ───────────────────────────────│
│                                 │
│  Hersteller                [▼]  │  Accordion, default open
│  ┌─────────────────────────┐   │
│  │ 🔍 Suchen...            │   │  Search in Dropdown
│  ├─────────────────────────┤   │
│  │ ☑ Zeiss            (45) │   │  Checkbox + Count
│  │ ☐ Hexagon          (32) │   │
│  │ ☐ Wenzel           (28) │   │
│  │ ☐ Mitutoyo         (15) │   │
│  │   + 12 weitere          │   │  "Show more" Link
│  └─────────────────────────┘   │
│                                 │
│  Preis                     [▼]  │
│  ┌─────────────────────────┐   │
│  │  Min €    │    Max €    │   │  Dual Input
│  │  [10.000] │ [100.000]   │   │
│  ├─────────────────────────┤   │
│  │  ●────────────●         │   │  Range Slider
│  │  0€          200.000€   │   │
│  └─────────────────────────┘   │
│                                 │
│  Baujahr                   [▼]  │
│  Messbereich               [▲]  │  Collapsed
│  Genauigkeit               [▲]  │
│  Standort                  [▲]  │
│                                 │
│ ───────────────────────────────│
│  [  123 Ergebnisse anzeigen  ] │  Sticky Button (Mobile)
└─────────────────────────────────┘

Width: 280px (fixed)
Position: sticky, top: 80px
Max-height: calc(100vh - 100px)
Overflow: auto
```

### Filter Modal (Mobile)

```
┌─────────────────────────────────┐
│  Filter                    [✕]  │  Header
│ ───────────────────────────────│
│                                 │
│  ┌─────────────────────────┐   │
│  │ Hersteller          [▼] │   │
│  │ Preis               [▼] │   │
│  │ Baujahr             [▼] │   │
│  │ ...                     │   │
│  └─────────────────────────┘   │
│                                 │
│  Aktive Filter:                 │
│  [Zeiss ✕] [10k-50k € ✕]       │  Filter Chips
│                                 │
│ ───────────────────────────────│
│  [Zurücksetzen]  [123 anzeigen]│  Footer Buttons
└─────────────────────────────────┘

Animation: Slide up from bottom
Height: 90vh (max)
Border-radius: 16px 16px 0 0 (top)
Backdrop: rgba(0,0,0,0.5)
```

### Wizard Step Indicator

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ●─────────●─────────○─────────○─────────○                        │
│   1         2         3         4         5                        │
│  Stamm-   Technik   Standort  Medien   Vorschau                   │
│  daten                                                              │
│                                                                     │
│   ●  = Completed (primary-500)                                      │
│   ●  = Current (primary-500, larger, pulse animation)               │
│   ○  = Upcoming (neutral-300)                                       │
│   ── = Line (completed: primary-500, upcoming: neutral-200)         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Mobile: Numbers only, no labels
Tablet+: Numbers + Labels
```

### Form Input

```
┌─────────────────────────────────────────┐
│  Firmenname *                           │  Label (text-sm, font-medium)
│  ┌─────────────────────────────────┐   │
│  │ Musterfirma GmbH                │   │  Input (h-10, px-3)
│  └─────────────────────────────────┘   │
│  Geben Sie den offiziellen Namen ein   │  Helper (text-xs, neutral-500)
└─────────────────────────────────────────┘

States:
- Default: border-neutral-200
- Focus: border-primary-500, ring-2 ring-primary-100
- Error: border-error-500, ring-2 ring-error-100
- Disabled: bg-neutral-100, cursor-not-allowed

Error State:
┌─────────────────────────────────────────┐
│  E-Mail *                               │
│  ┌─────────────────────────────────┐   │
│  │ invalid-email              ⚠   │   │  Error icon in input
│  └─────────────────────────────────┘   │
│  ⚠ Bitte geben Sie eine gültige        │  Error message (text-error-500)
│    E-Mail-Adresse ein                   │
└─────────────────────────────────────────┘
```

### Button Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | primary-500 | white | none | Main CTAs |
| **Secondary** | white | primary-600 | primary-200 | Secondary actions |
| **Ghost** | transparent | neutral-600 | none | Tertiary, links |
| **Destructive** | error-500 | white | none | Delete, Cancel |
| **Outline** | transparent | neutral-700 | neutral-300 | Filters, toggles |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| **sm** | 32px | 12px 16px | 14px |
| **md** | 40px | 16px 24px | 14px |
| **lg** | 48px | 20px 32px | 16px |

---

## 30. Interaction Patterns

### Animations & Transitions

#### Global Defaults

```css
--transition-fast:   150ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow:   300ms ease-out;
```

#### Specific Animations

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Button hover | background, transform | 150ms | ease-out |
| Card hover | transform, shadow | 200ms | ease-out |
| Modal open | opacity, transform | 200ms | ease-out |
| Modal close | opacity, transform | 150ms | ease-in |
| Dropdown open | opacity, transform | 150ms | ease-out |
| Toast appear | transform (slideIn) | 300ms | spring |
| Page transition | opacity | 200ms | ease-out |
| Skeleton pulse | opacity | 1.5s | ease-in-out (infinite) |

### Loading States

#### Skeleton Screens

```
Listing Card Skeleton:
┌─────────────────────────────┐
│ ████████████████████████████│  Image placeholder
│ ████████████████████████████│  (animated pulse)
│ ████████████████████████████│
│─────────────────────────────│
│ ████████                    │  Text line 60%
│ ██████████████████          │  Text line 80%
│ ████████████                │  Text line 50%
│─────────────────────────────│
│ ████████        ██████████  │  Price + Button
└─────────────────────────────┘

Animation: opacity 0.4 → 1 → 0.4 (1.5s loop)
```

#### Button Loading

```
[  ◠  Wird gespeichert...  ]

- Spinner icon (animated rotate)
- Text change to indicate action
- Button disabled
- Maintain button width (min-width)
```

### Micro-Interactions

#### Favorite Toggle (Phase 2)

```
Klick auf ♡:
1. Scale: 1 → 1.2 → 1 (200ms)
2. Color: neutral-400 → error-500
3. Icon: outline → filled
4. Optional: particles burst
```

#### Add to Compare

```
Klick auf "Vergleichen":
1. Checkmark appears (scale 0 → 1)
2. Counter updates in header
3. Toast: "Zur Vergleichsliste hinzugefügt"
```

#### Form Validation

```
Valid Input:
1. Border: neutral → success (300ms)
2. Checkmark icon fades in (right side)

Invalid Input:
1. Border: neutral → error (instant)
2. Shake animation (3x, 50ms each)
3. Error message slides down
```

### Feedback Patterns

#### Toast Notifications

```
Position: Bottom-right (Desktop), Bottom-center (Mobile)
Duration: 5s (auto-dismiss), persistent for errors
Stack: Max 3 visible, older ones slide up

┌─────────────────────────────────────────┐
│ ✓  Inserat erfolgreich gespeichert  [✕]│
└─────────────────────────────────────────┘

Animation:
- Enter: slideInRight + fadeIn (300ms)
- Exit: slideOutRight + fadeOut (200ms)
```

#### Confirmation Dialogs

```
Für destruktive Aktionen:

┌─────────────────────────────────────────┐
│                                    [✕]  │
│         ⚠️                              │
│   Inserat wirklich löschen?             │
│                                         │
│   Diese Aktion kann nicht rückgängig    │
│   gemacht werden. Alle Daten und        │
│   Bilder werden gelöscht.               │
│                                         │
│   [ Abbrechen ]     [ Ja, löschen ]     │
│                        (destructive)     │
└─────────────────────────────────────────┘

- Destructive button rechts
- Enter = Abbrechen (safe default)
- Escape = Abbrechen
```

### Navigation Patterns

#### Breadcrumbs

```
Home  >  Maschinen  >  Zeiss  >  Contura 10/12/6

- Max 4 levels visible
- Mobile: Only "< Zurück zu Zeiss"
- Current page not clickable
- Truncate long names with ...
```

#### Pagination

```
Desktop:
[ < ]  1  2  3  ...  8  9  10  [ > ]

Mobile:
[ < Zurück ]        Seite 3 von 10        [ Weiter > ]

- Current page highlighted
- Show first, last, and ±2 around current
- Disabled state for first/last
```

---

## 31. Wireframes & Design Assets

### Design Tool

* **Tool:** Figma
* **Link:** `[TBD - Figma Link hier einfügen]`

### Wireframe-Status

| Seite | Low-Fi | High-Fi | Responsive | Status |
|-------|--------|---------|------------|--------|
| Startseite | ⬜ | ⬜ | ⬜ | Ausstehend |
| Listing-Übersicht | ⬜ | ⬜ | ⬜ | Ausstehend |
| Listing-Detail | ⬜ | ⬜ | ⬜ | Ausstehend |
| Vergleichsseite | ⬜ | ⬜ | ⬜ | Ausstehend |
| Login/Register | ⬜ | ⬜ | ⬜ | Ausstehend |
| Seller Dashboard | ⬜ | ⬜ | ⬜ | Ausstehend |
| Inserat-Wizard | ⬜ | ⬜ | ⬜ | Ausstehend |
| Lead-Verwaltung | ⬜ | ⬜ | ⬜ | Ausstehend |
| Admin Dashboard | ⬜ | ⬜ | ⬜ | Ausstehend |

### Asset-Anforderungen

#### Logo

- [ ] Logo (SVG, horizontal)
- [ ] Logo Icon (für Favicon, App Icon)
- [ ] Logo dark mode Variante

#### Illustrationen

- [ ] Empty State Illustrationen
- [ ] Error Page Illustrationen
- [ ] Onboarding Illustrationen

#### Icons

- [ ] Lucide React Icons (standardisiert)
- [ ] Custom Icons falls benötigt

#### Placeholder Images

- [ ] Maschinen-Placeholder (4:3)
- [ ] Avatar-Placeholder
- [ ] Logo-Placeholder (Firmen)

---

## 32. Page Layouts

### Startseite Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]          Maschinen  Hersteller  So funktioniert's    [DE▼] [Login] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    HERO SECTION (100vh - 80px)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   Gebrauchte Messmaschinen                                         │   │
│  │   einfach finden & verkaufen                                       │   │
│  │                                                                     │   │
│  │   Der B2B-Marktplatz für Koordinatenmessmaschinen                  │   │
│  │   in Europa. Geprüfte Inserate, seriöse Händler.                   │   │
│  │                                                                     │   │
│  │   ┌─────────────────────────────────────────────────────────────┐  │   │
│  │   │ 🔍  Hersteller, Modell oder Stichwort...          [Suchen] │  │   │
│  │   └─────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │   Beliebte Hersteller: [Zeiss] [Hexagon] [Wenzel] [Mitutoyo]       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   📊 STATS BAR                                                             │
│   ┌──────────────┬──────────────┬──────────────┬──────────────┐           │
│   │  245+        │  48          │  12          │  8           │           │
│   │  Maschinen   │  Verkäufer   │  Länder      │  Hersteller  │           │
│   └──────────────┴──────────────┴──────────────┴──────────────┘           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FEATURED LISTINGS                          [Alle Maschinen →]            │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│   │   Card 1   │ │   Card 2   │ │   Card 3   │ │   Card 4   │             │
│   │            │ │            │ │            │ │            │             │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SO FUNKTIONIERT CMM24                                                     │
│   ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐     │
│   │    🔍              │ │    📝              │ │    🤝              │     │
│   │  Suchen & Finden   │ │  Anfrage senden    │ │  Direkt verhandeln │     │
│   │  Filtern Sie nach  │ │  Kontaktieren Sie  │ │  Ohne Provision,   │     │
│   │  Ihren Kriterien   │ │  den Verkäufer     │ │  direkt zum Ziel   │     │
│   └────────────────────┘ └────────────────────┘ └────────────────────┘     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HERSTELLER                                                                │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│   │Zeiss │ │Hexag.│ │Wenzel│ │Mitut.│ │Coord3│ │LK    │ │Aberl.│ │Nikon ││
│   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FÜR VERKÄUFER                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Verkaufen Sie Ihre Messmaschine auf CMM24                         │   │
│   │  Erreichen Sie qualifizierte Käufer in ganz Europa                 │   │
│   │                                                                     │   │
│   │  ✓ Kostenlos starten    ✓ Geprüfte Anfragen    ✓ Kein Risiko      │   │
│   │                                                                     │   │
│   │  [Jetzt kostenlos inserieren]                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                     │
│  Über uns | Kontakt | FAQ | Impressum | Datenschutz | AGB      [DE▼]       │
│  © 2026 CMM24                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Listing-Detailseite Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header]                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Maschinen > Zeiss > Contura 10/12/6                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │                                 │  │                                 │  │
│  │      BILDERGALERIE              │  │   ZEISS                         │  │
│  │      (Hauptbild)                │  │   Contura 10/12/6               │  │
│  │                                 │  │                                 │  │
│  │         600x450px               │  │   ┌─────────────────────────┐   │  │
│  │                                 │  │   │ ✓ Geprüftes Inserat     │   │  │
│  │      [◀]            [▶]        │  │   └─────────────────────────┘   │  │
│  │                                 │  │                                 │  │
│  │  ┌────┐┌────┐┌────┐┌────┐┌────┐│  │   Preis                         │  │
│  │  │ 1  ││ 2  ││ 3  ││ 4  ││ 5  ││  │   45.000 €                      │  │
│  │  └────┘└────┘└────┘└────┘└────┘│  │   zzgl. MwSt. · VB              │  │
│  │      Thumbnails (5 sichtbar)    │  │                                 │  │
│  └─────────────────────────────────┘  │   [    Anfrage senden    ]      │  │
│                                       │   [  📄 Als PDF speichern ]     │  │
│  ┌─────────────────────────────────┐  │                                 │  │
│  │ KEY FACTS                       │  │   ─────────────────────────     │  │
│  ├─────────────────────────────────┤  │                                 │  │
│  │ Baujahr        │ 2019           │  │   VERKÄUFER                     │  │
│  │ Zustand        │ Sehr gut       │  │   ┌─────────────────────────┐   │  │
│  │ Messbereich    │ 1000x1200x600  │  │   │ 🏢  CMM-Trade GmbH      │   │  │
│  │ Genauigkeit    │ 1.8 + L/350 µm │  │   │ ✓ Verifiziert           │   │  │
│  │ Software       │ Calypso 6.8    │  │   │ 📍 München, DE          │   │  │
│  │ Steuerung      │ C99            │  │   │ 📦 12 Inserate          │   │  │
│  │ Taster         │ VAST XXT       │  │   │ ⚡ Antwortet in <24h    │   │  │
│  └─────────────────────────────────┘  │   └─────────────────────────┘   │  │
│                                       │                                 │  │
│                                       │   📍 STANDORT                   │  │
│                                       │   ┌─────────────────────────┐   │  │
│                                       │   │     [Map Preview]       │   │  │
│                                       │   │     München, DE         │   │  │
│                                       │   └─────────────────────────┘   │  │
│                                       └─────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ BESCHREIBUNG                                                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Verkaufe gut erhaltene Zeiss Contura mit aktueller Software...      │   │
│  │ Lorem ipsum dolor sit amet, consectetur adipiscing elit.            │   │
│  │ [Mehr anzeigen]                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ LIEFERUMFANG                                                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ ✓ Messmaschine komplett    ✓ Software-Lizenz    ✓ Dokumentation    │   │
│  │ ✓ Tasterkopf VAST XXT      ✓ Kalibrierkugel     ✓ Einweisung      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DOKUMENTE                                                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 📄 Datenblatt.pdf (2.3 MB)              [Download]                  │   │
│  │ 📄 Kalibrierzertifikat.pdf (1.1 MB)     [Download]                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ÄHNLICHE MASCHINEN                                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │   Card 1   │ │   Card 2   │ │   Card 3   │ │   Card 4   │              │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Footer]                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Layout-Regeln:
- Desktop: 2-Spalten (60/40)
- Tablet: 2-Spalten (55/45)
- Mobile: 1-Spalte (Galerie → Info → Details)
- Sticky CTA-Box auf Mobile (unten)
```

### Suchergebnis-Seite Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header]                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Maschinen                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 [Suchfeld..................................]  [Suchen]           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────┐  ┌───────────────────────────────────────────────┐   │
│  │                  │  │                                               │   │
│  │  FILTER SIDEBAR  │  │  123 Maschinen gefunden                       │   │
│  │  (280px)         │  │                                               │   │
│  │                  │  │  Sortieren: [Relevanz ▼]    Ansicht: [⊞] [≡] │   │
│  │  ───────────────│  │                                               │   │
│  │                  │  │  Aktive Filter:                               │   │
│  │  Hersteller  [▼] │  │  [Zeiss ✕] [2018-2023 ✕] [< 80.000€ ✕]       │   │
│  │  ☑ Zeiss    (45) │  │                                               │   │
│  │  ☐ Hexagon  (32) │  │  ─────────────────────────────────────────── │   │
│  │  ☐ Wenzel   (28) │  │                                               │   │
│  │                  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ │   │
│  │  Preis       [▼] │  │  │   Card 1   │ │   Card 2   │ │   Card 3   │ │   │
│  │  [10.000] - [80k]│  │  │ ☐ Vergl.   │ │ ☐ Vergl.   │ │ ☐ Vergl.   │ │   │
│  │  ●─────────●     │  │  └────────────┘ └────────────┘ └────────────┘ │   │
│  │                  │  │                                               │   │
│  │  Baujahr     [▼] │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ │   │
│  │  2018 - 2024     │  │  │   Card 4   │ │   Card 5   │ │   Card 6   │ │   │
│  │                  │  │  │ ☐ Vergl.   │ │ ☐ Vergl.   │ │ ☐ Vergl.   │ │   │
│  │  Messbereich [▲] │  │  └────────────┘ └────────────┘ └────────────┘ │   │
│  │  Genauigkeit [▲] │  │                                               │   │
│  │  Standort    [▲] │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ │   │
│  │                  │  │  │   Card 7   │ │   Card 8   │ │   Card 9   │ │   │
│  │  ───────────────│  │  │ ☐ Vergl.   │ │ ☐ Vergl.   │ │ ☐ Vergl.   │ │   │
│  │                  │  │  └────────────┘ └────────────┘ └────────────┘ │   │
│  │  [Filter zurück- │  │                                               │   │
│  │   setzen]        │  │  ─────────────────────────────────────────── │   │
│  │                  │  │                                               │   │
│  └──────────────────┘  │  [ < ]  1  2  3  ...  8  9  10  [ > ]         │   │
│                        │                                               │   │
│                        └───────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ VERGLEICHS-BAR (sticky, wenn Maschinen ausgewählt)                  │   │
│  │ 3 Maschinen ausgewählt    [Vergleichen]    [Auswahl löschen]        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Footer]                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Layout-Regeln:
- Desktop: Sidebar (280px) + Content
- Tablet (<1024px): Filter als Modal, Content full-width
- Mobile: Filter-Button oben, Content 1-spaltig
- Grid: 3 Spalten (lg), 2 (md), 1 (sm)
```

### Seller Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header mit User-Menu]                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌───────────────────────────────────────────────┐   │
│  │                  │  │                                               │   │
│  │  SIDEBAR (240px) │  │  Willkommen zurück, Sandra!                   │   │
│  │                  │  │                                               │   │
│  │  ───────────────│  │  ┌──────────────┐ ┌──────────────┐ ┌────────┐ │   │
│  │  📊 Dashboard    │  │  │ 3 / 7       │ │ 5            │ │ 2      │ │   │
│  │  📦 Inserate     │  │  │ Aktive      │ │ Neue         │ │ Diese  │ │   │
│  │  ✉️  Anfragen (5) │  │  │ Inserate    │ │ Anfragen     │ │ Woche  │ │   │
│  │  ⚙️  Konto        │  │  └──────────────┘ └──────────────┘ └────────┘ │   │
│  │  💳 Abo          │  │                                               │   │
│  │                  │  │  ─────────────────────────────────────────── │   │
│  │  ───────────────│  │                                               │   │
│  │                  │  │  NEUESTE ANFRAGEN                             │   │
│  │  Plan: Starter   │  │  ┌─────────────────────────────────────────┐ │   │
│  │  3/7 Inserate    │  │  │ 🔵 Müller GmbH · Zeiss Contura          │ │   │
│  │                  │  │  │    vor 2 Stunden · Neu                   │ │   │
│  │  [Upgrade]       │  │  ├─────────────────────────────────────────┤ │   │
│  │                  │  │  │ 🔵 Schmidt AG · Hexagon Global          │ │   │
│  │                  │  │  │    vor 5 Stunden · Neu                   │ │   │
│  │                  │  │  ├─────────────────────────────────────────┤ │   │
│  │                  │  │  │ ⚪ Weber KG · Wenzel LH 87               │ │   │
│  │                  │  │  │    gestern · Kontaktiert                 │ │   │
│  │                  │  │  └─────────────────────────────────────────┘ │   │
│  │                  │  │  [Alle Anfragen →]                           │   │
│  │                  │  │                                               │   │
│  │                  │  │  ─────────────────────────────────────────── │   │
│  │                  │  │                                               │   │
│  │                  │  │  MEINE INSERATE                               │   │
│  │                  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │   │
│  │                  │  │  │ Card 1   │ │ Card 2   │ │ Card 3   │      │   │
│  │                  │  │  │ ● Aktiv  │ │ ● Aktiv  │ │ ○ Entwurf│      │   │
│  │                  │  │  └──────────┘ └──────────┘ └──────────┘      │   │
│  │                  │  │  [Alle Inserate →]   [+ Neues Inserat]       │   │
│  │                  │  │                                               │   │
│  └──────────────────┘  └───────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Layout-Regeln:
- Desktop: Sidebar (240px) + Content
- Tablet: Sidebar collapsed (Icons only, 64px)
- Mobile: Bottom Navigation oder Hamburger
```

### Vergleichsseite Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header]                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Vergleich                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Maschinenvergleich (3 von 5)                    [Als PDF exportieren]     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              │ Zeiss Contura    │ Hexagon Global   │ Wenzel LH 87   │   │
│  │              │ [✕ Entfernen]    │ [✕ Entfernen]    │ [✕ Entfernen]  │   │
│  ├──────────────┼──────────────────┼──────────────────┼────────────────┤   │
│  │              │ [Bild]           │ [Bild]           │ [Bild]         │   │
│  │              │ 120x90           │ 120x90           │ 120x90         │   │
│  ├──────────────┼──────────────────┼──────────────────┼────────────────┤   │
│  │ Preis        │ 45.000 €         │ 38.000 €  ✓     │ 52.000 €       │   │  ← Günstigster
│  │ Baujahr      │ 2019             │ 2018             │ 2020    ✓      │   │  ← Neuester
│  ├──────────────┼──────────────────┼──────────────────┼────────────────┤   │
│  │ TECHNISCH    │                  │                  │                │   │
│  │ Messbereich  │ 1000×1200×600    │ 900×1200×600     │ 1200×1500×800  │   │
│  │ Genauigkeit  │ 1.8 + L/350 µm  │ 2.0 + L/300 µm   │ 1.5 + L/400 µm │   │
│  │ Software     │ Calypso 6.8      │ PC-DMIS 2021     │ Metrosoft      │   │
│  │ Steuerung    │ C99              │ Global S         │ WM             │   │
│  │ Taster       │ VAST XXT         │ HP-S-X1          │ Renishaw       │   │
│  ├──────────────┼──────────────────┼──────────────────┼────────────────┤   │
│  │ STANDORT     │                  │                  │                │   │
│  │ Land         │ Deutschland      │ Österreich       │ Schweiz        │   │
│  │ Stadt        │ München          │ Wien             │ Zürich         │   │
│  ├──────────────┼──────────────────┼──────────────────┼────────────────┤   │
│  │ VERKÄUFER    │                  │                  │                │   │
│  │ Firma        │ CMM-Trade GmbH   │ Messtechnik AT   │ Swiss Measure  │   │
│  │ Verifiziert  │ ✓ Ja             │ ✓ Ja             │ ○ Nein         │   │
│  ├──────────────┼──────────────────┼──────────────────┼────────────────┤   │
│  │              │ [Anfrage senden] │ [Anfrage senden] │ [Anfrage send.]│   │
│  │              │ [Details →]      │ [Details →]      │ [Details →]    │   │
│  └──────────────┴──────────────────┴──────────────────┴────────────────┘   │
│                                                                             │
│  [+ Weitere Maschine hinzufügen]                                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Footer]                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Layout-Regeln:
- Desktop: Tabelle horizontal scrollbar bei >3 Maschinen
- Tablet: Max 2 Maschinen nebeneinander, horizontal scroll
- Mobile: Vertikal gestapelte Cards mit "Nächste/Vorherige"
- Sticky erste Spalte (Attribut-Namen)
- Highlight für "beste" Werte (günstigster Preis, neuestes Jahr, etc.)
```

---

## 33. Bildergalerie-Spezifikation

### Desktop-Galerie

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    HAUPTBILD (600x450)                          │
│                                                                 │
│     [◀]                                          [▶]           │
│                                                                 │
│                    3 / 12                                       │
│                                                                 │
│ ┌──────┐                                           [🔍 Zoom]   │
│ │ NEU  │                                                        │
│ └──────┘                                                        │
└─────────────────────────────────────────────────────────────────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ▶
│ 1  │ │ 2  │ │*3* │ │ 4  │ │ 5  │ │ 6  │ │ 7  │   (scrollable)
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘

* = aktives Thumbnail (border-primary-500)
```

### Mobile-Galerie

```
┌─────────────────────────────────────────┐
│                                         │
│          HAUPTBILD (100vw)              │
│          (Swipe ← →)                    │
│                                         │
│  ●  ●  ●  ○  ○  ○  ○  ○  ○  ○  ○  ○   │  Dots
│                                         │
└─────────────────────────────────────────┘
```

### Lightbox / Fullscreen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [✕]                                                        3 / 12         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│       [◀]                    BILD (max-size)                     [▶]       │
│                              (Zoom: Pinch / Scroll)                         │
│                                                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ 1  │ │ 2  │ │*3* │ │ 4  │ │ 5  │ │ 6  │ │ 7  │ │ 8  │ │ 9  │ │ 10 │   │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

Backdrop: rgba(0, 0, 0, 0.95)
```

### Interaktionen

| Aktion | Desktop | Mobile |
|--------|---------|--------|
| Nächstes Bild | Pfeil-Buttons, Pfeiltasten | Swipe links |
| Vorheriges Bild | Pfeil-Buttons, Pfeiltasten | Swipe rechts |
| Lightbox öffnen | Klick auf Bild | Tap auf Bild |
| Lightbox schließen | ✕, Escape, Klick außerhalb | ✕, Swipe down |
| Zoom | Scroll (Lightbox) | Pinch-to-Zoom |
| Thumbnail wechseln | Klick | Tap |

### Video-Integration

```
Wenn Video vorhanden:
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ ▶️ │ │ 4  │ │ 5  │   ← Video-Thumbnail mit Play-Icon
└────┘ └────┘ └────┘ └────┘ └────┘

Video im Hauptbereich:
- YouTube/Vimeo Embed (16:9)
- Beibehalten der Thumbnail-Navigation
- Autoplay: Nein
- Controls: Ja
```

---

## 34. Search & Autocomplete UX

### Search Input

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 │ Zeiss Cont█                                      │ [✕]    │
└─────────────────────────────────────────────────────────────────┘
      ↓ Dropdown öffnet nach 2 Zeichen

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  VORSCHLÄGE                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  🔍  Zeiss Contura                              → 23 Ergebnisse │
│  🔍  Zeiss Contura 10/12/6                      → 8 Ergebnisse  │
│  🔍  Zeiss Contura G2                           → 5 Ergebnisse  │
│                                                                 │
│  HERSTELLER                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  🏭  Zeiss                                      → 45 Maschinen  │
│                                                                 │
│  MASCHINEN                                                      │
│  ─────────────────────────────────────────────────────────────  │
│  ┌─────┐  Zeiss Contura 10/12/6                                │
│  │ Img │  München · 45.000 €                                    │
│  └─────┘                                                        │
│  ┌─────┐  Zeiss Contura G2 RDS                                 │
│  │ Img │  Berlin · 62.000 €                                     │
│  └─────┘                                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  [Alle Ergebnisse für "Zeiss Cont" anzeigen →]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Keyboard Navigation

| Taste | Aktion |
|-------|--------|
| `↓` | Nächster Vorschlag |
| `↑` | Vorheriger Vorschlag |
| `Enter` | Auswählen / Suchen |
| `Escape` | Dropdown schließen |
| `Tab` | Zum nächsten Element |

### States

| State | Verhalten |
|-------|-----------|
| **Leer** | Placeholder: "Hersteller, Modell oder Stichwort..." |
| **Fokus, leer** | Optional: "Letzte Suchen" anzeigen |
| **Tippen (<2 Zeichen)** | Dropdown geschlossen |
| **Tippen (≥2 Zeichen)** | Dropdown öffnet, Loading-State |
| **Ergebnisse** | Gruppiert nach Typ (Vorschläge, Hersteller, Maschinen) |
| **Keine Ergebnisse** | "Keine Ergebnisse für 'xyz'" + Tipp |

### Mobile Search

```
┌─────────────────────────────────┐
│ [←]  🔍 Suchen...               │  ← Full-width Input
├─────────────────────────────────┤
│                                 │
│ Letzte Suchen                   │
│ ─────────────────────────────── │
│ 🕐  Zeiss Contura               │
│ 🕐  Hexagon                     │
│ 🕐  Portal CMM                  │
│                                 │
│ Beliebte Suchen                 │
│ ─────────────────────────────── │
│ 🔥  Zeiss                       │
│ 🔥  Messmaschine gebraucht      │
│                                 │
└─────────────────────────────────┘
```

---

## 35. Content & Copywriting Guidelines

### Tone of Voice

| Aspekt | Guideline | Beispiel |
|--------|-----------|----------|
| **Ton** | Professionell, aber nicht steif | "Gerne helfen wir weiter" statt "Bei Fragen kontaktieren Sie uns" |
| **Ansprache** | Sie-Form (B2B-Standard) | "Erstellen Sie Ihr Inserat" |
| **Sprache** | Klar, direkt, ohne Jargon | "Messbereich" statt "Messvolumen" (außer technisch nötig) |
| **Länge** | Kurz und prägnant | Headlines: max. 8 Wörter |

### Button-Texte

| Kontext | ✅ Richtig | ❌ Falsch |
|---------|-----------|----------|
| Primäre Aktion | "Anfrage senden" | "Absenden" |
| Speichern | "Änderungen speichern" | "Speichern" |
| Weiter im Wizard | "Weiter zu Medien" | "Weiter" |
| Abbrechen | "Abbrechen" | "Zurück" (wenn es nicht zurück geht) |
| Löschen | "Inserat löschen" | "Löschen" |
| Bestätigen | "Ja, löschen" | "OK" |

### Error Messages

| Typ | Struktur | Beispiel |
|-----|----------|----------|
| **Validierung** | Was ist falsch + wie beheben | "Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@firma.de)" |
| **System-Fehler** | Entschuldigung + was tun | "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns." |
| **Nicht gefunden** | Bestätigung + Alternative | "Diese Seite existiert nicht. Zurück zur Startseite?" |
| **Keine Berechtigung** | Erklärung + Lösung | "Sie haben keinen Zugriff. Bitte melden Sie sich an." |

### Placeholder-Texte

| Feld | Placeholder |
|------|-------------|
| E-Mail | "name@firma.de" |
| Telefon | "+49 123 456789" |
| Firmenname | "Musterfirma GmbH" |
| Preis | "z.B. 45000" |
| Beschreibung | "Beschreiben Sie den Zustand, Besonderheiten und Lieferumfang..." |
| Suche | "Hersteller, Modell oder Stichwort..." |

### Leere Zustände (Empty States)

| Seite | Headline | Subtext | CTA |
|-------|----------|---------|-----|
| Keine Suchergebnisse | "Keine Maschinen gefunden" | "Versuchen Sie, Ihre Filter anzupassen" | "Filter zurücksetzen" |
| Keine Inserate (Seller) | "Noch keine Inserate" | "Erstellen Sie Ihr erstes Inserat" | "Inserat erstellen" |
| Keine Anfragen | "Noch keine Anfragen" | "Anfragen erscheinen hier, sobald..." | - |
| Vergleich leer | "Keine Maschinen im Vergleich" | "Fügen Sie Maschinen hinzu" | "Maschinen suchen" |

### Erfolgs-Nachrichten

| Aktion | Toast-Text |
|--------|------------|
| Inserat gespeichert | "Entwurf gespeichert" |
| Inserat veröffentlicht | "Inserat eingereicht – wir prüfen es innerhalb von 24h" |
| Anfrage gesendet | "Anfrage gesendet – der Verkäufer wurde benachrichtigt" |
| Account erstellt | "Willkommen bei CMM24!" |
| Passwort geändert | "Passwort erfolgreich geändert" |

---

## 36. Trust & Social Proof Elements

### Badge-System

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  INSERAT-BADGES                                                 │
│                                                                 │
│  ┌─────────────┐  Geprüftes Inserat (nach Admin-Review)        │
│  │ ✓ Geprüft   │  Farbe: success-500                            │
│  └─────────────┘  Tooltip: "Dieses Inserat wurde von CMM24      │
│                           auf Vollständigkeit geprüft"          │
│                                                                 │
│  ┌─────────────┐  Neu (< 7 Tage alt)                           │
│  │ ★ Neu       │  Farbe: primary-500                            │
│  └─────────────┘                                                │
│                                                                 │
│  ┌─────────────┐  Verkauft                                     │
│  │   Verkauft  │  Farbe: neutral-500                            │
│  └─────────────┘  Overlay auf Bild + Badge                      │
│                                                                 │
│  ┌─────────────┐  Preis reduziert                              │
│  │ ↓ Reduziert │  Farbe: warning-500                            │
│  └─────────────┘  Zeigt: "Vorher: 50.000 €"                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Verkäufer-Badges

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  VERKÄUFER-INFO BOX                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🏢  CMM-Trade GmbH                                     │   │
│  │                                                         │   │
│  │  ┌───────────────────┐  ┌───────────────────┐          │   │
│  │  │ ✓ Verifiziert     │  │ ⭐ Top-Verkäufer  │          │   │
│  │  └───────────────────┘  └───────────────────┘          │   │
│  │                                                         │   │
│  │  📍 München, Deutschland                                │   │
│  │  📦 12 aktive Inserate                                  │   │
│  │  ⚡ Antwortet meist in < 24 Stunden                     │   │
│  │  🕐 Mitglied seit Januar 2024                           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Verifiziert-Badge:
- Erscheint nach manueller Prüfung durch Admin
- Kriterien: Gewerbenachweis, Impressum geprüft
- Tooltip: "Identität und Gewerbeanmeldung geprüft"

Top-Verkäufer-Badge (Phase 2):
- Automatisch bei: >10 erfolgreiche Verkäufe, <12h Antwortzeit
- Farbe: warning-500 (Gold)
```

### Trust-Indikatoren auf Startseite

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  VERTRAUEN SCHAFFEN                                             │
│                                                                 │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │              │              │              │              │ │
│  │   ✓          │   🛡️         │   🔒         │   💬         │ │
│  │   Geprüfte   │   Sichere    │   DSGVO-     │   Direkter   │ │
│  │   Inserate   │   Zahlung    │   konform    │   Kontakt    │ │
│  │              │              │              │              │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                 │
│  "Über 500 erfolgreiche Vermittlungen seit 2024"               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Antwortzeit-Indikator

```
Berechnung:
- Durchschnittliche Zeit bis erste Antwort (letzte 30 Tage)
- Nur wenn ≥3 Anfragen beantwortet

Anzeige:
⚡ < 2h     → "Antwortet meist sofort"
⚡ < 12h    → "Antwortet meist in < 12 Stunden"
⚡ < 24h    → "Antwortet meist in < 24 Stunden"
⚡ < 48h    → "Antwortet meist in < 2 Tagen"
(keine)    → Nicht anzeigen
```

---

## 37. E-Mail & PDF Templates

### E-Mail Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       [CMM24 Logo]                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Hallo Sandra,                                                  │
│                                                                 │
│  [E-Mail-Inhalt hier]                                          │
│                                                                 │
│  Lorem ipsum dolor sit amet, consectetur adipiscing elit.       │
│  Sed do eiusmod tempor incididunt ut labore et dolore.         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              [ Primärer Button ]                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Oder kopieren Sie diesen Link:                                │
│  https://cmm24.de/...                                          │
│                                                                 │
│  Mit freundlichen Grüßen,                                      │
│  Ihr CMM24-Team                                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CMM24 GmbH · Musterstraße 1 · 12345 München                   │
│  Impressum · Datenschutz · Abmelden                            │
│                                                                 │
│  Sie erhalten diese E-Mail, weil Sie sich bei CMM24            │
│  registriert haben.                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Design-Specs:
- Max-Width: 600px
- Padding: 32px
- Font: Arial, sans-serif (E-Mail-safe)
- Primary Color: #1E90E6
- Text Color: #374151
- Background: #F9FAFB
- Button: 48px height, 24px padding, border-radius 8px
```

### E-Mail Template: Neue Anfrage

```
Betreff: Neue Anfrage für Ihre Zeiss Contura 10/12/6

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Hallo Sandra,                                                  │
│                                                                 │
│  Sie haben eine neue Anfrage für Ihr Inserat erhalten:         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ┌───────┐                                               │   │
│  │ │ [Img] │  Zeiss Contura 10/12/6                       │   │
│  │ └───────┘  45.000 €                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Anfrage von:                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Name:    Thomas Meier                                         │
│  Firma:   Automotive GmbH                                      │
│  E-Mail:  t.meier@automotive.de                                │
│  Telefon: +49 123 456789                                       │
│                                                                 │
│  Nachricht:                                                    │
│  "Guten Tag, wir interessieren uns für Ihre Zeiss Contura.     │
│   Ist die Maschine noch verfügbar? Können Sie uns weitere      │
│   Details zum Zustand mitteilen?"                              │
│                                                                 │
│              [ Anfrage im Dashboard ansehen ]                  │
│                                                                 │
│  Antworten Sie zeitnah – Käufer schätzen schnelle Reaktionen!  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### PDF-Angebot Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [CMM24 Logo]                                     Angebot vom 21.01.2026   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         ZEISS CONTURA 10/12/6                               │
│                                                                             │
│  ┌───────────────────────────────────┐  ┌───────────────────────────────┐  │
│  │                                   │  │                               │  │
│  │         [Hauptbild]               │  │         [Bild 2]              │  │
│  │                                   │  │                               │  │
│  └───────────────────────────────────┘  └───────────────────────────────┘  │
│  ┌───────────────────────────────────┐  ┌───────────────────────────────┐  │
│  │         [Bild 3]                  │  │         [Bild 4]              │  │
│  └───────────────────────────────────┘  └───────────────────────────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TECHNISCHE DATEN                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  │ Hersteller      │ Zeiss                                                 │
│  │ Modell          │ Contura 10/12/6                                       │
│  │ Baujahr         │ 2019                                                  │
│  │ Zustand         │ Sehr gut                                              │
│  │ Messbereich     │ 1000 × 1200 × 600 mm                                  │
│  │ Genauigkeit     │ MPEE = 1.8 + L/350 µm                                 │
│  │ Software        │ Calypso 6.8                                           │
│  │ Steuerung       │ C99                                                   │
│  │ Tastsystem      │ VAST XXT                                              │
│  │ Standort        │ München, Deutschland                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  BESCHREIBUNG                                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Gut erhaltene Zeiss Contura mit aktueller Software. Die Maschine wurde    │
│  regelmäßig gewartet und kalibriert. Letzte Kalibrierung: Oktober 2025.    │
│                                                                             │
│  LIEFERUMFANG                                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ✓ Messmaschine komplett        ✓ Software-Lizenz        ✓ Dokumentation  │
│  ✓ Tasterkopf VAST XXT          ✓ Kalibrierkugel         ✓ Einweisung     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PREIS                                                         45.000 €    │
│                                                          zzgl. MwSt., VB   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VERKÄUFER                                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  CMM-Trade GmbH                      ✓ Verifizierter Händler               │
│  Musterstraße 123                                                          │
│  80331 München                                                             │
│  Deutschland                                                               │
│                                                                             │
│  Kontakt: info@cmm-trade.de | +49 89 123456                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dieses Angebot wurde über CMM24.de erstellt.                              │
│  Direktlink: https://cmm24.de/maschinen/zeiss-contura-xyz                  │
│                                                                             │
│  [QR-Code]                                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

PDF-Specs:
- Format: A4 (210 × 297 mm)
- Margins: 20mm
- Font: Inter oder Helvetica
- Dateiname: CMM24_Zeiss_Contura_10-12-6_2026-01-21.pdf
```

### Print Styles (CSS)

```css
@media print {
  /* Header/Footer ausblenden */
  header, footer, nav, .no-print { display: none; }
  
  /* Hintergrund drucken */
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  /* Seitenumbrüche */
  .page-break { page-break-before: always; }
  .no-break { page-break-inside: avoid; }
  
  /* Links sichtbar machen */
  a[href]:after { content: " (" attr(href) ")"; font-size: 0.8em; }
  
  /* Listing-Detail optimiert */
  .listing-detail {
    max-width: 100%;
    margin: 0;
  }
  
  /* Bilder-Grid für Print */
  .gallery-thumbnails {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}
```

---

## 38. Scheduled Tasks / Cron Jobs

### Übersicht

| Task | Frequenz | Zeitpunkt | Beschreibung |
|------|----------|-----------|--------------|
| `archive-sold-listings` | täglich | 02:00 UTC | Verkaufte Inserate nach 30 Tagen archivieren |
| `archive-expired-listings` | täglich | 02:15 UTC | Inserate von gelöschten Accounts archivieren |
| `subscription-reminder` | täglich | 08:00 UTC | E-Mail 7 Tage vor Abo-Ende |
| `subscription-expire` | täglich | 00:00 UTC | Abgelaufene Abos auf Free downgraden |
| `cleanup-orphan-media` | wöchentlich | So 03:00 | Nicht verknüpfte Bilder löschen |
| `cleanup-old-drafts` | wöchentlich | So 03:30 | Entwürfe älter als 90 Tage löschen |
| `cleanup-old-notifications` | wöchentlich | So 04:00 | Gelesene Notifications >30 Tage löschen |
| `sitemap-regenerate` | täglich | 04:00 UTC | XML-Sitemap neu generieren |
| `analytics-aggregate` | täglich | 01:00 UTC | Views/Anfragen pro Tag aggregieren |
| `gdpr-cleanup` | täglich | 03:00 UTC | Account-Löschungen nach 14 Tagen ausführen |

### Implementierung

* **Tool:** Supabase Edge Functions + pg_cron oder Vercel Cron
* **Monitoring:** Alerts bei Fehler, Log in `cron_logs` Tabelle
* **Idempotent:** Alle Jobs können mehrfach ausgeführt werden

### Task Details

#### archive-sold-listings

```sql
UPDATE listings 
SET status = 'archived', updated_at = NOW()
WHERE status = 'sold' 
  AND sold_at < NOW() - INTERVAL '30 days';
```

#### subscription-reminder

```typescript
// Pseudo-Code
const expiringSubscriptions = await db
  .from('subscriptions')
  .select('*, accounts(*), profiles(*)')
  .eq('status', 'active')
  .gte('current_period_end', new Date())
  .lte('current_period_end', addDays(new Date(), 7))
  .is('reminder_sent', false);

for (const sub of expiringSubscriptions) {
  await sendEmail('subscription_expiring', sub.profiles.email);
  await db.from('subscriptions').update({ reminder_sent: true }).eq('id', sub.id);
}
```

---

## 39. Database Performance

### Indizes

#### Listings

```sql
-- Primäre Suche
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_status_published ON listings(status, published_at DESC);
CREATE INDEX idx_listings_account ON listings(account_id);
CREATE INDEX idx_listings_manufacturer ON listings(manufacturer_id);
CREATE INDEX idx_listings_model ON listings(model_id);

-- Filter-Kombinationen
CREATE INDEX idx_listings_filter ON listings(status, manufacturer_id, year_built, price);
CREATE INDEX idx_listings_location ON listings(status, location_country, location_city);
CREATE INDEX idx_listings_price_range ON listings(status, price) WHERE status = 'active';

-- Volltext-Suche
CREATE INDEX idx_listings_search ON listings 
  USING gin(to_tsvector('german', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Geo-Suche (für Umkreissuche)
CREATE INDEX idx_listings_geo ON listings USING gist(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

#### Inquiries

```sql
CREATE INDEX idx_inquiries_listing ON inquiries(listing_id);
CREATE INDEX idx_inquiries_account ON inquiries(account_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_account_status ON inquiries(account_id, status);
```

#### Subscriptions

```sql
CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_expiry ON subscriptions(current_period_end) 
  WHERE status = 'active';
```

#### Accounts & Profiles

```sql
CREATE INDEX idx_accounts_owner ON accounts(owner_id);
CREATE INDEX idx_accounts_slug ON accounts(slug);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### Query Optimization

#### Listing-Suche (häufigste Query)

```sql
-- Optimierte Query mit Pagination
SELECT l.*, m.name as manufacturer_name, mo.name as model_name
FROM listings l
LEFT JOIN manufacturers m ON l.manufacturer_id = m.id
LEFT JOIN models mo ON l.model_id = mo.id
WHERE l.status = 'active'
  AND (l.manufacturer_id = $1 OR $1 IS NULL)
  AND (l.price BETWEEN $2 AND $3)
  AND (l.year_built >= $4 OR $4 IS NULL)
ORDER BY l.published_at DESC
LIMIT 20 OFFSET $5;

-- Explain: Index Scan on idx_listings_status_published
```

### Connection Pooling

* **Tool:** Supavisor (Supabase built-in)
* **Pool Size:** 15 connections (Supabase Free), 50+ (Pro)
* **Mode:** Transaction mode für serverless

---

## 40. Resilience & Graceful Degradation

### Externe Service-Ausfälle

| Service | Auswirkung | Fallback-Strategie |
|---------|------------|-------------------|
| **Stripe** | Checkout, Webhooks | Banner "Zahlung temporär nicht möglich", Free-Plan weiter nutzbar, Webhooks in Queue |
| **Resend** | E-Mail-Versand | In DB queuen, Retry nach 5/15/60 min, max 3 Versuche |
| **Mapbox** | Standort-Karte | Karte ausblenden, nur Text-Adresse zeigen |
| **Plausible** | Analytics | Silently fail, keine User-Auswirkung |
| **Sentry** | Error Tracking | console.error als Fallback |
| **Supabase Storage** | Bild-Upload | Upload-Fehler anzeigen, Retry-Button |

### Retry-Strategien

```typescript
// Exponential Backoff für API-Calls
const retry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
    }
  }
};
```

### Circuit Breaker Pattern

```typescript
// Für externe APIs
const circuitBreaker = {
  stripe: { failures: 0, lastFailure: null, isOpen: false },
};

// Nach 5 Fehlern in 60s → Circuit öffnen
// Nach 30s → Half-open, einen Request durchlassen
// Bei Erfolg → Schließen
```

### Offline-Handling

```typescript
// Service Worker für kritische Assets
// Offline-Banner wenn navigator.onLine === false

┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Keine Internetverbindung                                    │
│     Einige Funktionen sind eingeschränkt.     [Erneut versuchen]│
└─────────────────────────────────────────────────────────────────┘
```

### Database Connection Errors

```typescript
// Supabase Client mit Retry
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    fetch: fetchWithRetry, // Custom fetch mit Retry-Logik
  },
});
```

---

## 41. Keyboard Shortcuts & Focus Management

### Globale Shortcuts

| Shortcut | Aktion | Verfügbar |
|----------|--------|-----------|
| `/` | Suche fokussieren | Überall |
| `Escape` | Modal/Dropdown schließen | Bei offenem Modal |
| `?` | Shortcut-Hilfe anzeigen | Überall |
| `g` dann `h` | Zur Startseite | Überall |
| `g` dann `s` | Zur Suche | Überall |
| `g` dann `d` | Zum Dashboard | Eingeloggt |

### Listing-Liste Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `j` / `↓` | Nächstes Inserat fokussieren |
| `k` / `↑` | Vorheriges Inserat fokussieren |
| `Enter` | Fokussiertes Inserat öffnen |
| `c` | Zum Vergleich hinzufügen/entfernen |
| `o` | Inserat in neuem Tab öffnen |

### Seller Portal Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `n` | Neues Inserat erstellen |
| `e` | Ausgewähltes Inserat bearbeiten |
| `a` | Zu Anfragen wechseln |

### Wizard Navigation

| Shortcut | Aktion |
|----------|--------|
| `Ctrl + Enter` | Weiter zum nächsten Schritt |
| `Ctrl + Backspace` | Zurück zum vorherigen Schritt |
| `Ctrl + s` | Entwurf speichern |

### Shortcut-Hilfe Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Tastenkombinationen                                       [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NAVIGATION                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  /              Suche fokussieren                               │
│  g dann h       Zur Startseite                                  │
│  g dann s       Zur Suche                                       │
│  g dann d       Zum Dashboard                                   │
│                                                                 │
│  LISTEN                                                         │
│  ─────────────────────────────────────────────────────────────  │
│  j / k          Nächstes / Vorheriges Element                   │
│  Enter          Element öffnen                                  │
│  c              Zum Vergleich hinzufügen                        │
│                                                                 │
│  ALLGEMEIN                                                      │
│  ─────────────────────────────────────────────────────────────  │
│  Escape         Schließen                                       │
│  ?              Diese Hilfe anzeigen                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Focus Management

#### Regeln

| Situation | Focus-Ziel |
|-----------|------------|
| Modal öffnet | Erstes fokussierbares Element im Modal |
| Modal schließt | Element, das Modal geöffnet hat |
| Formular-Error | Erstes fehlerhaftes Feld |
| Nach Seitennavigation | `<main>` oder Skip-Link |
| Toast erscheint | Toast (für Screen Reader, visuell nicht) |
| Dropdown öffnet | Erste Option |
| Autocomplete öffnet | Input bleibt fokussiert |

#### Skip Links

```html
<!-- Erster Element im Body -->
<a href="#main-content" class="skip-link">
  Zum Hauptinhalt springen
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--color-primary-500);
  color: white;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}
</style>
```

#### Focus Trap (Modals)

```typescript
// Bei Modal: Focus innerhalb des Modals halten
// Tab am Ende → zurück zum Anfang
// Shift+Tab am Anfang → zum Ende
// Implementierung: @headlessui/react oder focus-trap-react
```

---

## 42. Share-Funktionalität

### Share-Button (Listing-Detail)

```
┌────────────────────────────────────────────────────────────┐
│  [🔗 Teilen]                                               │
└────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│  Teilen                                               [✕]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ https://cmm24.de/maschinen/zeiss-contura-xyz  [📋] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  [✉️  E-Mail]   [💼 LinkedIn]   [🐦 X/Twitter]            │
│                                                            │
│  [📱 WhatsApp]  [💬 Telegram]   (Mobile only)             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Implementierung

#### Native Share API (Mobile)

```typescript
const handleShare = async () => {
  const shareData = {
    title: 'Zeiss Contura 10/12/6 auf CMM24',
    text: 'Gebrauchte Messmaschine: Zeiss Contura 10/12/6 für 45.000 €',
    url: 'https://cmm24.de/maschinen/zeiss-contura-xyz',
  };

  if (navigator.share && navigator.canShare(shareData)) {
    // Native Share Sheet (Mobile)
    await navigator.share(shareData);
  } else {
    // Fallback: Share Modal anzeigen
    openShareModal();
  }
};
```

#### Share URLs

```typescript
const shareUrls = {
  email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
};
```

#### Copy to Clipboard

```typescript
const copyToClipboard = async (url: string) => {
  await navigator.clipboard.writeText(url);
  toast.success('Link kopiert!');
};
```

### Tracking

```typescript
// Analytics Event bei Share
trackEvent('listing_shared', {
  listing_id: listing.id,
  method: 'linkedin' | 'email' | 'copy' | 'native',
});
```

---

## 43. Accessibility Erweiterungen

### Reduced Motion

```css
/* Global Styles */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Skeleton Loading ohne Animation */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--color-neutral-200);
  }
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --color-primary-500: #0066CC;
    --color-neutral-600: #000000;
    --color-neutral-200: #000000;
  }
  
  button, a {
    text-decoration: underline;
  }
  
  .card {
    border-width: 2px;
  }
}
```

### Screen Reader Optimierungen

```html
<!-- Live Regions für dynamische Updates -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="announcer">
  <!-- JS fügt hier Ankündigungen ein -->
</div>

<!-- Beispiel: Nach Filter-Änderung -->
<script>
  document.getElementById('announcer').textContent = 
    '123 Maschinen gefunden';
</script>

<!-- Versteckte Beschreibungen -->
<button aria-describedby="compare-hint">
  Vergleichen
</button>
<span id="compare-hint" class="sr-only">
  Fügt diese Maschine zur Vergleichsliste hinzu (max. 5)
</span>
```

### ARIA Patterns

#### Tabs (z.B. Inserat-Beschreibung/Specs)

```html
<div role="tablist" aria-label="Inserat-Details">
  <button role="tab" aria-selected="true" aria-controls="panel-desc" id="tab-desc">
    Beschreibung
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-specs" id="tab-specs">
    Technische Daten
  </button>
</div>
<div role="tabpanel" id="panel-desc" aria-labelledby="tab-desc">
  <!-- Inhalt -->
</div>
```

#### Combobox (Autocomplete)

```html
<div class="search-container">
  <input
    type="text"
    role="combobox"
    aria-expanded="true"
    aria-controls="search-listbox"
    aria-activedescendant="option-1"
    aria-autocomplete="list"
  />
  <ul role="listbox" id="search-listbox">
    <li role="option" id="option-1" aria-selected="true">Zeiss Contura</li>
    <li role="option" id="option-2">Zeiss Accura</li>
  </ul>
</div>
```

### Session Timeout Warning

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ⚠️  Ihre Sitzung läuft in 5 Minuten ab                        │
│                                                                 │
│  Aus Sicherheitsgründen werden Sie automatisch abgemeldet,     │
│  wenn Sie inaktiv bleiben.                                      │
│                                                                 │
│  Ungespeicherte Änderungen könnten verloren gehen.             │
│                                                                 │
│  [ Abmelden ]                    [ Angemeldet bleiben ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Timing:
- Warning: 5 Minuten vor Ablauf
- Session: 7 Tage (mit Remember Me: 30 Tage)
- Nach Timeout: Redirect zu Login mit Return-URL
- Ungespeicherte Wizard-Daten: Auto-Save alle 30s
```

---

## 44. Scroll & Navigation Verhalten

### Scroll Restoration

```typescript
// next.config.js
module.exports = {
  experimental: {
    scrollRestoration: true,
  },
};

// Für custom Scroll-Position (z.B. nach Filter-Änderung)
const scrollPositions = useRef<Map<string, number>>(new Map());

// Vor Navigation speichern
scrollPositions.current.set(pathname, window.scrollY);

// Nach Navigation wiederherstellen
useEffect(() => {
  const savedPosition = scrollPositions.current.get(pathname);
  if (savedPosition) {
    window.scrollTo(0, savedPosition);
  }
}, [pathname]);
```

### Infinite Scroll vs. Pagination

**Entscheidung: Pagination (mit Option für "Mehr laden")**

| Aspekt | Pagination | Infinite Scroll |
|--------|------------|-----------------|
| SEO | ✅ Besser (separate URLs) | ❌ Schlechter |
| Accessibility | ✅ Besser | ⚠️ Komplexer |
| Performance | ✅ Kontrolliert | ⚠️ Memory-Issues |
| UX | ⚠️ Mehr Klicks | ✅ Flüssiger |
| Footer erreichbar | ✅ Ja | ❌ Schwierig |

**Implementierung:**

```
Seite 1 von 10  ·  123 Ergebnisse

[Card] [Card] [Card]
[Card] [Card] [Card]
[Card] [Card] [Card]

[ Mehr laden (20 weitere) ]  ← Optional für "Endlos-Gefühl"

──────────────────────────────

[ < ]  1  2  3  ...  8  9  10  [ > ]
```

### Smooth Scroll

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

### Back-to-Top Button

```
Position: Fixed, bottom-right
Erscheint: Nach 500px Scroll
Animation: Fade in

┌─────┐
│  ↑  │
└─────┘
```

---

## 45. Offene Fragen

### Produkt

- [ ] Soll es eine Telefon-Verifizierung für Verkäufer geben?
- [ ] Brauchen wir eine "Preis auf Anfrage"-Option?
- [ ] Wie detailliert soll die Genauigkeits-Angabe sein (MPEE, MPEp)?
- [ ] Sollen Käufer Maschinen ohne Account anfragen können?
- [ ] Gibt es einen Mindestpreis für Inserate?
- [ ] Soll es eine Seriennummer-Pflichtfeld geben?

### Technik

- [ ] Supabase vs. eigene PostgreSQL-Instanz für Scale?
- [ ] Meilisearch von Anfang an oder erst bei Bedarf?
- [ ] Self-hosted PostHog oder Cloud?
- [ ] Wie werden große Bilder (>10MB) behandelt? Reject oder Resize?

### Legal

- [ ] Wer erstellt die AGB? Rechtsanwalt erforderlich.
- [ ] Benötigen wir eine Gewerbe-Verifizierung für Verkäufer?
- [ ] Wie gehen wir mit Fake-Inseraten um? (Haftung)

### Business

- [ ] Ab wann Featured Listings / Boosts einführen?
- [ ] Gibt es einen Enterprise-Plan für große Händler (>10 Inserate)?
- [ ] Provision bei erfolgreichem Verkauf? (Phase 2+)

### UX/Design

- [ ] Sollen wir Dark Mode unterstützen?
- [ ] Brauchen wir Onboarding-Tooltips für neue User?
- [ ] Welche Bilder-Anzahl minimal/maximal pro Inserat?

---

**Status:** Entwurf v6.0 (Final)
**Owner:** Jan Hemkemeier
**Ziel:** MVP Launch
**Letzte Aktualisierung:** Januar 2026
**Umfang:** 45 Abschnitte, ~3.600 Zeilen