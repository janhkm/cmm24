-- ============================================
-- CMM24 Migration: Fix RLS Recursion
-- ============================================
-- Die Admin-Policies verursachen eine Endlosschleife weil sie
-- profiles abfragen, was wiederum die Policy auslöst.
-- Lösung: SECURITY DEFINER Funktion die RLS umgeht.

-- Helper-Funktion: Prüft ob User Admin ist (ohne RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Helper-Funktion: Prüft ob User Super-Admin ist (ohne RLS)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

-- =============================================
-- Fix Profiles Policies
-- =============================================

-- Alte Policy löschen
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Neue Policy mit Helper-Funktion
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- =============================================
-- Fix Accounts Policies
-- =============================================

-- Alte Policy löschen
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;

-- Neue Policy mit Helper-Funktion
CREATE POLICY "Admins can manage all accounts"
  ON accounts FOR ALL
  USING (is_admin());

-- =============================================
-- Fix Subscriptions Policies
-- =============================================

-- Alte Policy löschen (falls sie das gleiche Problem hat)
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;

-- Neue Policy mit Helper-Funktion
CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (is_admin());

-- =============================================
-- Fix Plans Policies
-- =============================================

DROP POLICY IF EXISTS "Admins can manage plans" ON plans;

CREATE POLICY "Super admins can manage plans"
  ON plans FOR ALL
  USING (is_super_admin());

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO anon;
GRANT EXECUTE ON FUNCTION is_super_admin TO anon;

COMMENT ON FUNCTION is_admin IS 'Checks if current user is admin or super_admin. Uses SECURITY DEFINER to avoid RLS recursion.';
COMMENT ON FUNCTION is_super_admin IS 'Checks if current user is super_admin. Uses SECURITY DEFINER to avoid RLS recursion.';
