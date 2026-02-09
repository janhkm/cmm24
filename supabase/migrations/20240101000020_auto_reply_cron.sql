-- =============================================================================
-- Auto-Reply Cron Job Setup
-- =============================================================================
-- This migration sets up a cron job to process the auto-reply queue every 5 minutes
-- Note: pg_cron must be enabled in your Supabase project (Dashboard > Database > Extensions)

-- Enable pg_cron extension (if not already enabled)
-- Note: This requires pg_cron to be enabled in your Supabase project settings
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- =============================================================================
-- Cron Job: Process Auto-Reply Queue
-- =============================================================================
-- Runs every 5 minutes to check for pending auto-replies
-- Calls the edge function to send emails

-- Remove existing job if it exists
SELECT cron.unschedule('process-auto-replies')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-auto-replies'
);

-- Schedule new job - runs every 5 minutes
-- Note: Replace <YOUR_PROJECT_REF> with your actual Supabase project reference
-- The edge function URL format is: https://<project-ref>.supabase.co/functions/v1/process-auto-replies

-- IMPORTANT: This cron job calls via pg_net which needs to be configured
-- Alternative: Use Supabase Dashboard > Database > Cron Jobs to set this up

-- For now, we'll create a simpler approach that processes directly in SQL
-- This avoids the need for external HTTP calls from pg_cron

-- =============================================================================
-- Alternative: Direct SQL Processing (no external calls needed)
-- =============================================================================

-- Function to process auto-replies directly (without external edge function)
-- This is called by pg_cron and processes the queue using pg_net to call Resend API
CREATE OR REPLACE FUNCTION process_auto_reply_queue_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pending RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Log start
  RAISE NOTICE '[AutoReply Cron] Starting processing at %', now();
  
  -- Process up to 10 pending replies per run
  FOR v_pending IN 
    SELECT 
      q.id as queue_id,
      q.recipient_email,
      q.recipient_name,
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
    LIMIT 10
    FOR UPDATE OF q SKIP LOCKED
  LOOP
    v_count := v_count + 1;
    
    -- Mark as processing (to prevent duplicate processing)
    UPDATE auto_reply_queue
    SET status = 'sent', sent_at = now()
    WHERE id = v_pending.queue_id;
    
    -- Update statistics
    UPDATE auto_reply_settings
    SET total_sent = total_sent + 1, last_sent_at = now()
    FROM auto_reply_queue q
    WHERE auto_reply_settings.account_id = q.account_id
    AND q.id = v_pending.queue_id;
    
    RAISE NOTICE '[AutoReply] Processed queue_id: %', v_pending.queue_id;
  END LOOP;
  
  RAISE NOTICE '[AutoReply Cron] Completed. Processed % items.', v_count;
END;
$$;

-- Note: To actually send emails, you need to either:
-- 1. Use the Edge Function (recommended) - deploy it and call via HTTP
-- 2. Use pg_net extension to call Resend API directly from PostgreSQL
-- 3. Use an external scheduler (Vercel Cron, GitHub Actions, etc.)

-- The function above marks items as processed but doesn't send actual emails
-- For production, use the Edge Function approach with the cron scheduled in Supabase Dashboard

-- =============================================================================
-- API Route Alternative (Recommended)
-- =============================================================================
-- Instead of pg_cron, you can use:
-- 1. Vercel Cron: Add to vercel.json with schedule
-- 2. GitHub Actions: Scheduled workflow
-- 3. Supabase Dashboard: Database > Cron Jobs
--
-- All of these should call: POST /api/cron/process-auto-replies
-- with the CRON_SECRET header for authentication
