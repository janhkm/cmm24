-- =============================================
-- Kaeufer-Anfragen: buyer_profile_id in inquiries
-- Ermoeglicht Kaeufern ihre gesendeten Anfragen zu sehen
-- =============================================

-- Neues Feld: Verknuepfung zum angemeldeten Kaeufer
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS buyer_profile_id UUID REFERENCES profiles(id);

-- Index fuer schnelles Lookup
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON inquiries(buyer_profile_id) WHERE buyer_profile_id IS NOT NULL;

-- =============================================
-- Funktion: Bestehende Anfragen mit neuem Account verknuepfen
-- Wird aufgerufen wenn ein Kaeufer sich registriert oder einloggt
-- =============================================
CREATE OR REPLACE FUNCTION link_inquiries_to_buyer(p_profile_id UUID, p_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  linked_count INTEGER := 0;
BEGIN
  UPDATE inquiries
  SET buyer_profile_id = p_profile_id
  WHERE contact_email = p_email
    AND buyer_profile_id IS NULL
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS linked_count = ROW_COUNT;
  RETURN linked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RLS: Kaeufer koennen ihre eigenen gesendeten Anfragen sehen
-- =============================================
CREATE POLICY "Buyers can view own sent inquiries" ON inquiries
  FOR SELECT USING (buyer_profile_id = auth.uid());
