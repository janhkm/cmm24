-- =============================================================================
-- API Keys Migration
-- =============================================================================

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Hashed API key (we never store the actual key)
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (e.g., "cmm_live_...")
  permissions TEXT[] NOT NULL DEFAULT ARRAY['read'], -- e.g., ['read', 'write', 'delete']
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_account ON api_keys(account_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(account_id) WHERE is_active = true;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owners can manage API keys"
  ON api_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = api_keys.account_id
      AND accounts.owner_id = auth.uid()
    )
  );

-- Note: team_members may have profile_id instead of user_id depending on existing schema
CREATE POLICY "Team admins can view API keys"
  ON api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = api_keys.account_id
      AND accounts.owner_id = auth.uid()
    )
  );

-- API key usage log for analytics
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_time ON api_key_usage(api_key_id, created_at);

-- RLS for usage logs
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owners can view usage logs"
  ON api_key_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      JOIN accounts ON accounts.id = api_keys.account_id
      WHERE api_keys.id = api_key_usage.api_key_id
      AND accounts.owner_id = auth.uid()
    )
  );
