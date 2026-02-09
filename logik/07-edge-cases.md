# Edge Cases – Downgrade, Deletion, Failures

## Übersicht

Dieses Dokument beschreibt das Verhalten bei Grenzfällen und Fehlersituationen.

---

## 1. Plan-Downgrade

### Szenario: Business → Starter → Free

Wenn ein Account auf einen niedrigeren Plan wechselt, können Limits überschritten sein.

### Strategie: **Soft-Lock** (Daten behalten, Zugriff einschränken)

| Ressource | Über Limit | Verhalten |
|-----------|------------|-----------|
| **Listings** | 10 → 5 → 1 | Bestehende bleiben aktiv, keine neuen erstellbar |
| **Team-Mitglieder** | 5 → 1 → 0 | Überzählige werden `is_active = false` |
| **Featured Listings** | - | Laufen aus, keine neuen buchbar |
| **Gesperrte Features** | - | Seiten zeigen Upgrade-Prompt |

### Listing-Handling bei Downgrade

```sql
-- NICHT: Automatisch löschen oder archivieren
-- SONDERN: Nur neue Erstellung blockieren

-- Query für "Kann neues Listing erstellen?"
SELECT 
  p.listing_limit,
  COUNT(l.id) as current_count,
  p.listing_limit > COUNT(l.id) as can_create
FROM subscriptions s
JOIN plans p ON s.plan_id = p.id
LEFT JOIN listings l ON l.account_id = s.account_id 
  AND l.status IN ('draft', 'pending_review', 'active')
  AND l.deleted_at IS NULL
WHERE s.account_id = $account_id
GROUP BY p.listing_limit;
```

### Team-Mitglieder bei Downgrade

```sql
-- Bei Downgrade: Überzählige Mitglieder deaktivieren
-- Behalte Owner + die zuerst hinzugefügten

WITH plan_limit AS (
  SELECT p.feature_flags->>'max_team_members' as max_members
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE s.account_id = $account_id
),
ranked_members AS (
  SELECT 
    tm.id,
    tm.role,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN tm.role = 'owner' THEN 0 ELSE 1 END,
        tm.created_at ASC
    ) as rank
  FROM team_members tm
  WHERE tm.account_id = $account_id
)
UPDATE team_members
SET is_active = (
  SELECT rm.rank <= COALESCE((SELECT max_members::int FROM plan_limit), 0)
  FROM ranked_members rm
  WHERE rm.id = team_members.id
)
WHERE account_id = $account_id;
```

### UI-Verhalten nach Downgrade

```typescript
// Beispiel: Inserat erstellen Button
function CreateListingButton() {
  const { listingLimit, canCreateListing } = usePermissions();
  const { data: listingCount } = useMyListingCount();
  
  const isOverLimit = listingCount >= listingLimit;
  
  if (isOverLimit) {
    return (
      <div className="space-y-2">
        <Button disabled>
          Neues Inserat erstellen
        </Button>
        <p className="text-sm text-muted-foreground">
          Du hast {listingCount} von {listingLimit} Inseraten. 
          <Link href="/seller/abo/upgrade">Upgrade</Link> für mehr.
        </p>
      </div>
    );
  }
  
  return <Button>Neues Inserat erstellen</Button>;
}
```

---

## 2. Account Suspension

### Gründe für Sperrung

| Grund | Trigger | Dauer |
|-------|---------|-------|
| Zahlungsausfall | Stripe `invoice.payment_failed` | Bis Zahlung |
| Regelverstoß | Admin-Aktion | Bis Review |
| Betrugsversuch | Automatisch/Admin | Permanent |
| DSGVO-Anfrage | User-Request | Nach Löschung |

### Verhalten bei Suspension

```sql
-- Account sperren
UPDATE accounts
SET status = 'suspended',
    suspended_reason = $reason,
    updated_at = NOW()
WHERE id = $account_id;

-- Alle aktiven Listings ausblenden (nicht löschen!)
UPDATE listings
SET status = 'archived'
WHERE account_id = $account_id
  AND status = 'active'
  AND deleted_at IS NULL;
```

### UI bei gesperrtem Account

```typescript
// middleware.ts - Check in Seller routes
if (account?.status === 'suspended') {
  return NextResponse.redirect('/seller/gesperrt');
}

// /seller/gesperrt/page.tsx
export default function AccountSuspendedPage() {
  const { account } = useAuth();
  
  return (
    <div className="container max-w-md py-20 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Account gesperrt</h1>
      <p className="text-muted-foreground mb-4">
        {account?.suspended_reason || 'Ihr Account wurde vorübergehend gesperrt.'}
      </p>
      <Button asChild>
        <Link href="/kontakt">Support kontaktieren</Link>
      </Button>
    </div>
  );
}
```

### Reaktivierung

```sql
-- Account reaktivieren
UPDATE accounts
SET status = 'active',
    suspended_reason = NULL,
    updated_at = NOW()
WHERE id = $account_id;

-- Listings müssen MANUELL wieder aktiviert werden
-- (User entscheidet welche wieder online gehen)
```

---

## 3. Soft-Delete

### Betroffene Tabellen

| Tabelle | Soft-Delete | Grund |
|---------|-------------|-------|
| `listings` | ✓ | Wiederherstellung, Audit |
| `accounts` | ✓ | Legal, Support |
| `inquiries` | ✓ | CRM-Historie |
| `profiles` | - | Supabase Auth managed |
| `listing_media` | - | CASCADE von listings |
| Rest | - | Keine Retention nötig |

### Soft-Delete implementieren

```sql
-- Listing "löschen"
UPDATE listings
SET deleted_at = NOW(),
    status = 'archived'
WHERE id = $id AND account_id = $account_id;

-- Zugehörige Media NICHT löschen (für Wiederherstellung)
-- Storage-Cleanup später per Job
```

### Queries anpassen

```sql
-- WICHTIG: Alle Queries müssen deleted_at filtern!

-- Falsch:
SELECT * FROM listings WHERE account_id = $account_id;

-- Richtig:
SELECT * FROM listings 
WHERE account_id = $account_id 
  AND deleted_at IS NULL;
```

### RLS Policies für Soft-Delete

```sql
-- Public Listings (nur nicht-gelöschte)
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (
    status IN ('active', 'sold') 
    AND deleted_at IS NULL
  );

-- Owner sieht auch gelöschte (für Wiederherstellung)
CREATE POLICY "Owner can view all own listings" ON listings
  FOR SELECT USING (
    account_id = get_my_account_id()
    -- Kein deleted_at Filter für Owner!
  );
```

### Wiederherstellung

```typescript
// src/lib/actions/listings.ts
export async function restoreListing(listingId: string) {
  const supabase = await createActionClient();
  
  // Prüfen ob Limit erreicht
  const { canCreate, limit, current } = await checkListingLimit();
  
  if (!canCreate) {
    return { 
      error: `Listing-Limit erreicht (${current}/${limit}). Upgrade erforderlich.` 
    };
  }
  
  const { error } = await supabase
    .from('listings')
    .update({ 
      deleted_at: null,
      status: 'draft', // Zurück auf Draft für Review
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId);
  
  return { error };
}
```

### Endgültige Löschung (Cleanup Job)

```sql
-- Wöchentlicher Job: Soft-deleted > 30 Tage endgültig löschen
SELECT cron.schedule(
  'permanent-delete-old-listings',
  '0 4 * * 0', -- Sonntag 04:00
  $$
    -- 1. Storage-Dateien löschen (via Edge Function)
    -- 2. Dann DB-Einträge
    DELETE FROM listings
    WHERE deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '30 days'
  $$
);
```

---

## 4. Stripe Failures

### Zahlungsausfall

```typescript
// Webhook: invoice.payment_failed
export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createServiceRoleClient();
  
  // Subscription-Status aktualisieren
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);
  
  // Email an User senden
  await sendPaymentFailedEmail({
    to: invoice.customer_email,
    invoiceUrl: invoice.hosted_invoice_url,
    amount: invoice.amount_due / 100,
  });
  
  // Nach 3 fehlgeschlagenen Versuchen: Account einschränken
  // (Stripe managed das automatisch, wir reagieren auf subscription.deleted)
}
```

### Subscription Cancelled

```typescript
// Webhook: customer.subscription.deleted
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createServiceRoleClient();
  
  // Subscription auf canceled setzen
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
  
  // Downgrade auf Free Plan
  const freePlan = await supabase
    .from('plans')
    .select('id')
    .eq('slug', 'free')
    .single();
  
  await supabase
    .from('subscriptions')
    .update({ plan_id: freePlan.data.id, status: 'active' })
    .eq('stripe_subscription_id', subscription.id);
  
  // Email senden
  await sendSubscriptionCancelledEmail({...});
  
  // Team-Mitglieder deaktivieren (Free = 0 Team-Mitglieder)
  await deactivateExcessTeamMembers(accountId, 0);
}
```

### Webhook Retry

```typescript
// Stripe retries failed webhooks automatically
// Unsere Handling muss idempotent sein!

export async function handleWebhook(event: Stripe.Event) {
  // Prüfen ob bereits verarbeitet
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();
  
  if (existing) {
    return { status: 200, message: 'Already processed' };
  }
  
  // Event verarbeiten...
  
  // Als verarbeitet markieren
  await supabase
    .from('stripe_events')
    .insert({ stripe_event_id: event.id, type: event.type });
}
```

---

## 5. Listing-Moderation Edge Cases

### Pending Review bei Account-Suspension

```sql
-- Wenn Account gesperrt wird während Listing in Review
UPDATE listings
SET status = 'archived',
    rejection_reason = 'Account gesperrt',
    rejected_at = NOW()
WHERE account_id = $account_id
  AND status = 'pending_review';
```

### Moderation nach Plan-Downgrade

Wenn ein User während der Moderation auf Free downgradet:
- Listing wird trotzdem moderiert
- Bei Freigabe: Prüfen ob Limit erreicht
- Wenn Limit erreicht: Listing bleibt als Draft

```typescript
// Bei Listing-Freigabe
async function approveListing(listingId: string) {
  const listing = await getListing(listingId);
  const { canCreate, limit, current } = await checkListingLimit(listing.account_id);
  
  if (!canCreate) {
    // Limit erreicht - als Draft belassen
    await updateListing(listingId, {
      status: 'draft',
      rejection_reason: null,
    });
    
    await notifyUser({
      type: 'listing_approved_but_limited',
      message: `Ihr Inserat wurde freigegeben, aber Sie haben bereits ${current} von ${limit} Inseraten aktiv.`,
    });
    
    return;
  }
  
  // Normal freigeben
  await updateListing(listingId, {
    status: 'active',
    published_at: new Date().toISOString(),
  });
}
```

---

## 6. Concurrent Edit Conflicts

### Optimistic Locking

```sql
-- Listings Tabelle hat bereits updated_at
-- Verwenden als Version-Check

-- Bei Update: Check ob unverändert seit Laden
UPDATE listings
SET title = $title,
    description = $description,
    updated_at = NOW()
WHERE id = $id
  AND updated_at = $loaded_updated_at  -- Optimistic Lock
RETURNING *;

-- Wenn 0 rows affected: Conflict!
```

### Conflict-Handling im Frontend

```typescript
async function saveListing(data: ListingFormData) {
  const { data: result, error } = await supabase
    .from('listings')
    .update(data)
    .eq('id', data.id)
    .eq('updated_at', data.loadedAt) // Optimistic lock
    .select()
    .single();
  
  if (!result && !error) {
    // Conflict - jemand hat zwischenzeitlich geändert
    const { data: current } = await supabase
      .from('listings')
      .select('*')
      .eq('id', data.id)
      .single();
    
    return {
      conflict: true,
      serverData: current,
      message: 'Das Inserat wurde zwischenzeitlich geändert. Bitte überprüfen Sie die Änderungen.',
    };
  }
  
  return { data: result, error };
}
```

---

## 7. Zusammenfassung: Entscheidungsmatrix

| Situation | Aktion | Begründung |
|-----------|--------|------------|
| Downgrade → Listings über Limit | Behalten, keine neuen | User-Daten schützen |
| Downgrade → Team über Limit | Deaktivieren (nicht löschen) | Später reaktivierbar |
| Account-Suspension | Listings archivieren | Reversibel |
| Soft-Delete Listing | 30 Tage behalten | Wiederherstellung möglich |
| Zahlungsausfall | past_due Status, Email | Grace Period geben |
| Subscription cancelled | Auf Free downgraden | Daten behalten |
| Webhook Failure | Idempotent + Retry | Stripe retries automatisch |
| Edit Conflict | Optimistic Lock | User informieren |

---

## 8. Monitoring dieser Edge Cases

### Alerts einrichten (Sentry/Logging)

```typescript
// Wichtige Events tracken
const criticalEvents = [
  'account.suspended',
  'account.downgraded',
  'subscription.payment_failed',
  'subscription.cancelled',
  'listing.limit_reached',
  'webhook.failed',
];

// Alert wenn zu viele in kurzer Zeit
if (criticalEvents.includes(event.type)) {
  Sentry.captureMessage(`Critical Event: ${event.type}`, {
    level: 'warning',
    extra: event.data,
  });
}
```
