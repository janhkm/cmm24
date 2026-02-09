-- =============================================
-- pg_cron Jobs fuer automatisierte Aufgaben
-- =============================================

-- Extension aktivieren (falls noetig)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================
-- Job 1: Featured Listings ablaufen lassen (taeglich 00:00)
-- =============================================
SELECT cron.schedule(
  'expire-featured-listings',
  '0 0 * * *',
  $$
    UPDATE listings
    SET featured = false, featured_until = NULL, updated_at = NOW()
    WHERE featured = true 
      AND featured_until IS NOT NULL
      AND featured_until < NOW()
      AND deleted_at IS NULL
  $$
);

-- =============================================
-- Job 2: Alte Entwuerfe soft-loeschen (woechentlich Sonntag 03:00)
-- Entwuerfe die seit 90 Tagen nicht bearbeitet wurden
-- =============================================
SELECT cron.schedule(
  'cleanup-old-drafts',
  '0 3 * * 0',
  $$
    UPDATE listings
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE status = 'draft'
      AND updated_at < NOW() - INTERVAL '90 days'
      AND deleted_at IS NULL
  $$
);

-- =============================================
-- Job 3: Endgueltige Loesung soft-deleted Listings (woechentlich Sonntag 04:00)
-- Soft-deleted seit mehr als 30 Tagen
-- =============================================
SELECT cron.schedule(
  'permanent-delete-old-listings',
  '0 4 * * 0',
  $$
    DELETE FROM listing_media
    WHERE listing_id IN (
      SELECT id FROM listings
      WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL '30 days'
    );
    
    DELETE FROM listings
    WHERE deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '30 days';
  $$
);

-- =============================================
-- Job 4: Alte Stripe Events aufraeumen (woechentlich Sonntag 05:00)
-- Events aelter als 90 Tage
-- =============================================
SELECT cron.schedule(
  'cleanup-stripe-events',
  '0 5 * * 0',
  $$
    DELETE FROM stripe_events
    WHERE processed_at < NOW() - INTERVAL '90 days'
  $$
);

-- =============================================
-- Job 5: Alte Benachrichtigungen aufraeumen (woechentlich Sonntag 05:30)
-- Gelesene Benachrichtigungen aelter als 60 Tage
-- =============================================
SELECT cron.schedule(
  'cleanup-old-notifications',
  '30 5 * * 0',
  $$
    DELETE FROM notifications
    WHERE read_at IS NOT NULL
      AND created_at < NOW() - INTERVAL '60 days'
  $$
);

-- =============================================
-- Job 6: Abgelaufene Team-Einladungen loeschen (taeglich 06:00)
-- =============================================
SELECT cron.schedule(
  'cleanup-expired-invitations',
  '0 6 * * *',
  $$
    DELETE FROM team_invitations
    WHERE expires_at < NOW()
      AND accepted_at IS NULL
  $$
);
