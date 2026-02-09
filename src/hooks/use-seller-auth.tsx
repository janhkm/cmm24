'use client';

import { createContext, useContext } from 'react';
import type { Tables } from '@/types/supabase';

type Profile = Tables<'profiles'>;
type Account = Tables<'accounts'>;
type Plan = Tables<'plans'>;
type Subscription = Tables<'subscriptions'>;

/**
 * Daten die vom Server-Layout geladen und per Context
 * an alle Seller-Child-Pages weitergegeben werden.
 *
 * Eliminiert useAuth() (4-8 DB-Calls) aus jeder Seite.
 */
export interface SellerAuthData {
  profile: Profile;
  account: Account;
  plan: Plan | null;
  subscription: (Subscription & { plans: Plan | null }) | null;
  unreadInquiries: number;
  activeListings: number;
  listingLimit: number;
}

const SellerAuthContext = createContext<SellerAuthData | null>(null);

export function SellerAuthProvider({
  value,
  children,
}: {
  value: SellerAuthData;
  children: React.ReactNode;
}) {
  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
}

/**
 * Hook fuer Seller-Seiten. Ersetzt useAuth() komplett.
 * Daten kommen aus dem Server-Layout - keine DB-Calls, sofort verfuegbar.
 */
export function useSellerAuth() {
  const ctx = useContext(SellerAuthContext);
  if (!ctx) {
    throw new Error('useSellerAuth muss innerhalb des Seller-Layouts verwendet werden');
  }

  const planSlug = (ctx.plan?.slug || 'free') as 'free' | 'starter' | 'business';

  return {
    // Direkte Daten
    profile: ctx.profile,
    account: ctx.account,
    plan: ctx.plan,
    subscription: ctx.subscription,
    unreadInquiries: ctx.unreadInquiries,
    activeListings: ctx.activeListings,
    listingLimit: ctx.listingLimit,

    // Computed helpers (gleiche API wie useAuth)
    isLoading: false, // Nie loading - Daten kommen vom Server
    isAuthenticated: true, // Immer true - Layout hat das schon geprueft
    isAdmin: ctx.profile.role === 'admin' || ctx.profile.role === 'super_admin',
    isSuperAdmin: ctx.profile.role === 'super_admin',
    planSlug,
    planName: ctx.plan?.name || 'Free',
    featureFlags: (ctx.plan?.feature_flags || {}) as Record<string, boolean | number>,
  };
}
