'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ensureSubscription } from '@/lib/actions/auth';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/types/supabase';

type Profile = Tables<'profiles'>;
type Account = Tables<'accounts'>;
type Subscription = Tables<'subscriptions'>;
type Plan = Tables<'plans'>;

interface AuthState {
  user: User | null;
  profile: Profile | null;
  account: Account | null;
  subscription: Subscription | null;
  plan: Plan | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    account: null,
    subscription: null,
    plan: null,
    session: null,
    isLoading: true,
  });

  const supabase = createClient();

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch profile and account in parallel
      const [profileResult, accountResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('accounts').select('*').eq('owner_id', userId).is('deleted_at', null).maybeSingle(),
      ]);

      const profile = profileResult.data;
      const account = accountResult.data;
      
      // Then get subscription and plan for the account
      let subscription: Subscription | null = null;
      let plan: Plan | null = null;
      
      if (account) {
        let subscriptionResult = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('account_id', account.id)
          .in('status', ['active', 'trialing', 'past_due'])
          .maybeSingle();
        
        // Falls keine Subscription existiert: einmalig versuchen zu erstellen
        if (!subscriptionResult.data) {
          try {
            const ensureResult = await ensureSubscription();
            if (ensureResult.success) {
              subscriptionResult = await supabase
                .from('subscriptions')
                .select('*, plans(*)')
                .eq('account_id', account.id)
                .in('status', ['active', 'trialing', 'past_due'])
                .maybeSingle();
            }
          } catch {
            // Fehler ignorieren -- Subscription kann spaeter erstellt werden
          }
        }
        
        if (subscriptionResult.data) {
          const { plans: planData, ...subData } = subscriptionResult.data;
          subscription = subData;
          plan = planData as Plan;
        }
      }
      
      // Kein Account = Kaeufer (kein Problem, kein Account noetig)
      // Profile trotzdem sicherstellen
      if (!profile) {
        try {
          await ensureSubscription(); // Erstellt auch das Profil
          // Profil nochmal laden
          const retryProfile = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
          if (retryProfile.data) {
            return { profile: retryProfile.data, account, subscription, plan };
          }
        } catch {
          // Ignorieren
        }
      }

      return {
        profile,
        account,
        subscription,
        plan,
      };
    } catch (error) {
      console.error('Fetch user data error:', error);
      return {
        profile: null,
        account: null,
        subscription: null,
        plan: null,
      };
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { profile, account, subscription, plan } = await fetchUserData(session.user.id);
          setState({
            user: session.user,
            profile,
            account,
            subscription,
            plan,
            session,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { profile, account, subscription, plan } = await fetchUserData(session.user.id);
            setState({
              user: session.user,
              profile,
              account,
              subscription,
              plan,
              session,
              isLoading: false,
            });
          } else {
            setState({
              user: null,
              profile: null,
              account: null,
              subscription: null,
              plan: null,
              session: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const { profile, account, subscription, plan } = await fetchUserData(state.user.id);
      setState(prev => ({ ...prev, profile, account, subscription, plan }));
    }
  }, [state.user, fetchUserData]);

  return {
    ...state,
    signOut,
    refreshProfile,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin' || state.profile?.role === 'super_admin',
    isSuperAdmin: state.profile?.role === 'super_admin',
  };
}
