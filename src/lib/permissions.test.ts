import { describe, it, expect } from 'vitest';
import {
  getPlanTier,
  hasTier,
  getTierName,
  hasFeature,
  canCreateListing,
  getListingLimit,
  getFeatureLimit,
  isAdmin,
  isSuperAdmin,
  isAccountSuspended,
  canAccessStatistics,
  canAccessLeadPipeline,
  canAccessTeamManagement,
  canAccessApi,
  getRequiredTierForFeature,
  type UserContext,
} from './permissions';

// ============================================
// Test Fixtures
// ============================================

const createCtx = (overrides: Partial<UserContext> = {}): UserContext => ({
  profile: null,
  account: null,
  subscription: null,
  plan: null,
  ...overrides,
});

const freePlan = {
  id: 'plan-free',
  name: 'Free',
  slug: 'free',
  listing_limit: 1,
  price_monthly: 0,
  price_yearly: 0,
  launch_price_monthly: 0,
  launch_price_yearly: 0,
  stripe_price_id_monthly: null,
  stripe_price_id_yearly: null,
  feature_flags: {
    max_listings: 1,
    max_images_per_listing: 5,
    max_team_members: 0,
    featured_per_month: 0,
    statistics: false,
    email_composer: false,
    lead_pipeline: false,
    auto_reply: false,
    team_management: false,
    api_access: false,
    support_level: 'email',
  },
  features: ['1 Inserat'],
  description: null,
  sort_order: 1,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any;

const starterPlan = {
  ...freePlan,
  id: 'plan-starter',
  name: 'Starter',
  slug: 'starter',
  listing_limit: 5,
  feature_flags: {
    max_listings: 5,
    max_images_per_listing: 10,
    max_team_members: 1,
    featured_per_month: 1,
    statistics: true,
    email_composer: true,
    lead_pipeline: false,
    auto_reply: false,
    team_management: false,
    api_access: false,
    support_level: '24h',
  },
} as any;

const businessPlan = {
  ...freePlan,
  id: 'plan-business',
  name: 'Business',
  slug: 'business',
  listing_limit: 25,
  feature_flags: {
    max_listings: 25,
    max_images_per_listing: 20,
    max_team_members: 5,
    featured_per_month: 5,
    statistics: true,
    email_composer: true,
    lead_pipeline: true,
    auto_reply: true,
    team_management: true,
    api_access: true,
    support_level: '4h',
  },
} as any;

const userProfile = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  phone: null,
  avatar_url: null,
  role: 'user',
  accepted_terms_at: new Date().toISOString(),
  accepted_marketing: false,
  onboarding_intent: null,
  onboarding_machine_count: null,
  email_verified_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any;

const adminProfile = { ...userProfile, role: 'admin' } as any;
const superAdminProfile = { ...userProfile, role: 'super_admin' } as any;

const activeAccount = {
  id: 'account-1',
  owner_id: 'user-1',
  company_name: 'Test GmbH',
  slug: 'test-gmbh',
  status: 'active',
} as any;

const suspendedAccount = { ...activeAccount, status: 'suspended' } as any;

// ============================================
// Tests
// ============================================

describe('getPlanTier', () => {
  it('gibt free zurueck wenn kein Plan', () => {
    expect(getPlanTier(createCtx())).toBe('free');
  });

  it('gibt free zurueck fuer Free-Plan', () => {
    expect(getPlanTier(createCtx({ plan: freePlan }))).toBe('free');
  });

  it('gibt starter zurueck fuer Starter-Plan', () => {
    expect(getPlanTier(createCtx({ plan: starterPlan }))).toBe('starter');
  });

  it('gibt business zurueck fuer Business-Plan', () => {
    expect(getPlanTier(createCtx({ plan: businessPlan }))).toBe('business');
  });
});

describe('hasTier', () => {
  it('free hat free-Tier', () => {
    expect(hasTier(createCtx({ plan: freePlan }), 'free')).toBe(true);
  });

  it('free hat NICHT starter-Tier', () => {
    expect(hasTier(createCtx({ plan: freePlan }), 'starter')).toBe(false);
  });

  it('starter hat starter- und free-Tier', () => {
    const ctx = createCtx({ plan: starterPlan });
    expect(hasTier(ctx, 'free')).toBe(true);
    expect(hasTier(ctx, 'starter')).toBe(true);
    expect(hasTier(ctx, 'business')).toBe(false);
  });

  it('business hat alle Tiers', () => {
    const ctx = createCtx({ plan: businessPlan });
    expect(hasTier(ctx, 'free')).toBe(true);
    expect(hasTier(ctx, 'starter')).toBe(true);
    expect(hasTier(ctx, 'business')).toBe(true);
  });
});

describe('getTierName', () => {
  it('gibt korrekte Namen zurueck', () => {
    expect(getTierName('free')).toBe('Free');
    expect(getTierName('starter')).toBe('Starter');
    expect(getTierName('business')).toBe('Business');
  });
});

describe('hasFeature', () => {
  it('free hat keine Features', () => {
    const ctx = createCtx({ plan: freePlan });
    expect(hasFeature(ctx, 'statistics')).toBe(false);
    expect(hasFeature(ctx, 'lead_pipeline')).toBe(false);
    expect(hasFeature(ctx, 'api_access')).toBe(false);
  });

  it('starter hat statistics und email_composer', () => {
    const ctx = createCtx({ plan: starterPlan });
    expect(hasFeature(ctx, 'statistics')).toBe(true);
    expect(hasFeature(ctx, 'email_composer')).toBe(true);
    expect(hasFeature(ctx, 'lead_pipeline')).toBe(false);
    expect(hasFeature(ctx, 'api_access')).toBe(false);
  });

  it('business hat alle Features', () => {
    const ctx = createCtx({ plan: businessPlan });
    expect(hasFeature(ctx, 'statistics')).toBe(true);
    expect(hasFeature(ctx, 'email_composer')).toBe(true);
    expect(hasFeature(ctx, 'lead_pipeline')).toBe(true);
    expect(hasFeature(ctx, 'auto_reply')).toBe(true);
    expect(hasFeature(ctx, 'team_management')).toBe(true);
    expect(hasFeature(ctx, 'api_access')).toBe(true);
  });
});

describe('canCreateListing', () => {
  it('erlaubt Erstellung unter Limit', () => {
    const ctx = createCtx({ plan: starterPlan, account: activeAccount });
    expect(canCreateListing(ctx, 0)).toBe(true);
    expect(canCreateListing(ctx, 4)).toBe(true);
  });

  it('blockiert bei erreichtem Limit', () => {
    const ctx = createCtx({ plan: starterPlan, account: activeAccount });
    expect(canCreateListing(ctx, 5)).toBe(false);
  });

  it('blockiert bei ueberschrittenem Limit (Downgrade)', () => {
    const ctx = createCtx({ plan: freePlan, account: activeAccount });
    expect(canCreateListing(ctx, 10)).toBe(false);
  });

  it('blockiert bei gesperrtem Account', () => {
    const ctx = createCtx({ plan: starterPlan, account: suspendedAccount });
    expect(canCreateListing(ctx, 0)).toBe(false);
  });
});

describe('getListingLimit', () => {
  it('gibt 1 fuer Free-Plan', () => {
    expect(getListingLimit(createCtx({ plan: freePlan }))).toBe(1);
  });

  it('gibt 5 fuer Starter-Plan', () => {
    expect(getListingLimit(createCtx({ plan: starterPlan }))).toBe(5);
  });

  it('gibt 25 fuer Business-Plan', () => {
    expect(getListingLimit(createCtx({ plan: businessPlan }))).toBe(25);
  });
});

describe('Role Checks', () => {
  it('erkennt Admin', () => {
    expect(isAdmin(createCtx({ profile: adminProfile }))).toBe(true);
    expect(isAdmin(createCtx({ profile: superAdminProfile }))).toBe(true);
    expect(isAdmin(createCtx({ profile: userProfile }))).toBe(false);
  });

  it('erkennt Super-Admin', () => {
    expect(isSuperAdmin(createCtx({ profile: superAdminProfile }))).toBe(true);
    expect(isSuperAdmin(createCtx({ profile: adminProfile }))).toBe(false);
    expect(isSuperAdmin(createCtx({ profile: userProfile }))).toBe(false);
  });
});

describe('Account Status', () => {
  it('erkennt gesperrten Account', () => {
    expect(isAccountSuspended(createCtx({ account: suspendedAccount }))).toBe(true);
    expect(isAccountSuspended(createCtx({ account: activeAccount }))).toBe(false);
    expect(isAccountSuspended(createCtx())).toBe(false);
  });
});

describe('Feature Access by Tier', () => {
  it('Statistiken ab Starter', () => {
    expect(canAccessStatistics(createCtx({ plan: freePlan }))).toBe(false);
    expect(canAccessStatistics(createCtx({ plan: starterPlan }))).toBe(true);
    expect(canAccessStatistics(createCtx({ plan: businessPlan }))).toBe(true);
  });

  it('Lead Pipeline nur Business', () => {
    expect(canAccessLeadPipeline(createCtx({ plan: freePlan }))).toBe(false);
    expect(canAccessLeadPipeline(createCtx({ plan: starterPlan }))).toBe(false);
    expect(canAccessLeadPipeline(createCtx({ plan: businessPlan }))).toBe(true);
  });

  it('Team Management nur Business', () => {
    expect(canAccessTeamManagement(createCtx({ plan: freePlan }))).toBe(false);
    expect(canAccessTeamManagement(createCtx({ plan: starterPlan }))).toBe(false);
    expect(canAccessTeamManagement(createCtx({ plan: businessPlan }))).toBe(true);
  });

  it('API nur Business', () => {
    expect(canAccessApi(createCtx({ plan: freePlan }))).toBe(false);
    expect(canAccessApi(createCtx({ plan: starterPlan }))).toBe(false);
    expect(canAccessApi(createCtx({ plan: businessPlan }))).toBe(true);
  });
});

describe('getRequiredTierForFeature', () => {
  it('gibt korrekten Tier fuer jedes Feature', () => {
    expect(getRequiredTierForFeature('statistics')).toBe('starter');
    expect(getRequiredTierForFeature('email_composer')).toBe('starter');
    expect(getRequiredTierForFeature('lead_pipeline')).toBe('business');
    expect(getRequiredTierForFeature('auto_reply')).toBe('business');
    expect(getRequiredTierForFeature('team_management')).toBe('business');
    expect(getRequiredTierForFeature('api_access')).toBe('business');
  });
});
