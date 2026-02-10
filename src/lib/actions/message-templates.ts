'use server';

import { createActionClient } from '@/lib/supabase/server';
import type { ActionResult } from './types';
import { ErrorMessages } from './types';
import { sanitizeText } from '@/lib/validations/sanitize';
import { revalidatePath } from 'next/cache';

// =============================================================================
// Typen
// =============================================================================

export interface MessageTemplate {
  id: string;
  account_id: string;
  title: string;
  content: string;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// =============================================================================
// Vorlagen laden
// =============================================================================

export async function getMessageTemplates(
  accountId: string
): Promise<ActionResult<MessageTemplate[]>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Account-Ownership pruefen: User muss Owner oder Teammitglied sein
    const { data: account } = await supabase
      .from('accounts')
      .select('id, owner_id')
      .eq('id', accountId)
      .is('deleted_at', null)
      .single();

    if (!account) {
      return { success: false, error: 'Account nicht gefunden', code: 'NOT_FOUND' };
    }

    // Pruefen ob User Owner ist oder Teammitglied des Accounts
    if (account.owner_id !== user.id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('account_id', accountId)
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!teamMember) {
        return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
      }
    }

    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('account_id', accountId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getMessageTemplates] Fehler:', error);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getMessageTemplates] Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Vorlage erstellen
// =============================================================================

export async function createMessageTemplate(
  accountId: string,
  title: string,
  content: string
): Promise<ActionResult<MessageTemplate>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Account-Ownership pruefen
    const { data: account } = await supabase
      .from('accounts')
      .select('id, owner_id')
      .eq('id', accountId)
      .is('deleted_at', null)
      .single();

    if (!account) {
      return { success: false, error: 'Account nicht gefunden', code: 'NOT_FOUND' };
    }

    if (account.owner_id !== user.id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('account_id', accountId)
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!teamMember) {
        return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
      }
    }

    // Validieren
    const sanitizedTitle = sanitizeText(title);
    const sanitizedContent = sanitizeText(content);

    if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
      return { success: false, error: 'Titel darf nicht leer sein', code: 'VALIDATION_ERROR' };
    }

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return { success: false, error: 'Inhalt darf nicht leer sein', code: 'VALIDATION_ERROR' };
    }

    if (sanitizedTitle.length > 100) {
      return { success: false, error: 'Titel zu lang (max. 100 Zeichen)', code: 'VALIDATION_ERROR' };
    }

    if (sanitizedContent.length > 5000) {
      return { success: false, error: 'Inhalt zu lang (max. 5.000 Zeichen)', code: 'VALIDATION_ERROR' };
    }

    // Maximale Anzahl pruefen (max 20 Vorlagen pro Account)
    const { count } = await supabase
      .from('message_templates')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if ((count ?? 0) >= 20) {
      return { success: false, error: 'Maximale Anzahl an Vorlagen erreicht (20)', code: 'VALIDATION_ERROR' };
    }

    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        account_id: accountId,
        title: sanitizedTitle.trim(),
        content: sanitizedContent.trim(),
        sort_order: (count ?? 0) + 1,
      })
      .select()
      .single();

    if (error) {
      console.error('[createMessageTemplate] Fehler:', error);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    revalidatePath('/seller/konto');
    return { success: true, data };
  } catch (error) {
    console.error('[createMessageTemplate] Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Vorlage aktualisieren
// =============================================================================

export async function updateMessageTemplate(
  templateId: string,
  title: string,
  content: string
): Promise<ActionResult<MessageTemplate>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Ownership-Pruefung: Template muss zu einem Account des Users gehoeren
    const { data: template } = await supabase
      .from('message_templates')
      .select('id, account_id')
      .eq('id', templateId)
      .single();

    if (!template) {
      return { success: false, error: 'Vorlage nicht gefunden', code: 'NOT_FOUND' };
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('id, owner_id')
      .eq('id', template.account_id)
      .single();

    if (!account || account.owner_id !== user.id) {
      // Auch Teammitglieder pruefen
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('account_id', template.account_id)
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!teamMember) {
        return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
      }
    }

    const sanitizedTitle = sanitizeText(title);
    const sanitizedContent = sanitizeText(content);

    if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
      return { success: false, error: 'Titel darf nicht leer sein', code: 'VALIDATION_ERROR' };
    }

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return { success: false, error: 'Inhalt darf nicht leer sein', code: 'VALIDATION_ERROR' };
    }

    const { data, error } = await supabase
      .from('message_templates')
      .update({
        title: sanitizedTitle.trim(),
        content: sanitizedContent.trim(),
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('[updateMessageTemplate] Fehler:', error);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    revalidatePath('/seller/konto');
    return { success: true, data };
  } catch (error) {
    console.error('[updateMessageTemplate] Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Vorlage loeschen
// =============================================================================

export async function deleteMessageTemplate(
  templateId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Ownership-Pruefung: Template muss zu einem Account des Users gehoeren
    const { data: template } = await supabase
      .from('message_templates')
      .select('id, account_id')
      .eq('id', templateId)
      .single();

    if (!template) {
      return { success: false, error: 'Vorlage nicht gefunden', code: 'NOT_FOUND' };
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('id, owner_id')
      .eq('id', template.account_id)
      .single();

    if (!account || account.owner_id !== user.id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('account_id', template.account_id)
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!teamMember) {
        return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
      }
    }

    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('[deleteMessageTemplate] Fehler:', error);
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    revalidatePath('/seller/konto');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[deleteMessageTemplate] Fehler:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}
