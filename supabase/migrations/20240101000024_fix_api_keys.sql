-- =============================================================================
-- Fix API Keys - Add missing columns and policies
-- =============================================================================

-- Add missing columns to api_keys (if they don't exist)
DO $$
BEGIN
  -- Add permissions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN permissions TEXT[] NOT NULL DEFAULT ARRAY['read'];
  END IF;
  
  -- Add key_hash column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'key_hash'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN key_hash TEXT NOT NULL DEFAULT '';
  END IF;
  
  -- Add key_prefix column  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'key_prefix'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN key_prefix TEXT NOT NULL DEFAULT '';
  END IF;
  
  -- Add revoked_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'revoked_at'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN revoked_at TIMESTAMPTZ;
  END IF;
  
  -- Add revoked_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'revoked_by'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN revoked_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_api_keys_account ON api_keys(account_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Account owners can manage API keys" ON api_keys;
DROP POLICY IF EXISTS "Team admins can view API keys" ON api_keys;

-- Create RLS policies
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

-- Create api_key_usage table if not exists
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

CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_time ON api_key_usage(api_key_id, created_at);

ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account owners can view usage logs" ON api_key_usage;

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
