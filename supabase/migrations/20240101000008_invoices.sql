-- ============================================
-- CMM24 Migration: Invoices (Rechnungen)
-- ============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- cents
  currency TEXT DEFAULT 'EUR',
  status invoice_status DEFAULT 'draft',
  pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_invoices_account ON invoices(account_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);

-- RLS aktivieren
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- User kann eigene Rechnungen sehen
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE owner_id = auth.uid()
    )
  );

-- Admins können alle sehen/ändern
CREATE POLICY "Admins can manage all invoices"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Stripe Events Tabelle (für Idempotenz)
CREATE TABLE stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_events_event_id ON stripe_events(stripe_event_id);
