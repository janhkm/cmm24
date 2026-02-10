-- =============================================================================
-- Migration: Benachrichtigungseinstellungen (DSGVO Art. 21 — Widerspruchsrecht)
-- =============================================================================
-- Ermoeglicht Nutzern, ihre E-Mail-Benachrichtigungspraeferenzen zu steuern.
-- Dient der Umsetzung des Widerspruchsrechts gemaess Art. 21 DSGVO.
-- =============================================================================

-- Tabelle fuer Benachrichtigungspraeferenzen
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- E-Mail-Benachrichtigungen
  email_inquiries BOOLEAN NOT NULL DEFAULT true,        -- Neue Anfragen
  email_messages BOOLEAN NOT NULL DEFAULT true,         -- Neue Nachrichten
  email_listing_updates BOOLEAN NOT NULL DEFAULT true,  -- Inserat-Status-Updates
  email_product_updates BOOLEAN NOT NULL DEFAULT false,  -- Produkt-Neuigkeiten
  email_newsletter BOOLEAN NOT NULL DEFAULT false,       -- Newsletter
  email_marketing BOOLEAN NOT NULL DEFAULT false,        -- Marketing-Emails
  
  -- Metadaten
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Pro Profil nur ein Eintrag
  UNIQUE(profile_id)
);

-- RLS aktivieren
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- User kann eigene Praeferenzen lesen
CREATE POLICY "Users can read own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = profile_id);

-- User kann eigene Praeferenzen erstellen
CREATE POLICY "Users can create own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- User kann eigene Praeferenzen aktualisieren
CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = profile_id);

-- Trigger fuer updated_at
CREATE TRIGGER set_updated_at_notification_preferences
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_preferences_profile_id 
  ON notification_preferences(profile_id);
