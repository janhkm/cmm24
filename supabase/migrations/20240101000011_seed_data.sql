-- ============================================
-- CMM24 Migration: Seed Data
-- ============================================

-- =============================================
-- PLANS (Free, Starter, Business)
-- =============================================
INSERT INTO plans (name, slug, listing_limit, price_monthly, price_yearly, launch_price_monthly, launch_price_yearly, sort_order, feature_flags, features) VALUES
-- FREE Plan (Tier 1)
(
  'Free',
  'free',
  1,
  0,
  0,
  0,
  0,
  1,
  '{
    "max_listings": 1,
    "max_images_per_listing": 5,
    "max_team_members": 0,
    "featured_per_month": 0,
    "statistics": false,
    "email_composer": false,
    "lead_pipeline": false,
    "auto_reply": false,
    "team_management": false,
    "api_access": false,
    "support_level": "email"
  }',
  ARRAY[
    '1 Inserat',
    '5 Bilder pro Inserat',
    'Anfragen-Verwaltung (Liste)',
    'E-Mail-Support'
  ]
),
-- STARTER Plan (Tier 2)
(
  'Starter',
  'starter',
  5,
  5500, -- 55€ regulär
  55000, -- 550€/Jahr regulär
  2400, -- 24€ Early Adopter
  24000, -- 240€/Jahr Early Adopter
  2,
  '{
    "max_listings": 5,
    "max_images_per_listing": 10,
    "max_team_members": 1,
    "featured_per_month": 1,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": false,
    "auto_reply": false,
    "team_management": false,
    "api_access": false,
    "support_level": "24h"
  }',
  ARRAY[
    '5 Inserate',
    '10 Bilder pro Inserat',
    'Statistiken',
    'E-Mail-Composer',
    '1 Featured Listing/Monat',
    '24h Support'
  ]
),
-- BUSINESS Plan (Tier 3)
(
  'Business',
  'business',
  25,
  14300, -- 143€ regulär
  143000, -- 1430€/Jahr regulär
  7900, -- 79€ Early Adopter
  79000, -- 790€/Jahr Early Adopter
  3,
  '{
    "max_listings": 25,
    "max_images_per_listing": 20,
    "max_team_members": 5,
    "featured_per_month": 5,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": true,
    "auto_reply": true,
    "team_management": true,
    "api_access": true,
    "support_level": "4h"
  }',
  ARRAY[
    '25 Inserate',
    '20 Bilder pro Inserat',
    'Lead-Pipeline',
    'Auto-Reply',
    'Team-Management',
    'API-Zugang',
    '5 Featured Listings/Monat',
    '4h Priority Support'
  ]
);

-- =============================================
-- MANUFACTURERS (Hersteller)
-- =============================================
INSERT INTO manufacturers (name, slug, country, description) VALUES
('Zeiss', 'zeiss', 'DE', 'Carl Zeiss Industrial Metrology - Führender Hersteller von Koordinatenmessmaschinen'),
('Hexagon', 'hexagon', 'SE', 'Hexagon Manufacturing Intelligence - Globaler Anbieter von Messtechnik'),
('Wenzel', 'wenzel', 'DE', 'Wenzel Group - Deutscher Hersteller von Präzisionsmesstechnik'),
('Mitutoyo', 'mitutoyo', 'JP', 'Mitutoyo Corporation - Japanischer Messtechnik-Spezialist'),
('Coord3', 'coord3', 'IT', 'Coord3 Metrology - Italienischer CMM-Hersteller'),
('LK Metrology', 'lk-metrology', 'GB', 'LK Metrology - Britischer Spezialist für große Messmaschinen'),
('Werth', 'werth', 'DE', 'Werth Messtechnik - Spezialist für optische und Multisensor-Messtechnik'),
('OGP', 'ogp', 'US', 'Optical Gaging Products - Amerikanischer Hersteller von optischen Messsystemen'),
('Nikon', 'nikon', 'JP', 'Nikon Metrology - Optische und Laser-Messtechnik'),
('Keyence', 'keyence', 'JP', 'Keyence Corporation - Automatisierung und Messtechnik'),
('Faro', 'faro', 'US', 'FARO Technologies - Portable Messtechnik und 3D-Scanning'),
('Renishaw', 'renishaw', 'GB', 'Renishaw plc - Präzisionsmesstechnik und Tastsysteme'),
('Leitz', 'leitz', 'DE', 'Leitz (Hexagon) - Hochpräzise Koordinatenmesstechnik'),
('DEA', 'dea', 'IT', 'DEA (Hexagon) - Italienische Messmaschinen'),
('Sheffield', 'sheffield', 'US', 'Sheffield (Hexagon) - Amerikanische Messmaschinen'),
('Brown & Sharpe', 'brown-sharpe', 'US', 'Brown & Sharpe (Hexagon) - Traditioneller Messtechnik-Hersteller'),
('Sonstige', 'sonstige', NULL, 'Andere Hersteller');

-- =============================================
-- MODELS (Modelle für wichtige Hersteller)
-- =============================================

-- Zeiss Models
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'ACCURA', 'accura', 'portal' FROM manufacturers WHERE slug = 'zeiss';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'CONTURA', 'contura', 'portal' FROM manufacturers WHERE slug = 'zeiss';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'PRISMO', 'prismo', 'portal' FROM manufacturers WHERE slug = 'zeiss';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'SPECTRUM', 'spectrum', 'portal' FROM manufacturers WHERE slug = 'zeiss';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'XENOS', 'xenos', 'portal' FROM manufacturers WHERE slug = 'zeiss';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'O-INSPECT', 'o-inspect', 'optical' FROM manufacturers WHERE slug = 'zeiss';

-- Hexagon Models
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'Global S', 'global-s', 'portal' FROM manufacturers WHERE slug = 'hexagon';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'Optiv', 'optiv', 'optical' FROM manufacturers WHERE slug = 'hexagon';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'Tigo SF', 'tigo-sf', 'portal' FROM manufacturers WHERE slug = 'hexagon';

-- Wenzel Models
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'LH', 'lh', 'portal' FROM manufacturers WHERE slug = 'wenzel';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'XOrbit', 'xorbit', 'horizontal_arm' FROM manufacturers WHERE slug = 'wenzel';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'SF', 'sf', 'portal' FROM manufacturers WHERE slug = 'wenzel';

-- Mitutoyo Models
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'Crysta-Apex S', 'crysta-apex-s', 'portal' FROM manufacturers WHERE slug = 'mitutoyo';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'STRATO-Apex', 'strato-apex', 'portal' FROM manufacturers WHERE slug = 'mitutoyo';
INSERT INTO models (manufacturer_id, name, slug, category) 
SELECT id, 'Quick Vision', 'quick-vision', 'optical' FROM manufacturers WHERE slug = 'mitutoyo';
