-- =============================================================================
-- INQUIRY MESSAGES: Plattform-Messaging zwischen Buyer und Seller
-- Ersetzt den Outlook-Sync-Ansatz durch ein eigenes Nachrichtensystem
-- =============================================================================

-- Nachrichten-Tabelle
CREATE TABLE IF NOT EXISTS inquiry_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'seller', 'system')),
  sender_profile_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes fuer schnellen Zugriff
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry
  ON inquiry_messages(inquiry_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_unread
  ON inquiry_messages(inquiry_id)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_sender
  ON inquiry_messages(sender_profile_id);

-- =============================================================================
-- RLS: Seller und Buyer koennen ihre eigenen Nachrichten sehen
-- =============================================================================

ALTER TABLE inquiry_messages ENABLE ROW LEVEL SECURITY;

-- Seller kann Nachrichten seiner Anfragen lesen
CREATE POLICY "Seller can view inquiry messages"
  ON inquiry_messages FOR SELECT
  USING (
    inquiry_id IN (
      SELECT i.id FROM inquiries i
      WHERE i.account_id IN (
        SELECT a.id FROM accounts a WHERE a.owner_id = auth.uid()
      )
    )
  );

-- Buyer kann Nachrichten seiner eigenen Anfragen lesen
CREATE POLICY "Buyer can view own inquiry messages"
  ON inquiry_messages FOR SELECT
  USING (
    inquiry_id IN (
      SELECT i.id FROM inquiries i
      WHERE i.buyer_profile_id = auth.uid()
    )
  );

-- Seller kann Nachrichten zu seinen Anfragen senden
CREATE POLICY "Seller can send inquiry messages"
  ON inquiry_messages FOR INSERT
  WITH CHECK (
    sender_type = 'seller'
    AND sender_profile_id = auth.uid()
    AND inquiry_id IN (
      SELECT i.id FROM inquiries i
      WHERE i.account_id IN (
        SELECT a.id FROM accounts a WHERE a.owner_id = auth.uid()
      )
    )
  );

-- Buyer kann Nachrichten zu seinen Anfragen senden
CREATE POLICY "Buyer can send inquiry messages"
  ON inquiry_messages FOR INSERT
  WITH CHECK (
    sender_type = 'buyer'
    AND sender_profile_id = auth.uid()
    AND inquiry_id IN (
      SELECT i.id FROM inquiries i
      WHERE i.buyer_profile_id = auth.uid()
    )
  );

-- Seller kann Nachrichten als gelesen markieren
CREATE POLICY "Seller can mark messages as read"
  ON inquiry_messages FOR UPDATE
  USING (
    inquiry_id IN (
      SELECT i.id FROM inquiries i
      WHERE i.account_id IN (
        SELECT a.id FROM accounts a WHERE a.owner_id = auth.uid()
      )
    )
  );

-- Buyer kann Nachrichten als gelesen markieren
CREATE POLICY "Buyer can mark messages as read"
  ON inquiry_messages FOR UPDATE
  USING (
    inquiry_id IN (
      SELECT i.id FROM inquiries i
      WHERE i.buyer_profile_id = auth.uid()
    )
  );

-- System/Admin kann alles
CREATE POLICY "Admins can manage all inquiry messages"
  ON inquiry_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Service-Role kann einfuegen (fuer System-Nachrichten und Benachrichtigungen)
CREATE POLICY "Service role can insert inquiry messages"
  ON inquiry_messages FOR INSERT
  WITH CHECK (sender_type = 'system');

-- =============================================================================
-- Feature-Flag Update: inquiry_messaging fuer Starter + Business
-- =============================================================================

-- Starter Plan: Messaging aktivieren
UPDATE plans
SET feature_flags = feature_flags || '{"inquiry_messaging": true}'::jsonb
WHERE slug = 'starter';

-- Business Plan: Messaging aktivieren
UPDATE plans
SET feature_flags = feature_flags || '{"inquiry_messaging": true}'::jsonb
WHERE slug = 'business';

-- Free Plan: Messaging explizit deaktivieren
UPDATE plans
SET feature_flags = feature_flags || '{"inquiry_messaging": false}'::jsonb
WHERE slug = 'free';

-- =============================================================================
-- Feld fuer ungelesene Nachrichten-Count auf inquiries (Performance)
-- =============================================================================

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS unread_messages_seller INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_messages_buyer INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_inquiries_last_message
  ON inquiries(account_id, last_message_at DESC NULLS LAST)
  WHERE deleted_at IS NULL;
