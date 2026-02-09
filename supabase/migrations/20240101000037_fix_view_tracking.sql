-- ============================================
-- CMM24 Migration: View-Tracking mit Deduplizierung
-- Problem: Views wurden doppelt gezaehlt (generateMetadata + Page)
-- und ohne jede Deduplizierung (Bots, Refreshes, etc.)
-- ============================================

-- Tabelle fuer View-Events (zur Deduplizierung)
CREATE TABLE IF NOT EXISTS listing_view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  viewed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique Index fuer Deduplizierung: Ein Besucher pro Listing pro Tag
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_view_events_dedup
  ON listing_view_events (listing_id, visitor_hash, viewed_date);

-- Index fuer schnelles Aufraeumen alter Events
CREATE INDEX IF NOT EXISTS idx_listing_view_events_date
  ON listing_view_events (viewed_date);

-- RLS aktivieren (Zugriff nur ueber SECURITY DEFINER Funktionen)
ALTER TABLE listing_view_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNCTION: record_listing_view(listing_id, visitor_hash)
-- Dedupliziert Views: Ein Besucher pro Listing pro Tag
-- Gibt TRUE zurueck wenn der View gezaehlt wurde
-- =============================================
CREATE OR REPLACE FUNCTION record_listing_view(
  p_listing_id UUID,
  p_visitor_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Versuch einzufuegen, bei Duplikat (gleicher Besucher+Listing+Tag) nichts tun
  INSERT INTO listing_view_events (listing_id, visitor_hash, viewed_date)
  VALUES (p_listing_id, p_visitor_hash, CURRENT_DATE)
  ON CONFLICT (listing_id, visitor_hash, viewed_date) DO NOTHING;
  
  -- Wenn Insert erfolgreich war (kein Duplikat), Counter erhoehen
  IF FOUND THEN
    UPDATE listings 
    SET views_count = views_count + 1 
    WHERE id = p_listing_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: cleanup_old_view_events()
-- Loescht View-Events aelter als 30 Tage
-- Kann per Cron-Job aufgerufen werden
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_view_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM listing_view_events 
  WHERE viewed_date < CURRENT_DATE - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
