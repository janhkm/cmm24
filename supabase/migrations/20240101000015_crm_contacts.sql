-- ============================================
-- CMM24 Migration: CRM Contacts (Business Feature)
-- ============================================

-- =============================================
-- ENUMS
-- =============================================

-- Lead Status für Kontakte
CREATE TYPE lead_status AS ENUM (
  'new',           -- Neuer Kontakt
  'contacted',     -- Kontaktiert
  'qualified',     -- Qualifiziert (echtes Interesse)
  'negotiation',   -- In Verhandlung
  'won',           -- Abgeschlossen/Gewonnen
  'lost'           -- Verloren
);

-- Aktivitätstypen für Timeline
CREATE TYPE activity_type AS ENUM (
  'note',           -- Manuelle Notiz
  'call',           -- Telefonat
  'email_sent',     -- E-Mail gesendet
  'email_received', -- E-Mail erhalten
  'meeting',        -- Meeting/Termin
  'inquiry',        -- Neue Anfrage
  'status_change'   -- Status-Änderung
);

-- =============================================
-- CONTACTS (Kontakte)
-- =============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Stammdaten
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  company_name TEXT,
  job_title TEXT,
  
  -- Adresse
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT,
  
  -- CRM-Felder
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_status lead_status DEFAULT 'new',
  tags TEXT[] DEFAULT '{}',
  source TEXT,  -- 'inquiry', 'import', 'manual', 'messe', etc.
  
  -- Tracking
  last_contact_at TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  notes TEXT,
  
  -- Statistiken (cached)
  total_inquiries INTEGER DEFAULT 0,
  total_value INTEGER DEFAULT 0,  -- Summe aller Anfragewerte in cents
  
  -- Soft-Delete & Timestamps
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ein Kontakt pro Email pro Account
  UNIQUE(account_id, email)
);

-- Indexes für Contacts
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_account_email ON contacts(account_id, email);
CREATE INDEX idx_contacts_lead_status ON contacts(lead_status);
CREATE INDEX idx_contacts_last_contact ON contacts(last_contact_at DESC);
CREATE INDEX idx_contacts_active ON contacts(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_search ON contacts USING gin(
  to_tsvector('german', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(company_name, '') || ' ' || email)
);

-- Updated_at Trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- CONTACT_ACTIVITIES (Aktivitäten-Timeline)
-- =============================================

CREATE TABLE contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),  -- Wer hat die Aktivität erstellt
  
  -- Aktivitäts-Details
  activity_type activity_type NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Optional: Verknüpfung zu Inquiry
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  
  -- Metadaten (z.B. für Status-Änderungen)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Activities
CREATE INDEX idx_contact_activities_contact ON contact_activities(contact_id);
CREATE INDEX idx_contact_activities_account ON contact_activities(account_id);
CREATE INDEX idx_contact_activities_created ON contact_activities(created_at DESC);
CREATE INDEX idx_contact_activities_type ON contact_activities(activity_type);

-- =============================================
-- INQUIRIES: Kontakt-Verknüpfung hinzufügen
-- =============================================

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_contact ON inquiries(contact_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

-- Contacts: Account-Owner kann eigene Kontakte sehen
CREATE POLICY "Owner can view own contacts"
  ON contacts FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    ) AND deleted_at IS NULL
  );

-- Contacts: Account-Owner kann Kontakte erstellen
CREATE POLICY "Owner can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Contacts: Account-Owner kann eigene Kontakte aktualisieren
CREATE POLICY "Owner can update own contacts"
  ON contacts FOR UPDATE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Contacts: Account-Owner kann eigene Kontakte löschen
CREATE POLICY "Owner can delete own contacts"
  ON contacts FOR DELETE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Activities: Account-Owner kann eigene Aktivitäten sehen
CREATE POLICY "Owner can view own contact activities"
  ON contact_activities FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Activities: Account-Owner kann Aktivitäten erstellen
CREATE POLICY "Owner can create contact activities"
  ON contact_activities FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Activities: Account-Owner kann eigene Aktivitäten löschen
CREATE POLICY "Owner can delete own contact activities"
  ON contact_activities FOR DELETE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Admins können alles sehen
CREATE POLICY "Admins can manage all contacts"
  ON contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage all contact activities"
  ON contact_activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Funktion: Kontakt-Statistiken aktualisieren
CREATE OR REPLACE FUNCTION update_contact_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Wenn eine Anfrage einen Kontakt bekommt, Statistiken aktualisieren
  IF NEW.contact_id IS NOT NULL THEN
    UPDATE contacts
    SET 
      total_inquiries = (
        SELECT COUNT(*) FROM inquiries 
        WHERE contact_id = NEW.contact_id AND deleted_at IS NULL
      ),
      total_value = (
        SELECT COALESCE(SUM(value), 0) FROM inquiries 
        WHERE contact_id = NEW.contact_id AND deleted_at IS NULL
      ),
      last_contact_at = GREATEST(last_contact_at, NOW()),
      updated_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Inquiry-Updates
CREATE TRIGGER trigger_update_contact_stats
  AFTER INSERT OR UPDATE OF contact_id, value, deleted_at ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_stats();

-- Funktion: Kontakt erstellen oder finden
CREATE OR REPLACE FUNCTION find_or_create_contact(
  p_account_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'inquiry'
)
RETURNS UUID AS $$
DECLARE
  v_contact_id UUID;
BEGIN
  -- Existierenden Kontakt suchen
  SELECT id INTO v_contact_id
  FROM contacts
  WHERE account_id = p_account_id AND email = p_email AND deleted_at IS NULL;
  
  -- Falls nicht gefunden, neuen erstellen
  IF v_contact_id IS NULL THEN
    INSERT INTO contacts (account_id, email, first_name, last_name, company_name, phone, source)
    VALUES (p_account_id, p_email, p_first_name, p_last_name, p_company_name, p_phone, p_source)
    RETURNING id INTO v_contact_id;
  END IF;
  
  RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
