'use server';

/**
 * Server Action fuer Verkaeufer-Account-Erstellung.
 * Ausgelagert aus der Client-Component, da inline 'use server' in Client-Components nicht erlaubt ist.
 */

import { createActionClient } from '@/lib/supabase/server';

export async function createSellerAccount(companyName: string, phone?: string) {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht angemeldet' };
  }
  
  // Pruefen ob schon ein Account existiert
  const { data: existing } = await supabase
    .from('accounts')
    .select('id')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  if (existing) {
    return { success: true, data: { accountId: existing.id, alreadyExists: true } };
  }
  
  // Slug generieren
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Account via RPC erstellen (SECURITY DEFINER)
  const { data: accountId, error } = await (supabase as any)
    .rpc('create_user_account', {
      p_user_id: user.id,
      p_company_name: companyName,
      p_slug: slug || null,
      p_phone: phone || null,
    });
  
  if (error) {
    console.error('[createSellerAccount] Error:', error);
    return { success: false, error: 'Fehler beim Erstellen des Verkaeuferkontos' };
  }
  
  return { success: true, data: { accountId, alreadyExists: false } };
}
