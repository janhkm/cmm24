-- =============================================================================
-- Notifications System
-- =============================================================================

-- Notification types enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'new_inquiry',
      'inquiry_replied',
      'listing_approved',
      'listing_rejected',
      'listing_expiring',
      'subscription_renewed',
      'subscription_expiring',
      'payment_failed',
      'welcome',
      'system'
    );
  END IF;
END
$$;

-- =============================================================================
-- Drop and recreate notifications table with correct structure
-- =============================================================================

-- Drop existing table (we'll recreate it with the correct structure)
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table with full structure
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- User notifications (most common query)
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC) 
  WHERE deleted_at IS NULL;

-- Unread notifications count
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) 
  WHERE deleted_at IS NULL AND is_read = false;

-- By type for analytics
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);

-- Related entities
CREATE INDEX idx_notifications_inquiry ON notifications(inquiry_id) 
  WHERE inquiry_id IS NOT NULL;
CREATE INDEX idx_notifications_listing ON notifications(listing_id) 
  WHERE listing_id IS NOT NULL;

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Users can soft-delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- Function: Create notification (SECURITY DEFINER for RLS bypass)
-- =============================================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_inquiry_id UUID DEFAULT NULL,
  p_listing_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, link, inquiry_id, listing_id, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_link, p_inquiry_id, p_listing_id, p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- =============================================================================
-- Enable Realtime for notifications table
-- =============================================================================
DO $$
BEGIN
  -- Add table to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if publication doesn't exist or table already added
  NULL;
END
$$;

-- =============================================================================
-- Trigger: Auto-notify on new inquiry
-- =============================================================================
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
        'buyer_name', NEW.name,
        'buyer_email', NEW.email
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_notify_on_new_inquiry ON inquiries;
CREATE TRIGGER trigger_notify_on_new_inquiry
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_inquiry();

-- =============================================================================
-- Trigger: Auto-notify on listing status change
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_on_listing_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Only trigger on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get owner user_id
  SELECT owner_id INTO v_owner_id
  FROM accounts
  WHERE id = NEW.account_id;
  
  IF v_owner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Listing approved
  IF NEW.status = 'active' AND OLD.status = 'pending_review' THEN
    PERFORM create_notification(
      v_owner_id,
      'listing_approved'::notification_type,
      'Inserat freigegeben',
      'Ihr Inserat "' || NEW.title || '" wurde freigegeben und ist jetzt online.',
      '/seller/inserate/' || NEW.id,
      NULL,
      NEW.id,
      '{}'::jsonb
    );
  END IF;
  
  -- Listing rejected (archived from pending_review)
  IF NEW.status = 'archived' AND OLD.status = 'pending_review' THEN
    PERFORM create_notification(
      v_owner_id,
      'listing_rejected'::notification_type,
      'Inserat abgelehnt',
      'Ihr Inserat "' || NEW.title || '" wurde leider nicht freigegeben. Bitte überprüfen Sie die Angaben.',
      '/seller/inserate/' || NEW.id,
      NULL,
      NEW.id,
      '{}'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_notify_on_listing_status_change ON listings;
CREATE TRIGGER trigger_notify_on_listing_status_change
  AFTER UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_listing_status_change();
