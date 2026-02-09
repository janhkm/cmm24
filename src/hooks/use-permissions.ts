'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import * as permissions from '@/lib/permissions';
import type { FeatureFlag, PlanTier } from '@/lib/permissions';

export function usePermissions() {
  const { profile, account, subscription, plan, isLoading } = useAuth();
  
  const ctx = useMemo(() => ({
    profile,
    account,
    subscription,
    plan,
  }), [profile, account, subscription, plan]);
  
  return {
    isLoading,
    
    // Auth
    isAuthenticated: permissions.isAuthenticated(ctx),
    isAccountSuspended: permissions.isAccountSuspended(ctx),
    
    // Roles
    isAdmin: permissions.isAdmin(ctx),
    isSuperAdmin: permissions.isSuperAdmin(ctx),
    
    // Tier
    tier: permissions.getPlanTier(ctx),
    tierName: permissions.getTierName(permissions.getPlanTier(ctx)),
    hasTier: (minTier: PlanTier) => permissions.hasTier(ctx, minTier),
    
    // Limits
    listingLimit: permissions.getListingLimit(ctx),
    imageLimit: permissions.getImageLimit(ctx),
    featuredLimit: permissions.getFeaturedLimit(ctx),
    teamMemberLimit: permissions.getTeamMemberLimit(ctx),
    
    // Feature Access
    canAccessStatistics: permissions.canAccessStatistics(ctx),
    canAccessEmailComposer: permissions.canAccessEmailComposer(ctx),
    canAccessLeadPipeline: permissions.canAccessLeadPipeline(ctx),
    canAccessAutoReply: permissions.canAccessAutoReply(ctx),
    canAccessTeamManagement: permissions.canAccessTeamManagement(ctx),
    canAccessApi: permissions.canAccessApi(ctx),
    
    // Listing creation (needs current count)
    canCreateListing: (currentCount: number) =>
      permissions.canCreateListing(ctx, currentCount),
    
    // Admin
    canAccessAdminPanel: permissions.canAccessAdminPanel(ctx),
    canAccessStammdaten: permissions.canAccessStammdaten(ctx),
    
    // Helper
    getRequiredTier: (feature: FeatureFlag) =>
      permissions.getRequiredTierForFeature(feature),
    getRequiredTierName: (feature: FeatureFlag) =>
      permissions.getTierName(permissions.getRequiredTierForFeature(feature)),
  };
}

export type { PlanTier, FeatureFlag };
