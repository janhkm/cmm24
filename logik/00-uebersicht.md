# CMM24 – Schema-Übersicht & Migrations-Plan

## Dokumentation

| Datei | Bereich | Seiten |
|-------|---------|--------|
| [01-auth.md](./01-auth.md) | Authentifizierung | Login, Register, Password Reset, Email Verify |
| [02-public-pages.md](./02-public-pages.md) | Öffentliche Seiten | Home, Maschinen, Hersteller, Kategorien, etc. |
| [03-seller-portal.md](./03-seller-portal.md) | Verkäufer-Portal | Dashboard, Inserate, Anfragen, Abo, Konto |
| [04-admin-panel.md](./04-admin-panel.md) | Admin-Bereich | Moderation, Accounts, Stammdaten |
| [05-permissions.md](./05-permissions.md) | Berechtigungen | Tiers, Feature-Flags, Zugriffsmatrix |
| [06-infrastructure.md](./06-infrastructure.md) | Infrastruktur | Storage, Email, Caching, Background Jobs |
| [07-edge-cases.md](./07-edge-cases.md) | Edge Cases | Downgrade, Deletion, Failures |
| [08-testing.md](./08-testing.md) | Testing | Unit, Integration, E2E, Fixtures |
| [09-security.md](./09-security.md) | Security | Validation, CORS, CSP, Rate-Limiting |
| [10-api.md](./10-api.md) | API | REST API für Business-Tier (Endpoints, Auth) |

---

## Pricing (Aktuell)

| Plan | Preis (Early Adopter) | Preis (Regulär) | Inserate | 
|------|-----------------------|-----------------|----------|
| **Free** | 0€ | 0€ | 1 |
| **Starter** | 24€/Monat | 55€/Monat | 5 |
| **Business** | 79€/Monat | 143€/Monat | 25 |

**Early Adopter:** -58% Rabatt, limitiert
**Jährlich:** -20% zusätzlich

---

## Architektur-Entscheidungen

| Entscheidung | Gewählt | Grund |
|--------------|---------|-------|
| Free-Plan in DB | **Explizit** | JOINs einfacher, Analytics konsistent |
| Soft-Delete | **listings, accounts, inquiries** | Wiederherstellung, Audit, Legal |
| Account-Settings | **In accounts Tabelle** | Weniger JOINs, einfacher |
| Search | **Postgres FTS (MVP)** | Später Meilisearch |
| Email-Provider | **Resend** | React-Email, günstig, DE-Server |
| File-Storage | **Supabase Storage** | Integriert, günstig |

---

## Konsolidiertes Datenbank-Schema

### Enums (Types)

```sql
-- Benutzerrollen
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Listing-Status
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'archived');

-- Listing-Zustand
CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair');

-- Maschinentyp/Kategorie
CREATE TYPE machine_category AS ENUM ('portal', 'cantilever', 'horizontal_arm', 'gantry', 'optical', 'other');

-- Medientyp
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

-- Anfrage-Status
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'offer_sent', 'won', 'lost');

-- Account-Status
CREATE TYPE account_status AS ENUM ('active', 'suspended');

-- Subscription-Status
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- Billing-Interval
CREATE TYPE billing_interval AS ENUM ('monthly', 'yearly');

-- Team-Rollen
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Report-Gründe
CREATE TYPE report_reason AS ENUM ('spam', 'fake', 'inappropriate', 'duplicate', 'other');

-- Report-Status
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Invoice-Status
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');

-- Inquiry Source
CREATE TYPE inquiry_source AS ENUM ('listing', 'contact', 'api');
```

---

### Tabellen nach Priorität

#### Kritisch (Phase 1)

```sql
-- 1. PROFILES (via Trigger nach auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  accepted_terms_at TIMESTAMPTZ,
  accepted_marketing BOOLEAN DEFAULT false,
  onboarding_intent TEXT,
  onboarding_machine_count TEXT,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNTS (Firmen)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  legal_form TEXT,                    -- GmbH, AG, KG, etc.
  description TEXT,                   -- Firmenbeschreibung (max 500 Zeichen)
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  -- Adresse
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT,
  vat_id TEXT,
  -- Status
  is_verified BOOLEAN DEFAULT false,
  status account_status DEFAULT 'active',
  suspended_reason TEXT,
  -- Stripe (für Customer-Portal)
  stripe_customer_id TEXT,
  -- Auto-Reply Settings (kein separates account_settings!)
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_delay_minutes INTEGER DEFAULT 5,
  auto_reply_message TEXT,
  email_signature TEXT,
  -- Soft-Delete
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MANUFACTURERS (Stammdaten)
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  country TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MODELS (Stammdaten)
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category machine_category,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manufacturer_id, slug)
);

-- 5. LISTINGS
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
  model_id UUID REFERENCES models(id),
  model_name_custom TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- cents
  price_negotiable BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'EUR',
  year_built INTEGER NOT NULL,
  condition listing_condition NOT NULL,
  -- Technische Daten
  measuring_range_x INTEGER, -- mm
  measuring_range_y INTEGER, -- mm
  measuring_range_z INTEGER, -- mm
  accuracy_um TEXT,
  software TEXT,
  controller TEXT,
  probe_system TEXT,
  -- Standort
  location_country TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_postal_code TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  -- Status & Meta
  status listing_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  -- Full-Text Search
  search_vector TSVECTOR,
  -- Moderation
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES profiles(id),
  -- Soft-Delete
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LISTING_MEDIA
CREATE TABLE listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INQUIRIES
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id), -- Verkäufer
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_company TEXT,
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'new',
  notes TEXT,
  value INTEGER, -- Geschätzter Wert in cents
  lost_reason TEXT,
  -- Tracking
  source inquiry_source DEFAULT 'listing',
  auto_reply_sent_at TIMESTAMPTZ,
  -- Soft-Delete
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Hoch (Phase 2: Monetarisierung)

```sql
-- 8. PLANS
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'free', 'starter', 'business'
  listing_limit INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL, -- cents (regulär)
  price_yearly INTEGER NOT NULL, -- cents (regulär)
  launch_price_monthly INTEGER, -- cents (Early Adopter)
  launch_price_yearly INTEGER, -- cents (Early Adopter)
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  feature_flags JSONB NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status subscription_status DEFAULT 'active',
  billing_interval billing_interval DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  is_early_adopter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ein aktiver Subscription pro Account
  UNIQUE(account_id) -- Constraint: nur eine Subscription pro Account
);

-- 10. INVOICES
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- cents
  currency TEXT DEFAULT 'EUR',
  status invoice_status DEFAULT 'draft',
  pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
```

#### Mittel (Phase 3: Features)

```sql
-- 11. AUDIT_LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REPORTS
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_email TEXT NOT NULL,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TEAM_MEMBERS
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role team_role DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true, -- Für Downgrade: deaktivieren statt löschen
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, profile_id)
);

-- 14. TEAM_INVITATIONS
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- 15. EMAIL_CONNECTIONS
CREATE TABLE email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gmail', 'outlook', 'imap'
  email TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

```sql
-- =============================================
-- LISTINGS
-- =============================================
CREATE INDEX idx_listings_account ON listings(account_id);
CREATE INDEX idx_listings_manufacturer ON listings(manufacturer_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_status_published ON listings(status, published_at DESC);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;
-- Soft-Delete Filter
CREATE INDEX idx_listings_active ON listings(id) WHERE deleted_at IS NULL;
-- Account + Status (häufiger Query)
CREATE INDEX idx_listings_account_status ON listings(account_id, status) WHERE deleted_at IS NULL;
-- Full-Text Search
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);

-- =============================================
-- LISTING MEDIA
-- =============================================
CREATE INDEX idx_listing_media_listing ON listing_media(listing_id);
CREATE INDEX idx_listing_media_primary ON listing_media(listing_id) WHERE is_primary = true;

-- =============================================
-- ACCOUNTS
-- =============================================
CREATE INDEX idx_accounts_owner ON accounts(owner_id);
CREATE INDEX idx_accounts_slug ON accounts(slug);
CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_stripe ON accounts(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- =============================================
-- INQUIRIES
-- =============================================
CREATE INDEX idx_inquiries_account ON inquiries(account_id);
CREATE INDEX idx_inquiries_listing ON inquiries(listing_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_account_status ON inquiries(account_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inquiries_active ON inquiries(id) WHERE deleted_at IS NULL;

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- =============================================
-- AUDIT LOGS
-- =============================================
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_performer ON audit_logs(performed_by);

-- =============================================
-- TEAM
-- =============================================
CREATE INDEX idx_team_members_account ON team_members(account_id);
CREATE INDEX idx_team_members_profile ON team_members(profile_id);
CREATE INDEX idx_team_members_active ON team_members(account_id) WHERE is_active = true;
```

---

## Trigger Functions

```sql
-- =============================================
-- 1. Auto-Update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_listing_media_updated_at BEFORE UPDATE ON listing_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 2. Create profile after auth.users insert
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 3. Auto-assign Free Plan to new Account
-- =============================================
CREATE OR REPLACE FUNCTION assign_free_plan()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get Free plan ID
  SELECT id INTO free_plan_id FROM plans WHERE slug = 'free' LIMIT 1;
  
  -- Create subscription with Free plan
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (account_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_account_created_assign_free_plan
  AFTER INSERT ON accounts
  FOR EACH ROW EXECUTE FUNCTION assign_free_plan();

-- =============================================
-- 4. Generate listing slug
-- =============================================
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_listing_slug_trigger
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION generate_listing_slug();

-- =============================================
-- 5. Update listing search_vector
-- =============================================
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('german', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('german', COALESCE(NEW.model_name_custom, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description, model_name_custom ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- =============================================
-- 6. Audit log trigger
-- =============================================
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, performed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to important tables
CREATE TRIGGER log_listings_changes AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER log_accounts_changes AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER log_subscriptions_changes AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_changes();
```

---

## RLS Policies (Zusammenfassung)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper functions
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_account_id()
RETURNS UUID AS $$
  SELECT id FROM accounts 
  WHERE owner_id = auth.uid() AND deleted_at IS NULL 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies: siehe einzelne Logik-Dateien für Details
```

---

## Seed Data: Plans

```sql
INSERT INTO plans (name, slug, listing_limit, price_monthly, price_yearly, launch_price_monthly, launch_price_yearly, sort_order, feature_flags, features) VALUES
-- FREE Plan (Tier 1)
(
  'Free',
  'free',
  1,
  0,
  0,
  0,
  0,
  1,
  '{
    "max_listings": 1,
    "max_images_per_listing": 5,
    "max_team_members": 0,
    "featured_per_month": 0,
    "statistics": false,
    "email_composer": false,
    "lead_pipeline": false,
    "auto_reply": false,
    "team_management": false,
    "api_access": false,
    "support_level": "email"
  }',
  ARRAY[
    '1 Inserat',
    '5 Bilder pro Inserat',
    'Anfragen-Verwaltung (Liste)',
    'E-Mail-Support'
  ]
),
-- STARTER Plan (Tier 2)
(
  'Starter',
  'starter',
  5,
  5500, -- 55€ regulär
  55000, -- 550€/Jahr regulär
  2400, -- 24€ Early Adopter
  24000, -- 240€/Jahr Early Adopter
  2,
  '{
    "max_listings": 5,
    "max_images_per_listing": 10,
    "max_team_members": 1,
    "featured_per_month": 1,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": false,
    "auto_reply": false,
    "team_management": false,
    "api_access": false,
    "support_level": "24h"
  }',
  ARRAY[
    '5 Inserate',
    '10 Bilder pro Inserat',
    'Statistiken',
    'E-Mail-Composer',
    '1 Featured Listing/Monat',
    '24h Support'
  ]
),
-- BUSINESS Plan (Tier 3)
(
  'Business',
  'business',
  25,
  14300, -- 143€ regulär
  143000, -- 1430€/Jahr regulär
  7900, -- 79€ Early Adopter
  79000, -- 790€/Jahr Early Adopter
  3,
  '{
    "max_listings": 25,
    "max_images_per_listing": 20,
    "max_team_members": 5,
    "featured_per_month": 5,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": true,
    "auto_reply": true,
    "team_management": true,
    "api_access": true,
    "support_level": "4h"
  }',
  ARRAY[
    '25 Inserate',
    '20 Bilder pro Inserat',
    'Lead-Pipeline',
    'Auto-Reply',
    'Team-Management',
    'API-Zugang',
    '5 Featured Listings/Monat',
    '4h Priority Support'
  ]
);
```

---

## Migrations-Plan

### Phase 1: Foundation
1. Enums erstellen
2. `profiles` + Trigger (handle_new_user)
3. `accounts` (mit Soft-Delete, Stripe-Customer-ID)
4. `plans` + Seed-Daten (Free, Starter, Business)
5. `subscriptions` + Trigger (assign_free_plan)
6. `manufacturers` + `models` + Seed-Daten
7. `listings` + `listing_media` (mit SEO, Search-Vector, Soft-Delete)
8. `inquiries` (mit Source, Auto-Reply-Tracking, Soft-Delete)
9. Indexes erstellen
10. RLS Policies für Phase 1

### Phase 2: Monetarisierung
1. Stripe Products/Prices erstellen
2. `invoices`
3. Stripe Webhook Handler
4. RLS Policies für Phase 2

### Phase 3: Features
1. `audit_logs` + Trigger
2. `reports`
3. `team_members` + `team_invitations`
4. `email_connections`
5. `notifications`
6. Background Jobs (pg_cron)
7. RLS Policies für Phase 3

---

## Nächste Schritte

1. ~~Supabase-Pakete installieren~~ ✓
2. ~~Supabase-Client konfigurieren~~ ✓
3. ~~Middleware erstellen~~ ✓
4. **Phase 1 Migrations ausführen**
5. Auth-Flows implementieren (Login, Register, etc.)
6. Mock-Daten durch echte DB-Queries ersetzen
