/**
 * CMM24 Permissions & Access Control
 * Zentrale Permission-Logik fuer die gesamte Anwendung.
 */

import type { Tables } from '@/types/supabase';

// ============================================
// Types
// ============================================

type Profile = Tables<'profiles'>;
type Account = Tables<'accounts'>;
type Subscription = Tables<'subscriptions'>;
type Plan = Tables<'plans'>;

export interface UserContext {
  profile: Profile | null;
  account: Account | null;
  subscription: Subscription | null;
  plan: Plan | null;
}

export type PlanTier = 'free' | 'starter' | 'business';

export type FeatureFlag =
  | 'statistics'
  | 'email_composer'
  | 'lead_pipeline'
  | 'auto_reply'
  | 'team_management'
  | 'api_access';

// ============================================
// Auth Checks
// ============================================

export function isAuthenticated(ctx: UserContext): boolean {
  return ctx.profile !== null;
}

export function isAccountSuspended(ctx: UserContext): boolean {
  return ctx.account?.status === 'suspended';
}

// ============================================
// Role Checks
// ============================================

export function isAdmin(ctx: UserContext): boolean {
  return ctx.profile?.role === 'admin' || ctx.profile?.role === 'super_admin';
}

export function isSuperAdmin(ctx: UserContext): boolean {
  return ctx.profile?.role === 'super_admin';
}

// ============================================
// Tier Checks
// ============================================

const TIER_ORDER: PlanTier[] = ['free', 'starter', 'business'];

export function getPlanTier(ctx: UserContext): PlanTier {
  if (!ctx.plan) return 'free';
  const slug = ctx.plan.slug;
  if (slug === 'starter') return 'starter';
  if (slug === 'business') return 'business';
  return 'free';
}

export function hasTier(ctx: UserContext, minTier: PlanTier): boolean {
  // ALLES IST JETZT FREE - immer true
  return true;
  
  // AUSKOMMENTIERT: Alte Tier-basierte Logik
  // const userTier = getPlanTier(ctx);
  // return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(minTier);
}

export function getTierName(tier: PlanTier): string {
  const names: Record<PlanTier, string> = {
    free: 'Free',
    starter: 'Starter',
    business: 'Business',
  };
  return names[tier];
}

// ============================================
// Feature Flag Checks
// HINWEIS: Aktuell ist alles Free - alle Features freigeschaltet.
// ============================================

export function hasFeature(ctx: UserContext, feature: FeatureFlag): boolean {
  // ALLES IST JETZT FREE
  return true;
  
  // AUSKOMMENTIERT: Alte Plan-basierte Logik
  // if (!ctx.plan?.feature_flags) return false;
  // const flags = ctx.plan.feature_flags as Record<string, boolean | number | string>;
  // return flags[feature] === true;
}

export function getFeatureLimit(ctx: UserContext, feature: string): number {
  if (!ctx.plan?.feature_flags) {
    if (feature === 'max_listings') return 1;
    if (feature === 'max_images_per_listing') return 5;
    return 0;
  }
  const flags = ctx.plan.feature_flags as Record<string, number>;
  return flags[feature] ?? 0;
}

// ============================================
// Spezifische Permission Checks
// HINWEIS: Aktuell ist alles Free - alle Checks geben true zurueck.
// ============================================

// Listings - kein Limit mehr (Free = unbegrenzt)
export function canCreateListing(ctx: UserContext, currentCount: number): boolean {
  if (isAccountSuspended(ctx)) return false;
  // ALLES IST JETZT FREE - kein Listing-Limit
  return true;
  
  // AUSKOMMENTIERT: Alte Limit-Logik
  // const limit = getFeatureLimit(ctx, 'max_listings');
  // return currentCount < limit;
}

export function getListingLimit(ctx: UserContext): number {
  // ALLES IST JETZT FREE - unbegrenzte Listings
  return -1;
  
  // AUSKOMMENTIERT: Alte Limit-Logik
  // return getFeatureLimit(ctx, 'max_listings');
}

export function getImageLimit(ctx: UserContext): number {
  // ALLES IST JETZT FREE - unbegrenzte Bilder
  return 999;
  
  // AUSKOMMENTIERT: Alte Limit-Logik
  // return getFeatureLimit(ctx, 'max_images_per_listing');
}

// Statistiken - AUSKOMMENTIERT (wird spaeter Pay-Feature)
export function canAccessStatistics(ctx: UserContext): boolean {
  return true;
}

// Email Composer
export function canAccessEmailComposer(ctx: UserContext): boolean {
  return true;
}

// Lead Pipeline
export function canAccessLeadPipeline(ctx: UserContext): boolean {
  return true;
}

// Auto Reply
export function canAccessAutoReply(ctx: UserContext): boolean {
  return true;
}

// Team Management - jetzt Free
export function canAccessTeamManagement(ctx: UserContext): boolean {
  return true;
}

// API Access - AUSKOMMENTIERT (wird spaeter Pay-Feature)
export function canAccessApi(ctx: UserContext): boolean {
  return true;
}

// Featured Listings
export function getFeaturedLimit(ctx: UserContext): number {
  // ALLES IST JETZT FREE
  return 999;
}

// Team Members
export function getTeamMemberLimit(ctx: UserContext): number {
  // ALLES IST JETZT FREE
  return 999;
}

// Admin
export function canAccessAdminPanel(ctx: UserContext): boolean {
  return isAdmin(ctx);
}

export function canAccessStammdaten(ctx: UserContext): boolean {
  return isSuperAdmin(ctx);
}

// ============================================
// Required Tier fuer Feature
// ============================================

export function getRequiredTierForFeature(feature: FeatureFlag): PlanTier {
  const requirements: Record<FeatureFlag, PlanTier> = {
    statistics: 'starter',
    email_composer: 'starter',
    lead_pipeline: 'business',
    auto_reply: 'business',
    team_management: 'business',
    api_access: 'business',
  };
  return requirements[feature];
}
