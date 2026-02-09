# CMM24 – Permissions & Access Control

## Übersicht

Dieses Dokument definiert das komplette Rechte- und Zugriffssystem für CMM24.

**Wichtig:** Gesperrte Features werden im UI **angezeigt aber ausgegraut** (nicht versteckt), um Upselling zu fördern.

---

## 1. Authentifizierungsebenen

| Level | Beschreibung | Zugriff |
|-------|--------------|---------|
| **Anonym** | Nicht eingeloggt | Nur öffentliche Seiten |
| **Authentifiziert (Free)** | Eingeloggt, Free-Plan | Seller Portal (eingeschränkt) |
| **Subscriber (Starter)** | Eingeloggt + Starter-Plan | Seller Portal (Tier 2) |
| **Subscriber (Business)** | Eingeloggt + Business-Plan | Seller Portal (Vollzugriff) |
| **Admin** | Rolle = `admin` | Admin-Bereich (eingeschränkt) |
| **Super-Admin** | Rolle = `super_admin` | Vollzugriff auf alles |

---

## 2. Plan-Tiers (Subscription)

### Tier-Übersicht

| Tier | Plan | Listing-Limit | Preis (Early Adopter) | Preis (Regulär) |
|------|------|---------------|----------------------|-----------------|
| **Tier 1** | Free | 1 Inserat | 0€ | 0€ |
| **Tier 2** | Starter | 5 Inserate | 24€/Monat | 55€/Monat |
| **Tier 3** | Business | 25 Inserate | 79€/Monat | 143€/Monat |

**Early Adopter Rabatt:** -58%, limitiert (z.B. 73 Plätze)
**Jährlich:** -20% zusätzlich

### Feature-Flags pro Plan

```typescript
interface PlanFeatureFlags {
  // Basis-Limits
  max_listings: number;           // 1 | 5 | 25
  max_images_per_listing: number; // 5 | 10 | 20
  max_team_members: number;       // 0 | 1 | 5
  featured_per_month: number;     // 0 | 1 | 5
  
  // Features (boolean)
  statistics: boolean;            // false | true | true
  email_composer: boolean;        // false | true | true
  lead_pipeline: boolean;         // false | false | true
  auto_reply: boolean;            // false | false | true
  team_management: boolean;       // false | false | true
  api_access: boolean;            // false | false | true
  
  // Support Level
  support_level: 'email' | '24h' | '4h';
}
```

### Konkrete Feature-Zuordnung

| Feature | Free (Tier 1) | Starter (Tier 2) | Business (Tier 3) |
|---------|:-------------:|:----------------:|:-----------------:|
| **Inserate** | 1 | 5 | 25 |
| **Statistiken** | 🔒 | ✓ | ✓ |
| **E-Mail-Composer** | 🔒 | ✓ | ✓ |
| **Lead-Pipeline** | 🔒 | 🔒 | ✓ |
| **Auto-Reply** | 🔒 | 🔒 | ✓ |
| **Featured/Monat** | 0 | 1 | 5 |
| **Team-Management** | 🔒 | 🔒 | ✓ |
| **API-Zugang** | 🔒 | 🔒 | ✓ |
| **Support** | Email | 24h | 4h |

🔒 = Sichtbar aber gesperrt (Upgrade-Prompt)

---

## 3. Seiten-Zugriffsmatrix

### Öffentliche Seiten (Anonym erlaubt)

| Seite | Pfad | Anmerkung |
|-------|------|-----------|
| Startseite | `/` | - |
| Maschinen-Übersicht | `/maschinen` | - |
| Maschinen-Detail | `/maschinen/[slug]` | - |
| Hersteller | `/hersteller`, `/hersteller/[slug]` | - |
| Kategorien | `/kategorien`, `/kategorien/[slug]` | - |
| Vergleich | `/vergleich` | Speicherung nur mit Login |
| Verkaufen (Info) | `/verkaufen` | Marketing-Seite |
| So funktioniert's | `/so-funktionierts` | - |
| Über uns | `/ueber-uns` | - |
| Kontakt | `/kontakt` | - |
| FAQ | `/faq` | - |
| Glossar | `/glossar`, `/glossar/[slug]` | - |
| Ratgeber | `/ratgeber`, `/ratgeber/[slug]` | - |
| **Legal** | `/impressum`, `/datenschutz`, `/agb`, `/cookie-richtlinie`, `/widerrufsbelehrung` | - |

### Auth-Seiten (Nur für nicht-eingeloggte)

| Seite | Pfad | Redirect wenn eingeloggt |
|-------|------|--------------------------|
| Login | `/login` | → `/seller/dashboard` |
| Registrierung | `/registrieren` | → `/seller/dashboard` |
| Passwort vergessen | `/passwort-vergessen` | → `/seller/dashboard` |
| Passwort zurücksetzen | `/passwort-reset` | Erlaubt (mit Token) |
| Email bestätigen | `/email-bestaetigen` | Erlaubt (mit Token) |

### Seller Portal (Authentifiziert erforderlich)

**Alle Seiten sind für eingeloggte User zugänglich, aber Features können gesperrt sein.**

| Seite | Pfad | Verfügbar ab | Gesperrt für |
|-------|------|--------------|--------------|
| Dashboard | `/seller/dashboard` | Free | - |
| Inserate | `/seller/inserate` | Free | - |
| Inserat erstellen | `/seller/inserate/neu` | Free | Limit prüfen |
| Inserat bearbeiten | `/seller/inserate/[id]` | Free | - |
| Inserat Vorschau | `/seller/inserate/[id]/vorschau` | Free | - |
| **Anfragen Liste** | `/seller/anfragen/liste` | Free | - |
| **Anfragen Pipeline** | `/seller/anfragen/pipeline` | **Business** | 🔒 Free, Starter |
| Anfrage Detail | `/seller/anfragen/[id]` | Free | - |
| **Statistiken** | `/seller/statistiken` | **Starter** | 🔒 Free |
| **Emails** | `/seller/emails` | **Starter** | 🔒 Free |
| Abo-Verwaltung | `/seller/abo` | Free | - |
| Abo Upgrade | `/seller/abo/upgrade` | Free | - |
| Konto | `/seller/konto` | Free | - |
| Konto Firma | `/seller/konto/firma` | Free | - |
| Konto Passwort | `/seller/konto/passwort` | Free | - |
| Rechnungen | `/seller/rechnungen` | Free | - |
| **Team** | `/seller/team` | **Business** | 🔒 Free, Starter |
| **API** | `/seller/api` | **Business** | 🔒 Free, Starter |

### Feature-Sperr-Verhalten

Wenn ein User eine gesperrte Seite aufruft:
1. **Seite wird geladen** (nicht redirect)
2. **Upgrade-Overlay/Modal** wird angezeigt
3. **Content ist sichtbar aber unscharf/ausgegraut** im Hintergrund
4. **CTA zum Upgrade** auf den nötigen Plan

### Admin-Bereich (Nur Admins)

| Seite | Pfad | Rolle |
|-------|------|-------|
| Admin Dashboard | `/admin/dashboard` | `admin` / `super_admin` |
| Moderation | `/admin/moderation` | `admin` / `super_admin` |
| Moderation Detail | `/admin/moderation/[id]` | `admin` / `super_admin` |
| Accounts | `/admin/accounts` | `admin` / `super_admin` |
| Reports | `/admin/reports` | `admin` / `super_admin` |
| Statistiken | `/admin/statistiken` | `admin` / `super_admin` |
| **Stammdaten** | `/admin/stammdaten/*` | **`super_admin` only** |

---

## 4. Technische Implementierung

### 4.1 Middleware (Route-Level Protection)

```typescript
// src/middleware.ts

// Middleware prüft NUR:
// 1. Öffentlich vs. Authentifiziert
// 2. Admin-Rolle für /admin/*
// 3. Super-Admin für /admin/stammdaten/*

// Tier-basierte Feature-Locks werden auf PAGE-LEVEL geprüft, nicht in Middleware!
// Grund: Gesperrte Seiten sollen angezeigt werden mit Upgrade-Prompt

const routeConfig = {
  // Öffentlich - kein Auth Check
  public: [
    '/',
    '/maschinen',
    '/maschinen/:slug',
    '/hersteller',
    '/hersteller/:slug',
    '/kategorien',
    '/kategorien/:slug',
    '/vergleich',
    '/verkaufen',
    '/so-funktionierts',
    '/ueber-uns',
    '/kontakt',
    '/faq',
    '/glossar',
    '/glossar/:slug',
    '/ratgeber',
    '/ratgeber/:slug',
    '/impressum',
    '/datenschutz',
    '/agb',
    '/cookie-richtlinie',
    '/widerrufsbelehrung',
    '/maintenance',
  ],
  
  // Auth-Seiten - Redirect wenn eingeloggt
  auth: [
    '/login',
    '/registrieren',
    '/passwort-vergessen',
  ],
  
  // Seller Portal - Nur Auth-Check (Tier-Check auf Page-Level)
  seller: [
    '/seller/:path*',
  ],
  
  // Admin - Nur role = admin | super_admin
  admin: [
    '/admin/:path*',
  ],
  
  // Super Admin Only
  superAdmin: [
    '/admin/stammdaten/:path*',
  ],
};
```

### 4.2 Permission-Check Funktionen

```typescript
// src/lib/permissions.ts

import { Tables } from '@/types/supabase';

type Profile = Tables<'profiles'>;
type Account = Tables<'accounts'>;
type Subscription = Tables<'subscriptions'>;
type Plan = Tables<'plans'>;

interface UserContext {
  profile: Profile | null;
  account: Account | null;
  subscription: Subscription | null;
  plan: Plan | null;
}

// ============================================
// AUTH CHECKS
// ============================================

export function isAuthenticated(ctx: UserContext): boolean {
  return ctx.profile !== null;
}

export function isAccountSuspended(ctx: UserContext): boolean {
  return ctx.account?.status === 'suspended';
}

// ============================================
// ROLE CHECKS
// ============================================

export function isAdmin(ctx: UserContext): boolean {
  return ctx.profile?.role === 'admin' || 
         ctx.profile?.role === 'super_admin';
}

export function isSuperAdmin(ctx: UserContext): boolean {
  return ctx.profile?.role === 'super_admin';
}

// ============================================
// TIER CHECKS
// ============================================

export type PlanTier = 'free' | 'starter' | 'business';

export function getPlanTier(ctx: UserContext): PlanTier {
  if (!ctx.plan) return 'free';
  
  const slug = ctx.plan.slug;
  if (slug === 'starter') return 'starter';
  if (slug === 'business') return 'business';
  
  return 'free';
}

export function hasTier(ctx: UserContext, minTier: PlanTier): boolean {
  const tierOrder: PlanTier[] = ['free', 'starter', 'business'];
  const userTier = getPlanTier(ctx);
  
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(minTier);
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
// FEATURE FLAG CHECKS
// ============================================

export type FeatureFlag = 
  | 'statistics'
  | 'email_composer'
  | 'lead_pipeline'
  | 'auto_reply'
  | 'team_management'
  | 'api_access';

export function hasFeature(ctx: UserContext, feature: FeatureFlag): boolean {
  if (!ctx.plan?.feature_flags) return false;
  
  const flags = ctx.plan.feature_flags as Record<string, boolean | number>;
  return flags[feature] === true;
}

export function getFeatureLimit(ctx: UserContext, feature: string): number {
  if (!ctx.plan?.feature_flags) {
    // Free tier defaults
    if (feature === 'max_listings') return 1;
    return 0;
  }
  
  const flags = ctx.plan.feature_flags as Record<string, number>;
  return flags[feature] ?? 0;
}

// ============================================
// SPECIFIC PERMISSION CHECKS
// ============================================

// --- Listings ---
export function canCreateListing(ctx: UserContext, currentCount: number): boolean {
  if (isAccountSuspended(ctx)) return false;
  
  const limit = getFeatureLimit(ctx, 'max_listings');
  return currentCount < limit;
}

export function getListingLimit(ctx: UserContext): number {
  return getFeatureLimit(ctx, 'max_listings');
}

// --- Statistiken (Starter+) ---
export function canAccessStatistics(ctx: UserContext): boolean {
  return hasTier(ctx, 'starter');
}

// --- Email Composer (Starter+) ---
export function canAccessEmailComposer(ctx: UserContext): boolean {
  return hasTier(ctx, 'starter');
}

// --- Lead Pipeline (Business only) ---
export function canAccessLeadPipeline(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// --- Auto Reply (Business only) ---
export function canAccessAutoReply(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// --- Team Management (Business only) ---
export function canAccessTeamManagement(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// --- API Access (Business only) ---
export function canAccessApi(ctx: UserContext): boolean {
  return hasTier(ctx, 'business');
}

// --- Featured Listings ---
export function getFeaturedLimit(ctx: UserContext): number {
  return getFeatureLimit(ctx, 'featured_per_month');
}

// --- Admin ---
export function canAccessAdminPanel(ctx: UserContext): boolean {
  return isAdmin(ctx);
}

export function canAccessStammdaten(ctx: UserContext): boolean {
  return isSuperAdmin(ctx);
}

// ============================================
// REQUIRED TIER FOR FEATURE
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
```

### 4.3 React Hook für Permissions

```typescript
// src/hooks/use-permissions.ts

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
    featuredLimit: permissions.getFeaturedLimit(ctx),
    
    // Feature Access (für UI-Locking)
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
    
    // Helper für Upgrade-Prompts
    getRequiredTier: (feature: FeatureFlag) => 
      permissions.getRequiredTierForFeature(feature),
  };
}

export type { PlanTier, FeatureFlag };
```

### 4.4 Komponenten für Conditional Rendering

```typescript
// src/components/permissions/feature-gate.tsx

'use client';

import { usePermissions, type PlanTier } from '@/hooks/use-permissions';
import { UpgradePrompt } from './upgrade-prompt';

interface FeatureGateProps {
  requiredTier: PlanTier;
  featureName: string;
  children: React.ReactNode;
}

/**
 * Zeigt Content wenn Tier ausreicht, sonst Upgrade-Prompt
 * Der Content wird NICHT versteckt, sondern mit Overlay überlagert
 */
export function FeatureGate({ 
  requiredTier, 
  featureName,
  children 
}: FeatureGateProps) {
  const { hasTier, isLoading } = usePermissions();
  
  if (isLoading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }
  
  const hasAccess = hasTier(requiredTier);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Zeige Content ausgegraut mit Upgrade-Overlay
  return (
    <div className="relative">
      <div className="opacity-30 blur-[2px] pointer-events-none select-none">
        {children}
      </div>
      <UpgradePrompt 
        requiredTier={requiredTier}
        featureName={featureName}
      />
    </div>
  );
}
```

```typescript
// src/components/permissions/upgrade-prompt.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Lock, Rocket } from 'lucide-react';
import Link from 'next/link';
import { getTierName, type PlanTier } from '@/lib/permissions';

interface UpgradePromptProps {
  requiredTier: PlanTier;
  featureName: string;
}

export function UpgradePrompt({ requiredTier, featureName }: UpgradePromptProps) {
  const tierName = getTierName(requiredTier);
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-background/95 border rounded-xl p-8 max-w-md text-center shadow-lg">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {featureName} freischalten
        </h3>
        
        <p className="text-muted-foreground mb-6">
          Diese Funktion ist ab dem <strong>{tierName}</strong>-Plan verfügbar.
          Upgrade jetzt und nutze alle Features.
        </p>
        
        <Button asChild size="lg" className="w-full">
          <Link href="/seller/abo/upgrade">
            <Rocket className="w-4 h-4 mr-2" />
            Auf {tierName} upgraden
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

```typescript
// src/components/permissions/tier-badge.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import type { PlanTier } from '@/lib/permissions';

interface TierBadgeProps {
  tier: PlanTier;
  size?: 'sm' | 'default';
}

const tierStyles: Record<PlanTier, string> = {
  free: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  starter: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  business: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export function TierBadge({ tier, size = 'default' }: TierBadgeProps) {
  const labels: Record<PlanTier, string> = {
    free: 'Free',
    starter: 'Starter',
    business: 'Business',
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${tierStyles[tier]} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}`}
    >
      {labels[tier]}
    </Badge>
  );
}
```

---

## 5. Datenbank-Schema: Plans mit Feature Flags

```sql
-- Plans Seed-Daten (korrekte Preise!)
INSERT INTO plans (name, slug, listing_limit, price_monthly, price_yearly, launch_price_monthly, launch_price_yearly, feature_flags, features) VALUES
-- FREE Plan (Tier 1)
(
  'Free',
  'free',
  1,
  0,
  0,
  0,
  0,
  '{
    "max_listings": 1,
    "max_images_per_listing": 5,
    "max_team_members": 0,
    "featured_per_month": 0,
    "statistics": false,
    "email_composer": false,
    "lead_pipeline": false,
    "auto_reply": false,
    "team_management": false,
    "api_access": false,
    "support_level": "email"
  }',
  ARRAY[
    '1 Inserat',
    '5 Bilder pro Inserat',
    'Anfragen-Verwaltung (Liste)',
    'E-Mail-Support'
  ]
),
-- STARTER Plan (Tier 2)
(
  'Starter',
  'starter',
  5,
  5500, -- 55€ regulär
  55000, -- 550€/Jahr regulär
  2400, -- 24€ Early Adopter
  24000, -- 240€/Jahr Early Adopter
  '{
    "max_listings": 5,
    "max_images_per_listing": 10,
    "max_team_members": 1,
    "featured_per_month": 1,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": false,
    "auto_reply": false,
    "team_management": false,
    "api_access": false,
    "support_level": "24h"
  }',
  ARRAY[
    '5 Inserate',
    '10 Bilder pro Inserat',
    'Statistiken',
    'E-Mail-Composer',
    '1 Featured Listing/Monat',
    '24h Support'
  ]
),
-- BUSINESS Plan (Tier 3)
(
  'Business',
  'business',
  25,
  14300, -- 143€ regulär
  143000, -- 1430€/Jahr regulär
  7900, -- 79€ Early Adopter
  79000, -- 790€/Jahr Early Adopter
  '{
    "max_listings": 25,
    "max_images_per_listing": 20,
    "max_team_members": 5,
    "featured_per_month": 5,
    "statistics": true,
    "email_composer": true,
    "lead_pipeline": true,
    "auto_reply": true,
    "team_management": true,
    "api_access": true,
    "support_level": "4h"
  }',
  ARRAY[
    '25 Inserate',
    '20 Bilder pro Inserat',
    'Lead-Pipeline',
    'Auto-Reply',
    'Team-Management',
    'API-Zugang',
    '5 Featured Listings/Monat',
    '4h Priority Support'
  ]
);
```

---

## 6. UI-Patterns für Upselling

### Navigation mit Tier-Badges (Sidebar)

```tsx
// src/components/seller/sidebar-nav.tsx

function SidebarNav() {
  const { 
    canAccessStatistics,
    canAccessLeadPipeline,
    canAccessTeamManagement,
    canAccessApi,
  } = usePermissions();

  return (
    <nav>
      {/* Immer sichtbar */}
      <NavItem href="/seller/dashboard" icon={Home}>Dashboard</NavItem>
      <NavItem href="/seller/inserate" icon={Package}>Inserate</NavItem>
      <NavItem href="/seller/anfragen/liste" icon={MessageSquare}>Anfragen</NavItem>
      
      {/* Pipeline - gesperrt für Free/Starter */}
      <NavItem 
        href="/seller/anfragen/pipeline" 
        icon={Kanban}
        locked={!canAccessLeadPipeline}
        badge={!canAccessLeadPipeline ? 'Business' : undefined}
      >
        Pipeline
      </NavItem>
      
      {/* Statistiken - gesperrt für Free */}
      <NavItem 
        href="/seller/statistiken" 
        icon={BarChart}
        locked={!canAccessStatistics}
        badge={!canAccessStatistics ? 'Starter' : undefined}
      >
        Statistiken
      </NavItem>
      
      {/* Team - gesperrt für Free/Starter */}
      <NavItem 
        href="/seller/team" 
        icon={Users}
        locked={!canAccessTeamManagement}
        badge={!canAccessTeamManagement ? 'Business' : undefined}
      >
        Team
      </NavItem>
      
      {/* API - gesperrt für Free/Starter */}
      <NavItem 
        href="/seller/api" 
        icon={Code}
        locked={!canAccessApi}
        badge={!canAccessApi ? 'Business' : undefined}
      >
        API
      </NavItem>
    </nav>
  );
}
```

### Page-Level Feature Gate

```tsx
// src/app/(seller)/seller/statistiken/page.tsx

export default function StatistikenPage() {
  return (
    <FeatureGate 
      requiredTier="starter" 
      featureName="Statistiken"
    >
      <StatistikenContent />
    </FeatureGate>
  );
}
```

### Anfragen-Seite mit View-Switch

```tsx
// src/app/(seller)/seller/anfragen/page.tsx

export default function AnfragenPage() {
  const { canAccessLeadPipeline } = usePermissions();
  const [view, setView] = useState<'list' | 'pipeline'>('list');
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button 
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          Liste
        </Button>
        <Button 
          variant={view === 'pipeline' ? 'default' : 'outline'}
          onClick={() => setView('pipeline')}
          disabled={!canAccessLeadPipeline}
        >
          Pipeline
          {!canAccessLeadPipeline && <TierBadge tier="business" size="sm" />}
        </Button>
      </div>
      
      {view === 'list' && <AnfragenListe />}
      {view === 'pipeline' && (
        <FeatureGate requiredTier="business" featureName="Lead-Pipeline">
          <AnfragenPipeline />
        </FeatureGate>
      )}
    </div>
  );
}
```

---

## 7. Zusammenfassung: Wer darf was?

### Quick Reference

| Aktion | Anonym | Free | Starter | Business | Admin | Super-Admin |
|--------|:------:|:----:|:-------:|:--------:|:-----:|:-----------:|
| Maschinen ansehen | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Anfrage senden | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Seller Dashboard | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inserate erstellen | - | 1 | 5 | 25 | ✓ | ✓ |
| Anfragen (Liste) | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Statistiken | - | 🔒 | ✓ | ✓ | ✓ | ✓ |
| E-Mail-Composer | - | 🔒 | ✓ | ✓ | ✓ | ✓ |
| Lead-Pipeline | - | 🔒 | 🔒 | ✓ | ✓ | ✓ |
| Auto-Reply | - | 🔒 | 🔒 | ✓ | ✓ | ✓ |
| Team-Verwaltung | - | 🔒 | 🔒 | ✓ | ✓ | ✓ |
| API-Zugang | - | 🔒 | 🔒 | ✓ | ✓ | ✓ |
| Admin Dashboard | - | - | - | - | ✓ | ✓ |
| Moderation | - | - | - | - | ✓ | ✓ |
| Stammdaten ändern | - | - | - | - | - | ✓ |

🔒 = Sichtbar aber gesperrt (mit Upgrade-Prompt)

**Hinweis:** Für Downgrade-Handling und Edge Cases siehe [07-edge-cases.md](./07-edge-cases.md)

---

## 8. Implementierungs-Checkliste

### Foundation (bereits erstellt):

- [x] `src/lib/supabase/client.ts` - Browser-Client
- [x] `src/lib/supabase/server.ts` - Server-Client
- [x] `src/lib/supabase/middleware.ts` - Session-Handling
- [x] `src/middleware.ts` - Route Protection
- [x] `src/hooks/use-auth.ts` - Auth-Hook
- [x] `src/lib/actions/auth.ts` - Auth Server Actions
- [x] `src/types/supabase.ts` - Database Types

### Noch zu erstellen:

- [ ] `src/lib/permissions.ts` - Permission-Funktionen
- [ ] `src/hooks/use-permissions.ts` - React Hook
- [ ] `src/components/permissions/feature-gate.tsx` - Feature-Gate Komponente
- [ ] `src/components/permissions/upgrade-prompt.tsx` - Upgrade-Modal
- [ ] `src/components/permissions/tier-badge.tsx` - Badge für Nav-Items

### Seiten mit FeatureGate wrappen:

- [ ] `/seller/statistiken` - requiredTier: "starter"
- [ ] `/seller/anfragen/pipeline` - requiredTier: "business"
- [ ] `/seller/team` - requiredTier: "business"
- [ ] `/seller/api` - requiredTier: "business"

### Navigation anpassen:

- [ ] Seller Sidebar - Locked-States + Badges hinzufügen

### Database:

- [ ] Migrationen erstellen (siehe 00-uebersicht.md)
- [ ] Plans-Seed mit korrekten Feature-Flags ausführen
