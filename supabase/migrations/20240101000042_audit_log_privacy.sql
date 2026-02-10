-- =============================================================================
-- Migration: Audit-Log DSGVO-Konformitaet
-- =============================================================================
-- 1. Sensible Felder in Audit-Logs maskieren (Datenminimierung, Art. 5(1)(c))
-- 2. Automatische Loeschung nach 2 Jahren (Speicherbegrenzung, Art. 5(1)(e))
-- 3. IP-Adressen in api_key_usage nach 90 Tagen loeschen
-- =============================================================================

-- Sensible Felder die in Audit-Logs maskiert werden sollen
CREATE OR REPLACE FUNCTION redact_sensitive_fields(data JSONB)
RETURNS JSONB AS $$
DECLARE
  sensitive_keys TEXT[] := ARRAY[
    'email', 'phone', 'address_street', 'address_postal_code',
    'vat_id', 'password', 'avatar_url', 'ip_address',
    'contact_email', 'contact_phone', 'reporter_email'
  ];
  k TEXT;
BEGIN
  IF data IS NULL THEN
    RETURN NULL;
  END IF;
  
  FOREACH k IN ARRAY sensitive_keys LOOP
    IF data ? k AND data->>k IS NOT NULL AND data->>k != '' THEN
      data := data || jsonb_build_object(k, '***REDACTED***');
    END IF;
  END LOOP;
  
  RETURN data;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Audit-Log-Trigger aktualisieren: sensible Felder maskieren
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, performed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN redact_sensitive_fields(row_to_json(OLD)::jsonb) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN redact_sensitive_fields(row_to_json(NEW)::jsonb) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zur automatischen Bereinigung alter Audit-Logs (2 Jahre Retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zur Anonymisierung alter IP-Adressen in api_key_usage (90 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_api_usage_ips()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE api_key_usage
  SET ip_address = NULL, user_agent = NULL
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND ip_address IS NOT NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IP-Adressen in Audit-Logs nach 90 Tagen anonymisieren
CREATE OR REPLACE FUNCTION cleanup_old_audit_log_ips()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE audit_logs
  SET ip_address = NULL, user_agent = NULL
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND (ip_address IS NOT NULL OR user_agent IS NOT NULL);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
