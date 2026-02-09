-- ============================================
-- CMM24 Migration: Account Creation Function
-- ============================================
-- Diese Funktion umgeht RLS um Accounts für neue User zu erstellen.
-- Wird von der signUp Server Action aufgerufen.

CREATE OR REPLACE FUNCTION create_user_account(
  p_user_id UUID,
  p_company_name TEXT,
  p_slug TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_slug TEXT;
  v_counter INTEGER := 0;
  v_base_slug TEXT;
BEGIN
  -- Generate slug if not provided
  IF p_slug IS NULL OR p_slug = '' THEN
    v_base_slug := LOWER(REGEXP_REPLACE(p_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
    -- Replace German umlauts
    v_base_slug := REPLACE(v_base_slug, 'ä', 'ae');
    v_base_slug := REPLACE(v_base_slug, 'ö', 'oe');
    v_base_slug := REPLACE(v_base_slug, 'ü', 'ue');
    v_base_slug := REPLACE(v_base_slug, 'ß', 'ss');
    v_slug := v_base_slug;
  ELSE
    v_slug := p_slug;
    v_base_slug := p_slug;
  END IF;
  
  -- Check if account already exists for this user
  SELECT id INTO v_account_id 
  FROM accounts 
  WHERE owner_id = p_user_id AND deleted_at IS NULL;
  
  IF v_account_id IS NOT NULL THEN
    RETURN v_account_id; -- Already exists, return existing ID
  END IF;
  
  -- Handle slug uniqueness
  WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter;
  END LOOP;
  
  -- Insert account
  -- The trigger on_account_created_assign_free_plan will auto-create subscription
  INSERT INTO accounts (owner_id, company_name, slug, phone)
  VALUES (p_user_id, p_company_name, v_slug, p_phone)
  RETURNING id INTO v_account_id;
  
  RETURN v_account_id;
END;
$$;

-- Grant execute to authenticated users (needed for RPC call)
GRANT EXECUTE ON FUNCTION create_user_account TO authenticated;

-- Also grant to anon for registration flow (user not fully authenticated yet)
GRANT EXECUTE ON FUNCTION create_user_account TO anon;

COMMENT ON FUNCTION create_user_account IS 
'Creates an account for a user with SECURITY DEFINER to bypass RLS during registration.
The subscription is automatically created via the on_account_created_assign_free_plan trigger.';
