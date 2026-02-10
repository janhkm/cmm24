-- =============================================================================
-- BUSINESS FEATURES: Premium-Funktionen fuer Business-Plan
-- Lesebestaetigungen, Nachrichtenanhaenge, Vorlagen, Erweitertes Profil, Badge
-- =============================================================================

-- =============================================================================
-- 1. Nachrichtenanhaenge auf inquiry_messages
-- =============================================================================

ALTER TABLE inquiry_messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- =============================================================================
-- 2. Nachrichtenvorlagen
-- =============================================================================

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_account
  ON message_templates(account_id, sort_order);

-- RLS fuer message_templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'Account owner can manage message templates') THEN
    CREATE POLICY "Account owner can manage message templates"
      ON message_templates FOR ALL
      USING (
        account_id IN (
          SELECT id FROM accounts WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'Team members can view message templates') THEN
    CREATE POLICY "Team members can view message templates"
      ON message_templates FOR SELECT
      USING (
        account_id IN (
          SELECT account_id FROM team_members WHERE profile_id = auth.uid() AND is_active = true
        )
      );
  END IF;
END $$;

-- Trigger fuer updated_at
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 3. Erweitertes Profil + Premium Badge
-- =============================================================================

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Index fuer is_premium (wird in Listing-Queries gebraucht)
CREATE INDEX IF NOT EXISTS idx_accounts_is_premium
  ON accounts(is_premium)
  WHERE is_premium = true;

-- =============================================================================
-- 4. Feature Flags aktualisieren
-- =============================================================================

-- Business: Alle Premium-Features aktivieren
UPDATE plans SET feature_flags = feature_flags ||
  '{"read_receipts":true,"message_attachments":true,"message_templates":true,"premium_profile":true,"premium_badge":true}'::jsonb
WHERE slug = 'business';

-- Starter: Premium-Features deaktivieren
UPDATE plans SET feature_flags = feature_flags ||
  '{"read_receipts":false,"message_attachments":false,"message_templates":false,"premium_profile":false,"premium_badge":false}'::jsonb
WHERE slug = 'starter';

-- Free: Premium-Features deaktivieren
UPDATE plans SET feature_flags = feature_flags ||
  '{"read_receipts":false,"message_attachments":false,"message_templates":false,"premium_profile":false,"premium_badge":false}'::jsonb
WHERE slug = 'free';

-- =============================================================================
-- 5. Bestehende Business-Accounts als Premium markieren
-- =============================================================================

UPDATE accounts SET is_premium = true
WHERE id IN (
  SELECT s.account_id FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE p.slug = 'business'
  AND s.status IN ('active', 'trialing')
);

-- =============================================================================
-- 6. Storage Bucket fuer Nachrichtenanhaenge
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Seller und Buyer koennen Anhaenge lesen/schreiben
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload message attachments') THEN
    CREATE POLICY "Users can upload message attachments"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'message-attachments' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view message attachments') THEN
    CREATE POLICY "Users can view message attachments"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'message-attachments' AND auth.role() = 'authenticated');
  END IF;
END $$;
