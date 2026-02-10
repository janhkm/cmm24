'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';
import { sendListingApprovedEmail, sendListingRejectedEmail, sendAccountSuspendedEmail, sendAccountVerifiedEmail } from '@/lib/email/send';

// =============================================================================
// Types
// =============================================================================

export interface AdminAccount {
  id: string;
  owner_id: string;
  company_name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  address_city: string | null;
  address_country: string | null;
  is_verified: boolean;
  status: 'active' | 'suspended';
  suspended_reason: string | null;
  created_at: string;
  // Joined data
  owner_email: string;
  plan_slug: string;
  listing_count: number;
}

export interface AdminListing {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  status: string;
  year_built: number;
  condition: string;
  location_city: string;
  location_country: string;
  created_at: string;
  updated_at: string;
  // Joined data
  manufacturer_name: string;
  manufacturer_slug: string;
  account_id: string;
  company_name: string;
  media: { id: string; url: string; thumbnail_url: string | null }[];
}

export interface AdminManufacturer {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  listing_count: number;
  created_at: string;
}

export interface AdminStats {
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  verifiedAccounts: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalInquiries: number;
  newInquiriesThisWeek: number;
  newInquiriesThisMonth: number;
  // Plan distribution
  planDistribution: {
    plan: string;
    count: number;
    percentage: number;
  }[];
  // Top manufacturers
  topManufacturers: {
    id: string;
    name: string;
    count: number;
  }[];
  // Top locations
  topLocations: {
    city: string;
    country: string;
    count: number;
  }[];
  // Recent signups
  recentSignups: {
    id: string;
    companyName: string;
    planSlug: string;
    createdAt: string;
  }[];
}

// =============================================================================
// Helper: UUID-Validierung
// =============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

// =============================================================================
// Helper: Check if user is admin
// =============================================================================

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

// =============================================================================
// Account Management
// =============================================================================

/**
 * Get all accounts for admin view
 */
export async function getAdminAccounts(): Promise<ActionResult<AdminAccount[]>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  // Get accounts with owner email and subscription plan
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select(`
      id,
      owner_id,
      company_name,
      slug,
      logo_url,
      website,
      phone,
      address_city,
      address_country,
      is_verified,
      status,
      suspended_reason,
      created_at,
      profiles!accounts_owner_id_fkey(email),
      subscriptions(plans(slug))
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Get admin accounts error:', error);
    return { success: false, error: 'Fehler beim Laden der Accounts' };
  }
  
  // Get listing counts for each account
  const { data: listingCounts } = await supabase
    .from('listings')
    .select('account_id')
    .is('deleted_at', null);
  
  const countMap: Record<string, number> = {};
  (listingCounts || []).forEach((l) => {
    countMap[l.account_id] = (countMap[l.account_id] || 0) + 1;
  });
  
  const result: AdminAccount[] = (accounts || []).map((a) => ({
    id: a.id,
    owner_id: a.owner_id,
    company_name: a.company_name,
    slug: a.slug,
    logo_url: a.logo_url,
    website: a.website,
    phone: a.phone,
    address_city: a.address_city,
    address_country: a.address_country,
    is_verified: a.is_verified ?? false,
    status: (a.status as 'active' | 'suspended') ?? 'active',
    suspended_reason: a.suspended_reason,
    created_at: a.created_at ?? new Date().toISOString(),
    owner_email: (a.profiles as { email: string } | null)?.email || 'Unbekannt',
    plan_slug: (a.subscriptions as Array<{ plans: { slug: string } | null }> | null)?.[0]?.plans?.slug || 'free',
    listing_count: countMap[a.id] || 0,
  }));
  
  return { success: true, data: result };
}

/**
 * Verify an account
 */
export async function verifyAccount(accountId: string): Promise<ActionResult<void>> {
  if (!isValidUUID(accountId)) {
    return { success: false, error: 'Ungueltige Account-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  // Account-Details fuer E-Mail laden
  const { data: accountData } = await supabase
    .from('accounts')
    .select('company_name, owner_id, profiles!accounts_owner_id_fkey(email, full_name)')
    .eq('id', accountId)
    .single();
  
  const { error } = await supabase
    .from('accounts')
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', accountId);
  
  if (error) {
    console.error('Verify account error:', error);
    return { success: false, error: 'Fehler beim Verifizieren' };
  }
  
  // Verifizierungs-E-Mail senden
  if (accountData) {
    const profile = accountData.profiles as { email: string; full_name: string | null } | null;
    if (profile?.email) {
      sendAccountVerifiedEmail({
        to: profile.email,
        userName: profile.full_name?.split(' ')[0] || 'Nutzer',
        companyName: accountData.company_name,
      }).catch(err => {
        console.error('[verifyAccount] Failed to send verification email');
      });
    }
  }
  
  revalidatePath('/admin/accounts');
  return { success: true, data: undefined };
}

/**
 * Suspend an account
 */
export async function suspendAccount(accountId: string, reason: string): Promise<ActionResult<void>> {
  if (!isValidUUID(accountId)) {
    return { success: false, error: 'Ungueltige Account-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  if (!reason.trim()) {
    return { success: false, error: 'Bitte geben Sie einen Grund an' };
  }

  if (reason.length > 1000) {
    return { success: false, error: 'Grund ist zu lang (max. 1000 Zeichen)' };
  }
  
  const supabase = await createActionClient();
  
  // Account-Details fuer E-Mail laden
  const { data: accountData } = await supabase
    .from('accounts')
    .select('company_name, owner_id, profiles!accounts_owner_id_fkey(email, full_name)')
    .eq('id', accountId)
    .single();
  
  // Suspend account
  const { error: accountError } = await supabase
    .from('accounts')
    .update({ 
      status: 'suspended', 
      suspended_reason: reason,
      updated_at: new Date().toISOString() 
    })
    .eq('id', accountId);
  
  if (accountError) {
    console.error('Suspend account error:', accountError);
    return { success: false, error: 'Fehler beim Sperren' };
  }
  
  // Also deactivate all listings from this account
  await supabase
    .from('listings')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('account_id', accountId)
    .eq('status', 'active');
  
  // Sperrungs-E-Mail senden
  if (accountData) {
    const profile = accountData.profiles as { email: string; full_name: string | null } | null;
    if (profile?.email) {
      sendAccountSuspendedEmail({
        to: profile.email,
        userName: profile.full_name?.split(' ')[0] || 'Nutzer',
        companyName: accountData.company_name,
        reason: reason.trim(),
      }).catch(err => {
        console.error('[suspendAccount] Failed to send suspension email');
      });
    }
  }
  
  revalidatePath('/admin/accounts');
  return { success: true, data: undefined };
}

/**
 * Reactivate a suspended account
 */
export async function reactivateAccount(accountId: string): Promise<ActionResult<void>> {
  if (!isValidUUID(accountId)) {
    return { success: false, error: 'Ungueltige Account-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  const { error } = await supabase
    .from('accounts')
    .update({ 
      status: 'active', 
      suspended_reason: null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', accountId);
  
  if (error) {
    console.error('Reactivate account error:', error);
    return { success: false, error: 'Fehler beim Reaktivieren' };
  }
  
  revalidatePath('/admin/accounts');
  return { success: true, data: undefined };
}

// =============================================================================
// Listing Moderation
// =============================================================================

/**
 * Get listings for moderation
 */
export async function getAdminListings(status?: string): Promise<ActionResult<AdminListing[]>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  let query = supabase
    .from('listings')
    .select(`
      id,
      title,
      slug,
      price,
      currency,
      status,
      year_built,
      condition,
      location_city,
      location_country,
      created_at,
      updated_at,
      account_id,
      manufacturers(name, slug),
      accounts(company_name),
      listing_media(id, url, thumbnail_url, is_primary)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status as 'active' | 'draft' | 'pending_review' | 'sold' | 'archived');
  }
  
  const { data: listings, error } = await query.limit(100);
  
  if (error) {
    console.error('Get admin listings error:', error);
    return { success: false, error: 'Fehler beim Laden der Inserate' };
  }
  
  const result: AdminListing[] = (listings || []).map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    price: l.price,
    currency: l.currency || 'EUR',
    status: l.status ?? 'draft',
    year_built: l.year_built,
    condition: l.condition,
    location_city: l.location_city,
    location_country: l.location_country,
    created_at: l.created_at ?? new Date().toISOString(),
    updated_at: l.updated_at ?? new Date().toISOString(),
    manufacturer_name: (l.manufacturers as { name: string; slug: string } | null)?.name || 'Unbekannt',
    manufacturer_slug: (l.manufacturers as { name: string; slug: string } | null)?.slug || '',
    account_id: l.account_id,
    company_name: (l.accounts as { company_name: string } | null)?.company_name || 'Unbekannt',
    media: ((l.listing_media as Array<{ id: string; url: string; thumbnail_url: string | null; is_primary: boolean | null }>) || [])
      .filter((m) => m.is_primary)
      .concat((l.listing_media as Array<{ id: string; url: string; thumbnail_url: string | null; is_primary: boolean | null }>) || [])
      .slice(0, 1)
      .map((m) => ({
        id: m.id,
        url: m.url,
        thumbnail_url: m.thumbnail_url,
      })),
  }));
  
  return { success: true, data: result };
}

/**
 * Approve a listing
 */
export async function approveListing(listingId: string): Promise<ActionResult<void>> {
  if (!isValidUUID(listingId)) {
    return { success: false, error: 'Ungueltige Inserat-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  // Get listing details for email
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      slug,
      price,
      accounts(
        company_name,
        profiles(email, full_name)
      ),
      listing_media(url, is_primary)
    `)
    .eq('id', listingId)
    .single();
  
  const { error } = await supabase
    .from('listings')
    .update({ 
      status: 'active', 
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', listingId);
  
  if (error) {
    console.error('Approve listing error:', error);
    return { success: false, error: 'Fehler beim Freigeben' };
  }
  
  // Send approval email to seller
  if (listing) {
    const account = listing.accounts as { company_name: string; profiles: { email: string; full_name: string | null } | null } | null;
    const sellerEmail = account?.profiles?.email;
    const sellerName = account?.profiles?.full_name?.split(' ')[0] || 'Verkäufer';
    const media = listing.listing_media as { url: string; is_primary: boolean | null }[] | null;
    const primaryImage = media?.find(m => m.is_primary)?.url || media?.[0]?.url;
    
    const formattedPrice = listing.price 
      ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(listing.price / 100)
      : 'Preis auf Anfrage';
    
    if (sellerEmail) {
      sendListingApprovedEmail({
        to: sellerEmail,
        sellerName,
        listingTitle: listing.title,
        listingPrice: formattedPrice,
        listingImage: primaryImage,
        listingSlug: listing.slug,
      }).catch(err => {
        console.error('[approveListing] Failed to send approval email');
      });
    }
  }
  
  revalidatePath('/admin/moderation');
  return { success: true, data: undefined };
}

/**
 * Reject a listing
 */
export async function rejectListing(listingId: string, reason: string): Promise<ActionResult<void>> {
  if (!isValidUUID(listingId)) {
    return { success: false, error: 'Ungueltige Inserat-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  if (!reason.trim()) {
    return { success: false, error: 'Bitte geben Sie einen Ablehnungsgrund an' };
  }

  if (reason.length > 2000) {
    return { success: false, error: 'Ablehnungsgrund ist zu lang (max. 2000 Zeichen)' };
  }
  
  const supabase = await createActionClient();
  
  // Listing-Details fuer Email laden
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      slug,
      accounts(
        company_name,
        profiles(email, full_name)
      )
    `)
    .eq('id', listingId)
    .single();
  
  const { error } = await supabase
    .from('listings')
    .update({ 
      status: 'archived',
      rejection_reason: reason.trim(),
      rejected_at: new Date().toISOString(),
      rejected_by: admin.userId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', listingId);
  
  if (error) {
    console.error('[rejectListing] Error:', error);
    return { success: false, error: 'Fehler beim Ablehnen' };
  }
  
  // Ablehnungs-Benachrichtigung an Verkaeufer senden
  if (listing) {
    const account = listing.accounts as { company_name: string; profiles: { email: string; full_name: string | null } | null } | null;
    const sellerEmail = account?.profiles?.email;
    const sellerName = account?.profiles?.full_name?.split(' ')[0] || 'Verkaeufer';
    
    if (sellerEmail) {
      // In-App-Benachrichtigung erstellen
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', sellerEmail)
        .single();
      
      if (profile) {
        try {
          await supabase.rpc('create_notification', {
            p_user_id: profile.id,
            p_type: 'listing_rejected',
            p_title: 'Inserat abgelehnt',
            p_message: `Ihr Inserat "${listing.title}" wurde abgelehnt. Grund: ${reason.trim()}`,
            p_link: `/seller/inserate/${listingId}`,
            p_inquiry_id: undefined,
            p_listing_id: listingId,
            p_metadata: { reason: reason.trim() },
          });
        } catch {
          /* Notification-Fehler ignorieren */
        }
      }
      
      // Ablehnungs-E-Mail senden
      sendListingRejectedEmail({
        to: sellerEmail,
        sellerName,
        listingTitle: listing.title,
        rejectionReason: reason.trim(),
        listingId,
      }).catch(err => {
        console.error('[rejectListing] Failed to send rejection email');
      });
    }
  }
  
  revalidatePath('/admin/moderation');
  return { success: true, data: undefined };
}

// =============================================================================
// Manufacturer Management (Stammdaten)
// =============================================================================

/**
 * Get all manufacturers for admin
 */
export async function getAdminManufacturers(): Promise<ActionResult<AdminManufacturer[]>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  const { data: manufacturers, error } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Get manufacturers error:', error);
    return { success: false, error: 'Fehler beim Laden der Hersteller' };
  }
  
  // Get listing counts
  const { data: counts } = await supabase
    .from('listings')
    .select('manufacturer_id')
    .is('deleted_at', null);
  
  const countMap: Record<string, number> = {};
  (counts || []).forEach((l) => {
    countMap[l.manufacturer_id] = (countMap[l.manufacturer_id] || 0) + 1;
  });
  
  const result: AdminManufacturer[] = (manufacturers || []).map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    logo_url: m.logo_url,
    country: m.country,
    website: m.website,
    description: m.description,
    listing_count: countMap[m.id] || 0,
    created_at: m.created_at ?? new Date().toISOString(),
  }));
  
  return { success: true, data: result };
}

/**
 * Create a new manufacturer
 */
export async function createManufacturer(data: {
  name: string;
  slug: string;
  country?: string;
  website?: string;
  description?: string;
}): Promise<ActionResult<AdminManufacturer>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  if (!data.name.trim() || !data.slug.trim()) {
    return { success: false, error: 'Name und Slug sind erforderlich' };
  }

  // Slug-Format validieren (nur Kleinbuchstaben, Zahlen, Bindestriche)
  if (!/^[a-z0-9-]+$/.test(data.slug.trim().toLowerCase())) {
    return { success: false, error: 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' };
  }

  if (data.name.length > 200) {
    return { success: false, error: 'Name ist zu lang (max. 200 Zeichen)' };
  }

  if (data.description && data.description.length > 5000) {
    return { success: false, error: 'Beschreibung ist zu lang (max. 5000 Zeichen)' };
  }
  
  const supabase = await createActionClient();
  
  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      country: data.country?.trim() || null,
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Create manufacturer error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ein Hersteller mit diesem Slug existiert bereits' };
    }
    return { success: false, error: 'Fehler beim Erstellen' };
  }
  
  revalidatePath('/admin/stammdaten/hersteller');
  return { 
    success: true, 
    data: {
      id: manufacturer.id,
      name: manufacturer.name,
      slug: manufacturer.slug,
      logo_url: manufacturer.logo_url,
      country: manufacturer.country,
      website: manufacturer.website,
      description: manufacturer.description,
      listing_count: 0,
      created_at: manufacturer.created_at ?? new Date().toISOString(),
    }
  };
}

/**
 * Update a manufacturer
 */
export async function updateManufacturer(
  id: string, 
  data: {
    name?: string;
    slug?: string;
    country?: string;
    website?: string;
    description?: string;
  }
): Promise<ActionResult<void>> {
  if (!isValidUUID(id)) {
    return { success: false, error: 'Ungueltige Hersteller-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug.trim().toLowerCase())) {
    return { success: false, error: 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' };
  }

  if (data.name && data.name.length > 200) {
    return { success: false, error: 'Name ist zu lang (max. 200 Zeichen)' };
  }

  if (data.description && data.description.length > 5000) {
    return { success: false, error: 'Beschreibung ist zu lang (max. 5000 Zeichen)' };
  }
  
  const supabase = await createActionClient();
  
  const updateData: Record<string, any> = {};
  if (data.name) updateData.name = data.name.trim();
  if (data.slug) updateData.slug = data.slug.trim().toLowerCase();
  if (data.country !== undefined) updateData.country = data.country?.trim() || null;
  if (data.website !== undefined) updateData.website = data.website?.trim() || null;
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  
  const { error } = await supabase
    .from('manufacturers')
    .update(updateData)
    .eq('id', id);
  
  if (error) {
    console.error('Update manufacturer error:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
  
  revalidatePath('/admin/stammdaten/hersteller');
  return { success: true, data: undefined };
}

/**
 * Delete a manufacturer (only if no listings)
 */
export async function deleteManufacturer(id: string): Promise<ActionResult<void>> {
  if (!isValidUUID(id)) {
    return { success: false, error: 'Ungueltige Hersteller-ID' };
  }

  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  // Check if manufacturer has listings
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('manufacturer_id', id)
    .is('deleted_at', null);
  
  if (count && count > 0) {
    return { success: false, error: 'Hersteller hat noch Inserate und kann nicht gelöscht werden' };
  }
  
  const { error } = await supabase
    .from('manufacturers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Delete manufacturer error:', error);
    return { success: false, error: 'Fehler beim Löschen' };
  }
  
  revalidatePath('/admin/stammdaten/hersteller');
  return { success: true, data: undefined };
}

// =============================================================================
// Admin Dashboard Stats
// =============================================================================

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<ActionResult<AdminStats>> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  const supabase = await createActionClient();
  
  // Get account stats
  const { data: accounts } = await supabase
    .from('accounts')
    .select('status, is_verified')
    .is('deleted_at', null);
  
  const totalAccounts = accounts?.length || 0;
  const activeAccounts = accounts?.filter(a => a.status === 'active').length || 0;
  const suspendedAccounts = accounts?.filter(a => a.status === 'suspended').length || 0;
  const verifiedAccounts = accounts?.filter(a => a.is_verified).length || 0;
  
  // Get listing stats
  const { data: listings } = await supabase
    .from('listings')
    .select('status')
    .is('deleted_at', null);
  
  const totalListings = listings?.length || 0;
  const activeListings = listings?.filter(l => l.status === 'active').length || 0;
  const pendingListings = listings?.filter(l => l.status === 'pending_review').length || 0;
  const soldListings = listings?.filter(l => l.status === 'sold').length || 0;
  
  // Get inquiry stats
  const { count: totalInquiries } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true });
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  const { count: newInquiriesThisWeek } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());
  
  const { count: newInquiriesThisMonth } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneMonthAgo.toISOString());
  
  // Get plan distribution
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plans(slug)')
    .eq('status', 'active');
  
  const planCounts: Record<string, number> = { free: 0, starter: 0, business: 0 };
  
  // Count accounts with subscriptions
  subscriptions?.forEach(sub => {
    const planSlug = (sub.plans as { slug: string } | null)?.slug;
    if (planSlug && planCounts[planSlug] !== undefined) {
      planCounts[planSlug]++;
    }
  });
  
  // Accounts without active subscriptions are on free plan
  planCounts['free'] = Math.max(0, totalAccounts - (planCounts['starter'] || 0) - (planCounts['business'] || 0));
  
  const totalWithPlan = Object.values(planCounts).reduce((a, b) => a + b, 0);
  const planDistribution = [
    { plan: 'Free', count: planCounts['free'], percentage: totalWithPlan > 0 ? Math.round((planCounts['free'] / totalWithPlan) * 100) : 0 },
    { plan: 'Starter', count: planCounts['starter'], percentage: totalWithPlan > 0 ? Math.round((planCounts['starter'] / totalWithPlan) * 100) : 0 },
    { plan: 'Business', count: planCounts['business'], percentage: totalWithPlan > 0 ? Math.round((planCounts['business'] / totalWithPlan) * 100) : 0 },
  ];
  
  // Get top manufacturers
  const { data: manufacturerListings } = await supabase
    .from('listings')
    .select('manufacturer_id, manufacturers(id, name)')
    .eq('status', 'active')
    .is('deleted_at', null);
  
  const manufacturerCounts: Record<string, { id: string; name: string; count: number }> = {};
  manufacturerListings?.forEach(listing => {
    const mfr = listing.manufacturers as { id: string; name: string } | null;
    if (mfr) {
      if (!manufacturerCounts[mfr.id]) {
        manufacturerCounts[mfr.id] = { id: mfr.id, name: mfr.name, count: 0 };
      }
      manufacturerCounts[mfr.id].count++;
    }
  });
  
  const topManufacturers = Object.values(manufacturerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get top locations
  const { data: locationListings } = await supabase
    .from('listings')
    .select('location_city, location_country')
    .eq('status', 'active')
    .is('deleted_at', null);
  
  const locationCounts: Record<string, { city: string; country: string; count: number }> = {};
  locationListings?.forEach(listing => {
    if (listing.location_city && listing.location_country) {
      const key = `${listing.location_city}-${listing.location_country}`;
      if (!locationCounts[key]) {
        locationCounts[key] = { city: listing.location_city, country: listing.location_country, count: 0 };
      }
      locationCounts[key].count++;
    }
  });
  
  const topLocations = Object.values(locationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get recent signups
  const { data: recentAccountsData } = await supabase
    .from('accounts')
    .select(`
      id,
      company_name,
      created_at,
      subscriptions(plans(slug))
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);
  
  const recentSignups = (recentAccountsData || []).map(account => {
    const subs = account.subscriptions as { plans: { slug: string } | null }[] | null;
    const planSlug = subs?.[0]?.plans?.slug || 'free';
    return {
      id: account.id,
      companyName: account.company_name,
      planSlug,
      createdAt: account.created_at || '',
    };
  });
  
  return {
    success: true,
    data: {
      totalAccounts,
      activeAccounts,
      suspendedAccounts,
      verifiedAccounts,
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      totalInquiries: totalInquiries || 0,
      newInquiriesThisWeek: newInquiriesThisWeek || 0,
      newInquiriesThisMonth: newInquiriesThisMonth || 0,
      planDistribution,
      topManufacturers,
      topLocations,
      recentSignups,
    },
  };
}
