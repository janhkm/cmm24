# Seller Portal – Logik & Schema-Anforderungen

## Übersicht der Seiten

| Seite | Pfad | Beschreibung |
|-------|------|--------------|
| Dashboard | `/seller/dashboard` | Übersicht, Stats, Schnellaktionen |
| Inserate | `/seller/inserate` | Liste eigener Inserate |
| Inserat erstellen | `/seller/inserate/neu` | 6-Step Wizard |
| Inserat bearbeiten | `/seller/inserate/[id]` | Bearbeiten + Aktionen |
| Anfragen Pipeline | `/seller/anfragen/pipeline` | Kanban-Board |
| Anfragen Liste | `/seller/anfragen/liste` | Tabellenansicht |
| Anfrage Detail | `/seller/anfragen/[id]` | Einzelne Anfrage |
| Statistiken | `/seller/statistiken` | Analytics |
| Abo | `/seller/abo` | Plan-Verwaltung |
| Abo Upgrade | `/seller/abo/upgrade` | Plan wechseln |
| Konto | `/seller/konto` | Profil, Firma, Email, Security |
| Team | `/seller/team` | Team-Mitglieder (Business) |
| Rechnungen | `/seller/rechnungen` | Rechnungs-Historie |
| Emails | `/seller/emails` | Email-Verlauf |
| API | `/seller/api` | API-Keys (Business) |

---

## 1. Dashboard (`/seller/dashboard`)

### Daten-Anforderungen

#### Stats-Karten
```sql
-- Aktive Inserate für diesen Account
SELECT COUNT(*) FROM listings 
WHERE account_id = $account_id AND status = 'active'

-- Neue Anfragen (letzte 7 Tage)
SELECT COUNT(*) FROM inquiries
WHERE account_id = $account_id 
  AND created_at > NOW() - INTERVAL '7 days'
  AND status = 'new'

-- Views gesamt (letzte 30 Tage)
SELECT SUM(views_count) FROM listings
WHERE account_id = $account_id

-- Anfrage-Quote berechnen (client-side)
```

#### Aktueller Plan & Usage
```sql
SELECT s.*, p.name, p.listing_limit, p.feature_flags
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.account_id = $account_id AND s.status = 'active'
```

#### Neueste Anfragen (5 Stück)
```sql
SELECT i.*, l.title as listing_title, l.slug as listing_slug
FROM inquiries i
JOIN listings l ON i.listing_id = l.id
WHERE i.account_id = $account_id
ORDER BY i.created_at DESC
LIMIT 5
```

#### Eigene Inserate (3 Stück)
```sql
SELECT l.*, 
  (SELECT url FROM listing_media WHERE listing_id = l.id AND is_primary LIMIT 1) as image
FROM listings l
WHERE l.account_id = $account_id
ORDER BY l.updated_at DESC
LIMIT 3
```

### Schema-Anforderungen
- `listings`
- `inquiries`
- `subscriptions`
- `plans`

---

## 2. Inserate (`/seller/inserate`)

### Daten-Anforderungen

#### Alle eigenen Inserate
```sql
SELECT l.*, m.name as manufacturer_name,
  (SELECT url FROM listing_media WHERE listing_id = l.id AND is_primary LIMIT 1) as image
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
WHERE l.account_id = $account_id
ORDER BY l.created_at DESC
```

#### Filter-Optionen
- Status: all, active, pending_review, draft, sold, archived
- Hersteller: aus eigenen Listings
- Suche: Titel, Hersteller-Name

#### Stats pro Status
```sql
SELECT status, COUNT(*) as count
FROM listings
WHERE account_id = $account_id
GROUP BY status
```

### Aktionen

#### Inserat duplizieren
```sql
INSERT INTO listings (...)
SELECT ..., 'draft' as status, NOW() as created_at
FROM listings WHERE id = $id AND account_id = $account_id
```

#### Inserat archivieren
```sql
UPDATE listings 
SET status = 'archived', updated_at = NOW()
WHERE id = $id AND account_id = $account_id
```

#### Inserat löschen
```sql
-- Erst Media löschen (Storage)
DELETE FROM listing_media WHERE listing_id = $id
-- Dann Listing
DELETE FROM listings WHERE id = $id AND account_id = $account_id
```

#### Featured setzen
```sql
UPDATE listings
SET featured = true, featured_until = $date
WHERE id = $id AND account_id = $account_id
```

### Schema: Feature-Limits prüfen
```typescript
// Vor Feature-Aktion prüfen
const plan = await getPlanForAccount(accountId)
const featuredCount = await getFeaturedCount(accountId)

if (plan.featureFlags.hasFeaturedListings !== -1 &&
    featuredCount >= plan.featureFlags.hasFeaturedListings) {
  throw new Error('Featured-Limit erreicht')
}
```

---

## 3. Inserat erstellen (`/seller/inserate/neu`)

### 6-Step Wizard

#### Step 1: Stammdaten
| Feld | Typ | Pflicht | Validation |
|------|-----|---------|------------|
| manufacturerId | uuid | Ja | FK → manufacturers |
| modelNameCustom | text | Nein | max 100 |
| title | text | Ja | 10-150 chars |
| yearBuilt | integer | Ja | 1950 - aktuelles Jahr |
| condition | enum | Ja | new, like_new, good, fair |
| price | integer | Ja | > 0, in cents |
| priceNegotiable | boolean | Nein | default false |

#### Step 2: Technische Daten
| Feld | Typ | Pflicht | Validation |
|------|-----|---------|------------|
| measuringRangeX | integer | Nein | 1-10000 mm |
| measuringRangeY | integer | Nein | 1-10000 mm |
| measuringRangeZ | integer | Nein | 1-10000 mm |
| accuracyUm | text | Nein | max 50 |
| software | text | Nein | max 100 |
| controller | text | Nein | max 100 |
| probeSystem | text | Nein | max 100 |

#### Step 3: Standort
| Feld | Typ | Pflicht | Validation |
|------|-----|---------|------------|
| locationCountry | text | Ja | ISO country code |
| locationCity | text | Ja | 2-100 chars |
| locationPostalCode | text | Ja | 3-10 chars |

#### Step 4: Beschreibung
| Feld | Typ | Pflicht | Validation |
|------|-----|---------|------------|
| description | text | Ja | 50-5000 chars |

#### Step 5: Medien
| Feld | Typ | Pflicht | Validation |
|------|-----|---------|------------|
| images | File[] | Ja (min 1) | jpg/png/webp, max 10MB |
| documents | File[] | Nein | pdf, max 25MB |

#### Step 6: Vorschau & Submit

### Aktionen

#### Als Entwurf speichern
```sql
INSERT INTO listings (..., status) VALUES (..., 'draft')
```

#### Zur Prüfung einreichen
```sql
INSERT INTO listings (..., status) VALUES (..., 'pending_review')
-- ODER
UPDATE listings SET status = 'pending_review' WHERE id = $id
```

### Media Upload
```typescript
// 1. Bild zu Supabase Storage hochladen
const { data } = await supabase.storage
  .from('listing-media')
  .upload(`${accountId}/${listingId}/${filename}`, file)

// 2. DB-Eintrag erstellen
await supabase.from('listing_media').insert({
  listing_id: listingId,
  type: 'image',
  url: data.path,
  filename: file.name,
  size_bytes: file.size,
  mime_type: file.type,
  sort_order: index,
  is_primary: index === 0
})
```

### Slug-Generierung
```typescript
const generateSlug = (title: string, id: string) => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50)
  return `${base}-${id.substring(0, 8)}`
}
```

---

## 4. Inserat bearbeiten (`/seller/inserate/[id]`)

### Daten-Anforderungen

#### Listing laden
```sql
SELECT * FROM listings
WHERE id = $id AND account_id = $account_id
```

#### Medien laden
```sql
SELECT * FROM listing_media
WHERE listing_id = $id
ORDER BY sort_order
```

### Aktionen
- Speichern (UPDATE)
- Zur Prüfung einreichen (status → pending_review)
- Als verkauft markieren (status → sold, sold_at = NOW())
- Archivieren (status → archived)
- Löschen

---

## 5. Anfragen (`/seller/anfragen/*`)

### Pipeline View (Kanban)

#### Spalten
1. **Neu** (status = 'new')
2. **Kontaktiert** (status = 'contacted')
3. **Angebot** (status = 'offer_sent')
4. **Gewonnen** (status = 'won')
5. **Verloren** (status = 'lost')

#### Query
```sql
SELECT i.*, l.title as listing_title, l.slug, l.price,
  (SELECT url FROM listing_media WHERE listing_id = l.id AND is_primary LIMIT 1) as listing_image
FROM inquiries i
JOIN listings l ON i.listing_id = l.id
WHERE i.account_id = $account_id
ORDER BY i.created_at DESC
```

### Drag & Drop
```sql
UPDATE inquiries
SET status = $new_status, updated_at = NOW()
WHERE id = $id AND account_id = $account_id
```

### Anfrage-Detail (`/seller/anfragen/[id]`)

#### Daten
```sql
SELECT i.*, l.*, m.name as manufacturer_name
FROM inquiries i
JOIN listings l ON i.listing_id = l.id
JOIN manufacturers m ON l.manufacturer_id = m.id
WHERE i.id = $id AND i.account_id = $account_id
```

#### Aktionen
- Status ändern
- Notizen speichern
- Email senden (über Email-Composer)

### Schema: `inquiries` (erweitert)
```sql
inquiries
├── id (uuid, PK)
├── listing_id (uuid, FK → listings)
├── account_id (uuid, FK → accounts)
├── contact_name (text)
├── contact_email (text)
├── contact_phone (text, nullable)
├── contact_company (text, nullable)
├── message (text)
├── status (enum: 'new', 'contacted', 'offer_sent', 'won', 'lost')
├── notes (text, nullable)
├── value (integer, nullable) -- Geschätzter Wert in cents
├── lost_reason (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

---

## 6. Abo (`/seller/abo`)

### Daten-Anforderungen

#### Aktuelle Subscription
```sql
SELECT s.*, p.*
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.account_id = $account_id AND s.status IN ('active', 'past_due')
```

#### Rechnungen
```sql
SELECT * FROM invoices
WHERE account_id = $account_id
ORDER BY created_at DESC
LIMIT 10
```

### Schema: Subscriptions

#### `plans`
```sql
plans
├── id (uuid, PK)
├── name (text)
├── slug (text, unique) -- 'free', 'starter', 'business'
├── listing_limit (integer)
├── price_monthly (integer, cents)
├── price_yearly (integer, cents)
├── launch_price_monthly (integer, nullable)
├── launch_price_yearly (integer, nullable)
├── extra_listing_price_monthly (integer, nullable)
├── extra_listing_price_yearly (integer, nullable)
├── stripe_price_id_monthly (text, nullable)
├── stripe_price_id_yearly (text, nullable)
├── feature_flags (jsonb)
├── features (text[]) -- Display-Liste
├── is_active (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### `subscriptions`
```sql
subscriptions
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── plan_id (uuid, FK → plans)
├── stripe_subscription_id (text, unique, nullable)
├── stripe_customer_id (text, nullable)
├── status (enum: 'active', 'past_due', 'canceled', 'trialing')
├── billing_interval (enum: 'monthly', 'yearly')
├── current_period_start (timestamptz)
├── current_period_end (timestamptz)
├── cancel_at_period_end (boolean)
├── canceled_at (timestamptz, nullable)
├── is_early_adopter (boolean) DEFAULT false
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### `invoices`
```sql
invoices
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── subscription_id (uuid, FK → subscriptions)
├── stripe_invoice_id (text, unique)
├── amount (integer, cents)
├── currency (text)
├── status (enum: 'draft', 'open', 'paid', 'void', 'uncollectible')
├── pdf_url (text, nullable)
├── period_start (timestamptz)
├── period_end (timestamptz)
├── created_at (timestamptz)
└── paid_at (timestamptz, nullable)
```

### Stripe Webhook Events
- `checkout.session.completed` → Subscription erstellen
- `invoice.paid` → Invoice speichern
- `invoice.payment_failed` → Status auf 'past_due'
- `customer.subscription.updated` → Änderungen syncen
- `customer.subscription.deleted` → Kündigung verarbeiten

---

## 7. Konto (`/seller/konto`)

### Tabs

#### Profil
```sql
SELECT * FROM profiles WHERE id = $user_id
```
→ UPDATE profiles

#### Firma
```sql
SELECT * FROM accounts WHERE owner_id = $user_id
```
→ UPDATE accounts

#### E-Mail-Sync
Neue Tabelle für verbundene Email-Konten:
```sql
email_connections
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── provider (enum: 'gmail', 'outlook', 'imap')
├── email (text)
├── access_token (text, encrypted)
├── refresh_token (text, encrypted)
├── last_sync_at (timestamptz, nullable)
├── is_active (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

#### Auto-Reply
Settings sind direkt in der `accounts` Tabelle (keine separate `account_settings` Tabelle):

```sql
-- In accounts Tabelle
accounts.auto_reply_enabled (boolean) DEFAULT false
accounts.auto_reply_delay_minutes (integer) DEFAULT 5
accounts.auto_reply_message (text)
accounts.email_signature (text)
```

**Grund:** Einfachere JOINs, kein 1:1-Relationship-Overhead.

#### Sicherheit
- Passwort ändern: `supabase.auth.updateUser({ password })`
- 2FA: Supabase Auth MFA

---

## 8. Team (`/seller/team`) – Business Feature

### Daten-Anforderungen
```sql
SELECT tm.*, p.full_name, p.email, p.avatar_url
FROM team_members tm
JOIN profiles p ON tm.profile_id = p.id
WHERE tm.account_id = $account_id
```

### Schema: `team_members`
```sql
team_members
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── profile_id (uuid, FK → profiles)
├── role (enum: 'owner', 'admin', 'editor', 'viewer')
├── invited_by (uuid, FK → profiles)
├── invited_at (timestamptz)
├── accepted_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Einladungs-Flow
```sql
-- 1. Einladung erstellen
team_invitations
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── email (text)
├── role (enum)
├── token (text, unique)
├── expires_at (timestamptz)
├── created_at (timestamptz)
└── accepted_at (timestamptz, nullable)
```

---

## Zusammenfassung: Benötigte Tabellen für Seller Portal

| Tabelle | Priorität | Beschreibung |
|---------|-----------|--------------|
| `listings` | Kritisch | Inserate |
| `listing_media` | Kritisch | Bilder/Dokumente |
| `inquiries` | Kritisch | Anfragen |
| `subscriptions` | Kritisch | Abo-Status |
| `plans` | Kritisch | Plan-Definitionen |
| `accounts` | Kritisch | Firmen-Daten + Auto-Reply Settings |
| `invoices` | Hoch | Rechnungen |
| `email_connections` | Mittel | Email-Sync (Starter+) |
| `team_members` | Mittel | Team (Business) |
| `team_invitations` | Mittel | Team-Einladungen |

## RLS Policies für Seller Portal

### `listings`
```sql
-- Owner kann alle eigenen Listings sehen
CREATE POLICY "Owner can view all own listings" ON listings
  FOR SELECT USING (account_id IN (
    SELECT id FROM accounts WHERE owner_id = auth.uid()
  ));

-- Owner kann erstellen (Limit prüfen in Application)
CREATE POLICY "Owner can create listings" ON listings
  FOR INSERT WITH CHECK (account_id IN (
    SELECT id FROM accounts WHERE owner_id = auth.uid()
  ));

-- Owner kann updaten
CREATE POLICY "Owner can update own listings" ON listings
  FOR UPDATE USING (account_id IN (
    SELECT id FROM accounts WHERE owner_id = auth.uid()
  ));
```

### `inquiries`
```sql
-- Seller sieht nur seine Anfragen
CREATE POLICY "Seller can view own inquiries" ON inquiries
  FOR SELECT USING (account_id IN (
    SELECT id FROM accounts WHERE owner_id = auth.uid()
  ));

-- Seller kann updaten (Status, Notes)
CREATE POLICY "Seller can update own inquiries" ON inquiries
  FOR UPDATE USING (account_id IN (
    SELECT id FROM accounts WHERE owner_id = auth.uid()
  ));
```

### `subscriptions`
```sql
-- Nur eigene Subscription sehen
CREATE POLICY "View own subscription" ON subscriptions
  FOR SELECT USING (account_id IN (
    SELECT id FROM accounts WHERE owner_id = auth.uid()
  ));
```
