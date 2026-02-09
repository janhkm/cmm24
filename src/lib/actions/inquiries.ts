'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/supabase';
import type { ActionResult } from './types';
import { ErrorMessages } from './types';
import { sendNewInquiryEmail, sendInquiryConfirmationEmail } from '@/lib/email/send';
import { checkRateLimit, getRateLimitMessage } from '@/lib/rate-limit';
import { inquirySchema } from '@/lib/validations/inquiry';
import { sanitizeText } from '@/lib/validations/sanitize';

type Inquiry = Database['public']['Tables']['inquiries']['Row'];
type InquiryStatus = Database['public']['Enums']['inquiry_status'];

interface InquiryWithListing extends Inquiry {
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
  } | null;
}

/**
 * Helper: Get current user's account ID
 */
async function getMyAccountId(): Promise<string | null> {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  return account?.id || null;
}

/**
 * Get all inquiries for the current user's account
 */
export async function getMyInquiries(): Promise<ActionResult<InquiryWithListing[]>> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'UNAUTHORIZED' };
    }
    
    // Get all listings for this account first
    const { data: listings } = await supabase
      .from('listings')
      .select('id')
      .eq('account_id', accountId)
      .is('deleted_at', null);
    
    if (!listings || listings.length === 0) {
      return { success: true, data: [] };
    }
    
    const listingIds = listings.map(l => l.id);
    
    // Get inquiries for these listings
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        listings(id, title, slug, price)
      `)
      .in('listing_id', listingIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[getMyInquiries] Error:', error);
      return { success: false, error: 'Fehler beim Laden der Anfragen', code: 'SERVER_ERROR' };
    }
    
    const inquiries: InquiryWithListing[] = (data || []).map(d => ({
      ...d,
      listing: d.listings as InquiryWithListing['listing'],
    }));
    
    return { success: true, data: inquiries };
  } catch (error) {
    console.error('[getMyInquiries] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get a single inquiry by ID
 */
export async function getInquiry(id: string): Promise<ActionResult<InquiryWithListing>> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        listings!inner(id, title, slug, price, account_id)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    // Verify ownership via listing
    const listingData = data.listings as { id: string; title: string; slug: string; price: number | null; account_id: string };
    if (listingData.account_id !== accountId) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    return { 
      success: true, 
      data: {
        ...data,
        listing: {
          id: listingData.id,
          title: listingData.title,
          slug: listingData.slug,
          price: listingData.price,
        },
      },
    };
  } catch (error) {
    console.error('[getInquiry] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Update inquiry status (for pipeline)
 */
export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Verify ownership via listing
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('id, listing_id, listings!inner(account_id)')
      .eq('id', id)
      .single();
    
    if (!inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const listingData = inquiry.listings as { account_id: string };
    if (listingData.account_id !== accountId) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('[updateInquiryStatus] Error:', error);
      return { success: false, error: 'Fehler beim Aktualisieren', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/anfragen');
    revalidatePath(`/seller/anfragen/${id}`);
    return { success: true };
  } catch (error) {
    console.error('[updateInquiryStatus] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Update inquiry notes
 */
export async function updateInquiryNotes(id: string, notes: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Verify ownership via listing
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('id, listing_id, listings!inner(account_id)')
      .eq('id', id)
      .single();
    
    if (!inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const listingData = inquiry.listings as { account_id: string };
    if (listingData.account_id !== accountId) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const { error } = await supabase
      .from('inquiries')
      .update({ notes })
      .eq('id', id);
    
    if (error) {
      console.error('[updateInquiryNotes] Error:', error);
      return { success: false, error: 'Fehler beim Speichern der Notizen', code: 'SERVER_ERROR' };
    }
    
    revalidatePath(`/seller/anfragen/${id}`);
    return { success: true };
  } catch (error) {
    console.error('[updateInquiryNotes] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Mark inquiry as read (changes status from 'new' to 'contacted' if still new)
 * Note: The schema doesn't have a separate read_at column - we use status to indicate read state
 */
export async function markInquiryAsRead(id: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Verify ownership via listing
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('id, status, listings!inner(account_id)')
      .eq('id', id)
      .single();
    
    if (!inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const listingData = inquiry.listings as { account_id: string };
    if (listingData.account_id !== accountId) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    // Note: We don't have a read_at field - marking as read is implicit
    // when user views the inquiry. Status change is tracked separately.
    // For now, this is a no-op but kept for API compatibility.
    
    revalidatePath('/seller/anfragen');
    return { success: true };
  } catch (error) {
    console.error('[markInquiryAsRead] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get unread inquiry count for dashboard badge
 * Note: We consider 'new' status as unread
 */
export async function getUnreadInquiryCount(): Promise<ActionResult<number>> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'UNAUTHORIZED' };
    }
    
    // Get listing IDs for this account
    const { data: listings } = await supabase
      .from('listings')
      .select('id')
      .eq('account_id', accountId)
      .is('deleted_at', null);
    
    if (!listings || listings.length === 0) {
      return { success: true, data: 0 };
    }
    
    const listingIds = listings.map(l => l.id);
    
    // Count inquiries with 'new' status as unread
    const { count, error } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .in('listing_id', listingIds)
      .eq('status', 'new')
      .is('deleted_at', null);
    
    if (error) {
      console.error('[getUnreadInquiryCount] Error:', error);
      return { success: false, error: 'Fehler beim Laden', code: 'SERVER_ERROR' };
    }
    
    return { success: true, data: count || 0 };
  } catch (error) {
    console.error('[getUnreadInquiryCount] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Delete inquiry (soft delete)
 */
export async function deleteInquiry(id: string): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    // Verify ownership via listing
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('id, listings!inner(account_id)')
      .eq('id', id)
      .single();
    
    if (!inquiry) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const listingData = inquiry.listings as { account_id: string };
    if (listingData.account_id !== accountId) {
      return { success: false, error: ErrorMessages.INQUIRY_NOT_FOUND, code: 'NOT_FOUND' };
    }
    
    const { error } = await supabase
      .from('inquiries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('[deleteInquiry] Error:', error);
      return { success: false, error: 'Fehler beim Löschen der Anfrage', code: 'SERVER_ERROR' };
    }
    
    revalidatePath('/seller/anfragen');
    return { success: true };
  } catch (error) {
    console.error('[deleteInquiry] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get inquiries grouped by status (for pipeline view)
 */
export async function getInquiriesByStatus(): Promise<ActionResult<Record<InquiryStatus, InquiryWithListing[]>>> {
  try {
    const result = await getMyInquiries();
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error, code: result.code };
    }
    
    const grouped: Record<InquiryStatus, InquiryWithListing[]> = {
      new: [],
      contacted: [],
      offer_sent: [],
      won: [],
      lost: [],
    };
    
    result.data.forEach(inquiry => {
      const status = inquiry.status || 'new';
      if (grouped[status]) {
        grouped[status].push(inquiry);
      }
    });
    
    return { success: true, data: grouped };
  } catch (error) {
    console.error('[getInquiriesByStatus] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================
// PUBLIC INQUIRY CREATION (for visitors)
// =============================================

interface CreateInquiryData {
  listingId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactCompany?: string;
  message: string;
}

/**
 * Create a new inquiry (public - can be called by anyone)
 * Also creates/links a contact if the seller has CRM access (Business plan)
 */
export async function createInquiry(data: CreateInquiryData): Promise<ActionResult<Inquiry>> {
  try {
    // Rate Limit pruefen
    const rateLimit = await checkRateLimit('inquiry');
    if (!rateLimit.success) {
      return { success: false, error: getRateLimitMessage('inquiry'), code: 'RATE_LIMITED' };
    }

    // Input validieren
    const parsed = inquirySchema.safeParse({
      name: data.contactName,
      email: data.contactEmail,
      phone: data.contactPhone,
      company: data.contactCompany,
      message: data.message,
      listingId: data.listingId,
    });
    
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError || 'Ungueltige Eingabe', code: 'VALIDATION_ERROR' };
    }
    
    // Sanitize
    data.contactName = sanitizeText(data.contactName);
    data.message = sanitizeText(data.message);
    if (data.contactCompany) data.contactCompany = sanitizeText(data.contactCompany);

    const supabase = await createActionClient();
    
    // Get the listing with seller details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        id, 
        title, 
        slug,
        price,
        account_id, 
        status,
        accounts(
          id,
          company_name,
          owner_id,
          profiles(email, full_name)
        ),
        listing_media(url, is_primary)
      `)
      .eq('id', data.listingId)
      .single();
    
    if (listingError || !listing) {
      console.error('[createInquiry] Listing not found:', listingError);
      return { success: false, error: 'Inserat nicht gefunden', code: 'NOT_FOUND' };
    }
    
    if (listing.status !== 'active') {
      return { success: false, error: 'Dieses Inserat ist nicht mehr verfügbar', code: 'FORBIDDEN' };
    }
    
    // Extract seller info
    const account = listing.accounts as { id: string; company_name: string; owner_id: string; profiles: { email: string; full_name: string | null } | null } | null;
    const sellerEmail = account?.profiles?.email;
    const sellerName = account?.profiles?.full_name?.split(' ')[0] || 'Verkäufer';
    const sellerCompany = account?.company_name || 'Unbekannt';
    
    // Get primary image
    const media = listing.listing_media as { url: string; is_primary: boolean | null }[] | null;
    const primaryImage = media?.find(m => m.is_primary)?.url || media?.[0]?.url;
    
    // Check if seller has CRM access and create/link contact
    let contactId: string | null = null;
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plans(feature_flags)')
      .eq('account_id', listing.account_id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle();
    
    const featureFlags = (subscription?.plans as { feature_flags?: { crm_access?: boolean } } | null)?.feature_flags;
    const hasCrmAccess = featureFlags?.crm_access ?? false;
    
    if (hasCrmAccess) {
      // Try to find or create contact (type assertion needed until migrations run)
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('account_id', listing.account_id)
        .eq('email', data.contactEmail)
        .is('deleted_at', null)
        .maybeSingle();
      
      if (existingContact) {
        contactId = existingContact.id;
      } else {
        // Parse name into first/last
        const nameParts = data.contactName.trim().split(' ');
        const firstName = nameParts[0] || null;
        const lastName = nameParts.slice(1).join(' ') || null;
        
        // Create new contact
        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            account_id: listing.account_id,
            email: data.contactEmail,
            first_name: firstName,
            last_name: lastName,
            company_name: data.contactCompany || null,
            phone: data.contactPhone || null,
            source: 'inquiry',
            lead_status: 'new',
          })
          .select('id')
          .single();
        
        if (!contactError && newContact) {
          contactId = newContact.id;
        }
      }
    }
    
    // Kaeufer-Profil ermitteln (falls eingeloggt)
    let buyerProfileId: string | null = null;
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      buyerProfileId = currentUser.id;
    }
    
    // Create the inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        listing_id: data.listingId,
        account_id: listing.account_id,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        contact_company: data.contactCompany || null,
        message: data.message,
        status: 'new',
        source: 'listing',
        contact_id: contactId,
        buyer_profile_id: buyerProfileId,
      })
      .select()
      .single();
    
    if (inquiryError) {
      console.error('[createInquiry] Error:', inquiryError);
      return { success: false, error: 'Fehler beim Senden der Anfrage', code: 'SERVER_ERROR' };
    }
    
    // If we have a contact, create an activity
    if (contactId) {
      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        account_id: listing.account_id,
        activity_type: 'inquiry',
        title: `Anfrage zu "${listing.title}"`,
        description: data.message.substring(0, 500),
        inquiry_id: inquiry.id,
      });
      
      // Update contact stats
      await supabase
        .from('contacts')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', contactId);
    }
    
    // Format price for emails
    const formattedPrice = listing.price 
      ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(listing.price / 100)
      : 'Preis auf Anfrage';
    
    // Send notification email to seller (fire and forget)
    if (sellerEmail) {
      sendNewInquiryEmail({
        to: sellerEmail,
        sellerName,
        listingTitle: listing.title,
        listingPrice: formattedPrice,
        listingImage: primaryImage,
        listingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com'}/maschinen/${listing.slug}`,
        buyerName: data.contactName,
        buyerEmail: data.contactEmail,
        buyerPhone: data.contactPhone,
        buyerCompany: data.contactCompany,
        message: data.message,
        inquiryId: inquiry.id,
      }).catch(err => {
        console.error('[createInquiry] Failed to send seller notification:', err);
      });
    }
    
    // Send confirmation email to buyer (fire and forget)
    sendInquiryConfirmationEmail({
      to: data.contactEmail,
      buyerName: data.contactName.split(' ')[0] || data.contactName,
      listingTitle: listing.title,
      listingPrice: formattedPrice,
      listingImage: primaryImage,
      listingSlug: listing.slug,
      sellerCompany,
    }).catch(err => {
      console.error('[createInquiry] Failed to send buyer confirmation:', err);
    });
    
    return { success: true, data: inquiry };
  } catch (error) {
    console.error('[createInquiry] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

// =============================================
// BUYER INQUIRY ACTIONS (fuer Kaeufer-Dashboard)
// =============================================

interface BuyerInquiry extends Inquiry {
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
    status: string;
    manufacturer_name: string;
    primary_image: string | null;
  } | null;
}

/**
 * Alle vom aktuellen Kaeufer gesendeten Anfragen
 */
export async function getMyBuyerInquiries(): Promise<ActionResult<BuyerInquiry[]>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        listings(id, title, slug, price, status, 
          manufacturers(name),
          listing_media(url, thumbnail_url, is_primary)
        )
      `)
      .eq('buyer_profile_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[getMyBuyerInquiries] Error:', error);
      return { success: false, error: 'Fehler beim Laden der Anfragen', code: 'SERVER_ERROR' };
    }
    
    const inquiries: BuyerInquiry[] = (data || []).map(d => {
      const listing = d.listings as {
        id: string; title: string; slug: string; price: number | null; status: string;
        manufacturers: { name: string } | null;
        listing_media: { url: string; thumbnail_url: string | null; is_primary: boolean | null }[] | null;
      } | null;
      
      const primaryImage = listing?.listing_media?.find(m => m.is_primary)?.thumbnail_url
        || listing?.listing_media?.find(m => m.is_primary)?.url
        || listing?.listing_media?.[0]?.thumbnail_url
        || listing?.listing_media?.[0]?.url
        || null;
      
      return {
        ...d,
        listing: listing ? {
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          price: listing.price,
          status: listing.status,
          manufacturer_name: listing.manufacturers?.name || 'Unbekannt',
          primary_image: primaryImage,
        } : null,
      };
    });
    
    return { success: true, data: inquiries };
  } catch (error) {
    console.error('[getMyBuyerInquiries] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Bestehende Anfragen mit Kaeufer-Profil verknuepfen (nach Login/Registrierung)
 */
export async function linkInquiriesToBuyer(): Promise<ActionResult<{ linked: number }>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const { data: linkedCount, error } = await supabase
      .rpc('link_inquiries_to_buyer', {
        p_profile_id: user.id,
        p_email: user.email,
      });
    
    if (error) {
      console.error('[linkInquiriesToBuyer] Error:', error);
      return { success: false, error: 'Fehler beim Verknuepfen', code: 'SERVER_ERROR' };
    }
    
    return { success: true, data: { linked: linkedCount || 0 } };
  } catch (error) {
    console.error('[linkInquiriesToBuyer] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Kaeufer-Dashboard Stats
 */
export async function getBuyerStats(): Promise<ActionResult<{
  totalInquiries: number;
  pendingInquiries: number;
  respondedInquiries: number;
}>> {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: ErrorMessages.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, status')
      .eq('buyer_profile_id', user.id)
      .is('deleted_at', null);
    
    if (error) {
      console.error('[getBuyerStats] Error:', error);
      return { success: false, error: 'Fehler beim Laden', code: 'SERVER_ERROR' };
    }
    
    const inquiries = data || [];
    
    return {
      success: true,
      data: {
        totalInquiries: inquiries.length,
        pendingInquiries: inquiries.filter(i => i.status === 'new').length,
        respondedInquiries: inquiries.filter(i => ['contacted', 'offer_sent'].includes(i.status || '')).length,
      },
    };
  } catch (error) {
    console.error('[getBuyerStats] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}
