import Stripe from 'stripe';

// Server-side Stripe client
// STRIPE_SECRET_KEY should be set in .env.local
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Stripe functionality will not work.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// Configuration
export const stripeConfig = {
  // Webhook secret for verifying webhook signatures
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Base URL for redirects
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com',
  
  // Success and cancel URLs for checkout
  successUrl: '/seller/abo?success=true',
  cancelUrl: '/seller/abo/upgrade?canceled=true',
  
  // Customer portal return URL
  portalReturnUrl: '/seller/abo',
};

// Check if Stripe is enabled
export const isStripeEnabled = (): boolean => {
  return stripe !== null;
};

// Plan Price IDs - now loaded from database
// Fallback to ENV variables if needed
export const stripePriceIds = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
  },
};

// Map our plan slugs to Stripe price IDs (fallback, prefer DB values)
export function getPriceId(planSlug: string, interval: 'monthly' | 'yearly'): string | null {
  const prices = stripePriceIds[planSlug as keyof typeof stripePriceIds];
  if (!prices) return null;
  return prices[interval] || null;
}

// Get price ID directly from plan data (preferred method)
export function getPriceIdFromPlan(
  plan: { stripe_price_id_monthly: string | null; stripe_price_id_yearly: string | null },
  interval: 'monthly' | 'yearly'
): string | null {
  if (interval === 'monthly') {
    return plan.stripe_price_id_monthly || null;
  }
  return plan.stripe_price_id_yearly || null;
}

// Map Stripe price ID back to our plan
export function getPlanFromPriceId(priceId: string): { slug: string; interval: 'monthly' | 'yearly' } | null {
  for (const [slug, prices] of Object.entries(stripePriceIds)) {
    if (prices.monthly === priceId) {
      return { slug, interval: 'monthly' };
    }
    if (prices.yearly === priceId) {
      return { slug, interval: 'yearly' };
    }
  }
  return null;
}
