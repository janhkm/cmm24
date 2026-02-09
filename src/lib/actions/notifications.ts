'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { sendSubscriptionExpiringEmail as sendSubscriptionExpiringEmailFn } from '@/lib/email/send';

// =============================================================================
// Types
// =============================================================================

export type NotificationType =
  | 'new_inquiry'
  | 'inquiry_replied'
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_expiring'
  | 'subscription_renewed'
  | 'subscription_expiring'
  | 'payment_failed'
  | 'welcome'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  inquiry_id: string | null;
  listing_id: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  inquiryId?: string;
  listingId?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Get Notifications
// =============================================================================

/**
 * Get notifications for the current user
 */
export async function getNotifications(options?: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<ActionResult<Notification[]>> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: 'Fehler beim Laden der Benachrichtigungen' };
  }
  
  return {
    success: true,
    data: (data || []).map((n) => ({
      id: n.id,
      user_id: n.user_id,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      link: n.link,
      inquiry_id: n.inquiry_id,
      listing_id: n.listing_id,
      metadata: (n.metadata as Record<string, unknown>) || {},
      is_read: n.is_read ?? false,
      read_at: n.read_at,
      created_at: n.created_at ?? new Date().toISOString(),
    })),
  };
}

// =============================================================================
// Get Unread Count
// =============================================================================

/**
 * Get count of unread notifications
 */
export async function getUnreadNotificationCount(): Promise<ActionResult<number>> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .is('deleted_at', null);
  
  if (error) {
    console.error('Get unread count error:', error);
    return { success: false, error: 'Fehler beim Laden' };
  }
  
  return { success: true, data: count || 0 };
}

// =============================================================================
// Mark as Read
// =============================================================================

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult<void>> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Mark as read error:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
  
  return { success: true, data: undefined };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult<void>> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .is('deleted_at', null);
  
  if (error) {
    console.error('Mark all as read error:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
  
  revalidatePath('/seller');
  return { success: true, data: undefined };
}

// =============================================================================
// Delete Notification
// =============================================================================

/**
 * Soft delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<ActionResult<void>> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: 'Fehler beim Löschen' };
  }
  
  return { success: true, data: undefined };
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<ActionResult<void>> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('deleted_at', null);
  
  if (error) {
    console.error('Clear all notifications error:', error);
    return { success: false, error: 'Fehler beim Löschen' };
  }
  
  revalidatePath('/seller');
  return { success: true, data: undefined };
}

// =============================================================================
// Create Notification (Server-side utility)
// =============================================================================

/**
 * Create a notification using the database function
 * This bypasses RLS using SECURITY DEFINER
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<ActionResult<string>> {
  const supabase = await createActionClient();
  
  const { data, error } = await supabase.rpc('create_notification', {
    p_user_id: params.userId,
    p_type: params.type,
    p_title: params.title,
    p_message: params.message,
    p_link: params.link,
    p_inquiry_id: params.inquiryId,
    p_listing_id: params.listingId,
    p_metadata: params.metadata as unknown as undefined,
  });
  
  if (error) {
    console.error('Create notification error:', error);
    return { success: false, error: 'Fehler beim Erstellen der Benachrichtigung' };
  }
  
  return { success: true, data: data as string };
}

// =============================================================================
// Notification Helpers for common scenarios
// =============================================================================

/**
 * Send welcome notification to new user
 */
export async function sendWelcomeNotification(userId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'welcome',
    title: 'Willkommen bei CMM24!',
    message: 'Ihr Konto wurde erfolgreich erstellt. Entdecken Sie jetzt alle Funktionen.',
    link: '/seller',
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(userId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'payment_failed',
    title: 'Zahlung fehlgeschlagen',
    message: 'Die letzte Zahlung konnte nicht verarbeitet werden. Bitte aktualisieren Sie Ihre Zahlungsmethode.',
    link: '/seller/abo',
  });
}

/**
 * Send subscription expiring notification (In-App + E-Mail)
 */
export async function sendSubscriptionExpiringNotification(
  userId: string,
  daysLeft: number
): Promise<void> {
  // In-App-Notification
  await createNotification({
    userId,
    type: 'subscription_expiring',
    title: 'Abo läuft bald ab',
    message: `Ihr Abonnement läuft in ${daysLeft} Tagen ab. Erneuern Sie jetzt, um alle Funktionen zu behalten.`,
    link: '/seller/abo',
    metadata: { daysLeft },
  });
  
  // Zusaetzlich E-Mail senden
  const supabase = await createActionClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();
  
  if (profile?.email) {
    // Plan-Details ermitteln
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    
    let planName = 'Premium';
    let expiresAt = '';
    
    if (account) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('current_period_end, plans(name)')
        .eq('account_id', account.id)
        .maybeSingle();
      
      if (subscription) {
        planName = (subscription.plans as { name: string } | null)?.name || 'Premium';
        if (subscription.current_period_end) {
          expiresAt = new Date(subscription.current_period_end).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          });
        }
      }
    }
    
    sendSubscriptionExpiringEmailFn({
      to: profile.email,
      userName: profile.full_name?.split(' ')[0] || 'Nutzer',
      planName,
      daysLeft,
      expiresAt: expiresAt || `in ${daysLeft} Tagen`,
    }).catch(err => {
      console.error('[sendSubscriptionExpiringNotification] Email failed:', err);
    });
  }
}
