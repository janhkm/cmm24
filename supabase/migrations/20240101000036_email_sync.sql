-- =============================================================================
-- EMAIL SYNC: synced_emails Tabelle + email_connections erweitern
-- =============================================================================

-- Token-Ablauf und Provider-Metadaten auf email_connections
ALTER TABLE email_connections
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider_account_id TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Synchronisierte E-Mails
CREATE TABLE IF NOT EXISTS synced_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES email_connections(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  thread_id TEXT,
  folder TEXT NOT NULL DEFAULT 'inbox',
  from_name TEXT,
  from_email TEXT NOT NULL,
  to_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  cc_addresses JSONB DEFAULT '[]'::jsonb,
  subject TEXT,
  preview TEXT,
  body_html TEXT,
  body_text TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  importance TEXT DEFAULT 'normal',
  received_at TIMESTAMPTZ NOT NULL,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_synced_emails_account ON synced_emails(account_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_folder ON synced_emails(account_id, folder, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_synced_emails_connection ON synced_emails(connection_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_thread ON synced_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_inquiry ON synced_emails(inquiry_id);

DROP TRIGGER IF EXISTS update_synced_emails_updated_at ON synced_emails;
CREATE TRIGGER update_synced_emails_updated_at
  BEFORE UPDATE ON synced_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE synced_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'synced_emails' AND policyname = 'Account owner can view synced emails') THEN
    CREATE POLICY "Account owner can view synced emails"
      ON synced_emails FOR SELECT
      USING (account_id IN (SELECT id FROM accounts WHERE owner_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'synced_emails' AND policyname = 'Account owner can update synced emails') THEN
    CREATE POLICY "Account owner can update synced emails"
      ON synced_emails FOR UPDATE
      USING (account_id IN (SELECT id FROM accounts WHERE owner_id = auth.uid()));
  END IF;
END $$;

-- Nur Server (service_role) darf E-Mails einfuegen/loeschen
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'synced_emails' AND policyname = 'Service role can insert synced emails') THEN
    CREATE POLICY "Service role can insert synced emails"
      ON synced_emails FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'synced_emails' AND policyname = 'Service role can delete synced emails') THEN
    CREATE POLICY "Service role can delete synced emails"
      ON synced_emails FOR DELETE
      USING (true);
  END IF;
END $$;
