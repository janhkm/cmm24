-- =============================================
-- KOMPLETTER FIX: Registrierung
-- 
-- Problem: Nach signUp() ist auth.uid() = NULL (Email nicht bestaetigt).
-- Alle RLS-Policies scheitern. Regulaere Client-Calls funktionieren nicht.
-- 
-- Loesung: Eine SECURITY DEFINER Funktion die ALLES macht:
-- 1. Profil erstellen/aktualisieren
-- 2. Account erstellen (nur fuer Seller)
-- 3. Subscription erstellen (nur fuer Seller)
-- =============================================

CREATE OR REPLACE FUNCTION complete_registration(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_accepted_terms BOOLEAN DEFAULT true,
  p_accepted_marketing BOOLEAN DEFAULT false,
  p_onboarding_intent TEXT DEFAULT NULL,
  p_machine_count TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_company_slug TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID := NULL;
  v_subscription_id UUID := NULL;
  v_slug TEXT;
  v_counter INTEGER := 0;
  v_base_slug TEXT;
  v_free_plan_id UUID;
BEGIN
  -- ========================================
  -- 1. PROFIL: Upsert (erstellen oder aktualisieren)
  -- ========================================
  INSERT INTO profiles (
    id, email, full_name, phone,
    accepted_terms_at, accepted_marketing,
    onboarding_intent, onboarding_machine_count
  ) VALUES (
    p_user_id, p_email, p_full_name, p_phone,
    CASE WHEN p_accepted_terms THEN NOW() ELSE NULL END,
    p_accepted_marketing,
    p_onboarding_intent, p_machine_count
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    accepted_terms_at = COALESCE(EXCLUDED.accepted_terms_at, profiles.accepted_terms_at),
    accepted_marketing = EXCLUDED.accepted_marketing,
    onboarding_intent = EXCLUDED.onboarding_intent,
    onboarding_machine_count = EXCLUDED.onboarding_machine_count,
    updated_at = NOW();

  -- ========================================
  -- 2. ACCOUNT: Nur fuer Verkaeufer erstellen
  -- ========================================
  IF p_company_name IS NOT NULL AND p_company_name != '' AND p_onboarding_intent != 'buy' THEN
    -- Pruefen ob Account schon existiert
    SELECT id INTO v_account_id 
    FROM accounts 
    WHERE owner_id = p_user_id AND deleted_at IS NULL;
    
    IF v_account_id IS NULL THEN
      -- Slug generieren
      IF p_company_slug IS NOT NULL AND p_company_slug != '' THEN
        v_base_slug := p_company_slug;
      ELSE
        v_base_slug := LOWER(REGEXP_REPLACE(p_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
        v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
        v_base_slug := REPLACE(v_base_slug, 'ä', 'ae');
        v_base_slug := REPLACE(v_base_slug, 'ö', 'oe');
        v_base_slug := REPLACE(v_base_slug, 'ü', 'ue');
        v_base_slug := REPLACE(v_base_slug, 'ß', 'ss');
      END IF;
      
      v_slug := v_base_slug;
      
      -- Slug-Eindeutigkeit
      WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = v_slug) LOOP
        v_counter := v_counter + 1;
        v_slug := v_base_slug || '-' || v_counter;
      END LOOP;
      
      -- Account erstellen
      INSERT INTO accounts (owner_id, company_name, slug, phone)
      VALUES (p_user_id, p_company_name, v_slug, p_phone)
      RETURNING id INTO v_account_id;
      
      -- ========================================
      -- 3. SUBSCRIPTION: Free-Plan zuweisen
      -- ========================================
      SELECT id INTO v_free_plan_id FROM plans WHERE slug = 'free' LIMIT 1;
      
      IF v_free_plan_id IS NOT NULL THEN
        INSERT INTO subscriptions (account_id, plan_id, status)
        VALUES (v_account_id, v_free_plan_id, 'active')
        ON CONFLICT (account_id) DO NOTHING;
        
        SELECT id INTO v_subscription_id 
        FROM subscriptions 
        WHERE account_id = v_account_id;
      END IF;
    END IF;
  END IF;

  -- Ergebnis zurueckgeben
  RETURN jsonb_build_object(
    'profile_id', p_user_id,
    'account_id', v_account_id,
    'subscription_id', v_subscription_id,
    'intent', p_onboarding_intent
  );
END;
$$;

-- Zugriff fuer alle (wird direkt nach signUp aufgerufen, User ist noch nicht authentifiziert)
GRANT EXECUTE ON FUNCTION complete_registration TO anon;
GRANT EXECUTE ON FUNCTION complete_registration TO authenticated;
