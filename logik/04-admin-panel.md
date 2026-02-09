# Admin Panel – Logik & Schema-Anforderungen

## Übersicht der Seiten

| Seite | Pfad | Beschreibung |
|-------|------|--------------|
| Dashboard | `/admin/dashboard` | System-Übersicht, Quick Actions |
| Moderation | `/admin/moderation` | Inserate-Queue |
| Moderation Detail | `/admin/moderation/[id]` | Einzelnes Inserat prüfen |
| Accounts | `/admin/accounts` | Verkäufer verwalten |
| Stammdaten Hersteller | `/admin/stammdaten/hersteller` | Hersteller CRUD |
| Stammdaten Modelle | `/admin/stammdaten/modelle` | Modelle CRUD |
| Statistiken | `/admin/statistiken` | Platform Analytics |
| Reports | `/admin/reports` | Gemeldete Inserate |

---

## 1. Admin-Zugriff

### Rollen-Prüfung
```typescript
// In middleware.ts oder Server Component
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!['admin', 'super_admin'].includes(profile.role)) {
  redirect('/seller/dashboard')
}
```

### Rollen-Hierarchie
| Rolle | Rechte |
|-------|--------|
| `user` | Nur Seller Portal |
| `admin` | + Moderation, Accounts, Reports |
| `super_admin` | + Stammdaten, System-Settings, Impersonate |

---

## 2. Dashboard (`/admin/dashboard`)

### Daten-Anforderungen

#### Stats-Karten
```sql
-- Zur Moderation
SELECT COUNT(*) FROM listings WHERE status = 'pending_review'

-- Aktive Inserate
SELECT COUNT(*) FROM listings WHERE status = 'active'

-- Accounts
SELECT COUNT(*) FROM accounts

-- Anfragen (30 Tage)
SELECT COUNT(*) FROM inquiries 
WHERE created_at > NOW() - INTERVAL '30 days'
```

#### Pending Listings (5 neueste)
```sql
SELECT l.*, a.company_name as seller_name
FROM listings l
JOIN accounts a ON l.account_id = a.id
WHERE l.status = 'pending_review'
ORDER BY l.created_at DESC
LIMIT 5
```

#### Recent Activity (Audit Log)
```sql
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 10
```

### Schema: `audit_logs`
```sql
audit_logs
├── id (uuid, PK)
├── entity_type (text) -- 'listing', 'account', 'inquiry'
├── entity_id (uuid)
├── action (text) -- 'created', 'updated', 'status_changed', 'deleted'
├── old_values (jsonb, nullable)
├── new_values (jsonb, nullable)
├── performed_by (uuid, FK → profiles)
├── ip_address (inet, nullable)
├── user_agent (text, nullable)
├── created_at (timestamptz)
```

### Trigger für Audit Log
```sql
CREATE OR REPLACE FUNCTION log_listing_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, performed_by)
  VALUES (
    'listing',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Moderation (`/admin/moderation`)

### Daten-Anforderungen

#### Queue (pending_review)
```sql
SELECT l.*, m.name as manufacturer_name, a.company_name as seller_name,
  a.is_verified as seller_verified,
  (SELECT COUNT(*) FROM listing_media WHERE listing_id = l.id AND type = 'image') as image_count
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
JOIN accounts a ON l.account_id = a.id
WHERE l.status = 'pending_review'
ORDER BY l.created_at ASC -- FIFO
```

#### Tabs
- **Ausstehend**: status = 'pending_review'
- **Freigegeben**: status = 'active' (kürzlich)
- **Abgelehnt**: status = 'archived' mit rejection_reason

### Aktionen

#### Schnell-Freigabe
```sql
UPDATE listings
SET status = 'active', 
    published_at = NOW(),
    updated_at = NOW()
WHERE id = $id

-- Audit log
INSERT INTO audit_logs (entity_type, entity_id, action, performed_by)
VALUES ('listing', $id, 'approved', $admin_id)
```

#### Ablehnen
```sql
UPDATE listings
SET status = 'archived',
    rejection_reason = $reason,
    updated_at = NOW()
WHERE id = $id

-- Audit log + Email an Verkäufer senden
```

### Schema: Rejection Tracking
```sql
-- Erweiterung von listings
listings
├── ...
├── rejection_reason (text, nullable)
├── rejected_at (timestamptz, nullable)
├── rejected_by (uuid, FK → profiles, nullable)
```

---

## 4. Moderation Detail (`/admin/moderation/[id]`)

### Daten-Anforderungen

#### Listing mit allen Details
```sql
SELECT l.*, m.*, a.*
FROM listings l
JOIN manufacturers m ON l.manufacturer_id = m.id
JOIN accounts a ON l.account_id = a.id
WHERE l.id = $id
```

#### Alle Medien
```sql
SELECT * FROM listing_media
WHERE listing_id = $id
ORDER BY sort_order
```

#### Seller History
```sql
-- Andere Listings des Sellers
SELECT COUNT(*) as total,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'archived' AND rejection_reason IS NOT NULL THEN 1 ELSE 0 END) as rejected
FROM listings
WHERE account_id = $account_id

-- Vorherige Moderationen
SELECT l.title, l.status, l.rejection_reason, l.updated_at
FROM listings l
WHERE l.account_id = $account_id AND l.id != $id
ORDER BY l.updated_at DESC
LIMIT 5
```

### Prüfkriterien-Checkliste
```typescript
interface ModerationChecklist {
  hasImages: boolean           // >= 1 Bild
  imagesAppropriate: boolean   // Keine Stockfotos, zeigt echte Maschine
  descriptionComplete: boolean // >= 50 Zeichen, plausibel
  technicalDataValid: boolean  // Messbereich/Genauigkeit realistisch
  noContactInText: boolean     // Keine Telefon/Email in Beschreibung
  notDuplicate: boolean        // Kein bestehendes Duplikat
}
```

### Aktionen
- **Freigeben**: status → 'active'
- **Ablehnen** (mit Grund): status → 'archived', rejection_reason setzen
- **Bearbeiten**: Admin kann Felder korrigieren
- **Verkäufer kontaktieren**: Email senden

---

## 5. Accounts (`/admin/accounts`)

### Daten-Anforderungen

#### Alle Accounts
```sql
SELECT a.*, p.email, p.full_name,
  s.plan_id, pl.name as plan_name, s.status as subscription_status,
  (SELECT COUNT(*) FROM listings WHERE account_id = a.id) as listing_count
FROM accounts a
JOIN profiles p ON a.owner_id = p.id
LEFT JOIN subscriptions s ON s.account_id = a.id AND s.status = 'active'
LEFT JOIN plans pl ON s.plan_id = pl.id
ORDER BY a.created_at DESC
```

#### Filter
- Status: active, suspended
- Plan: free, starter, business
- Verified: true, false
- Suche: company_name, email, city

### Aktionen

#### Verifizieren
```sql
UPDATE accounts
SET is_verified = true, updated_at = NOW()
WHERE id = $id

-- Audit log
INSERT INTO audit_logs (...)
```

#### Sperren
```sql
UPDATE accounts
SET status = 'suspended', 
    suspended_reason = $reason,
    updated_at = NOW()
WHERE id = $id

-- Alle Listings deaktivieren
UPDATE listings
SET status = 'archived'
WHERE account_id = $id AND status = 'active'

-- Email an Verkäufer
```

#### Reaktivieren
```sql
UPDATE accounts
SET status = 'active',
    suspended_reason = NULL,
    updated_at = NOW()
WHERE id = $id
```

#### Impersonate (super_admin only)
```typescript
// Session als anderer User starten (für Support)
// Implementierung abhängig von Auth-Setup
const { data } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: account.email,
})
```

---

## 6. Stammdaten: Hersteller (`/admin/stammdaten/hersteller`)

### Daten-Anforderungen

```sql
SELECT m.*, 
  (SELECT COUNT(*) FROM listings WHERE manufacturer_id = m.id) as listing_count
FROM manufacturers m
ORDER BY m.name
```

### CRUD Aktionen

#### Create
```sql
INSERT INTO manufacturers (name, slug, country, logo_url)
VALUES ($name, $slug, $country, $logo_url)
RETURNING *
```

#### Update
```sql
UPDATE manufacturers
SET name = $name, slug = $slug, country = $country, logo_url = $logo_url, updated_at = NOW()
WHERE id = $id
```

#### Delete
```sql
-- Nur wenn keine Listings existieren
DELETE FROM manufacturers
WHERE id = $id AND NOT EXISTS (
  SELECT 1 FROM listings WHERE manufacturer_id = $id
)
```

### Schema: `manufacturers`
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

## 7. Stammdaten: Modelle (`/admin/stammdaten/modelle`)

### Daten-Anforderungen

```sql
SELECT mo.*, ma.name as manufacturer_name,
  (SELECT COUNT(*) FROM listings WHERE model_id = mo.id) as listing_count
FROM models mo
JOIN manufacturers ma ON mo.manufacturer_id = ma.id
ORDER BY ma.name, mo.name
```

### Schema: `models`
```sql
models
├── id (uuid, PK)
├── manufacturer_id (uuid, FK → manufacturers)
├── name (text)
├── slug (text)
├── category (machine_category enum)
├── created_at (timestamptz)
└── updated_at (timestamptz)

UNIQUE(manufacturer_id, slug)
```

---

## 8. Reports (`/admin/reports`)

### Daten-Anforderungen

```sql
SELECT r.*, l.title as listing_title, l.slug as listing_slug,
  a.company_name as seller_name
FROM reports r
JOIN listings l ON r.listing_id = l.id
JOIN accounts a ON l.account_id = a.id
WHERE r.status = 'pending'
ORDER BY r.created_at ASC
```

### Schema: `reports`
```sql
reports
├── id (uuid, PK)
├── listing_id (uuid, FK → listings)
├── reporter_email (text)
├── reason (enum: 'spam', 'fake', 'inappropriate', 'duplicate', 'other')
├── description (text, nullable)
├── status (enum: 'pending', 'reviewed', 'resolved', 'dismissed')
├── admin_notes (text, nullable)
├── reviewed_by (uuid, FK → profiles, nullable)
├── reviewed_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Aktionen
- **Prüfen**: Listing ansehen
- **Auflösen**: Listing entfernen/archivieren
- **Ablehnen**: Report als unbegründet markieren

---

## 9. Statistiken (`/admin/statistiken`)

### Metriken

#### Platform Overview
```sql
-- Listings über Zeit
SELECT date_trunc('day', created_at) as date, COUNT(*) as count
FROM listings
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date

-- Anfragen über Zeit
SELECT date_trunc('day', created_at) as date, COUNT(*) as count
FROM inquiries
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date

-- Revenue (MRR)
SELECT SUM(p.price_monthly) / 100.0 as mrr
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
WHERE s.status = 'active' AND p.price_monthly > 0
```

#### Top Performers
```sql
-- Top Verkäufer (nach Anfragen)
SELECT a.company_name, COUNT(i.id) as inquiry_count
FROM accounts a
JOIN inquiries i ON i.account_id = a.id
WHERE i.created_at > NOW() - INTERVAL '30 days'
GROUP BY a.id
ORDER BY inquiry_count DESC
LIMIT 10

-- Top Listings (nach Views)
SELECT l.title, l.views_count
FROM listings l
WHERE l.status = 'active'
ORDER BY l.views_count DESC
LIMIT 10
```

---

## Zusammenfassung: Benötigte Tabellen für Admin Panel

| Tabelle | Priorität | Beschreibung |
|---------|-----------|--------------|
| `audit_logs` | Hoch | Activity Tracking |
| `reports` | Hoch | Gemeldete Inserate |
| `manufacturers` | Kritisch | Stammdaten |
| `models` | Mittel | Stammdaten |

## RLS Policies für Admin Panel

### Admin-Prüfung Helper
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `listings` (Admin-Erweiterung)
```sql
-- Admin kann alle Listings sehen
CREATE POLICY "Admin can view all listings" ON listings
  FOR SELECT USING (is_admin());

-- Admin kann alle Listings updaten
CREATE POLICY "Admin can update all listings" ON listings
  FOR UPDATE USING (is_admin());
```

### `accounts` (Admin-Erweiterung)
```sql
-- Admin kann alle Accounts sehen
CREATE POLICY "Admin can view all accounts" ON accounts
  FOR SELECT USING (is_admin());

-- Admin kann Accounts updaten (verify, suspend)
CREATE POLICY "Admin can update accounts" ON accounts
  FOR UPDATE USING (is_admin());
```

### `manufacturers`
```sql
-- Jeder kann lesen
CREATE POLICY "Anyone can view manufacturers" ON manufacturers
  FOR SELECT USING (true);

-- Nur Admin kann schreiben
CREATE POLICY "Admin can manage manufacturers" ON manufacturers
  FOR ALL USING (is_admin());
```

### `audit_logs`
```sql
-- Nur Admin kann lesen
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- System kann schreiben (via Trigger)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
```
