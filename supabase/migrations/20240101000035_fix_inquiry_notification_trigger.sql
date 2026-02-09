-- =============================================
-- FIX: notify_on_new_inquiry Trigger
--
-- Problem: Der Trigger referenziert NEW.name und NEW.email,
-- aber die Spalten heissen contact_name und contact_email.
-- Fehler: 'record "new" has no field "name"'
-- =============================================

CREATE OR REPLACE FUNCTION notify_on_new_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing_title TEXT;
  v_seller_user_id UUID;
BEGIN
  -- Get listing info and seller user_id
  SELECT l.title, a.owner_id
  INTO v_listing_title, v_seller_user_id
  FROM listings l
  JOIN accounts a ON l.account_id = a.id
  WHERE l.id = NEW.listing_id;
  
  IF v_seller_user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_seller_user_id,
      'new_inquiry'::notification_type,
      'Neue Anfrage erhalten',
      'Sie haben eine neue Anfrage für "' || v_listing_title || '" erhalten.',
      '/seller/anfragen/' || NEW.id,
      NEW.id,
      NEW.listing_id,
      jsonb_build_object(
        'buyer_name', NEW.contact_name,
        'buyer_email', NEW.contact_email
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;
