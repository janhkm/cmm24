-- ============================================
-- CMM24 Migration: Accounts (Firmen)
-- ============================================

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
  -- Auto-Reply Settings
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_delay_minutes INTEGER DEFAULT 5,
  auto_reply_message TEXT,
  email_signature TEXT,
  -- Soft-Delete
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_accounts_owner ON accounts(owner_id);
CREATE INDEX idx_accounts_slug ON accounts(slug);
CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_stripe ON accounts(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_accounts_status ON accounts(status);

-- Trigger: Auto-Update updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Funktion: Slug generieren
CREATE OR REPLACE FUNCTION generate_account_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Unique machen mit UUID-Suffix falls nötig
    NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_account_slug_trigger
  BEFORE INSERT ON accounts
  FOR EACH ROW EXECUTE FUNCTION generate_account_slug();

-- RLS aktivieren
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own account"
  ON accounts FOR SELECT
  USING (owner_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can update own account"
  ON accounts FOR UPDATE
  USING (owner_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert own account"
  ON accounts FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Public: Aktive Accounts können öffentlich gesehen werden (für Verkäuferprofile)
CREATE POLICY "Anyone can view active accounts"
  ON accounts FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- Admins können alle sehen
CREATE POLICY "Admins can view all accounts"
  ON accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
