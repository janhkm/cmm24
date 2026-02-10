'use server';

import { createActionClient } from '@/lib/supabase/server';
import type { ActionResult } from './types';
import { ErrorMessages } from './types';
import { revalidatePath } from 'next/cache';

// =============================================================================
// Types
// =============================================================================

export interface NotificationPreferences {
  emailInquiries: boolean;
  emailMessages: boolean;
  emailListingUpdates: boolean;
  emailProductUpdates: boolean;
  emailNewsletter: boolean;
  emailMarketing: boolean;
}

// =============================================================================
// Benachrichtigungseinstellungen laden
// =============================================================================

export async function getNotificationPreferences(): Promise<ActionResult<NotificationPreferences>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[getNotificationPreferences] Error');
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    // Standardwerte wenn noch keine Praeferenzen gesetzt
    if (!data) {
      return {
        success: true,
        data: {
          emailInquiries: true,
          emailMessages: true,
          emailListingUpdates: true,
          emailProductUpdates: false,
          emailNewsletter: false,
          emailMarketing: false,
        },
      };
    }

    return {
      success: true,
      data: {
        emailInquiries: data.email_inquiries ?? true,
        emailMessages: data.email_messages ?? true,
        emailListingUpdates: data.email_listing_updates ?? true,
        emailProductUpdates: data.email_product_updates ?? false,
        emailNewsletter: data.email_newsletter ?? false,
        emailMarketing: data.email_marketing ?? false,
      },
    };
  } catch (error) {
    console.error('[getNotificationPreferences] Unexpected error');
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Benachrichtigungseinstellungen speichern
// =============================================================================

export async function updateNotificationPreferences(
  prefs: NotificationPreferences
): Promise<ActionResult<void>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    // Upsert: Erstellen oder aktualisieren
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        profile_id: user.id,
        email_inquiries: prefs.emailInquiries,
        email_messages: prefs.emailMessages,
        email_listing_updates: prefs.emailListingUpdates,
        email_product_updates: prefs.emailProductUpdates,
        email_newsletter: prefs.emailNewsletter,
        email_marketing: prefs.emailMarketing,
      }, {
        onConflict: 'profile_id',
      });

    if (error) {
      console.error('[updateNotificationPreferences] Error');
      return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
    }

    // Marketing-Praeferenz auch im Profil aktualisieren
    await supabase
      .from('profiles')
      .update({ accepted_marketing: prefs.emailMarketing || prefs.emailNewsletter })
      .eq('id', user.id);

    revalidatePath('/seller/konto');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[updateNotificationPreferences] Unexpected error');
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================================================
// Marketing komplett abbestellen (One-Click Unsubscribe fuer E-Mails)
// =============================================================================

export async function unsubscribeAll(): Promise<ActionResult<void>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }

    await supabase
      .from('notification_preferences')
      .upsert({
        profile_id: user.id,
        email_inquiries: true,  // Transaktionale E-Mails bleiben aktiv
        email_messages: true,   // Transaktionale E-Mails bleiben aktiv
        email_listing_updates: true, // Transaktionale E-Mails bleiben aktiv
        email_product_updates: false,
        email_newsletter: false,
        email_marketing: false,
      }, {
        onConflict: 'profile_id',
      });

    await supabase
      .from('profiles')
      .update({ accepted_marketing: false })
      .eq('id', user.id);

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[unsubscribeAll] Unexpected error');
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}
