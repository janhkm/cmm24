-- =============================================
-- Stripe Events Tabelle fuer Webhook-Idempotenz
-- Verhindert doppelte Verarbeitung von Events
-- =============================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index fuer schnelles Lookup
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(stripe_event_id);

-- Automatisches Cleanup: Events aelter als 90 Tage loeschen
-- (via pg_cron, falls aktiviert)
-- SELECT cron.schedule(
--   'cleanup-stripe-events',
--   '0 3 * * 0',
--   $$DELETE FROM stripe_events WHERE processed_at < NOW() - INTERVAL '90 days'$$
-- );

-- RLS: Nur Service Role darf zugreifen
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Keine Public Policies - nur via Service Role Key zugreifbar
