/**
 * API Key Verifizierung fuer REST API (/api/v1/*)
 * Nur fuer Business-Tier Accounts verfuegbar.
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

// Service-Role Client fuer API Key Lookup (bypass RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface ApiKeyResult {
  valid: boolean;
  accountId?: string;
  scopes?: string[];
  error?: string;
}

/**
 * Verifiziert einen API Key aus dem Authorization Header.
 */
export async function verifyApiKey(request: Request): Promise<ApiKeyResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }

  const apiKey = authHeader.slice(7);
  
  // Format pruefen
  if (!apiKey.startsWith('cmm24_sk_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // Hash berechnen
  const keyHash = createHash('sha256').update(apiKey).digest('hex');

  const supabase = getAdminClient();
  
  // API Key in DB suchen
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('account_id, scopes, expires_at, is_active')
    .eq('key_hash', keyHash)
    .single();

  if (!keyData || !keyData.is_active) {
    return { valid: false, error: 'Invalid or inactive API key' };
  }

  // Ablauf pruefen
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false, error: 'API key expired' };
  }

  // Plan pruefen (nur Business hat API-Zugang)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plans(feature_flags)')
    .eq('account_id', keyData.account_id)
    .in('status', ['active', 'trialing'])
    .maybeSingle();

  const featureFlags = (subscription?.plans as { feature_flags?: { api_access?: boolean } } | null)?.feature_flags;
  if (!featureFlags?.api_access) {
    return { valid: false, error: 'API access requires Business plan' };
  }

  // Last used aktualisieren (fire and forget)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)
    .then(() => {});

  return {
    valid: true,
    accountId: keyData.account_id,
    scopes: keyData.scopes || [],
  };
}

/**
 * Rate Limit fuer API pruefen
 */
export async function checkApiRateLimit(accountId: string): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}> {
  const result = await checkRateLimit('api', `api:${accountId}`);
  
  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : 3600,
  };
}

/**
 * Standard API Error Response
 */
export function apiError(code: string, message: string, status: number, details?: unknown) {
  return Response.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

/**
 * Prueft ob der API Key einen bestimmten Scope hat
 */
export function hasScope(scopes: string[], required: string): boolean {
  return scopes.includes(required) || scopes.includes('*');
}
