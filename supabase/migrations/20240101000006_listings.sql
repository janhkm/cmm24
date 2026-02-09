-- ============================================
-- CMM24 Migration: Listings & Listing Media
-- ============================================

-- Listings Tabelle
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
  model_id UUID REFERENCES models(id),
  model_name_custom TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- cents
  price_negotiable BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'EUR',
  year_built INTEGER NOT NULL,
  condition listing_condition NOT NULL,
  -- Technische Daten
  measuring_range_x INTEGER, -- mm
  measuring_range_y INTEGER, -- mm
  measuring_range_z INTEGER, -- mm
  accuracy_um TEXT,
  software TEXT,
  controller TEXT,
  probe_system TEXT,
  -- Standort
  location_country TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_postal_code TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  -- Status & Meta
  status listing_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  -- Full-Text Search
  search_vector TSVECTOR,
  -- Moderation
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES profiles(id),
  -- Soft-Delete
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_account ON listings(account_id);
CREATE INDEX idx_listings_manufacturer ON listings(manufacturer_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_status_published ON listings(status, published_at DESC);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;
CREATE INDEX idx_listings_active ON listings(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_listings_account_status ON listings(account_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);
CREATE INDEX idx_listings_location ON listings(location_country, location_city);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_year ON listings(year_built);

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: Slug generieren
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_listing_slug_trigger
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION generate_listing_slug();

-- Trigger: Search Vector aktualisieren
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('german', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('german', COALESCE(NEW.model_name_custom, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description, model_name_custom ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- Listing Media Tabelle
CREATE TABLE listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listing_media_listing ON listing_media(listing_id);
CREATE INDEX idx_listing_media_primary ON listing_media(listing_id) WHERE is_primary = true;

CREATE TRIGGER update_listing_media_updated_at
  BEFORE UPDATE ON listing_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS aktivieren
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;

-- Listings: Öffentlich aktive Listings sehen
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status IN ('active', 'sold') AND deleted_at IS NULL);

-- Listings: Owner kann alle eigenen sehen (auch drafts, deleted)
CREATE POLICY "Owner can view own listings"
  ON listings FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Listings: Owner kann eigene erstellen
CREATE POLICY "Owner can insert listings"
  ON listings FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Listings: Owner kann eigene aktualisieren
CREATE POLICY "Owner can update own listings"
  ON listings FOR UPDATE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Listings: Owner kann eigene löschen (soft-delete)
CREATE POLICY "Owner can delete own listings"
  ON listings FOR DELETE
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Admins können alle sehen/ändern
CREATE POLICY "Admins can manage all listings"
  ON listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Listing Media: Öffentlich für aktive Listings
CREATE POLICY "Anyone can view media of active listings"
  ON listing_media FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE status IN ('active', 'sold') AND deleted_at IS NULL
    )
  );

-- Listing Media: Owner kann eigene verwalten
CREATE POLICY "Owner can manage own listing media"
  ON listing_media FOR ALL
  USING (
    listing_id IN (
      SELECT l.id FROM listings l
      JOIN accounts a ON l.account_id = a.id
      WHERE a.owner_id = auth.uid()
    )
  );
