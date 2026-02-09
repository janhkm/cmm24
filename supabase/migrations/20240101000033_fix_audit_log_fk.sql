-- =============================================
-- FIX: audit_logs FK-Constraint auf profiles
--
-- Problem: Beim Registrieren erstellt complete_registration() 
-- zuerst das Profil, dann den Account. Der Account-INSERT
-- feuert den Trigger log_changes(), der auth.uid() als
-- performed_by schreibt. Da auth.uid() waehrend der
-- Registrierung nicht unbedingt ein gueltiges Profil hat
-- (oder noch nicht sichtbar ist), schlaegt der FK-Check
-- fehl und die gesamte Account-Erstellung wird zurueckgerollt.
--
-- Loesung: log_changes() prueft, ob auth.uid() in profiles
-- existiert. Falls nicht, wird performed_by auf NULL gesetzt.
-- =============================================

CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_performer UUID;
BEGIN
  -- auth.uid() nur verwenden, wenn ein Profil existiert
  v_performer := auth.uid();
  
  IF v_performer IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_performer) THEN
      v_performer := NULL;
    END IF;
  END IF;

  INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, performed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
    v_performer
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
