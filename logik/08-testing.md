# Testing-Strategie

## Übersicht

| Test-Typ | Tool | Abdeckung | Wann ausführen |
|----------|------|-----------|----------------|
| **Unit Tests** | Vitest | Utility-Funktionen, Permissions, Hooks | Pre-commit, CI |
| **Integration Tests** | Vitest + Supabase | Server Actions, API Routes | CI |
| **E2E Tests** | Playwright | Critical User Journeys | CI, Pre-Deploy |
| **Component Tests** | Vitest + Testing Library | UI-Komponenten | CI |

---

## 1. Setup

### Installation

```bash
# Testing Framework
npm install -D vitest @vitejs/plugin-react

# React Testing
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E Testing
npm install -D @playwright/test

# Mocking
npm install -D msw
```

### Vitest Konfiguration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'src/test',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client (für Unit Tests)
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  }),
}));
```

### Scripts in package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 2. Unit Tests

### Was testen?

| Bereich | Priorität | Beispiele |
|---------|-----------|-----------|
| Permissions | Hoch | `hasFeature()`, `canCreateListing()`, `getPlanTier()` |
| Utilities | Hoch | `formatPrice()`, `generateSlug()`, `validateEmail()` |
| Zod Schemas | Mittel | Form Validations |
| Hooks (isoliert) | Mittel | `usePermissions()` Logic |

### Beispiel: Permission-Funktionen testen

```typescript
// src/lib/permissions.test.ts
import { describe, it, expect } from 'vitest';
import {
  getPlanTier,
  hasFeature,
  canCreateListing,
  getRequiredTierForFeature,
} from './permissions';

describe('permissions', () => {
  describe('getPlanTier', () => {
    it('returns 1 for free plan', () => {
      expect(getPlanTier('free')).toBe(1);
    });

    it('returns 2 for starter plan', () => {
      expect(getPlanTier('starter')).toBe(2);
    });

    it('returns 3 for business plan', () => {
      expect(getPlanTier('business')).toBe(3);
    });

    it('returns 1 for unknown plan', () => {
      expect(getPlanTier('unknown')).toBe(1);
    });
  });

  describe('hasFeature', () => {
    const freePlan = {
      slug: 'free',
      feature_flags: {
        statistics: false,
        email_composer: false,
        lead_pipeline: false,
      },
    };

    const starterPlan = {
      slug: 'starter',
      feature_flags: {
        statistics: true,
        email_composer: true,
        lead_pipeline: false,
      },
    };

    const businessPlan = {
      slug: 'business',
      feature_flags: {
        statistics: true,
        email_composer: true,
        lead_pipeline: true,
      },
    };

    it('returns false for statistics on free plan', () => {
      expect(hasFeature(freePlan, 'statistics')).toBe(false);
    });

    it('returns true for statistics on starter plan', () => {
      expect(hasFeature(starterPlan, 'statistics')).toBe(true);
    });

    it('returns true for lead_pipeline only on business plan', () => {
      expect(hasFeature(freePlan, 'lead_pipeline')).toBe(false);
      expect(hasFeature(starterPlan, 'lead_pipeline')).toBe(false);
      expect(hasFeature(businessPlan, 'lead_pipeline')).toBe(true);
    });
  });

  describe('canCreateListing', () => {
    it('returns true when under limit', () => {
      const result = canCreateListing({
        currentCount: 0,
        maxListings: 5,
      });
      expect(result).toBe(true);
    });

    it('returns false when at limit', () => {
      const result = canCreateListing({
        currentCount: 5,
        maxListings: 5,
      });
      expect(result).toBe(false);
    });

    it('returns false when over limit (downgrade scenario)', () => {
      const result = canCreateListing({
        currentCount: 10,
        maxListings: 5,
      });
      expect(result).toBe(false);
    });
  });

  describe('getRequiredTierForFeature', () => {
    it('returns starter for statistics', () => {
      expect(getRequiredTierForFeature('statistics')).toBe('starter');
    });

    it('returns business for lead_pipeline', () => {
      expect(getRequiredTierForFeature('lead_pipeline')).toBe('business');
    });

    it('returns business for team_management', () => {
      expect(getRequiredTierForFeature('team_management')).toBe('business');
    });
  });
});
```

### Beispiel: Utility-Funktionen testen

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, generateSlug, formatDate } from './utils';

describe('formatPrice', () => {
  it('formats cents to EUR', () => {
    expect(formatPrice(12500)).toBe('125,00 €');
    expect(formatPrice(99)).toBe('0,99 €');
    expect(formatPrice(100000)).toBe('1.000,00 €');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0,00 €');
  });

  it('handles VB suffix', () => {
    expect(formatPrice(12500, { negotiable: true })).toBe('125,00 € VB');
  });
});

describe('generateSlug', () => {
  it('converts to lowercase', () => {
    expect(generateSlug('Hello World')).toMatch(/^hello-world/);
  });

  it('replaces special chars', () => {
    expect(generateSlug('Zeiss ACCURA II')).toMatch(/^zeiss-accura-ii/);
  });

  it('handles umlauts', () => {
    expect(generateSlug('Köln Düsseldorf')).toMatch(/^koln-dusseldorf|^köln-düsseldorf/);
  });
});
```

### Beispiel: Zod Schema testen

```typescript
// src/lib/validations/listing.test.ts
import { describe, it, expect } from 'vitest';
import { listingSchema } from './listing';

describe('listingSchema', () => {
  const validListing = {
    title: 'Zeiss ACCURA II CMM',
    description: 'Well maintained coordinate measuring machine...',
    price: 45000,
    year_built: 2018,
    condition: 'good',
    manufacturer_id: '123e4567-e89b-12d3-a456-426614174000',
    location_country: 'DE',
    location_city: 'München',
    location_postal_code: '80331',
  };

  it('accepts valid listing', () => {
    const result = listingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('rejects listing without title', () => {
    const { title, ...withoutTitle } = validListing;
    const result = listingSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = listingSchema.safeParse({ ...validListing, price: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects future year_built', () => {
    const result = listingSchema.safeParse({ ...validListing, year_built: 2030 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid condition', () => {
    const result = listingSchema.safeParse({ ...validListing, condition: 'broken' });
    expect(result.success).toBe(false);
  });
});
```

---

## 3. Integration Tests

### Test-Datenbank Setup

```typescript
// src/test/db.ts
import { createClient } from '@supabase/supabase-js';

// Separate Test-Datenbank oder Schema
const supabaseUrl = process.env.SUPABASE_TEST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_TEST_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const testDb = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Cleanup helper
export async function cleanupTestData(prefix: string) {
  // Delete test data by prefix
  await testDb.from('listings').delete().like('title', `${prefix}%`);
  await testDb.from('accounts').delete().like('company_name', `${prefix}%`);
  await testDb.from('profiles').delete().like('email', `${prefix}%`);
}
```

### Beispiel: Server Action testen

```typescript
// src/lib/actions/listings.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testDb, cleanupTestData } from '@/test/db';
import { createListing, updateListing, deleteListing } from './listings';

const TEST_PREFIX = 'TEST_LISTING_';

describe('listing actions', () => {
  let testAccountId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user and account
    const { data: user } = await testDb.auth.admin.createUser({
      email: `${TEST_PREFIX}user@test.com`,
      password: 'testpassword123',
      email_confirm: true,
    });
    testUserId = user.user!.id;

    const { data: account } = await testDb
      .from('accounts')
      .insert({
        owner_id: testUserId,
        company_name: `${TEST_PREFIX}Company`,
        slug: `${TEST_PREFIX.toLowerCase()}company`,
      })
      .select()
      .single();
    testAccountId = account!.id;
  });

  afterAll(async () => {
    await cleanupTestData(TEST_PREFIX);
    await testDb.auth.admin.deleteUser(testUserId);
  });

  it('creates a listing', async () => {
    const result = await createListing({
      accountId: testAccountId,
      title: `${TEST_PREFIX}Zeiss CMM`,
      description: 'Test description',
      price: 50000,
      year_built: 2020,
      condition: 'good',
      manufacturer_id: 'some-manufacturer-id',
      location_country: 'DE',
      location_city: 'Berlin',
      location_postal_code: '10115',
    });

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(`${TEST_PREFIX}Zeiss CMM`);
    expect(result.data?.status).toBe('draft');
  });

  it('enforces listing limit', async () => {
    // Create listings up to limit
    // Then try to create one more
    // Expect error
  });
});
```

---

## 4. E2E Tests (Playwright)

### Playwright Konfiguration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical User Journeys

| Journey | Priorität | Beschreibung |
|---------|-----------|--------------|
| Auth Flow | Kritisch | Register → Verify → Login → Logout |
| Listing erstellen | Kritisch | Login → Create Listing → Submit for Review |
| Anfrage senden | Kritisch | View Listing → Send Inquiry |
| Subscription | Hoch | Upgrade → Checkout → Access Features |
| Admin Moderation | Mittel | Login as Admin → Approve/Reject Listing |

### Beispiel: Auth Flow E2E Test

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register and login', async ({ page }) => {
    const testEmail = `e2e-test-${Date.now()}@example.com`;

    // Go to register page
    await page.goto('/registrieren');
    
    // Fill registration form
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.fill('[name="full_name"]', 'E2E Test User');
    await page.fill('[name="company_name"]', 'E2E Test Company');
    await page.check('[name="accepted_terms"]');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Expect success message or redirect
    await expect(page).toHaveURL(/\/registrieren\/bestaetigung|\/seller/);
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Should redirect to seller dashboard
    await expect(page).toHaveURL('/seller');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/seller');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
```

### Beispiel: Listing erstellen E2E Test

```typescript
// e2e/listings.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Listings', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[name="email"]', 'seller@test.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/seller');
  });

  test('can create a new listing', async ({ page }) => {
    await page.goto('/seller/inserate/neu');
    
    // Fill listing form
    await page.fill('[name="title"]', 'E2E Test CMM Machine');
    await page.selectOption('[name="manufacturer_id"]', { label: 'Zeiss' });
    await page.fill('[name="year_built"]', '2020');
    await page.selectOption('[name="condition"]', 'good');
    await page.fill('[name="price"]', '50000');
    await page.fill('[name="description"]', 'This is a test listing created by E2E tests.');
    
    // Location
    await page.fill('[name="location_city"]', 'Berlin');
    await page.fill('[name="location_postal_code"]', '10115');
    
    // Submit as draft
    await page.click('button:has-text("Speichern")');
    
    // Should redirect to listing edit page
    await expect(page).toHaveURL(/\/seller\/inserate\/[a-z0-9-]+/);
    
    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('gespeichert');
  });

  test('shows upgrade prompt when listing limit reached', async ({ page }) => {
    // Assuming test user is on free plan with 1 listing limit
    // and already has 1 listing
    
    await page.goto('/seller/inserate/neu');
    
    // Should show upgrade prompt
    await expect(page.locator('text=Upgrade')).toBeVisible();
  });
});
```

### Beispiel: Anfrage senden E2E Test

```typescript
// e2e/inquiry.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Inquiries', () => {
  test('visitor can send inquiry', async ({ page }) => {
    // Go to a listing page
    await page.goto('/maschinen/zeiss-accura-test-12345678');
    
    // Click inquiry button
    await page.click('button:has-text("Anfrage senden")');
    
    // Fill inquiry form
    await page.fill('[name="contact_name"]', 'E2E Test Buyer');
    await page.fill('[name="contact_email"]', 'buyer@test.com');
    await page.fill('[name="contact_company"]', 'Test Buyer GmbH');
    await page.fill('[name="message"]', 'I am interested in this machine. Please contact me.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=erfolgreich')).toBeVisible();
  });
});
```

---

## 5. Test Fixtures & Factories

```typescript
// src/test/factories.ts
import { faker } from '@faker-js/faker/locale/de';

export const createTestProfile = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  full_name: faker.person.fullName(),
  phone: faker.phone.number(),
  role: 'user' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestAccount = (overrides = {}) => ({
  id: faker.string.uuid(),
  owner_id: faker.string.uuid(),
  company_name: faker.company.name(),
  slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
  status: 'active' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestListing = (overrides = {}) => ({
  id: faker.string.uuid(),
  account_id: faker.string.uuid(),
  manufacturer_id: faker.string.uuid(),
  title: `${faker.company.name()} CMM ${faker.string.alphanumeric(4).toUpperCase()}`,
  slug: faker.helpers.slugify(`${faker.company.name()} CMM`).toLowerCase(),
  description: faker.lorem.paragraphs(2),
  price: faker.number.int({ min: 10000, max: 500000 }) * 100, // cents
  year_built: faker.number.int({ min: 2010, max: 2024 }),
  condition: faker.helpers.arrayElement(['new', 'like_new', 'good', 'fair']),
  location_country: 'DE',
  location_city: faker.location.city(),
  location_postal_code: faker.location.zipCode(),
  status: 'active' as const,
  views_count: faker.number.int({ min: 0, max: 1000 }),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestPlan = (slug: 'free' | 'starter' | 'business') => {
  const plans = {
    free: {
      id: faker.string.uuid(),
      name: 'Free',
      slug: 'free',
      listing_limit: 1,
      price_monthly: 0,
      price_yearly: 0,
      feature_flags: {
        max_listings: 1,
        statistics: false,
        email_composer: false,
        lead_pipeline: false,
        team_management: false,
        api_access: false,
      },
    },
    starter: {
      id: faker.string.uuid(),
      name: 'Starter',
      slug: 'starter',
      listing_limit: 5,
      price_monthly: 5500,
      price_yearly: 55000,
      feature_flags: {
        max_listings: 5,
        statistics: true,
        email_composer: true,
        lead_pipeline: false,
        team_management: false,
        api_access: false,
      },
    },
    business: {
      id: faker.string.uuid(),
      name: 'Business',
      slug: 'business',
      listing_limit: 25,
      price_monthly: 14300,
      price_yearly: 143000,
      feature_flags: {
        max_listings: 25,
        statistics: true,
        email_composer: true,
        lead_pipeline: true,
        team_management: true,
        api_access: true,
      },
    },
  };
  return plans[slug];
};
```

---

## 6. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 7. Coverage-Ziele

| Bereich | Ziel | Priorität |
|---------|------|-----------|
| Permission-Funktionen | 100% | Kritisch |
| Utility-Funktionen | 90%+ | Hoch |
| Zod Schemas | 80%+ | Hoch |
| Server Actions | 70%+ | Mittel |
| UI Components | 50%+ | Niedrig |
| E2E Critical Paths | 5 Journeys | Kritisch |

---

## Zusammenfassung

```
src/
├── test/
│   ├── setup.ts           # Test setup & mocks
│   ├── db.ts              # Test database helpers
│   └── factories.ts       # Data factories
├── lib/
│   ├── permissions.test.ts
│   ├── utils.test.ts
│   └── validations/
│       └── listing.test.ts
e2e/
├── auth.spec.ts
├── listings.spec.ts
└── inquiry.spec.ts
```
