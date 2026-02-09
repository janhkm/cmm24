-- =============================================
-- FIX: Profil-Trigger fuer auth.users
-- Der handle_new_user Trigger wurde nicht korrekt angelegt.
-- Dieser Fix stellt sicher, dass Profile automatisch erstellt werden.
-- =============================================

-- Funktion neu erstellen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger auf auth.users (DROP IF EXISTS + CREATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FIX: create_user_account - Profil immer sicherstellen
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
BEGIN
  -- IMMER sicherstellen, dass das Profil existiert
  INSERT INTO profiles (id, email, full_name)
  SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', p_company_name)
  FROM auth.users
  WHERE id = p_user_id
  ON CONFLICT (id) DO NOTHING;

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

-- =============================================
-- Hilfsfunktion: Profil sicherstellen (fuer use-auth.ts)
-- =============================================
CREATE OR REPLACE FUNCTION ensure_profile_exists(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
  FROM auth.users
  WHERE id = p_user_id
  ON CONFLICT (id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO anon;
