'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { createHash, randomBytes } from 'crypto';

// =============================================================================
// Types
// =============================================================================

export interface ApiKey {
  id: string;
  accountId: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  createdByName: string | null;
}

export interface ApiKeyUsageStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  avgResponseTime: number;
  topEndpoints: { endpoint: string; count: number }[];
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate a secure random API key
  const keyBytes = randomBytes(32);
  const key = `cmm_live_${keyBytes.toString('base64url')}`;
  
  // Hash for storage
  const hash = createHash('sha256').update(key).digest('hex');
  
  // Prefix for identification (first 12 chars after 'cmm_live_')
  const prefix = key.substring(0, 20);
  
  return { key, hash, prefix };
}

async function getCurrentUserAccount() {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('id, owner_id')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  if (!account) return null;
  
  // Get profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();
  
  return {
    userId: user.id,
    accountId: account.id,
    isOwner: account.owner_id === user.id,
    fullName: profile?.full_name || null,
  };
}

// =============================================================================
// Get API Keys
// =============================================================================

export async function getApiKeys(): Promise<ActionResult<ApiKey[]>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    const supabase = await createActionClient();
    
    const { data, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        account_id,
        name,
        key_prefix,
        permissions,
        last_used_at,
        expires_at,
        is_active,
        created_at
      `)
      .eq('account_id', userAccount.accountId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[getApiKeys] Error:', error);
      return { success: false, error: 'Fehler beim Laden der API-Keys' };
    }
    
    const keys: ApiKey[] = (data || []).map(k => {
      return {
        id: k.id,
        accountId: k.account_id,
        name: k.name,
        keyPrefix: k.key_prefix,
        permissions: k.permissions || ['read'],
        lastUsedAt: k.last_used_at,
        expiresAt: k.expires_at,
        isActive: k.is_active ?? true,
        createdAt: k.created_at || '',
        createdByName: null,
      };
    });
    
    return { success: true, data: keys };
  } catch (error) {
    console.error('[getApiKeys] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Create API Key
// =============================================================================

export async function createApiKey(params: {
  name: string;
  permissions: string[];
  expiresIn?: 'never' | '30d' | '90d' | '1y';
}): Promise<ActionResult<{ key: ApiKey; secretKey: string }>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!userAccount.isOwner) {
      return { success: false, error: 'Nur der Inhaber kann API-Keys erstellen' };
    }
    
    if (!params.name || params.name.length < 3) {
      return { success: false, error: 'Name muss mindestens 3 Zeichen haben' };
    }

    if (params.name.length > 100) {
      return { success: false, error: 'Name darf maximal 100 Zeichen haben' };
    }
    
    // Permissions gegen erlaubte Werte validieren
    const validPermissions = ['read', 'write', 'listings:read', 'listings:write', 'inquiries:read', 'inquiries:write', 'stats:read'];
    if (!Array.isArray(params.permissions) || params.permissions.length === 0) {
      return { success: false, error: 'Mindestens eine Berechtigung ist erforderlich' };
    }
    
    const invalidPermission = params.permissions.find(p => !validPermissions.includes(p));
    if (invalidPermission) {
      return { success: false, error: `Ungueltige Berechtigung: ${invalidPermission}` };
    }
    
    // Generate the API key
    const { key: secretKey, hash, prefix } = generateApiKey();
    
    // Calculate expiration
    let expiresAt: string | null = null;
    if (params.expiresIn && params.expiresIn !== 'never') {
      const now = new Date();
      switch (params.expiresIn) {
        case '30d':
          now.setDate(now.getDate() + 30);
          break;
        case '90d':
          now.setDate(now.getDate() + 90);
          break;
        case '1y':
          now.setFullYear(now.getFullYear() + 1);
          break;
      }
      expiresAt = now.toISOString();
    }
    
    const supabase = await createActionClient();
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        account_id: userAccount.accountId,
        name: params.name,
        key_hash: hash,
        key_prefix: prefix,
        permissions: params.permissions,
        expires_at: expiresAt,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[createApiKey] Error:', error);
      return { success: false, error: 'Fehler beim Erstellen des API-Keys' };
    }
    
    revalidatePath('/seller/api');
    
    return {
      success: true,
      data: {
        key: {
          id: data.id,
          accountId: data.account_id,
          name: data.name,
          keyPrefix: data.key_prefix,
          permissions: data.permissions || params.permissions,
          lastUsedAt: data.last_used_at,
          expiresAt: data.expires_at,
          isActive: data.is_active ?? true,
          createdAt: data.created_at || '',
          createdByName: userAccount.fullName,
        },
        secretKey, // Only returned once!
      },
    };
  } catch (error) {
    console.error('[createApiKey] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Revoke API Key
// =============================================================================

export async function revokeApiKey(keyId: string): Promise<ActionResult<void>> {
  try {
    // UUID-Validierung
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(keyId)) {
      return { success: false, error: 'Ungueltige Key-ID' };
    }

    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!userAccount.isOwner) {
      return { success: false, error: 'Nur der Inhaber kann API-Keys widerrufen' };
    }
    
    const supabase = await createActionClient();
    
    const { error } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: userAccount.userId,
      })
      .eq('id', keyId)
      .eq('account_id', userAccount.accountId);
    
    if (error) {
      console.error('[revokeApiKey] Error:', error);
      return { success: false, error: 'Fehler beim Widerrufen des API-Keys' };
    }
    
    revalidatePath('/seller/api');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[revokeApiKey] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Delete API Key
// =============================================================================

export async function deleteApiKey(keyId: string): Promise<ActionResult<void>> {
  try {
    // UUID-Validierung
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(keyId)) {
      return { success: false, error: 'Ungueltige Key-ID' };
    }

    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    if (!userAccount.isOwner) {
      return { success: false, error: 'Nur der Inhaber kann API-Keys löschen' };
    }
    
    const supabase = await createActionClient();
    
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('account_id', userAccount.accountId);
    
    if (error) {
      console.error('[deleteApiKey] Error:', error);
      return { success: false, error: 'Fehler beim Löschen des API-Keys' };
    }
    
    revalidatePath('/seller/api');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[deleteApiKey] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}

// =============================================================================
// Get API Key Usage Stats
// =============================================================================

export async function getApiKeyUsageStats(keyId?: string): Promise<ActionResult<ApiKeyUsageStats>> {
  try {
    const userAccount = await getCurrentUserAccount();
    if (!userAccount) {
      return { success: false, error: 'Nicht angemeldet' };
    }
    
    const supabase = await createActionClient();

    // API-Keys des Accounts laden
    const { data: keys } = await supabase
      .from('api_keys')
      .select('id')
      .eq('account_id', userAccount.accountId);

    const keyIds = keyId
      ? [keyId]
      : (keys || []).map(k => k.id);

    if (keyIds.length === 0) {
      return { success: true, data: { totalRequests: 0, requestsToday: 0, requestsThisMonth: 0, avgResponseTime: 0, topEndpoints: [] } };
    }

    // Usage-Statistiken aus api_key_usage Tabelle laden
    const { data: usage } = await supabase
      .from('api_key_usage')
      .select('endpoint, response_time_ms, created_at')
      .in('api_key_id', keyIds)
      .order('created_at', { ascending: false })
      .limit(10000);

    const allUsage = usage || [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const totalRequests = allUsage.length;
    const requestsToday = allUsage.filter(u => u.created_at && u.created_at >= todayStart).length;
    const requestsThisMonth = allUsage.filter(u => u.created_at && u.created_at >= monthStart).length;
    const responseTimes = allUsage.filter(u => u.response_time_ms).map(u => u.response_time_ms!);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    // Top-Endpoints zaehlen
    const endpointCounts = new Map<string, number>();
    allUsage.forEach(u => {
      endpointCounts.set(u.endpoint, (endpointCounts.get(u.endpoint) || 0) + 1);
    });
    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalRequests,
        requestsToday,
        requestsThisMonth,
        avgResponseTime,
        topEndpoints,
      },
    };
  } catch (error) {
    console.error('[getApiKeyUsageStats] Unexpected error:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
}
