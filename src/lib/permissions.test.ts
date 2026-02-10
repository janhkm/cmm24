import { describe, it, expect } from 'vitest';
import {
  getPlanTier,
  hasTier,
  getTierName,
  hasFeature,
  canCreateListing,
  getListingLimit,
  isAdmin,
  isSuperAdmin,
  isAccountSuspended,
  canAccessStatistics,
  canAccessLeadPipeline,
  canAccessTeamManagement,
  canAccessApi,
  getRequiredTierForFeature,
  type UserContext,
  type PlanTier,
  type FeatureFlag,
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

const freePlan: UserContext['plan'] = {
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
};

const starterPlan: UserContext['plan'] = {
  ...freePlan!,
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
};

const businessPlan: UserContext['plan'] = {
  ...freePlan!,
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
};

const userProfile: UserContext['profile'] = {
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
};

const adminProfile: UserContext['profile'] = { ...userProfile!, role: 'admin' };
const superAdminProfile: UserContext['profile'] = { ...userProfile!, role: 'super_admin' };

const activeAccount: UserContext['account'] = {
  id: 'account-1',
  owner_id: 'user-1',
  company_name: 'Test GmbH',
  slug: 'test-gmbh',
  status: 'active',
} as UserContext['account'];

const suspendedAccount: UserContext['account'] = {
  ...activeAccount!,
  status: 'suspended',
} as UserContext['account'];

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

// ============================================
// hasTier – Aktuell gibt immer true zurueck (alles free)
// SPAETER: Wenn Paid-Plaene aktiv, diese Tests reaktivieren:
//   - free hat NICHT starter-Tier → expect false
//   - starter hat NICHT business-Tier → expect false
// ============================================

describe('hasTier', () => {
  it('free hat free-Tier', () => {
    expect(hasTier(createCtx({ plan: freePlan }), 'free')).toBe(true);
  });

  it('alle Tiers geben true zurueck (alles free Modus)', () => {
    // Aktuell ist alles freigeschaltet – hasTier() gibt immer true zurueck
    expect(hasTier(createCtx({ plan: freePlan }), 'starter')).toBe(true);
    expect(hasTier(createCtx({ plan: freePlan }), 'business')).toBe(true);
    expect(hasTier(createCtx({ plan: starterPlan }), 'business')).toBe(true);
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

// ============================================
// hasFeature – Aktuell gibt immer true zurueck (alles free)
// SPAETER: Wenn Paid-Plaene aktiv, alte Expectations reaktivieren
// ============================================

describe('hasFeature', () => {
  it('alle Features sind freigeschaltet (alles free Modus)', () => {
    const ctx = createCtx({ plan: freePlan });
    // Aktuell: hasFeature() gibt immer true zurueck
    expect(hasFeature(ctx, 'statistics')).toBe(true);
    expect(hasFeature(ctx, 'lead_pipeline')).toBe(true);
    expect(hasFeature(ctx, 'api_access')).toBe(true);
  });

  it('starter hat alle Features (alles free Modus)', () => {
    const ctx = createCtx({ plan: starterPlan });
    expect(hasFeature(ctx, 'statistics')).toBe(true);
    expect(hasFeature(ctx, 'email_composer')).toBe(true);
    expect(hasFeature(ctx, 'lead_pipeline')).toBe(true);
    expect(hasFeature(ctx, 'api_access')).toBe(true);
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

// ============================================
// canCreateListing – Kein Limit mehr, nur suspended blockiert
// SPAETER: Wenn Paid-Plaene aktiv, Limit-Tests reaktivieren
// ============================================

describe('canCreateListing', () => {
  it('erlaubt Erstellung immer (alles free Modus)', () => {
    const ctx = createCtx({ plan: starterPlan, account: activeAccount });
    expect(canCreateListing(ctx, 0)).toBe(true);
    expect(canCreateListing(ctx, 4)).toBe(true);
    // Kein Limit mehr – auch bei hoher Anzahl erlaubt
    expect(canCreateListing(ctx, 5)).toBe(true);
    expect(canCreateListing(ctx, 100)).toBe(true);
  });

  it('erlaubt auch fuer Free-Plan ohne Limit', () => {
    const ctx = createCtx({ plan: freePlan, account: activeAccount });
    expect(canCreateListing(ctx, 10)).toBe(true);
  });

  it('blockiert bei gesperrtem Account', () => {
    const ctx = createCtx({ plan: starterPlan, account: suspendedAccount });
    expect(canCreateListing(ctx, 0)).toBe(false);
  });
});

// ============================================
// getListingLimit – Gibt -1 zurueck (unbegrenzt)
// SPAETER: Wenn Paid-Plaene aktiv, Limit-Werte reaktivieren
// ============================================

describe('getListingLimit', () => {
  it('gibt -1 zurueck fuer alle Plaene (unbegrenzt, alles free Modus)', () => {
    expect(getListingLimit(createCtx({ plan: freePlan }))).toBe(-1);
    expect(getListingLimit(createCtx({ plan: starterPlan }))).toBe(-1);
    expect(getListingLimit(createCtx({ plan: businessPlan }))).toBe(-1);
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

// ============================================
// Feature Access – Aktuell alle true (alles free)
// SPAETER: Wenn Paid-Plaene aktiv, Tier-basierte Tests reaktivieren
// ============================================

describe('Feature Access (alles free Modus)', () => {
  it('Statistiken fuer alle freigeschaltet', () => {
    expect(canAccessStatistics(createCtx({ plan: freePlan }))).toBe(true);
    expect(canAccessStatistics(createCtx({ plan: starterPlan }))).toBe(true);
    expect(canAccessStatistics(createCtx({ plan: businessPlan }))).toBe(true);
  });

  it('Lead Pipeline fuer alle freigeschaltet', () => {
    expect(canAccessLeadPipeline(createCtx({ plan: freePlan }))).toBe(true);
    expect(canAccessLeadPipeline(createCtx({ plan: starterPlan }))).toBe(true);
    expect(canAccessLeadPipeline(createCtx({ plan: businessPlan }))).toBe(true);
  });

  it('Team Management fuer alle freigeschaltet', () => {
    expect(canAccessTeamManagement(createCtx({ plan: freePlan }))).toBe(true);
    expect(canAccessTeamManagement(createCtx({ plan: starterPlan }))).toBe(true);
    expect(canAccessTeamManagement(createCtx({ plan: businessPlan }))).toBe(true);
  });

  it('API fuer alle freigeschaltet', () => {
    expect(canAccessApi(createCtx({ plan: freePlan }))).toBe(true);
    expect(canAccessApi(createCtx({ plan: starterPlan }))).toBe(true);
    expect(canAccessApi(createCtx({ plan: businessPlan }))).toBe(true);
  });
});

// ============================================
// getRequiredTierForFeature – bleibt unveraendert,
// definiert die zukuenftige Tier-Zuordnung
// ============================================

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
