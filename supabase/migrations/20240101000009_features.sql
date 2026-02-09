-- ============================================
-- CMM24 Migration: Feature Tables (Phase 3)
-- ============================================

-- =============================================
-- AUDIT LOGS
-- =============================================
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

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_performer ON audit_logs(performed_by);

-- Audit Log Trigger Function
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

-- Apply audit log trigger to important tables
CREATE TRIGGER log_listings_changes 
  AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER log_accounts_changes 
  AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER log_subscriptions_changes 
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_changes();

-- =============================================
-- REPORTS (Meldungen)
-- =============================================
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

CREATE INDEX idx_reports_listing ON reports(listing_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TEAM MEMBERS
-- =============================================
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

CREATE INDEX idx_team_members_account ON team_members(account_id);
CREATE INDEX idx_team_members_profile ON team_members(profile_id);
CREATE INDEX idx_team_members_active ON team_members(account_id) WHERE is_active = true;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TEAM INVITATIONS
-- =============================================
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

CREATE INDEX idx_team_invitations_account ON team_invitations(account_id);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);

-- =============================================
-- EMAIL CONNECTIONS
-- =============================================
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

CREATE INDEX idx_email_connections_account ON email_connections(account_id);

CREATE TRIGGER update_email_connections_updated_at
  BEFORE UPDATE ON email_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- NOTIFICATIONS
-- =============================================
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

CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_unread ON notifications(profile_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- API KEYS (für Business-Plan)
-- =============================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- SHA256 Hash des Keys
  key_prefix TEXT NOT NULL, -- "cmm24_sk_live_xxxx" für Anzeige
  scopes TEXT[] DEFAULT '{}', -- ['listings:read', 'listings:write']
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_account ON api_keys(account_id);

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS für Feature Tables
-- =============================================

-- Audit Logs: Nur Admins
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Reports: Admins können alle sehen, User können erstellen
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reports"
  ON reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all reports"
  ON reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Team Members: Account Owner kann verwalten
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owner can manage team"
  ON team_members FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view own membership"
  ON team_members FOR SELECT
  USING (profile_id = auth.uid());

-- Team Invitations
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owner can manage invitations"
  ON team_invitations FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Email Connections
ALTER TABLE email_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owner can manage email connections"
  ON email_connections FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (profile_id = auth.uid());

-- API Keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owner can manage api keys"
  ON api_keys FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );
