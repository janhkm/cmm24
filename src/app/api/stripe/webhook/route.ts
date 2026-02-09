import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, stripeConfig, getPlanFromPriceId } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/logger';
import { sendUpgradeConfirmationEmail, sendPaymentFailedEmail } from '@/lib/email/send';

// Create a Supabase admin client for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// =============================================================================
// Webhook Handler
// =============================================================================

export async function POST(request: Request) {
  if (!stripe) {
    log('error', 'Stripe Webhook', 'Stripe is not configured');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    log('error', 'Stripe Webhook', 'Missing signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (err) {
    log('error', 'Stripe Webhook', 'Signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  log('info', 'Stripe Webhook', `Received event: ${event.type}`);

  try {
    // Idempotenz-Check: Event bereits verarbeitet?
    const { data: existingEvent } = await supabaseAdmin
      .from('stripe_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();
    
    if (existingEvent) {
      log('info', 'Stripe Webhook', `Event already processed: ${event.id}`);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        log('info', 'Stripe Webhook', `Unhandled event type: ${event.type}`);
    }

    // Event als verarbeitet markieren
    try {
      await supabaseAdmin
        .from('stripe_events')
        .insert({ stripe_event_id: event.id, type: event.type });
    } catch {
      /* Duplicate-Insert ignorieren */
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log('error', 'Stripe Webhook', 'Error processing event', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  log('info', 'Stripe Webhook', `Checkout completed: ${session.id}`);
  
  const accountId = session.metadata?.account_id;
  const planSlug = session.metadata?.plan_slug;
  const customerId = session.customer as string | null;
  
  if (!accountId || !planSlug) {
    log('error', 'Stripe Webhook', 'Missing metadata in checkout session');
    return;
  }
  
  // 1. stripe_customer_id auf dem Account speichern (falls noch nicht gesetzt)
  if (customerId) {
    await supabaseAdmin
      .from('accounts')
      .update({ stripe_customer_id: customerId })
      .eq('id', accountId)
      .is('stripe_customer_id', null);
    
    log('info', 'Stripe Webhook', `Linked customer ${customerId} to account ${accountId}`);
  }
  
  // 2. Plan in DB finden
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('slug', planSlug)
    .single();
  
  if (!plan) {
    log('error', 'Stripe Webhook', `Plan not found: ${planSlug}`);
    return;
  }
  
  // 3. Subscription sofort aktualisieren (nicht auf subscription.created warten)
  const stripeSubscriptionId = session.subscription as string | null;
  
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan_id: plan.id,
      status: 'active',
      stripe_subscription_id: stripeSubscriptionId,
      billing_interval: 'yearly', // Default, wird durch subscription.updated korrigiert
      updated_at: new Date().toISOString(),
    })
    .eq('account_id', accountId);
  
  if (subError) {
    log('error', 'Stripe Webhook', 'Subscription update error', subError);
  } else {
    log('info', 'Stripe Webhook', `Upgraded account ${accountId} to plan ${planSlug}`);
    
    // Kontakte aus bestehenden Anfragen nachtraeglich erstellen (bei Upgrade auf CRM-Plan)
    await checkAndBackfillContacts(accountId, plan.id);
    
    // Upgrade-Bestaetigungs-E-Mail senden
    const { data: accountWithOwner } = await supabaseAdmin
      .from('accounts')
      .select('owner_id, company_name, profiles!accounts_owner_id_fkey(email, full_name)')
      .eq('id', accountId)
      .single();
    
    if (accountWithOwner) {
      const profile = accountWithOwner.profiles as unknown as { email: string; full_name: string | null } | null;
      if (profile?.email) {
        const stripeSubscription = session.subscription as string | null;
        let interval = 'monatlich';
        if (stripeSubscription && stripe) {
          try {
            const sub = await stripe.subscriptions.retrieve(stripeSubscription);
            const priceInterval = sub.items.data[0]?.price?.recurring?.interval;
            interval = priceInterval === 'year' ? 'jaehrlich' : 'monatlich';
          } catch {
            /* Fallback auf monatlich */
          }
        }
        
        sendUpgradeConfirmationEmail({
          to: profile.email,
          userName: profile.full_name?.split(' ')[0] || 'Nutzer',
          planName: planSlug.charAt(0).toUpperCase() + planSlug.slice(1),
          interval,
        }).catch(err => {
          log('error', 'Stripe Webhook', 'Failed to send upgrade email', err);
        });
      }
    }
  }
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  log('info', 'Stripe Webhook', `Subscription updated: ${subscription.id} ${subscription.status}`);
  
  const customerId = subscription.customer as string;
  const accountId = subscription.metadata?.account_id;
  
  // Get account by customer ID if not in metadata
  let finalAccountId = accountId;
  if (!finalAccountId) {
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    
    if (!account) {
      log('error', 'Stripe Webhook', `Account not found for customer: ${customerId}`);
      return;
    }
    finalAccountId = account.id;
  }
  
  // Get price info - aus DB statt ENV lesen
  const priceItem = subscription.items.data[0];
  const priceId = priceItem?.price.id;
  
  // Plan direkt ueber Price-ID in DB suchen
  let plan: { id: string } | null = null;
  
  if (priceId && /^price_[a-zA-Z0-9]+$/.test(priceId)) {
    const { data: planByPrice } = await supabaseAdmin
      .from('plans')
      .select('id')
      .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
      .maybeSingle();
    
    if (planByPrice) {
      plan = planByPrice;
    }
  }
  
  // Fallback: Plan ueber Metadata-Slug
  if (!plan) {
    const planSlug = subscription.metadata?.plan_slug || 'free';
    const { data: planBySlug } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('slug', planSlug)
      .single();
    plan = planBySlug;
  }
  
  if (!plan) {
    log('error', 'Stripe Webhook', `Plan not found for price: ${priceId}`);
    return;
  }
  
  // stripe_customer_id auf Account sicherstellen
  if (customerId && finalAccountId) {
    await supabaseAdmin
      .from('accounts')
      .update({ stripe_customer_id: customerId })
      .eq('id', finalAccountId)
      .is('stripe_customer_id', null);
  }
  
  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    paused: 'paused',
  };
  
  const status = statusMap[subscription.status] || 'active';
  // Interval aus Stripe Price ableiten
  const stripeInterval = priceItem?.price?.recurring?.interval;
  const interval = stripeInterval === 'year' ? 'yearly' : 'monthly';
  
  // Update or create subscription in database
  const { data: existingSubscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('account_id', finalAccountId)
    .maybeSingle();
  
  // Stripe Subscription Properties auslesen
  // Debug: Alle relevanten Properties loggen
  log('info', 'Stripe Webhook', `Sub details - cancel_at_period_end: ${JSON.stringify((subscription as any).cancel_at_period_end)}, current_period_end: ${JSON.stringify((subscription as any).current_period_end)}, canceled_at: ${JSON.stringify((subscription as any).canceled_at)}`);
  
  // Direkt auf dem Objekt zugreifen (Stripe SDK v20+ hat diese als Properties)
  const rawSub = JSON.parse(JSON.stringify(subscription)); // Serialisieren um Getter/Proxy-Probleme zu umgehen
  const periodStart = rawSub.current_period_start;
  const periodEnd = rawSub.current_period_end;
  const cancelAtPeriodEnd = rawSub.cancel_at_period_end ?? false;
  const canceledAt = rawSub.canceled_at;
  
  log('info', 'Stripe Webhook', `Parsed: cancelAtPeriodEnd=${cancelAtPeriodEnd}, periodEnd=${periodEnd}, canceledAt=${canceledAt}`);
  
  const subscriptionData: Record<string, any> = {
    account_id: finalAccountId,
    plan_id: plan.id,
    status,
    billing_interval: interval,
    stripe_subscription_id: subscription.id,
    cancel_at_period_end: cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  };
  
  if (periodStart) {
    subscriptionData.current_period_start = new Date(periodStart * 1000).toISOString();
  }
  if (periodEnd) {
    subscriptionData.current_period_end = new Date(periodEnd * 1000).toISOString();
  }
  if (canceledAt) {
    subscriptionData.canceled_at = new Date(canceledAt * 1000).toISOString();
  } else {
    subscriptionData.canceled_at = null;
  }
  
  log('info', 'Stripe Webhook', `DB update data: ${JSON.stringify(subscriptionData)}`);

  if (existingSubscription) {
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id);
    
    if (updateError) {
      log('error', 'Stripe Webhook', `DB update failed for subscription ${existingSubscription.id}`, updateError);
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData);
    
    if (insertError) {
      log('error', 'Stripe Webhook', `DB insert failed for account ${finalAccountId}`, insertError);
    }
  }
  
  log('info', 'Stripe Webhook', `Updated subscription for account ${finalAccountId}: ${status}, cancel_at_period_end=${cancelAtPeriodEnd}`);
  
  // Kontakte aus bestehenden Anfragen nachtraeglich erstellen (bei Upgrade auf CRM-Plan)
  if (finalAccountId && (status === 'active' || status === 'trialing')) {
    await checkAndBackfillContacts(finalAccountId, plan.id);
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  log('info', 'Stripe Webhook', `Subscription deleted: ${subscription.id}`);
  
  const customerId = subscription.customer as string;
  
  // Find account by customer ID
  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (!account) {
    log('error', 'Stripe Webhook', 'Account not found for deleted subscription');
    return;
  }
  
  // Get free plan
  const { data: freePlan } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('slug', 'free')
    .single();
  
  if (!freePlan) {
    log('error', 'Stripe Webhook', 'Free plan not found');
    return;
  }
  
  // Downgrade to free plan
  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan_id: freePlan.id,
      status: 'active',
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: false,
      canceled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('account_id', account.id);
  
  // Team-Mitglieder deaktivieren (Free = 0 Team-Mitglieder)
  try {
    await supabaseAdmin
      .rpc('deactivate_excess_team_members', {
        p_account_id: account.id,
        p_max_members: 0,
      });
  } catch (err) {
    log('error', 'Stripe Webhook', 'Team deactivation error', err);
  }
  
  log('info', 'Stripe Webhook', `Downgraded account ${account.id} to free plan`);
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  log('info', 'Stripe Webhook', `Invoice paid: ${invoice.id}`);
  
  const inv = invoice as unknown as {
    id: string;
    customer: string;
    subscription: string | null;
  };
  
  const customerId = inv.customer;
  const subscriptionId = inv.subscription;
  
  // Find account
  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (!account) {
    log('error', 'Stripe Webhook', 'Account not found for invoice');
    return;
  }
  
  // Ensure subscription is active
  if (subscriptionId) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
  }
  
  // Invoice in Datenbank speichern
  const invFull = invoice as unknown as {
    id: string;
    number: string | null;
    amount_paid: number;
    currency: string;
    status: string;
    invoice_pdf: string | null;
    hosted_invoice_url: string | null;
    period_start: number;
    period_end: number;
    created: number;
  };
  
  await supabaseAdmin
    .from('invoices')
    .upsert({
      account_id: account.id,
      stripe_invoice_id: invFull.id,
      amount: invFull.amount_paid,
      currency: (invFull.currency || 'eur').toUpperCase(),
      status: 'paid' as const,
      pdf_url: invFull.invoice_pdf,
      period_start: new Date(invFull.period_start * 1000).toISOString(),
      period_end: new Date(invFull.period_end * 1000).toISOString(),
      paid_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_invoice_id',
    });
  
  log('info', 'Stripe Webhook', `Invoice paid for account ${account.id}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  log('info', 'Stripe Webhook', `Invoice payment failed: ${invoice.id}`);
  
  const inv = invoice as unknown as {
    id: string;
    customer: string;
    subscription: string | null;
  };
  
  const customerId = inv.customer;
  const subscriptionId = inv.subscription;
  
  // Find account
  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (!account) {
    log('error', 'Stripe Webhook', 'Account not found for failed invoice');
    return;
  }
  
  // Update subscription status
  if (subscriptionId) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
  }
  
  // Get owner user_id for notification
  const { data: accountWithOwner } = await supabaseAdmin
    .from('accounts')
    .select('owner_id')
    .eq('id', account.id)
    .single();
  
  if (accountWithOwner?.owner_id) {
    // Create payment failed notification
    await supabaseAdmin.rpc('create_notification', {
      p_user_id: accountWithOwner.owner_id,
      p_type: 'payment_failed',
      p_title: 'Zahlung fehlgeschlagen',
      p_message: 'Die letzte Zahlung konnte nicht verarbeitet werden. Bitte aktualisieren Sie Ihre Zahlungsmethode.',
      p_link: '/seller/abo',
      p_inquiry_id: null,
      p_listing_id: null,
      p_metadata: {},
    });
    
    // Zusaetzlich E-Mail senden
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', accountWithOwner.owner_id)
      .single();
    
    if (ownerProfile?.email) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('plans(name)')
        .eq('account_id', account.id)
        .maybeSingle();
      
      const planName = (subscription?.plans as unknown as { name: string } | null)?.name || 'Premium';
      
      sendPaymentFailedEmail({
        to: ownerProfile.email,
        userName: ownerProfile.full_name?.split(' ')[0] || 'Nutzer',
        planName,
      }).catch(err => {
        log('error', 'Stripe Webhook', 'Failed to send payment failed email', err);
      });
    }
  }
  
  log('info', 'Stripe Webhook', `Payment failed for account ${account.id}`);
}

// =============================================================================
// Kontakt-Backfill bei Upgrade
// =============================================================================

async function backfillContactsFromInquiries(accountId: string) {
  log('info', 'Stripe Webhook', `Backfilling contacts for account ${accountId}`);
  
  try {
    const { data: inquiries, error: fetchError } = await supabaseAdmin
      .from('inquiries')
      .select('id, contact_name, contact_email, contact_phone, contact_company')
      .eq('account_id', accountId)
      .is('contact_id', null)
      .is('deleted_at', null);
    
    if (fetchError) {
      log('error', 'Stripe Webhook', 'Backfill: Fehler beim Laden der Anfragen', fetchError);
      return;
    }
    
    if (!inquiries || inquiries.length === 0) {
      log('info', 'Stripe Webhook', 'Backfill: Keine unverknuepften Anfragen gefunden');
      return;
    }
    
    const byEmail = new Map<string, {
      contactName: string;
      contactEmail: string;
      contactPhone: string | null;
      contactCompany: string | null;
      inquiryIds: string[];
    }>();
    
    for (const inq of inquiries) {
      const email = inq.contact_email?.toLowerCase()?.trim();
      if (!email) continue;
      
      const existing = byEmail.get(email);
      if (existing) {
        existing.inquiryIds.push(inq.id);
      } else {
        byEmail.set(email, {
          contactName: inq.contact_name,
          contactEmail: email,
          contactPhone: inq.contact_phone || null,
          contactCompany: inq.contact_company || null,
          inquiryIds: [inq.id],
        });
      }
    }
    
    let created = 0;
    let linked = 0;
    
    for (const [email, group] of byEmail) {
      const { data: existingContact } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .eq('account_id', accountId)
        .eq('email', email)
        .is('deleted_at', null)
        .maybeSingle();
      
      let contactId: string;
      
      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const nameParts = group.contactName.trim().split(' ');
        const firstName = nameParts[0] || null;
        const lastName = nameParts.slice(1).join(' ') || null;
        
        const { data: newContact, error: contactError } = await supabaseAdmin
          .from('contacts')
          .insert({
            account_id: accountId,
            email,
            first_name: firstName,
            last_name: lastName,
            company_name: group.contactCompany,
            phone: group.contactPhone,
            source: 'inquiry',
            lead_status: 'new',
          })
          .select('id')
          .single();
        
        if (contactError || !newContact) {
          log('error', 'Stripe Webhook', `Backfill: Fehler beim Erstellen des Kontakts fuer ${email}`, contactError);
          continue;
        }
        
        contactId = newContact.id;
        created++;
      }
      
      const { error: linkError } = await supabaseAdmin
        .from('inquiries')
        .update({ contact_id: contactId })
        .eq('account_id', accountId)
        .in('id', group.inquiryIds);
      
      if (linkError) {
        log('error', 'Stripe Webhook', `Backfill: Fehler beim Verknuepfen der Anfragen fuer ${email}`, linkError);
      } else {
        linked += group.inquiryIds.length;
      }
      
      const activities = group.inquiryIds.map((inquiryId) => ({
        contact_id: contactId,
        account_id: accountId,
        activity_type: 'inquiry' as const,
        title: 'Anfrage (rueckwirkend verknuepft)',
        inquiry_id: inquiryId,
        metadata: { backfilled: true },
      }));
      
      const { error: activityError } = await supabaseAdmin
        .from('contact_activities')
        .insert(activities);
      
      if (activityError) {
        log('error', 'Stripe Webhook', `Backfill: Aktivitaeten-Fehler fuer ${email}`, activityError);
      }
    }
    
    log('info', 'Stripe Webhook', `Backfill abgeschlossen: ${created} Kontakte erstellt, ${linked} Anfragen verknuepft`);
  } catch (err) {
    log('error', 'Stripe Webhook', 'Backfill: Unerwarteter Fehler', err);
  }
}

async function checkAndBackfillContacts(accountId: string, planId: string) {
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('feature_flags')
    .eq('id', planId)
    .single();
  
  const featureFlags = plan?.feature_flags as { crm_access?: boolean } | null;
  
  if (featureFlags?.crm_access) {
    await backfillContactsFromInquiries(accountId);
  }
}
