-- ============================================
-- CMM24 Migration: Helper Functions
-- ============================================

-- =============================================
-- HELPER: is_admin()
-- Prüft ob der aktuelle User Admin oder Super-Admin ist
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- HELPER: is_super_admin()
-- Prüft ob der aktuelle User Super-Admin ist
-- =============================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- HELPER: get_my_account_id()
-- Gibt die Account-ID des aktuellen Users zurück
-- =============================================
CREATE OR REPLACE FUNCTION get_my_account_id()
RETURNS UUID AS $$
  SELECT id FROM accounts 
  WHERE owner_id = auth.uid() AND deleted_at IS NULL 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- HELPER: get_my_plan_slug()
-- Gibt den Plan-Slug des aktuellen Users zurück
-- =============================================
CREATE OR REPLACE FUNCTION get_my_plan_slug()
RETURNS TEXT AS $$
  SELECT p.slug 
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE s.account_id = get_my_account_id()
    AND s.status IN ('active', 'trialing')
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- HELPER: get_listing_count(account_id)
-- Zählt aktive Listings eines Accounts
-- =============================================
CREATE OR REPLACE FUNCTION get_listing_count(p_account_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM listings
  WHERE account_id = p_account_id
    AND status IN ('draft', 'pending_review', 'active')
    AND deleted_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- HELPER: can_create_listing(account_id)
-- Prüft ob ein Account ein neues Listing erstellen kann
-- =============================================
CREATE OR REPLACE FUNCTION can_create_listing(p_account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  listing_limit INTEGER;
BEGIN
  -- Get current listing count
  SELECT get_listing_count(p_account_id) INTO current_count;
  
  -- Get plan limit
  SELECT p.listing_limit INTO listing_limit
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE s.account_id = p_account_id
    AND s.status IN ('active', 'trialing')
  LIMIT 1;
  
  -- If no subscription found, use 0 as limit
  IF listing_limit IS NULL THEN
    listing_limit := 0;
  END IF;
  
  RETURN current_count < listing_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: increment_view_count(listing_id)
-- Erhöht den View-Counter eines Listings
-- =============================================
CREATE OR REPLACE FUNCTION increment_view_count(p_listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: approve_listing(listing_id)
-- Gibt ein Listing frei (Admin-Funktion)
-- =============================================
CREATE OR REPLACE FUNCTION approve_listing(p_listing_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve listings';
  END IF;
  
  UPDATE listings
  SET status = 'active',
      published_at = NOW(),
      rejection_reason = NULL,
      rejected_at = NULL,
      rejected_by = NULL
  WHERE id = p_listing_id
    AND status = 'pending_review';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: reject_listing(listing_id, reason)
-- Lehnt ein Listing ab (Admin-Funktion)
-- =============================================
CREATE OR REPLACE FUNCTION reject_listing(p_listing_id UUID, p_reason TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject listings';
  END IF;
  
  UPDATE listings
  SET status = 'draft',
      rejection_reason = p_reason,
      rejected_at = NOW(),
      rejected_by = auth.uid()
  WHERE id = p_listing_id
    AND status = 'pending_review';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: suspend_account(account_id, reason)
-- Sperrt einen Account (Admin-Funktion)
-- =============================================
CREATE OR REPLACE FUNCTION suspend_account(p_account_id UUID, p_reason TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can suspend accounts';
  END IF;
  
  -- Account sperren
  UPDATE accounts
  SET status = 'suspended',
      suspended_reason = p_reason
  WHERE id = p_account_id;
  
  -- Alle aktiven Listings archivieren
  UPDATE listings
  SET status = 'archived'
  WHERE account_id = p_account_id
    AND status = 'active'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: reactivate_account(account_id)
-- Reaktiviert einen gesperrten Account (Admin-Funktion)
-- =============================================
CREATE OR REPLACE FUNCTION reactivate_account(p_account_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reactivate accounts';
  END IF;
  
  UPDATE accounts
  SET status = 'active',
      suspended_reason = NULL
  WHERE id = p_account_id;
  
  -- Listings bleiben archiviert - User muss manuell reaktivieren
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: soft_delete_listing(listing_id)
-- Soft-Delete für Listing
-- =============================================
CREATE OR REPLACE FUNCTION soft_delete_listing(p_listing_id UUID)
RETURNS VOID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Get account_id and verify ownership
  SELECT account_id INTO v_account_id
  FROM listings
  WHERE id = p_listing_id;
  
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
  
  -- Check ownership or admin
  IF NOT (
    v_account_id = get_my_account_id() OR is_admin()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  UPDATE listings
  SET deleted_at = NOW(),
      status = 'archived'
  WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER: restore_listing(listing_id)
-- Stellt ein soft-deleted Listing wieder her
-- =============================================
CREATE OR REPLACE FUNCTION restore_listing(p_listing_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_account_id UUID;
  v_can_create BOOLEAN;
BEGIN
  -- Get account_id
  SELECT account_id INTO v_account_id
  FROM listings
  WHERE id = p_listing_id;
  
  -- Check if can create (limit not reached)
  SELECT can_create_listing(v_account_id) INTO v_can_create;
  
  IF NOT v_can_create THEN
    RETURN FALSE; -- Limit reached
  END IF;
  
  -- Restore
  UPDATE listings
  SET deleted_at = NULL,
      status = 'draft' -- Goes back to draft for review
  WHERE id = p_listing_id
    AND account_id = get_my_account_id();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
