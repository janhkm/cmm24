-- =============================================================================
-- Team Members Migration
-- =============================================================================

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(account_id, email)
);

-- Team members table (linking users to accounts)
-- Note: This might already exist - check for profile_id vs user_id
DO $$
BEGIN
  -- Add user_id column if it doesn't exist (might be called profile_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_members' AND column_name = 'user_id'
  ) THEN
    -- Check if profile_id exists and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'team_members' AND column_name = 'profile_id'
    ) THEN
      ALTER TABLE team_members RENAME COLUMN profile_id TO user_id;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, user_id)
);

-- Indexes (with safe names)
CREATE INDEX IF NOT EXISTS idx_team_invitations_account ON team_invitations(account_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_members_account ON team_members(account_id);

-- Create index on user_id only if that column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_members' AND column_name = 'user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Ignore if index already exists
END $$;

-- RLS Policies for team_invitations
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owners can manage invitations"
  ON team_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = team_invitations.account_id
      AND accounts.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can view invitations"
  ON team_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.account_id = team_invitations.account_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Account owners can manage team members"
  ON team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = team_members.account_id
      AND accounts.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view their team"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.account_id = team_members.account_id
      AND tm.user_id = auth.uid()
    )
  );

-- Function to add owner as first team member when account is created
CREATE OR REPLACE FUNCTION add_owner_to_team()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO team_members (account_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (account_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to add owner when account is created
DROP TRIGGER IF EXISTS trigger_add_owner_to_team ON accounts;
CREATE TRIGGER trigger_add_owner_to_team
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_team();

-- Add existing account owners to team_members
INSERT INTO team_members (account_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM accounts
WHERE deleted_at IS NULL
ON CONFLICT (account_id, user_id) DO NOTHING;
