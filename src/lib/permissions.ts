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
  const userTier = getPlanTier(ctx);
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(minTier);
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
// ============================================

export function hasFeature(ctx: UserContext, feature: FeatureFlag): boolean {
  if (!ctx.plan?.feature_flags) return false;
  const flags = ctx.plan.feature_flags as Record<string, boolean | number | string>;
  return flags[feature] === true;
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
// ============================================

// Listings
export function canCreateListing(ctx: UserContext, currentCount: number): boolean {
  if (isAccountSuspended(ctx)) return false;
  const limit = getFeatureLimit(ctx, 'max_listings');
  return currentCount < limit;
}

export function getListingLimit(ctx: UserContext): number {
  return getFeatureLimit(ctx, 'max_listings');
}

export function getImageLimit(ctx: UserContext): number {
  return getFeatureLimit(ctx, 'max_images_per_listing');
}

// Statistiken (Starter+)
export function canAccessStatistics(ctx: UserContext): boolean {
  return hasTier(ctx, 'starter');
}

// Email Composer (Starter+)
export function canAccessEmailComposer(ctx: UserContext): boolean {
  return hasTier(ctx, 'starter');
}

// Lead Pipeline (Business only)
export function canAccessLeadPipeline(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// Auto Reply (Business only)
export function canAccessAutoReply(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// Team Management (Business only)
export function canAccessTeamManagement(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// API Access (Business only)
export function canAccessApi(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// Featured Listings
export function getFeaturedLimit(ctx: UserContext): number {
  return getFeatureLimit(ctx, 'featured_per_month');
}

// Team Members
export function getTeamMemberLimit(ctx: UserContext): number {
  return getFeatureLimit(ctx, 'max_team_members');
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
