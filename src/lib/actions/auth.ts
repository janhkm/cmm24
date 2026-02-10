'use server';

import { createActionClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkRateLimit, getRateLimitMessage } from '@/lib/rate-limit';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  phone?: string;
  acceptedTerms: boolean;
  acceptedMarketing: boolean;
  userIntent?: string;
  machineCount?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

// Generate slug from company name
function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/g, '-')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/(^-|-$)/g, '');
}

/**
 * Aktuellen User und Profildaten holen (fuer Client-Components).
 * Gibt null zurueck wenn nicht eingeloggt.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
} | null> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      fullName: profile?.full_name || null,
      avatarUrl: profile?.avatar_url || null,
    };
  } catch {
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(credentials: LoginCredentials): Promise<ActionResult> {
  // Rate Limit pruefen
  const rateLimit = await checkRateLimit('login');
  if (!rateLimit.success) {
    return { success: false, error: getRateLimitMessage('login') };
  }

  const supabase = await createActionClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message === 'Invalid login credentials'
        ? 'Ungültige E-Mail oder Passwort'
        : error.message,
    };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Sign in with Magic Link (OTP)
 */
export async function signInWithMagicLink(email: string): Promise<ActionResult> {
  const supabase = await createActionClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: 'Fehler beim Senden des Magic Links',
    };
  }

  return { success: true };
}

/**
 * Register a new user with email and password
 */
export async function signUp(data: RegisterData): Promise<ActionResult> {
  // Rate Limit pruefen
  const rateLimit = await checkRateLimit('register');
  if (!rateLimit.success) {
    return { success: false, error: getRateLimitMessage('register') };
  }

  const supabase = await createActionClient();

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        full_name: data.fullName,
        // Marketing-Wunsch als Metadatum speichern fuer Double-Opt-In.
        // Wird erst nach E-Mail-Bestaetigung (auth/callback) aktiviert.
        marketing_pending: data.acceptedMarketing,
      },
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return {
        success: false,
        error: 'Diese E-Mail-Adresse ist bereits registriert',
      };
    }
    return {
      success: false,
      error: authError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: 'Fehler bei der Registrierung',
    };
  }

  // Supabase Anti-Email-Enumeration Check:
  // Wenn Email bereits registriert ist, gibt signUp() einen "fake" User zurueck
  // mit leerer identities-Liste. Der User existiert NICHT wirklich in auth.users.
  if (!authData.user.identities || authData.user.identities.length === 0) {
    return {
      success: false,
      error: 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder setzen Sie Ihr Passwort zurueck.',
    };
  }

  // 2. ALLES in einem SECURITY DEFINER RPC-Call erledigen.
  //    Nach signUp() ist auth.uid() = NULL (Email nicht bestaetigt),
  //    daher scheitern alle regulaeren Client-Calls an RLS.
  //    Die Funktion complete_registration laeuft als DB-Owner und umgeht RLS.
  
  const slug = data.companyName ? generateSlug(data.companyName) : null;
  
  // TODO: Typ fuer complete_registration RPC nach naechstem `supabase gen types` entfernen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: regResult, error: regError } = await (supabase as any)
    .rpc('complete_registration', {
      p_user_id: authData.user.id,
      p_email: data.email,
      p_full_name: data.fullName,
      p_phone: data.phone || null,
      p_accepted_terms: data.acceptedTerms,
      // Marketing erst nach E-Mail-Bestaetigung aktivieren (Double-Opt-In, § 7 UWG)
      p_accepted_marketing: false,
      p_onboarding_intent: data.userIntent || null,
      p_machine_count: data.machineCount || null,
      p_company_name: data.companyName || null,
      p_company_slug: slug,
    });

  if (regError) {
    console.error('[signUp] complete_registration error:', regError);
    // Registrierung trotzdem als Erfolg melden - Daten koennen spaeter ergaenzt werden
  }

  // RPC RETURNS JSONB - Supabase kann das als String oder Objekt zurueckgeben
  let accountId: string | null = null;
  if (regResult) {
    // Falls regResult ein String ist (JSON), parsen
    const parsed = typeof regResult === 'string' ? JSON.parse(regResult) : regResult;
    accountId = parsed?.account_id || null;
  } else {
    // Registrierung ohne Account-Erstellung (Buyer-Only)
  }

  revalidatePath('/', 'layout');
  return { 
    success: true,
    data: { 
      user: authData.user,
      accountId: accountId,
      email: data.email,
      intent: data.userIntent,
    },
  };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  // Rate Limit pruefen
  const rateLimit = await checkRateLimit('passwordReset');
  if (!rateLimit.success) {
    return { success: false, error: getRateLimitMessage('passwordReset') };
  }

  const supabase = await createActionClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/passwort-reset`,
  });

  if (error) {
    return {
      success: false,
      error: 'Fehler beim Senden des Reset-Links',
    };
  }

  return { success: true };
}

/**
 * Update password (for password reset flow)
 */
export async function updatePassword(password: string): Promise<ActionResult> {
  const supabase = await createActionClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      error: 'Fehler beim Ändern des Passworts',
    };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createActionClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Ensure the current user has an account and subscription (creates if missing)
 */
export async function ensureSubscription(): Promise<ActionResult> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht angemeldet' };
  }

  // Profil sicherstellen (falls bei Registrierung nicht erstellt)
  // complete_registration mit minimalen Daten aufrufen
  try {
    // TODO: Typ fuer complete_registration RPC nach naechstem `supabase gen types` entfernen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('complete_registration', {
      p_user_id: user.id,
      p_email: user.email || '',
      p_full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      p_phone: null,
      p_accepted_terms: true,
      p_accepted_marketing: false,
      p_onboarding_intent: null,
      p_machine_count: null,
      p_company_name: null,
      p_company_slug: null,
    });
  } catch {
    // Fehler ignorieren falls Profil schon existiert
  }

  // Get account
  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();

  // Kein Account = Kaeufer (kein Seller-Account noetig)
  if (!account) {
    return { success: true, data: { noAccount: true } };
  }

  // Check if subscription exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id, plan_id')
    .eq('account_id', account.id)
    .maybeSingle();

  if (existingSubscription) {
    return { success: true, data: { subscriptionId: existingSubscription.id } };
  }

  // Subscription should have been created by trigger, but create manually as fallback
  // Subscription sollte durch Trigger erstellt worden sein - manueller Fallback
  
  // Get free plan
  const { data: freePlan } = await supabase
    .from('plans')
    .select('id')
    .eq('slug', 'free')
    .single();

  if (!freePlan) {
    return { success: false, error: 'Free-Plan nicht gefunden' };
  }

  // Create subscription
  const { data: newSubscription, error } = await supabase
    .from('subscriptions')
    .insert({
      account_id: account.id,
      plan_id: freePlan.id,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Subscription creation error:', error);
    return { success: false, error: 'Fehler beim Erstellen der Subscription' };
  }

  return { success: true, data: { subscriptionId: newSubscription.id, created: true } };
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(): Promise<ActionResult> {
  const supabase = await createActionClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return {
      success: false,
      error: 'Kein Benutzer angemeldet',
    };
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: 'Fehler beim Senden der Bestätigungs-E-Mail',
    };
  }

  return { success: true };
}
