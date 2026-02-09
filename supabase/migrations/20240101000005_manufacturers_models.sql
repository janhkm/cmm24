-- ============================================
-- CMM24 Migration: Manufacturers & Models (Stammdaten)
-- ============================================

-- Manufacturers Tabelle
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  country TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manufacturers_slug ON manufacturers(slug);
CREATE INDEX idx_manufacturers_name ON manufacturers(name);

CREATE TRIGGER update_manufacturers_updated_at
  BEFORE UPDATE ON manufacturers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Models Tabelle
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category machine_category,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manufacturer_id, slug)
);

CREATE INDEX idx_models_manufacturer ON models(manufacturer_id);
CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_category ON models(category);

CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS aktivieren
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Manufacturers: Jeder kann lesen
CREATE POLICY "Anyone can view manufacturers"
  ON manufacturers FOR SELECT
  USING (true);

-- Manufacturers: Nur Super-Admin kann ändern
CREATE POLICY "Super admins can manage manufacturers"
  ON manufacturers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Models: Jeder kann lesen
CREATE POLICY "Anyone can view models"
  ON models FOR SELECT
  USING (true);

-- Models: Nur Super-Admin kann ändern
CREATE POLICY "Super admins can manage models"
  ON models FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
