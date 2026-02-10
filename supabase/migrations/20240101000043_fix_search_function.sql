-- =============================================================================
-- Fix: search_listings um Hersteller-Name und Messbereich erweitern
-- =============================================================================

-- search_vector Trigger aktualisieren: Hersteller-Name mit einbeziehen
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  v_manufacturer_name TEXT;
BEGIN
  -- Hersteller-Name laden
  SELECT name INTO v_manufacturer_name
  FROM manufacturers
  WHERE id = NEW.manufacturer_id;

  NEW.search_vector := 
    setweight(to_tsvector('german', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(v_manufacturer_name, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('german', COALESCE(NEW.model_name_custom, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- search_listings RPC aktualisieren: Hersteller-Name ILIKE + Messbereich-Filter
CREATE OR REPLACE FUNCTION search_listings(
  p_search_term TEXT DEFAULT NULL,
  p_manufacturer_id UUID DEFAULT NULL,
  p_condition TEXT DEFAULT NULL,
  p_price_min INTEGER DEFAULT NULL,
  p_price_max INTEGER DEFAULT NULL,
  p_year_min INTEGER DEFAULT NULL,
  p_year_max INTEGER DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_featured BOOLEAN DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'newest',
  p_limit INTEGER DEFAULT 24,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  account_id UUID,
  manufacturer_id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  price INTEGER,
  price_negotiable BOOLEAN,
  currency TEXT,
  year_built INTEGER,
  condition TEXT,
  measuring_range_x INTEGER,
  measuring_range_y INTEGER,
  measuring_range_z INTEGER,
  accuracy_um TEXT,
  software TEXT,
  controller TEXT,
  probe_system TEXT,
  location_country TEXT,
  location_city TEXT,
  location_postal_code TEXT,
  status TEXT,
  featured BOOLEAN,
  views_count INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  search_rank REAL,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tsquery TSQUERY;
  v_total_count BIGINT;
BEGIN
  -- Build tsquery if search term provided
  IF p_search_term IS NOT NULL AND LENGTH(TRIM(p_search_term)) > 0 THEN
    BEGIN
      v_tsquery := websearch_to_tsquery('german', p_search_term);
    EXCEPTION WHEN OTHERS THEN
      v_tsquery := plainto_tsquery('german', p_search_term);
    END;
  END IF;

  -- Get total count first (for pagination)
  SELECT COUNT(*) INTO v_total_count
  FROM listings l
  LEFT JOIN manufacturers m ON m.id = l.manufacturer_id
  WHERE l.deleted_at IS NULL
    AND l.status = 'active'
    AND (p_manufacturer_id IS NULL OR l.manufacturer_id = p_manufacturer_id)
    AND (p_condition IS NULL OR l.condition = p_condition)
    AND (p_price_min IS NULL OR l.price >= p_price_min * 100)
    AND (p_price_max IS NULL OR l.price <= p_price_max * 100)
    AND (p_year_min IS NULL OR l.year_built >= p_year_min)
    AND (p_year_max IS NULL OR l.year_built <= p_year_max)
    AND (p_country IS NULL OR l.location_country = p_country)
    AND (p_featured IS NULL OR l.featured = p_featured)
    AND (
      v_tsquery IS NULL 
      OR l.search_vector @@ v_tsquery
      OR l.title ILIKE '%' || p_search_term || '%'
      OR l.description ILIKE '%' || p_search_term || '%'
      OR m.name ILIKE '%' || p_search_term || '%'
    );

  -- Return results with ranking
  RETURN QUERY
  SELECT 
    l.id,
    l.account_id,
    l.manufacturer_id,
    l.title,
    l.slug,
    l.description,
    l.price,
    l.price_negotiable,
    l.currency,
    l.year_built,
    l.condition,
    l.measuring_range_x,
    l.measuring_range_y,
    l.measuring_range_z,
    l.accuracy_um,
    l.software,
    l.controller,
    l.probe_system,
    l.location_country,
    l.location_city,
    l.location_postal_code,
    l.status,
    l.featured,
    l.views_count,
    l.published_at,
    l.created_at,
    l.updated_at,
    CASE 
      WHEN v_tsquery IS NOT NULL AND l.search_vector @@ v_tsquery 
      THEN ts_rank_cd(l.search_vector, v_tsquery)
      ELSE 0.0
    END AS search_rank,
    v_total_count AS total_count
  FROM listings l
  LEFT JOIN manufacturers m ON m.id = l.manufacturer_id
  WHERE l.deleted_at IS NULL
    AND l.status = 'active'
    AND (p_manufacturer_id IS NULL OR l.manufacturer_id = p_manufacturer_id)
    AND (p_condition IS NULL OR l.condition = p_condition)
    AND (p_price_min IS NULL OR l.price >= p_price_min * 100)
    AND (p_price_max IS NULL OR l.price <= p_price_max * 100)
    AND (p_year_min IS NULL OR l.year_built >= p_year_min)
    AND (p_year_max IS NULL OR l.year_built <= p_year_max)
    AND (p_country IS NULL OR l.location_country = p_country)
    AND (p_featured IS NULL OR l.featured = p_featured)
    AND (
      v_tsquery IS NULL 
      OR l.search_vector @@ v_tsquery
      OR l.title ILIKE '%' || p_search_term || '%'
      OR l.description ILIKE '%' || p_search_term || '%'
      OR m.name ILIKE '%' || p_search_term || '%'
    )
  ORDER BY
    CASE WHEN v_tsquery IS NULL AND l.featured THEN 0 ELSE 1 END,
    CASE p_sort_by
      WHEN 'relevance' THEN 
        CASE WHEN v_tsquery IS NOT NULL THEN -ts_rank_cd(l.search_vector, v_tsquery) ELSE 0 END
      ELSE 0
    END,
    CASE WHEN p_sort_by = 'price_asc' THEN l.price END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price_desc' THEN l.price END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'year_desc' THEN l.year_built END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'newest' OR p_sort_by IS NULL THEN l.published_at END DESC NULLS LAST,
    l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Existierende search_vectors aktualisieren (Hersteller-Name einbeziehen)
UPDATE listings SET updated_at = updated_at WHERE deleted_at IS NULL;
