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
