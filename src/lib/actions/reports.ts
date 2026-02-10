'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { checkRateLimit, getRateLimitMessage } from '@/lib/rate-limit';

// ============================================
// Types
// ============================================

export interface AdminReport {
  id: string;
  listing_id: string;
  reporter_email: string;
  reason: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  listing_title: string;
  listing_slug: string;
  seller_name: string;
}

// ============================================
// Helper: Admin-Check
// ============================================

async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || !['admin', 'super_admin'].includes(profile.role || '')) {
    return null;
  }
  
  return { userId: user.id };
}

// ============================================
// Reports CRUD
// ============================================

/**
 * Alle Reports laden (fuer Admin)
 */
export async function getAdminReports(status?: string): Promise<ActionResult<AdminReport[]>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  let query = supabase
    .from('reports')
    .select(`
      *,
      listings(id, title, slug, accounts(company_name))
    `)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status as 'pending' | 'reviewed' | 'resolved' | 'dismissed');
  }
  
  const { data: reports, error } = await query.limit(100);
  
  if (error) {
    console.error('[getAdminReports] Error:', error);
    return { success: false, error: 'Fehler beim Laden der Reports' };
  }
  
  const result: AdminReport[] = (reports || []).map((r) => {
    const listing = r.listings as { id: string; title: string; slug: string; accounts: { company_name: string } | null } | null;
    return {
      id: r.id,
      listing_id: r.listing_id,
      reporter_email: r.reporter_email,
      reason: r.reason,
      description: r.description,
      status: r.status ?? 'pending',
      admin_notes: r.admin_notes,
      reviewed_by: r.reviewed_by,
      reviewed_at: r.reviewed_at,
      created_at: r.created_at ?? new Date().toISOString(),
      updated_at: r.updated_at ?? new Date().toISOString(),
      listing_title: listing?.title || 'Unbekannt',
      listing_slug: listing?.slug || '',
      seller_name: listing?.accounts?.company_name || 'Unbekannt',
    };
  });
  
  return { success: true, data: result };
}

/**
 * Report als geprueft markieren
 */
export async function reviewReport(
  reportId: string,
  action: 'resolved' | 'dismissed',
  adminNotes?: string
): Promise<ActionResult<void>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  const { error } = await supabase
    .from('reports')
    .update({
      status: action,
      admin_notes: adminNotes?.trim() || null,
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  
  if (error) {
    console.error('[reviewReport] Error:', error);
    return { success: false, error: 'Fehler beim Aktualisieren des Reports' };
  }
  
  // Wenn resolved: Listing archivieren
  if (action === 'resolved') {
    const { data: report } = await supabase
      .from('reports')
      .select('listing_id')
      .eq('id', reportId)
      .single();
    
    if (report) {
      await supabase
        .from('listings')
        .update({
          status: 'archived',
          rejection_reason: `Report: ${adminNotes || 'Verstoss gegen Richtlinien'}`,
          rejected_at: new Date().toISOString(),
          rejected_by: admin.userId,
        })
        .eq('id', report.listing_id);
    }
  }
  
  revalidatePath('/admin/reports');
  return { success: true, data: undefined };
}

/**
 * Report erstellen (oeffentlich - jeder kann melden)
 */
export async function createReport(data: {
  listingId: string;
  reporterEmail: string;
  reason: string;
  description?: string;
  acceptedPrivacy: boolean;
}): Promise<ActionResult<void>> {
  // Datenschutz-Einwilligung pruefen (DSGVO Art. 6 Abs. 1 lit. a)
  if (!data.acceptedPrivacy) {
    return { success: false, error: 'Bitte akzeptieren Sie die Datenschutzerklärung' };
  }

  // Rate Limiting
  const rateLimit = await checkRateLimit('report');
  if (!rateLimit.success) {
    return { success: false, error: getRateLimitMessage('report') };
  }

  // E-Mail-Format validieren
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.reporterEmail || !emailRegex.test(data.reporterEmail)) {
    return { success: false, error: 'Ungueltige E-Mail-Adresse' };
  }

  // Reason validieren
  const validReasons = ['spam', 'fake', 'inappropriate', 'duplicate', 'other'];
  if (!validReasons.includes(data.reason)) {
    return { success: false, error: 'Ungueltiger Meldegrund' };
  }

  // Beschreibung laengenbeschraenkt
  if (data.description && data.description.length > 2000) {
    return { success: false, error: 'Beschreibung zu lang (max. 2000 Zeichen)' };
  }

  const supabase = await createActionClient();
  
  // Pruefen ob Listing existiert
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', data.listingId)
    .eq('status', 'active')
    .single();
  
  if (!listing) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  const { error } = await supabase
    .from('reports')
    .insert({
      listing_id: data.listingId,
      reporter_email: data.reporterEmail,
      reason: data.reason as 'spam' | 'fake' | 'inappropriate' | 'duplicate' | 'other',
      description: data.description?.trim() || null,
      status: 'pending' as const,
    });
  
  if (error) {
    console.error('[createReport] Error:', error);
    return { success: false, error: 'Fehler beim Erstellen der Meldung' };
  }
  
  return { success: true, data: undefined };
}
