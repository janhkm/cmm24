-- ============================================
-- CMM24 Migration: Google Merchant Center Felder
-- Neue optionale Spalten fuer Listings
-- ============================================

-- Maschinentyp / Kategorie
ALTER TABLE listings ADD COLUMN IF NOT EXISTS machine_type TEXT;

-- Physische Abmessungen der Maschine (Aufstellmasse, nicht Messbereich)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS weight_kg DECIMAL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS dimension_length_mm INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS dimension_width_mm INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS dimension_height_mm INTEGER;

-- Identifikatoren fuer Google Merchant Center
ALTER TABLE listings ADD COLUMN IF NOT EXISTS mpn TEXT; -- Manufacturer Part Number
ALTER TABLE listings ADD COLUMN IF NOT EXISTS gtin TEXT; -- Global Trade Item Number (EAN)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS serial_number TEXT;

-- Google Merchant Center Kategorie
ALTER TABLE listings ADD COLUMN IF NOT EXISTS google_product_category TEXT DEFAULT 'Business & Industrial > Industrial Equipment';

-- Index fuer machine_type Filter
CREATE INDEX IF NOT EXISTS idx_listings_machine_type ON listings(machine_type) WHERE machine_type IS NOT NULL;
