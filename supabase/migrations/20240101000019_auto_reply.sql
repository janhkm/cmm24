-- =============================================================================
-- Auto-Reply System for Business Plan
-- =============================================================================

-- =============================================================================
-- Auto-Reply Settings Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS auto_reply_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which account this belongs to
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  
  -- Enable/disable auto-reply
  is_enabled BOOLEAN DEFAULT false,
  
  -- Reply content
  subject TEXT NOT NULL DEFAULT 'Vielen Dank für Ihre Anfrage',
  message TEXT NOT NULL DEFAULT 'Vielen Dank für Ihr Interesse an unserem Angebot. Wir werden uns schnellstmöglich bei Ihnen melden.',
  
  -- Delay before sending (in minutes, 0 = immediate)
  delay_minutes INTEGER DEFAULT 0 CHECK (delay_minutes >= 0 AND delay_minutes <= 1440),
  
  -- Working hours (only send during these hours)
  respect_working_hours BOOLEAN DEFAULT false,
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '18:00',
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
  
  -- Include listing info in reply
  include_listing_details BOOLEAN DEFAULT true,
  
  -- Custom signature
  include_signature BOOLEAN DEFAULT true,
  signature TEXT,
  
  -- Statistics
  total_sent INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- Auto-Reply Queue (for delayed sending)
-- =============================================================================
CREATE TABLE IF NOT EXISTS auto_reply_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related entities
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE UNIQUE,
  
  -- Recipient info
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  
  -- Listing info
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  listing_title TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  
  -- Scheduled time
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  -- Sent info
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_auto_reply_settings_account ON auto_reply_settings(account_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_queue_status ON auto_reply_queue(status, scheduled_for) 
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_auto_reply_queue_account ON auto_reply_queue(account_id, created_at DESC);

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE auto_reply_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_queue ENABLE ROW LEVEL SECURITY;

-- Auto-reply settings policies
DROP POLICY IF EXISTS "Users can view own auto_reply_settings" ON auto_reply_settings;
DROP POLICY IF EXISTS "Users can update own auto_reply_settings" ON auto_reply_settings;
DROP POLICY IF EXISTS "Users can insert own auto_reply_settings" ON auto_reply_settings;

CREATE POLICY "Users can view own auto_reply_settings"
  ON auto_reply_settings FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own auto_reply_settings"
  ON auto_reply_settings FOR UPDATE
  TO authenticated
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own auto_reply_settings"
  ON auto_reply_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Auto-reply queue policies
DROP POLICY IF EXISTS "Users can view own auto_reply_queue" ON auto_reply_queue;

CREATE POLICY "Users can view own auto_reply_queue"
  ON auto_reply_queue FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- =============================================================================
-- Function: Queue auto-reply for new inquiry
-- =============================================================================
CREATE OR REPLACE FUNCTION queue_auto_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_settings auto_reply_settings%ROWTYPE;
  v_listing_title TEXT;
  v_scheduled_time TIMESTAMPTZ;
  v_has_business_plan BOOLEAN;
BEGIN
  -- Get account from listing
  SELECT l.account_id, l.title
  INTO v_account_id, v_listing_title
  FROM listings l
  WHERE l.id = NEW.listing_id;
  
  IF v_account_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if account has business plan with auto_reply feature
  SELECT EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.account_id = v_account_id
    AND s.status = 'active'
    AND (p.feature_flags->>'auto_reply')::boolean = true
  ) INTO v_has_business_plan;
  
  IF NOT v_has_business_plan THEN
    RETURN NEW;
  END IF;
  
  -- Get auto-reply settings
  SELECT * INTO v_settings
  FROM auto_reply_settings
  WHERE account_id = v_account_id
  AND is_enabled = true;
  
  IF v_settings.id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate scheduled time
  v_scheduled_time := now() + (v_settings.delay_minutes || ' minutes')::interval;
  
  -- If respecting working hours, adjust scheduled time
  IF v_settings.respect_working_hours THEN
    -- Check if current time is within working hours
    -- If not, schedule for next working day at start time
    -- (Simplified - full implementation would need more logic)
    IF EXTRACT(DOW FROM v_scheduled_time) = ANY(v_settings.working_days) THEN
      IF v_scheduled_time::time < v_settings.working_hours_start THEN
        v_scheduled_time := date_trunc('day', v_scheduled_time) + v_settings.working_hours_start;
      ELSIF v_scheduled_time::time > v_settings.working_hours_end THEN
        -- Schedule for next working day
        v_scheduled_time := date_trunc('day', v_scheduled_time) + interval '1 day' + v_settings.working_hours_start;
      END IF;
    END IF;
  END IF;
  
  -- Insert into queue
  INSERT INTO auto_reply_queue (
    account_id,
    inquiry_id,
    recipient_email,
    recipient_name,
    listing_id,
    listing_title,
    scheduled_for
  ) VALUES (
    v_account_id,
    NEW.id,
    NEW.email,
    NEW.name,
    NEW.listing_id,
    v_listing_title,
    v_scheduled_time
  );
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_queue_auto_reply ON inquiries;
CREATE TRIGGER trigger_queue_auto_reply
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION queue_auto_reply();

-- =============================================================================
-- Function: Process auto-reply queue (to be called by cron or edge function)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_pending_auto_replies(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  queue_id UUID,
  account_id UUID,
  inquiry_id UUID,
  recipient_email TEXT,
  recipient_name TEXT,
  listing_id UUID,
  listing_title TEXT,
  subject TEXT,
  message TEXT,
  include_listing_details BOOLEAN,
  include_signature BOOLEAN,
  signature TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as queue_id,
    q.account_id,
    q.inquiry_id,
    q.recipient_email,
    q.recipient_name,
    q.listing_id,
    q.listing_title,
    s.subject,
    s.message,
    s.include_listing_details,
    s.include_signature,
    s.signature
  FROM auto_reply_queue q
  JOIN auto_reply_settings s ON q.account_id = s.account_id
  WHERE q.status = 'pending'
  AND q.scheduled_for <= now()
  ORDER BY q.scheduled_for ASC
  LIMIT p_limit
  FOR UPDATE OF q SKIP LOCKED;
END;
$$;

-- =============================================================================
-- Function: Mark auto-reply as sent
-- =============================================================================
CREATE OR REPLACE FUNCTION mark_auto_reply_sent(
  p_queue_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Update queue item
  UPDATE auto_reply_queue
  SET 
    status = CASE WHEN p_success THEN 'sent' ELSE 'failed' END,
    sent_at = CASE WHEN p_success THEN now() ELSE NULL END,
    error_message = p_error_message
  WHERE id = p_queue_id
  RETURNING account_id INTO v_account_id;
  
  -- Update statistics if successful
  IF p_success AND v_account_id IS NOT NULL THEN
    UPDATE auto_reply_settings
    SET 
      total_sent = total_sent + 1,
      last_sent_at = now()
    WHERE account_id = v_account_id;
  END IF;
END;
$$;
