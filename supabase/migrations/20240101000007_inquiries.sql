-- ============================================
-- CMM24 Migration: Inquiries (Anfragen)
-- ============================================

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
  notes TEXT, -- Interne Notizen des Verkäufers
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

-- Indexes
CREATE INDEX idx_inquiries_account ON inquiries(account_id);
CREATE INDEX idx_inquiries_listing ON inquiries(listing_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_account_status ON inquiries(account_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inquiries_active ON inquiries(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS aktivieren
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Inquiries: Verkäufer kann eigene Anfragen sehen
CREATE POLICY "Seller can view own inquiries"
  ON inquiries FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    ) AND deleted_at IS NULL
  );

-- Inquiries: Verkäufer kann Status aktualisieren
CREATE POLICY "Seller can update own inquiries"
  ON inquiries FOR UPDATE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Inquiries: Jeder kann Anfragen erstellen (auch anonym)
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Inquiries: Verkäufer kann eigene löschen
CREATE POLICY "Seller can delete own inquiries"
  ON inquiries FOR DELETE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Admins können alle sehen
CREATE POLICY "Admins can view all inquiries"
  ON inquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
