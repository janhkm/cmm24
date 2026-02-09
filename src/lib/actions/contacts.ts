'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { z } from 'zod';

// Note: 'contacts' and 'contact_activities' tables are added by migration 20240101000015
// Type assertions are used until types are regenerated after migration runs

// Types (until Supabase types are regenerated)
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost';
export type ActivityType = 'note' | 'call' | 'email_sent' | 'email_received' | 'meeting' | 'inquiry' | 'status_change';

export interface Contact {
  id: string;
  account_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  mobile: string | null;
  company_name: string | null;
  job_title: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  lead_score: number;
  lead_status: LeadStatus;
  tags: string[];
  source: string | null;
  last_contact_at: string | null;
  next_follow_up: string | null;
  notes: string | null;
  total_inquiries: number;
  total_value: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactActivity {
  id: string;
  contact_id: string;
  account_id: string;
  user_id: string | null;
  activity_type: ActivityType;
  title: string | null;
  description: string | null;
  inquiry_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContactWithActivities extends Contact {
  activities: ContactActivity[];
}

// Validation Schemas
const createContactSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  companyName: z.string().max(200).optional(),
  jobTitle: z.string().max(100).optional(),
  addressStreet: z.string().max(200).optional(),
  addressCity: z.string().max(100).optional(),
  addressPostalCode: z.string().max(20).optional(),
  addressCountry: z.string().max(2).optional(),
  leadStatus: z.enum(['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost']).optional(),
  leadScore: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
  nextFollowUp: z.string().optional(),
});

const createActivitySchema = z.object({
  contactId: z.string().uuid(),
  activityType: z.enum(['note', 'call', 'email_sent', 'email_received', 'meeting', 'inquiry', 'status_change']),
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  inquiryId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateContactData = z.infer<typeof createContactSchema>;
export type CreateActivityData = z.infer<typeof createActivitySchema>;

/**
 * Helper: Get current user's account
 */
async function getMyAccount() {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  return account;
}

/**
 * Helper: Check if user has CRM access
 */
async function hasCrmAccess(): Promise<boolean> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) return false;
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plans(feature_flags)')
    .eq('account_id', account.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .maybeSingle();
  
  const featureFlags = (subscription?.plans as { feature_flags?: { crm_access?: boolean } } | null)?.feature_flags;
  return featureFlags?.crm_access ?? false;
}

// =============================================
// CONTACT CRUD OPERATIONS
// =============================================

/**
 * Get all contacts for the current user
 */
export async function getContacts(options?: {
  search?: string;
  status?: LeadStatus;
  tags?: string[];
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ contacts: Contact[]; total: number }>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  // Check CRM access
  const hasAccess = await hasCrmAccess();
  if (!hasAccess) {
    return { success: false, error: 'CRM-Zugang nicht verfügbar. Bitte upgraden Sie auf Business.', code: 'FORBIDDEN' };
  }
  
  // Type assertion needed until migrations run and types are regenerated
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('account_id', account.id)
    .is('deleted_at', null)
    .order('last_contact_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  // Search filter (escaped gegen Query-Injection)
  if (options?.search) {
    const { escapeFilterValue } = await import('@/lib/validations/escape');
    const safe = escapeFilterValue(options.search);
    const searchTerm = `%${safe}%`;
    query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},company_name.ilike.${searchTerm}`);
  }
  
  // Status filter
  if (options?.status) {
    query = query.eq('lead_status', options.status);
  }
  
  // Tags filter
  if (options?.tags && options.tags.length > 0) {
    query = query.contains('tags', options.tags);
  }
  
  // Pagination
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);
  
  const { data: contacts, error, count } = await query;
  
  if (error) {
    console.error('[getContacts] Error:', error);
    return { success: false, error: 'Fehler beim Laden der Kontakte', code: 'SERVER_ERROR' };
  }
  
  return { 
    success: true, 
    data: { 
      contacts: (contacts || []) as Contact[], 
      total: count || 0 
    } 
  };
}

/**
 * Get a single contact with activities
 */
export async function getContact(contactId: string): Promise<ActionResult<ContactWithActivities>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const hasAccess = await hasCrmAccess();
  if (!hasAccess) {
    return { success: false, error: 'CRM-Zugang nicht verfügbar', code: 'FORBIDDEN' };
  }
  
  // Get contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('account_id', account.id)
    .is('deleted_at', null)
    .single();
  
  if (contactError || !contact) {
    return { success: false, error: 'Kontakt nicht gefunden', code: 'NOT_FOUND' };
  }
  
  // Get activities
  const { data: activities, error: activitiesError } = await supabase
    .from('contact_activities')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (activitiesError) {
    console.error('[getContact] Activities error:', activitiesError);
  }
  
  return { 
    success: true, 
    data: {
      ...(contact as Contact),
      activities: (activities || []) as ContactActivity[],
    }
  };
}

/**
 * Create a new contact
 */
export async function createContact(data: CreateContactData): Promise<ActionResult<Contact>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const hasAccess = await hasCrmAccess();
  if (!hasAccess) {
    return { success: false, error: 'CRM-Zugang nicht verfügbar', code: 'FORBIDDEN' };
  }
  
  // Validate input
  const validated = createContactSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Ungültige Daten', code: 'VALIDATION_ERROR' };
  }
  
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      account_id: account.id,
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      email: data.email,
      phone: data.phone || null,
      mobile: data.mobile || null,
      company_name: data.companyName || null,
      job_title: data.jobTitle || null,
      address_street: data.addressStreet || null,
      address_city: data.addressCity || null,
      address_postal_code: data.addressPostalCode || null,
      address_country: data.addressCountry || null,
      lead_status: data.leadStatus || 'new',
      lead_score: data.leadScore || 0,
      tags: data.tags || [],
      source: data.source || 'manual',
      notes: data.notes || null,
      next_follow_up: data.nextFollowUp || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('[createContact] Error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ein Kontakt mit dieser E-Mail existiert bereits', code: 'CONFLICT' };
    }
    return { success: false, error: 'Fehler beim Erstellen des Kontakts', code: 'SERVER_ERROR' };
  }
  
  revalidatePath('/seller/kontakte');
  return { success: true, data: contact as Contact };
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: string, 
  data: Partial<CreateContactData>
): Promise<ActionResult<Contact>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('contacts')
    .select('id, account_id, lead_status')
    .eq('id', contactId)
    .eq('account_id', account.id)
    .is('deleted_at', null)
    .single();
  
  if (!existing) {
    return { success: false, error: 'Kontakt nicht gefunden', code: 'NOT_FOUND' };
  }
  
  const updateData: Record<string, unknown> = {};
  
  if (data.firstName !== undefined) updateData.first_name = data.firstName || null;
  if (data.lastName !== undefined) updateData.last_name = data.lastName || null;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.mobile !== undefined) updateData.mobile = data.mobile || null;
  if (data.companyName !== undefined) updateData.company_name = data.companyName || null;
  if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle || null;
  if (data.addressStreet !== undefined) updateData.address_street = data.addressStreet || null;
  if (data.addressCity !== undefined) updateData.address_city = data.addressCity || null;
  if (data.addressPostalCode !== undefined) updateData.address_postal_code = data.addressPostalCode || null;
  if (data.addressCountry !== undefined) updateData.address_country = data.addressCountry || null;
  if (data.leadStatus !== undefined) updateData.lead_status = data.leadStatus;
  if (data.leadScore !== undefined) updateData.lead_score = data.leadScore;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.nextFollowUp !== undefined) updateData.next_follow_up = data.nextFollowUp || null;
  
  const { data: contact, error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', contactId)
    .select()
    .single();
  
  if (error) {
    console.error('[updateContact] Error:', error);
    return { success: false, error: 'Fehler beim Aktualisieren', code: 'SERVER_ERROR' };
  }
  
  // Log status change as activity
  if (data.leadStatus && data.leadStatus !== existing.lead_status) {
    await supabase.from('contact_activities').insert({
      contact_id: contactId,
      account_id: account.id,
      activity_type: 'status_change',
      title: `Status geändert: ${existing.lead_status} → ${data.leadStatus}`,
      metadata: { from: existing.lead_status, to: data.leadStatus },
    });
  }
  
  revalidatePath('/seller/kontakte');
  revalidatePath(`/seller/kontakte/${contactId}`);
  return { success: true, data: contact as Contact };
}

/**
 * Delete a contact (soft delete)
 */
export async function deleteContact(contactId: string): Promise<ActionResult<void>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const { error } = await supabase
    .from('contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contactId)
    .eq('account_id', account.id);
  
  if (error) {
    console.error('[deleteContact] Error:', error);
    return { success: false, error: 'Fehler beim Löschen', code: 'SERVER_ERROR' };
  }
  
  revalidatePath('/seller/kontakte');
  return { success: true };
}

// =============================================
// ACTIVITY OPERATIONS
// =============================================

/**
 * Add an activity to a contact
 */
export async function addActivity(data: CreateActivityData): Promise<ActionResult<ContactActivity>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!account || !user) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  // Validate input
  const validated = createActivitySchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Ungültige Daten', code: 'VALIDATION_ERROR' };
  }
  
  // Verify contact ownership
  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', data.contactId)
    .eq('account_id', account.id)
    .is('deleted_at', null)
    .single();
  
  if (!contact) {
    return { success: false, error: 'Kontakt nicht gefunden', code: 'NOT_FOUND' };
  }
  
  const { data: activity, error } = await supabase
    .from('contact_activities')
    .insert({
      contact_id: data.contactId,
      account_id: account.id,
      user_id: user.id,
      activity_type: data.activityType,
      title: data.title || null,
      description: data.description || null,
      inquiry_id: data.inquiryId || null,
      metadata: (data.metadata || {}) as any,
    })
    .select()
    .single();
  
  if (error) {
    console.error('[addActivity] Error:', error);
    return { success: false, error: 'Fehler beim Hinzufügen der Aktivität', code: 'SERVER_ERROR' };
  }
  
  // Update last_contact_at on contact
  await supabase
    .from('contacts')
    .update({ last_contact_at: new Date().toISOString() })
    .eq('id', data.contactId);
  
  revalidatePath(`/seller/kontakte/${data.contactId}`);
  return { success: true, data: activity as ContactActivity };
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: string): Promise<ActionResult<void>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const { error } = await supabase
    .from('contact_activities')
    .delete()
    .eq('id', activityId)
    .eq('account_id', account.id);
  
  if (error) {
    console.error('[deleteActivity] Error:', error);
    return { success: false, error: 'Fehler beim Löschen', code: 'SERVER_ERROR' };
  }
  
  return { success: true };
}

// =============================================
// STATISTICS & UTILITIES
// =============================================

/**
 * Get contact statistics
 */
export async function getContactStats(): Promise<ActionResult<{
  total: number;
  byStatus: Record<LeadStatus, number>;
  newThisMonth: number;
  avgLeadScore: number;
}>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const hasAccess = await hasCrmAccess();
  if (!hasAccess) {
    return { success: false, error: 'CRM-Zugang nicht verfügbar', code: 'FORBIDDEN' };
  }
  
  // Get total and by status
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('lead_status, lead_score, created_at')
    .eq('account_id', account.id)
    .is('deleted_at', null);
  
  if (error) {
    console.error('[getContactStats] Error:', error);
    return { success: false, error: 'Fehler beim Laden der Statistiken', code: 'SERVER_ERROR' };
  }
  
  const total = contacts?.length || 0;
  const byStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let newThisMonth = 0;
  let totalScore = 0;
  
  for (const contact of contacts || []) {
    const status = contact.lead_status as LeadStatus;
    byStatus[status] = (byStatus[status] || 0) + 1;
    totalScore += contact.lead_score || 0;
    
    if (contact.created_at && new Date(contact.created_at) >= startOfMonth) {
      newThisMonth++;
    }
  }
  
  return {
    success: true,
    data: {
      total,
      byStatus,
      newThisMonth,
      avgLeadScore: total > 0 ? Math.round(totalScore / total) : 0,
    },
  };
}

/**
 * Get all unique tags used by contacts
 */
export async function getContactTags(): Promise<ActionResult<string[]>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('tags')
    .eq('account_id', account.id)
    .is('deleted_at', null);
  
  if (error) {
    console.error('[getContactTags] Error:', error);
    return { success: false, error: 'Fehler beim Laden der Tags', code: 'SERVER_ERROR' };
  }
  
  const allTags = new Set<string>();
  for (const contact of contacts || []) {
    for (const tag of contact.tags || []) {
      allTags.add(tag);
    }
  }
  
  return { success: true, data: Array.from(allTags).sort() };
}

/**
 * Get contact inquiries
 */
export async function getContactInquiries(contactId: string): Promise<ActionResult<unknown[]>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Nicht autorisiert', code: 'UNAUTHORIZED' };
  }
  
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select(`
      id,
      message,
      status,
      value,
      created_at,
      listings(id, title, slug)
    `)
    .eq('contact_id', contactId)
    .eq('account_id', account.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[getContactInquiries] Error:', error);
    return { success: false, error: 'Fehler beim Laden der Anfragen', code: 'SERVER_ERROR' };
  }
  
  return { success: true, data: inquiries || [] };
}
