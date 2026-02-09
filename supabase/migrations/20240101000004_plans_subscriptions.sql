-- ============================================
-- CMM24 Migration: Plans & Subscriptions
-- ============================================

-- Plans Tabelle
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'free', 'starter', 'business'
  listing_limit INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL, -- cents (regulär)
  price_yearly INTEGER NOT NULL, -- cents (regulär)
  launch_price_monthly INTEGER, -- cents (Early Adopter)
  launch_price_yearly INTEGER, -- cents (Early Adopter)
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  feature_flags JSONB NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active) WHERE is_active = true;

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Subscriptions Tabelle
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status subscription_status DEFAULT 'active',
  billing_interval billing_interval DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  is_early_adopter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ein aktiver Subscription pro Account
  UNIQUE(account_id)
);

CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: Auto-assign Free Plan zu neuem Account
CREATE OR REPLACE FUNCTION assign_free_plan()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get Free plan ID
  SELECT id INTO free_plan_id FROM plans WHERE slug = 'free' LIMIT 1;
  
  -- Create subscription with Free plan
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (account_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_account_created_assign_free_plan
  AFTER INSERT ON accounts
  FOR EACH ROW EXECUTE FUNCTION assign_free_plan();

-- RLS aktivieren
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans: Jeder kann aktive Plans sehen
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- Subscriptions: User kann nur eigene sehen
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Admins können alle sehen/ändern
CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage plans"
  ON plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
