'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { sendAutoReplyEmail } from '@/lib/email/send';

// =============================================================================
// Types
// =============================================================================

export interface AutoReplySettings {
  id: string;
  account_id: string;
  is_enabled: boolean;
  subject: string;
  message: string;
  delay_minutes: number;
  respect_working_hours: boolean;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  include_listing_details: boolean;
  include_signature: boolean;
  signature: string | null;
  total_sent: number;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutoReplyQueueItem {
  id: string;
  account_id: string;
  inquiry_id: string;
  recipient_email: string;
  recipient_name: string;
  listing_id: string | null;
  listing_title: string | null;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  scheduled_for: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface UpdateAutoReplySettingsParams {
  is_enabled?: boolean;
  subject?: string;
  message?: string;
  delay_minutes?: number;
  respect_working_hours?: boolean;
  working_hours_start?: string;
  working_hours_end?: string;
  working_days?: number[];
  include_listing_details?: boolean;
  include_signature?: boolean;
  signature?: string | null;
}

// =============================================================================
// Helper: Get current user's account
// =============================================================================

async function getMyAccount() {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('id, company_name')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  return account;
}

// =============================================================================
// Helper: Check if user has auto-reply feature
// =============================================================================

async function hasAutoReplyFeature(): Promise<boolean> {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      status,
      plans (
        feature_flags
      )
    `)
    .eq('account_id', (
      await supabase
        .from('accounts')
        .select('id')
        .eq('owner_id', user.id)
        .is('deleted_at', null)
        .single()
    ).data?.id || '')
    .eq('status', 'active')
    .maybeSingle();
  
  if (!subscription) return false;
  
  const featureFlags = (subscription.plans as { feature_flags: Record<string, boolean> } | null)?.feature_flags;
  return featureFlags?.auto_reply === true;
}

// =============================================================================
// Get Auto-Reply Settings
// =============================================================================

/**
 * Get auto-reply settings for current user's account
 */
export async function getAutoReplySettings(): Promise<ActionResult<AutoReplySettings | null>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const supabase = await createActionClient();
  
  const { data, error } = await supabase
    .from('auto_reply_settings')
    .select('*')
    .eq('account_id', account.id)
    .maybeSingle();
  
  if (error) {
    console.error('Get auto-reply settings error:', error);
    return { success: false, error: 'Fehler beim Laden der Einstellungen' };
  }
  
  if (!data) {
    return { success: true, data: null };
  }
  
  return {
    success: true,
    data: {
      ...data,
      working_days: data.working_days || [1, 2, 3, 4, 5],
      total_sent: data.total_sent || 0,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    } as AutoReplySettings,
  };
}

// =============================================================================
// Create/Update Auto-Reply Settings
// =============================================================================

/**
 * Update auto-reply settings (creates if not exists)
 */
export async function updateAutoReplySettings(
  params: UpdateAutoReplySettingsParams
): Promise<ActionResult<AutoReplySettings>> {
  // Check feature access
  const hasFeature = await hasAutoReplyFeature();
  if (!hasFeature) {
    return { 
      success: false, 
      error: 'Auto-Reply ist nur im Business-Plan verfügbar' 
    };
  }
  
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const supabase = await createActionClient();
  
  // Check if settings exist
  const { data: existing } = await supabase
    .from('auto_reply_settings')
    .select('id')
    .eq('account_id', account.id)
    .maybeSingle();
  
  const updateData = {
    ...params,
    updated_at: new Date().toISOString(),
  };
  
  let result;
  
  if (existing) {
    // Update existing
    result = await supabase
      .from('auto_reply_settings')
      .update(updateData)
      .eq('account_id', account.id)
      .select()
      .single();
  } else {
    // Create new with defaults
    result = await supabase
      .from('auto_reply_settings')
      .insert({
        account_id: account.id,
        subject: params.subject || 'Vielen Dank für Ihre Anfrage',
        message: params.message || 'Vielen Dank für Ihr Interesse an unserem Angebot. Wir werden uns schnellstmöglich bei Ihnen melden.',
        ...params,
      })
      .select()
      .single();
  }
  
  if (result.error) {
    console.error('Update auto-reply settings error:', result.error);
    return { success: false, error: 'Fehler beim Speichern' };
  }
  
  revalidatePath('/seller/emails');
  
  return {
    success: true,
    data: {
      ...result.data,
      working_days: result.data.working_days || [1, 2, 3, 4, 5],
      total_sent: result.data.total_sent || 0,
      created_at: result.data.created_at || new Date().toISOString(),
      updated_at: result.data.updated_at || new Date().toISOString(),
    } as AutoReplySettings,
  };
}

// =============================================================================
// Toggle Auto-Reply
// =============================================================================

/**
 * Quick toggle for enabling/disabling auto-reply
 */
export async function toggleAutoReply(enabled: boolean): Promise<ActionResult<void>> {
  const result = await updateAutoReplySettings({ is_enabled: enabled });
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  return { success: true, data: undefined };
}

// =============================================================================
// Get Auto-Reply Queue
// =============================================================================

/**
 * Get recent auto-reply queue items for current account
 */
export async function getAutoReplyQueue(options?: {
  limit?: number;
  status?: 'pending' | 'sent' | 'failed' | 'cancelled';
}): Promise<ActionResult<AutoReplyQueueItem[]>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const supabase = await createActionClient();
  
  let query = supabase
    .from('auto_reply_queue')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 50);
  
  if (options?.status) {
    query = query.eq('status', options.status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Get auto-reply queue error:', error);
    return { success: false, error: 'Fehler beim Laden' };
  }
  
  return {
    success: true,
    data: (data || []).map((item) => ({
      ...item,
      status: item.status as AutoReplyQueueItem['status'],
      created_at: item.created_at || new Date().toISOString(),
    })),
  };
}

// =============================================================================
// Cancel Queued Auto-Reply
// =============================================================================

/**
 * Cancel a pending auto-reply
 */
export async function cancelAutoReply(queueId: string): Promise<ActionResult<void>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const supabase = await createActionClient();
  
  const { error } = await supabase
    .from('auto_reply_queue')
    .update({ status: 'cancelled' })
    .eq('id', queueId)
    .eq('account_id', account.id)
    .eq('status', 'pending');
  
  if (error) {
    console.error('Cancel auto-reply error:', error);
    return { success: false, error: 'Fehler beim Abbrechen' };
  }
  
  revalidatePath('/seller/emails');
  return { success: true, data: undefined };
}

// =============================================================================
// Process Auto-Reply Queue (called by cron/edge function)
// =============================================================================

/**
 * Process pending auto-replies
 * This should be called by a cron job or edge function
 */
export async function processAutoReplyQueue(): Promise<ActionResult<{
  processed: number;
  sent: number;
  failed: number;
}>> {
  const supabase = await createActionClient();
  
  // Get pending auto-replies
  const { data: pendingReplies, error: fetchError } = await supabase
    .rpc('get_pending_auto_replies', { p_limit: 10 });
  
  if (fetchError) {
    console.error('Fetch pending auto-replies error:', fetchError);
    return { success: false, error: 'Fehler beim Laden der Queue' };
  }
  
  if (!pendingReplies || pendingReplies.length === 0) {
    return { success: true, data: { processed: 0, sent: 0, failed: 0 } };
  }
  
  let sent = 0;
  let failed = 0;
  
  for (const reply of pendingReplies) {
    try {
      // Build message with optional listing details
      let fullMessage = reply.message;
      
      if (reply.include_listing_details && reply.listing_title) {
        fullMessage += `\n\nAnfrage zu: ${reply.listing_title}`;
      }
      
      if (reply.include_signature && reply.signature) {
        fullMessage += `\n\n${reply.signature}`;
      }
      
      // Send email
      const emailResult = await sendAutoReplyEmail({
        to: reply.recipient_email,
        recipientName: reply.recipient_name,
        subject: reply.subject,
        message: fullMessage,
        listingTitle: reply.listing_title || undefined,
      });
      
      if (emailResult.success) {
        // Mark as sent
        await supabase.rpc('mark_auto_reply_sent', {
          p_queue_id: reply.queue_id,
          p_success: true,
        });
        sent++;
      } else {
        // Mark as failed
        await supabase.rpc('mark_auto_reply_sent', {
          p_queue_id: reply.queue_id,
          p_success: false,
          p_error_message: emailResult.error || 'Unknown error',
        });
        failed++;
      }
    } catch (error) {
      console.error('Process auto-reply error:', error);
      await supabase.rpc('mark_auto_reply_sent', {
        p_queue_id: reply.queue_id,
        p_success: false,
        p_error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      failed++;
    }
  }
  
  return {
    success: true,
    data: {
      processed: pendingReplies.length,
      sent,
      failed,
    },
  };
}

// =============================================================================
// Get Auto-Reply Statistics
// =============================================================================

/**
 * Get auto-reply statistics for dashboard
 */
export async function getAutoReplyStats(): Promise<ActionResult<{
  totalSent: number;
  lastSentAt: string | null;
  pendingCount: number;
  isEnabled: boolean;
}>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Nicht authentifiziert' };
  }
  
  const supabase = await createActionClient();
  
  // Get settings
  const { data: settings } = await supabase
    .from('auto_reply_settings')
    .select('is_enabled, total_sent, last_sent_at')
    .eq('account_id', account.id)
    .maybeSingle();
  
  // Get pending count
  const { count: pendingCount } = await supabase
    .from('auto_reply_queue')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', account.id)
    .eq('status', 'pending');
  
  return {
    success: true,
    data: {
      totalSent: settings?.total_sent || 0,
      lastSentAt: settings?.last_sent_at || null,
      pendingCount: pendingCount || 0,
      isEnabled: settings?.is_enabled || false,
    },
  };
}
