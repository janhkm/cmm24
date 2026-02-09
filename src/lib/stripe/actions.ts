'use server';

import { createActionClient } from '@/lib/supabase/server';
import { stripe, stripeConfig, getPriceId, getPriceIdFromPlan, isStripeEnabled } from './client';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/actions/types';
import { sendSubscriptionCanceledEmail } from '@/lib/email/send';

// =============================================================================
// Types
// =============================================================================

interface CreateCheckoutSessionParams {
  planSlug: 'starter' | 'business';
  interval: 'monthly' | 'yearly';
}

interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string;
}

// =============================================================================
// Helper: Get current user and account
// =============================================================================

async function getCurrentUserAccount() {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('id, stripe_customer_id')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  if (!account) return null;
  
  // Get profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single();
  
  return {
    userId: user.id,
    userEmail: profile?.email || user.email || '',
    userName: profile?.full_name || '',
    accountId: account.id,
    stripeCustomerId: account.stripe_customer_id,
  };
}

// =============================================================================
// Helper: Get or create Stripe customer
// =============================================================================

async function getOrCreateStripeCustomer(
  accountId: string,
  email: string,
  name?: string
): Promise<string | null> {
  if (!stripe || !isStripeEnabled()) {
    console.warn('[Stripe] Stripe is not enabled');
    return null;
  }
  
  // Service-Role Client verwenden (bypass RLS)
  // Nach signUp ist auth.uid() = NULL, regulaere Clients scheitern an RLS
  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  
  // Check if customer already exists
  const { data: account } = await adminClient
    .from('accounts')
    .select('stripe_customer_id, company_name')
    .eq('id', accountId)
    .single();
  
  if (account?.stripe_customer_id) {
    return account.stripe_customer_id;
  }
  
  // Create new Stripe customer
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || account?.company_name || undefined,
      metadata: {
        account_id: accountId,
      },
    });
    
    // Save customer ID to database (via admin client, bypass RLS)
    await adminClient
      .from('accounts')
      .update({ stripe_customer_id: customer.id })
      .eq('id', accountId);
    
    // Customer erfolgreich erstellt und verknuepft
    return customer.id;
  } catch (error) {
    console.error('[Stripe] Failed to create customer:', error);
    return null;
  }
}

// =============================================================================
// Create Checkout Session
// =============================================================================

/**
 * Create a Stripe Checkout session for upgrading subscription
 * Liest die Stripe Price IDs aus der Datenbank (plans-Tabelle)
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<ActionResult<CreateCheckoutSessionResult>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Zahlungen sind derzeit nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Price ID aus der Datenbank lesen (bevorzugt) oder ENV-Variablen (Fallback)
  const supabase = await createActionClient();
  const { data: plan } = await supabase
    .from('plans')
    .select('stripe_price_id_monthly, stripe_price_id_yearly')
    .eq('slug', params.planSlug)
    .single();
  
  const dbPriceId = plan
    ? (params.interval === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly)
    : null;
  
  // DB-Wert bevorzugen, Fallback auf ENV
  const priceId = (dbPriceId && dbPriceId.startsWith('price_'))
    ? dbPriceId
    : getPriceId(params.planSlug, params.interval);
  
  if (!priceId) {
    return { success: false, error: 'Stripe ist für diesen Plan noch nicht konfiguriert. Bitte kontaktieren Sie den Support.' };
  }
  
  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    userAccount.accountId,
    userAccount.userEmail,
    userAccount.userName
  );
  
  if (!customerId) {
    return { success: false, error: 'Fehler beim Erstellen des Kundenkontos' };
  }
  
  try {
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${stripeConfig.baseUrl}${stripeConfig.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${stripeConfig.baseUrl}${stripeConfig.cancelUrl}`,
      subscription_data: {
        metadata: {
          account_id: userAccount.accountId,
          plan_slug: params.planSlug,
        },
      },
      metadata: {
        account_id: userAccount.accountId,
        plan_slug: params.planSlug,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'required',
      // Tax ID collection for businesses
      tax_id_collection: {
        enabled: true,
      },
      // Automatic tax calculation (if enabled in Stripe)
      // automatic_tax: { enabled: true },
      locale: 'de',
    });
    
    if (!session.url) {
      return { success: false, error: 'Checkout-Session konnte nicht erstellt werden' };
    }
    
    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    };
  } catch (error) {
    console.error('[Stripe] Checkout session error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Checkout-Session' 
    };
  }
}

// =============================================================================
// Create Checkout Session with Price ID from Database
// =============================================================================

interface CreateCheckoutWithPriceIdParams {
  priceId: string;
  planSlug: string;
}

/**
 * Create a Stripe Checkout session using a specific price ID (from database)
 * Requires authenticated user
 */
export async function createCheckoutSessionWithPriceId(
  params: CreateCheckoutWithPriceIdParams
): Promise<ActionResult<CreateCheckoutSessionResult>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Zahlungen sind derzeit nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  if (!params.priceId || !params.priceId.startsWith('price_')) {
    return { success: false, error: 'Ungültige Preis-ID. Bitte kontaktieren Sie den Support.' };
  }
  
  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    userAccount.accountId,
    userAccount.userEmail,
    userAccount.userName
  );
  
  if (!customerId) {
    return { success: false, error: 'Fehler beim Erstellen des Kundenkontos' };
  }
  
  try {
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: `${stripeConfig.baseUrl}${stripeConfig.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${stripeConfig.baseUrl}${stripeConfig.cancelUrl}`,
      subscription_data: {
        metadata: {
          account_id: userAccount.accountId,
          plan_slug: params.planSlug,
        },
      },
      metadata: {
        account_id: userAccount.accountId,
        plan_slug: params.planSlug,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      locale: 'de',
    });
    
    if (!session.url) {
      return { success: false, error: 'Checkout-Session konnte nicht erstellt werden' };
    }
    
    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    };
  } catch (error) {
    console.error('[Stripe] Checkout session error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Checkout-Session' 
    };
  }
}

// =============================================================================
// Create Checkout Session for New Registration (No Auth Required)
// =============================================================================

interface CreateCheckoutForNewUserParams {
  accountId: string;
  email: string;
  userName: string;
  priceId: string;
  planSlug: string;
}

/**
 * Create a Stripe Checkout session for a newly registered user
 * This function does NOT require authentication - used during registration flow
 */
export async function createCheckoutForNewUser(
  params: CreateCheckoutForNewUserParams
): Promise<ActionResult<CreateCheckoutSessionResult>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Zahlungen sind derzeit nicht verfügbar' };
  }
  
  if (!params.accountId) {
    return { success: false, error: 'Account-ID fehlt' };
  }
  
  if (!params.priceId || !params.priceId.startsWith('price_')) {
    return { success: false, error: 'Ungültige Preis-ID. Bitte kontaktieren Sie den Support.' };
  }
  
  // Get or create Stripe customer using provided data (not from session)
  const customerId = await getOrCreateStripeCustomer(
    params.accountId,
    params.email,
    params.userName
  );
  
  if (!customerId) {
    return { success: false, error: 'Fehler beim Erstellen des Kundenkontos' };
  }
  
  try {
    // Create checkout session with registration-specific success URL
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      // Special success URL for registration flow
      success_url: `${stripeConfig.baseUrl}/registrieren/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${stripeConfig.baseUrl}/registrieren?canceled=true`,
      subscription_data: {
        metadata: {
          account_id: params.accountId,
          plan_slug: params.planSlug,
        },
      },
      metadata: {
        account_id: params.accountId,
        plan_slug: params.planSlug,
        registration_flow: 'true',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      locale: 'de',
    });
    
    if (!session.url) {
      return { success: false, error: 'Checkout-Session konnte nicht erstellt werden' };
    }
    
    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    };
  } catch (error) {
    console.error('[Stripe] New user checkout error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Checkout-Session' 
    };
  }
}

// =============================================================================
// Create Customer Portal Session
// =============================================================================

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createCustomerPortalSession(): Promise<ActionResult<{ url: string }>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Kundenportal ist derzeit nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  if (!userAccount.stripeCustomerId) {
    return { success: false, error: 'Kein aktives Abonnement gefunden' };
  }
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: userAccount.stripeCustomerId,
      return_url: `${stripeConfig.baseUrl}${stripeConfig.portalReturnUrl}`,
    });
    
    return {
      success: true,
      data: { url: session.url },
    };
  } catch (error) {
    console.error('[Stripe] Portal session error:', error);
    return { 
      success: false, 
      error: 'Fehler beim Öffnen des Kundenportals' 
    };
  }
}

// =============================================================================
// Get Subscription Status
// =============================================================================

/**
 * Get current subscription status from Stripe
 */
export async function getStripeSubscriptionStatus(): Promise<ActionResult<{
  status: string;
  planSlug: string | null;
  interval: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe ist nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  if (!userAccount.stripeCustomerId) {
    return {
      success: true,
      data: {
        status: 'none',
        planSlug: null,
        interval: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    };
  }
  
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: userAccount.stripeCustomerId,
      status: 'all',
      limit: 1,
    });
    
    const subscription = subscriptions.data[0];
    
    if (!subscription) {
      return {
        success: true,
        data: {
          status: 'none',
          planSlug: null,
          interval: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      };
    }
    
    // Type assertion for subscription properties
    const sub = subscription as unknown as {
      status: string;
      metadata: { plan_slug?: string };
      items: { data: Array<{ price: { recurring?: { interval: string } } }> };
      current_period_end: number;
      cancel_at_period_end: boolean;
    };
    
    // Get plan info from metadata
    const planSlug = sub.metadata.plan_slug || null;
    const priceItem = sub.items.data[0];
    const interval = priceItem?.price.recurring?.interval || null;
    
    return {
      success: true,
      data: {
        status: sub.status,
        planSlug,
        interval,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    };
  } catch (error) {
    console.error('[Stripe] Get subscription error:', error);
    return { success: false, error: 'Fehler beim Laden des Abonnements' };
  }
}

// =============================================================================
// Cancel Subscription (at period end)
// =============================================================================

/**
 * Cancel subscription at end of billing period
 */
export async function cancelSubscription(): Promise<ActionResult<void>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe ist nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  if (!userAccount.stripeCustomerId) {
    return { success: false, error: 'Kein aktives Abonnement gefunden' };
  }
  
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: userAccount.stripeCustomerId,
      status: 'active',
      limit: 1,
    });
    
    const subscription = subscriptions.data[0];
    if (!subscription) {
      return { success: false, error: 'Kein aktives Abonnement gefunden' };
    }
    
    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });
    
    // Kuendigungs-Bestaetigungs-E-Mail senden
    const subAny = subscription as any;
    const periodEnd = subAny.current_period_end;
    const activeUntil = periodEnd
      ? new Date(periodEnd * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Ende der Abrechnungsperiode';
    
    // Plan-Name ermitteln
    const planSlug = subAny.metadata?.plan_slug;
    const planName = planSlug 
      ? planSlug.charAt(0).toUpperCase() + planSlug.slice(1)
      : 'Premium';
    
    sendSubscriptionCanceledEmail({
      to: userAccount.userEmail,
      userName: userAccount.userName?.split(' ')[0] || 'Nutzer',
      planName,
      activeUntil,
    }).catch(err => {
      console.error('[Stripe] Failed to send cancellation email:', err);
    });
    
    revalidatePath('/seller/abo');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[Stripe] Cancel subscription error:', error);
    return { success: false, error: 'Fehler beim Kündigen des Abonnements' };
  }
}

// =============================================================================
// Get Invoices
// =============================================================================

export interface StripeInvoice {
  id: string;
  number: string | null;
  date: Date;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  pdfUrl: string | null;
  hostedUrl: string | null;
  description: string | null;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Get all invoices for the current user
 */
export async function getInvoices(limit: number = 24): Promise<ActionResult<StripeInvoice[]>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe ist nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  if (!userAccount.stripeCustomerId) {
    // No Stripe customer = no invoices
    return { success: true, data: [] };
  }
  
  try {
    const invoices = await stripe.invoices.list({
      customer: userAccount.stripeCustomerId,
      limit,
    });
    
    const formattedInvoices: StripeInvoice[] = invoices.data.map((invoice) => {
      // Type assertion for invoice properties
      const inv = invoice as unknown as {
        id: string;
        number: string | null;
        created: number;
        amount_paid: number;
        currency: string;
        status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
        invoice_pdf: string | null;
        hosted_invoice_url: string | null;
        description: string | null;
        lines: { data: Array<{ description: string | null }> };
        period_start: number;
        period_end: number;
      };
      
      // Get description from first line item if available
      const lineDescription = inv.lines?.data?.[0]?.description || inv.description;
      
      return {
        id: inv.id,
        number: inv.number,
        date: new Date(inv.created * 1000),
        amount: inv.amount_paid,
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        pdfUrl: inv.invoice_pdf,
        hostedUrl: inv.hosted_invoice_url,
        description: lineDescription,
        periodStart: new Date(inv.period_start * 1000),
        periodEnd: new Date(inv.period_end * 1000),
      };
    });
    
    return { success: true, data: formattedInvoices };
  } catch (error) {
    console.error('[Stripe] Get invoices error:', error);
    return { success: false, error: 'Fehler beim Laden der Rechnungen' };
  }
}

// =============================================================================
// Resume Subscription (undo cancellation)
// =============================================================================

/**
 * Resume a subscription that was set to cancel at period end
 */
export async function resumeSubscription(): Promise<ActionResult<void>> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe ist nicht verfügbar' };
  }
  
  const userAccount = await getCurrentUserAccount();
  if (!userAccount) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  if (!userAccount.stripeCustomerId) {
    return { success: false, error: 'Kein Abonnement gefunden' };
  }
  
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: userAccount.stripeCustomerId,
      limit: 1,
    });
    
    const subscription = subscriptions.data[0];
    if (!subscription) {
      return { success: false, error: 'Kein Abonnement gefunden' };
    }
    
    // Resume subscription
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });
    
    revalidatePath('/seller/abo');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[Stripe] Resume subscription error:', error);
    return { success: false, error: 'Fehler beim Fortsetzen des Abonnements' };
  }
}
