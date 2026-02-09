-- =============================================
-- Funktion: Ueberzaehlige Team-Mitglieder bei Downgrade deaktivieren
-- Behaelt den Owner + die aeltesten Mitglieder bis zum neuen Limit
-- =============================================

CREATE OR REPLACE FUNCTION deactivate_excess_team_members(
  p_account_id UUID,
  p_max_members INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  deactivated_count INTEGER := 0;
BEGIN
  -- Ueberzaehlige Mitglieder deaktivieren (Owner wird nie deaktiviert)
  WITH ranked_members AS (
    SELECT 
      tm.id,
      tm.role,
      tm.is_active,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE WHEN tm.role = 'owner' THEN 0 ELSE 1 END,
          tm.created_at ASC
      ) as rank
    FROM team_members tm
    WHERE tm.account_id = p_account_id
      AND tm.is_active = true
  )
  UPDATE team_members
  SET is_active = false, updated_at = NOW()
  WHERE id IN (
    SELECT id FROM ranked_members
    WHERE rank > p_max_members + 1  -- +1 fuer den Owner
      AND role != 'owner'
  );
  
  GET DIAGNOSTICS deactivated_count = ROW_COUNT;
  
  RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Trigger: Bei Subscription-Aenderung Team-Limit pruefen
-- =============================================

CREATE OR REPLACE FUNCTION check_team_limit_on_plan_change()
RETURNS TRIGGER AS $$
DECLARE
  new_max_members INTEGER;
  v_account_id UUID;
BEGIN
  v_account_id := NEW.account_id;
  
  -- Neues Team-Limit aus Plan holen
  SELECT COALESCE((p.feature_flags->>'max_team_members')::INTEGER, 0)
  INTO new_max_members
  FROM plans p
  WHERE p.id = NEW.plan_id;
  
  -- Ueberzaehlige Mitglieder deaktivieren
  IF new_max_members IS NOT NULL THEN
    PERFORM deactivate_excess_team_members(v_account_id, new_max_members);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger nur bei Plan-Aenderung (nicht bei jedem Update)
DROP TRIGGER IF EXISTS check_team_on_subscription_change ON subscriptions;
CREATE TRIGGER check_team_on_subscription_change
  AFTER UPDATE OF plan_id ON subscriptions
  FOR EACH ROW
  WHEN (OLD.plan_id IS DISTINCT FROM NEW.plan_id)
  EXECUTE FUNCTION check_team_limit_on_plan_change();
