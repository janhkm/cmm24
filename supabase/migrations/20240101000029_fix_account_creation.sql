-- =============================================
-- Fix: Account-Erstellung bei Registrierung
-- Problem: Race Condition - Profil-Trigger ist noch nicht fertig
-- wenn create_user_account aufgerufen wird.
-- Loesung: Funktion wartet auf Profil oder erstellt es selbst.
-- =============================================

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
  v_retry INTEGER := 0;
  v_profile_exists BOOLEAN := false;
BEGIN
  -- Warten bis das Profil existiert (max 5 Versuche, je 200ms)
  WHILE NOT v_profile_exists AND v_retry < 5 LOOP
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) INTO v_profile_exists;
    
    IF NOT v_profile_exists THEN
      v_retry := v_retry + 1;
      PERFORM pg_sleep(0.2); -- 200ms warten
    END IF;
  END LOOP;
  
  -- Falls Profil immer noch nicht existiert: selbst erstellen
  IF NOT v_profile_exists THEN
    -- Email aus auth.users holen
    INSERT INTO profiles (id, email, full_name)
    SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', p_company_name)
    FROM auth.users
    WHERE id = p_user_id
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Generate slug if not provided
  IF p_slug IS NULL OR p_slug = '' THEN
    v_base_slug := LOWER(REGEXP_REPLACE(p_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
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
    RETURN v_account_id;
  END IF;
  
  -- Handle slug uniqueness
  WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter;
  END LOOP;
  
  -- Insert account
  INSERT INTO accounts (owner_id, company_name, slug, phone)
  VALUES (p_user_id, p_company_name, v_slug, p_phone)
  RETURNING id INTO v_account_id;
  
  RETURN v_account_id;
END;
$$;
