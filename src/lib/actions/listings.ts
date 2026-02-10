'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/supabase';
import { checkRateLimit, getRateLimitMessage } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/validations/sanitize';
import { validateImageFile, validateDocumentFile } from '@/lib/storage/validate-file';
import { processImage } from '@/lib/storage/process-image';

type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];
type Listing = Database['public']['Tables']['listings']['Row'];
type ListingMedia = Database['public']['Tables']['listing_media']['Row'];

interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

interface CreateListingData {
  manufacturerId: string;
  modelNameCustom?: string;
  title: string;
  yearBuilt: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  price: number;
  priceNegotiable: boolean;
  measuringRangeX?: number;
  measuringRangeY?: number;
  measuringRangeZ?: number;
  accuracyUm?: string;
  software?: string;
  controller?: string;
  probeSystem?: string;
  locationCountry: string;
  locationCity: string;
  locationPostalCode: string;
  description: string;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .substring(0, 50);
}

/**
 * Get the current user's account
 */
async function getMyAccount() {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  return account;
}

/**
 * Check if user can create a new listing (based on plan limits)
 */
export async function canCreateListing(): Promise<ActionResult<{ canCreate: boolean; currentCount: number; limit: number }>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Kein Account gefunden' };
  }
  
  // Aktuelle Listing-Anzahl
  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', account.id)
    .in('status', ['draft', 'pending_review', 'active'])
    .is('deleted_at', null);
  
  // Plan-Limit ermitteln
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plans(listing_limit)')
    .eq('account_id', account.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .maybeSingle();
  
  const limit = (subscription?.plans as { listing_limit: number } | null)?.listing_limit ?? 1;
  const currentCount = count ?? 0;
  
  return {
    success: true,
    data: {
      canCreate: currentCount < limit,
      currentCount,
      limit,
    },
  };
}

/**
 * Create a new listing (as draft)
 */
export async function createListing(data: CreateListingData): Promise<ActionResult<Listing>> {
  // Email-Verifizierung pruefen
  const { requireVerifiedEmail } = await import('./types');
  const verifyError = await requireVerifiedEmail();
  if (verifyError) return { success: false, error: verifyError };

  // Rate Limit pruefen
  const rateLimit = await checkRateLimit('listingCreate');
  if (!rateLimit.success) {
    return { success: false, error: getRateLimitMessage('listingCreate') };
  }

  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Check plan limits
  const limitCheck = await canCreateListing();
  if (!limitCheck.data?.canCreate) {
    return { 
      success: false, 
      error: `Sie haben das Limit von ${limitCheck.data?.limit} Inseraten erreicht. Upgraden Sie Ihren Plan für mehr Inserate.` 
    };
  }
  
  // Input sanitieren
  data.title = sanitizeText(data.title);
  data.description = sanitizeText(data.description);
  if (data.modelNameCustom) data.modelNameCustom = sanitizeText(data.modelNameCustom);
  
  // Basis-Validierung
  if (data.title.length < 10) {
    return { success: false, error: 'Titel muss mindestens 10 Zeichen lang sein' };
  }
  if (data.description.length < 50) {
    return { success: false, error: 'Beschreibung muss mindestens 50 Zeichen lang sein' };
  }
  if (data.price <= 0) {
    return { success: false, error: 'Preis muss positiv sein' };
  }

  // Generate unique slug
  const baseSlug = generateSlug(data.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  
  const listingData: ListingInsert = {
    account_id: account.id,
    manufacturer_id: data.manufacturerId,
    model_name_custom: data.modelNameCustom || null,
    title: data.title,
    slug,
    year_built: data.yearBuilt,
    condition: data.condition,
    price: data.price,
    price_negotiable: data.priceNegotiable,
    measuring_range_x: data.measuringRangeX || null,
    measuring_range_y: data.measuringRangeY || null,
    measuring_range_z: data.measuringRangeZ || null,
    accuracy_um: data.accuracyUm || null,
    software: data.software || null,
    controller: data.controller || null,
    probe_system: data.probeSystem || null,
    location_country: data.locationCountry,
    location_city: data.locationCity,
    location_postal_code: data.locationPostalCode,
    description: data.description,
    status: 'draft',
  };
  
  const { data: listing, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single();
  
  if (error) {
    console.error('Create listing error:', error);
    return { success: false, error: 'Fehler beim Erstellen des Inserats' };
  }
  
  revalidatePath('/seller/inserate');
  return { success: true, data: listing };
}

/**
 * Update an existing listing
 */
export async function updateListing(
  listingId: string, 
  data: Partial<CreateListingData> & { _loadedAt?: string }
): Promise<ActionResult<Listing>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('listings')
    .select('id, account_id, status, updated_at')
    .eq('id', listingId)
    .single();
  
  if (!existing || existing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // Verkaufte Inserate koennen nicht mehr bearbeitet werden
  if (existing.status === 'sold') {
    return { success: false, error: 'Verkaufte Inserate können nicht bearbeitet werden' };
  }
  
  // Optimistic Locking: Pruefen ob zwischenzeitlich geaendert
  if (data._loadedAt && existing.updated_at) {
    const loadedTime = new Date(data._loadedAt).getTime();
    const serverTime = new Date(existing.updated_at).getTime();
    
    if (serverTime > loadedTime) {
      return { 
        success: false, 
        error: 'Das Inserat wurde zwischenzeitlich von jemand anderem geaendert. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
      };
    }
  }
  
  const updateData: ListingUpdate = {};
  
  if (data.manufacturerId !== undefined) updateData.manufacturer_id = data.manufacturerId;
  if (data.modelNameCustom !== undefined) updateData.model_name_custom = data.modelNameCustom || null;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.yearBuilt !== undefined) updateData.year_built = data.yearBuilt;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.priceNegotiable !== undefined) updateData.price_negotiable = data.priceNegotiable;
  if (data.measuringRangeX !== undefined) updateData.measuring_range_x = data.measuringRangeX || null;
  if (data.measuringRangeY !== undefined) updateData.measuring_range_y = data.measuringRangeY || null;
  if (data.measuringRangeZ !== undefined) updateData.measuring_range_z = data.measuringRangeZ || null;
  if (data.accuracyUm !== undefined) updateData.accuracy_um = data.accuracyUm || null;
  if (data.software !== undefined) updateData.software = data.software || null;
  if (data.controller !== undefined) updateData.controller = data.controller || null;
  if (data.probeSystem !== undefined) updateData.probe_system = data.probeSystem || null;
  if (data.locationCountry !== undefined) updateData.location_country = data.locationCountry;
  if (data.locationCity !== undefined) updateData.location_city = data.locationCity;
  if (data.locationPostalCode !== undefined) updateData.location_postal_code = data.locationPostalCode;
  if (data.description !== undefined) updateData.description = data.description;
  
  const { data: listing, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', listingId)
    .select()
    .single();
  
  if (error) {
    console.error('[updateListing] Error:', error);
    return { success: false, error: 'Fehler beim Aktualisieren des Inserats' };
  }
  
  revalidatePath('/seller/inserate');
  revalidatePath(`/seller/inserate/${listingId}`);
  // Auch die oeffentliche Detailseite aktualisieren
  if (listing.slug) {
    revalidatePath(`/maschinen/${listing.slug}`);
  }
  return { success: true, data: listing };
}

/**
 * Submit listing for review
 */
export async function submitListingForReview(listingId: string): Promise<ActionResult> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership and status
  const { data: existing } = await supabase
    .from('listings')
    .select('id, account_id, status')
    .eq('id', listingId)
    .single();
  
  if (!existing || existing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  if (existing.status !== 'draft') {
    return { success: false, error: 'Nur Entwürfe können zur Prüfung eingereicht werden' };
  }
  
  // Check if listing has at least one image
  const { count: mediaCount } = await supabase
    .from('listing_media')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('type', 'image');
  
  if (!mediaCount || mediaCount === 0) {
    return { success: false, error: 'Bitte laden Sie mindestens ein Bild hoch' };
  }
  
  const { error } = await supabase
    .from('listings')
    .update({ 
      status: 'pending_review',
      rejection_reason: null,
      rejected_at: null,
      rejected_by: null,
    })
    .eq('id', listingId);
  
  if (error) {
    console.error('Submit for review error:', error);
    return { success: false, error: 'Fehler beim Einreichen des Inserats' };
  }
  
  revalidatePath('/seller/inserate');
  return { success: true };
}

/**
 * Delete a listing (soft delete)
 */
export async function deleteListing(listingId: string): Promise<ActionResult> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('listings')
    .select('id, account_id')
    .eq('id', listingId)
    .single();
  
  if (!existing || existing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  const { error } = await supabase
    .from('listings')
    .update({ 
      deleted_at: new Date().toISOString(),
      status: 'archived',
    })
    .eq('id', listingId);
  
  if (error) {
    console.error('Delete listing error:', error);
    return { success: false, error: 'Fehler beim Löschen des Inserats' };
  }
  
  revalidatePath('/seller/inserate');
  return { success: true };
}

/**
 * Get a single listing by ID
 */
export async function getListing(listingId: string): Promise<ActionResult<Listing & { media: ListingMedia[] }>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(*)
    `)
    .eq('id', listingId)
    .single();
  
  if (error || !listing) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // Check if user can view this listing
  const isOwner = account && listing.account_id === account.id;
  const isPublic = listing.status === 'active' || listing.status === 'sold';
  
  if (!isOwner && !isPublic) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  return { 
    success: true, 
    data: {
      ...listing,
      media: listing.listing_media as ListingMedia[],
    },
  };
}

/**
 * Get all listings for the current user's account
 */
export async function getMyListings(): Promise<ActionResult<Listing[]>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(id, url, thumbnail_url, is_primary)
    `)
    .eq('account_id', account.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Get listings error:', error);
    return { success: false, error: 'Fehler beim Laden der Inserate' };
  }
  
  return { success: true, data: listings };
}

/**
 * Upload media to a listing
 */
export async function uploadListingMedia(
  listingId: string,
  file: File,
  type: 'image' | 'document' = 'image'
): Promise<ActionResult<ListingMedia>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id, account_id')
    .eq('id', listingId)
    .single();
  
  if (!listing || listing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // Datei mit Magic Bytes validieren
  const validation = type === 'image' 
    ? await validateImageFile(file)
    : await validateDocumentFile(file);
  
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Ungueltiges Dateiformat' };
  }
  
  // Unique base path fuer diese Datei
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const basePath = `${account.id}/${listingId}`;
  
  let mainUrl = '';
  let thumbnailUrl: string | null = null;
  
  if (type === 'image') {
    // Bild mit Sharp verarbeiten: Original + Thumbnail + Medium
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const processed = await processImage(buffer);
      
      // Alle 3 Versionen parallel hochladen
      const [originalUpload, thumbUpload, mediumUpload] = await Promise.all([
        supabase.storage.from('listing-images').upload(
          `${basePath}/original/${fileId}.webp`, processed.original,
          { contentType: 'image/webp', cacheControl: '31536000', upsert: false }
        ),
        supabase.storage.from('listing-images').upload(
          `${basePath}/thumbnails/${fileId}-thumb.webp`, processed.thumbnail,
          { contentType: 'image/webp', cacheControl: '31536000', upsert: false }
        ),
        supabase.storage.from('listing-images').upload(
          `${basePath}/thumbnails/${fileId}-medium.webp`, processed.medium,
          { contentType: 'image/webp', cacheControl: '31536000', upsert: false }
        ),
      ]);
      
      if (originalUpload.error) {
        console.error('[Upload] Original error:', originalUpload.error);
        return { success: false, error: 'Fehler beim Hochladen des Bildes' };
      }
      
      mainUrl = supabase.storage.from('listing-images').getPublicUrl(originalUpload.data.path).data.publicUrl;
      thumbnailUrl = thumbUpload.data
        ? supabase.storage.from('listing-images').getPublicUrl(thumbUpload.data.path).data.publicUrl
        : null;
    } catch (sharpError) {
      console.error('[Upload] Sharp processing error:', sharpError);
      // Fallback: Original ohne Processing hochladen
      const fallbackPath = `${basePath}/${fileId}.${file.name.split('.').pop()}`;
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from('listing-images')
        .upload(fallbackPath, file, { cacheControl: '31536000', upsert: false });
      
      if (fallbackError) {
        return { success: false, error: 'Fehler beim Hochladen der Datei' };
      }
      mainUrl = supabase.storage.from('listing-images').getPublicUrl(fallbackData.path).data.publicUrl;
    }
  } else {
    // Dokumente (PDF etc.) ohne Processing hochladen
    const docPath = `${basePath}/docs/${fileId}.${file.name.split('.').pop()}`;
    const { data: docData, error: docError } = await supabase.storage
      .from('listing-images')
      .upload(docPath, file, { cacheControl: '31536000', upsert: false });
    
    if (docError) {
      console.error('[Upload] Doc error:', docError);
      return { success: false, error: 'Fehler beim Hochladen der Datei' };
    }
    mainUrl = supabase.storage.from('listing-images').getPublicUrl(docData.path).data.publicUrl;
  }
  
  // Check if this is the first image (make it primary)
  const { count: existingCount } = await supabase
    .from('listing_media')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('type', 'image');
  
  const isPrimary = type === 'image' && (existingCount === 0 || existingCount === null);
  
  // Save to database
  const { data: media, error: dbError } = await supabase
    .from('listing_media')
    .insert({
      listing_id: listingId,
      type,
      url: mainUrl,
      thumbnail_url: thumbnailUrl,
      filename: file.name,
      size_bytes: file.size,
      mime_type: type === 'image' ? 'image/webp' : file.type,
      is_primary: isPrimary,
      sort_order: existingCount ?? 0,
    })
    .select()
    .single();
  
  if (dbError) {
    console.error('[Upload] DB error:', dbError);
    return { success: false, error: 'Fehler beim Speichern der Datei' };
  }
  
  revalidatePath(`/seller/inserate/${listingId}`);
  return { success: true, data: media };
}

/**
 * Delete media from a listing
 */
export async function deleteListingMedia(mediaId: string): Promise<ActionResult> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Get the media record and verify ownership
  const { data: media } = await supabase
    .from('listing_media')
    .select(`
      *,
      listings!inner(account_id)
    `)
    .eq('id', mediaId)
    .single();
  
  if (!media || (media.listings as { account_id: string }).account_id !== account.id) {
    return { success: false, error: 'Datei nicht gefunden' };
  }
  
  // Extract path from URL and delete from storage
  const url = new URL(media.url);
  const pathMatch = url.pathname.match(/listing-images\/(.+)/);
  if (pathMatch) {
    await supabase.storage.from('listing-images').remove([pathMatch[1]]);
  }
  
  // Delete from database
  const { error } = await supabase
    .from('listing_media')
    .delete()
    .eq('id', mediaId);
  
  if (error) {
    console.error('Delete media error:', error);
    return { success: false, error: 'Fehler beim Löschen der Datei' };
  }
  
  revalidatePath(`/seller/inserate/${media.listing_id}`);
  return { success: true };
}

/**
 * Toggle featured status for a listing (Business plan feature)
 */
export async function toggleListingFeatured(
  listingId: string,
  featured: boolean
): Promise<ActionResult<{ featured: boolean }>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, account_id, status, featured')
    .eq('id', listingId)
    .single();
  
  if (listingError || !listing || listing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // Only active listings can be featured
  if (listing.status !== 'active' && featured) {
    return { success: false, error: 'Nur aktive Inserate können hervorgehoben werden' };
  }
  
  // Check plan limits if trying to feature
  if (featured) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plans(feature_flags)')
      .eq('account_id', account.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle();
    
    const featureFlags = (subscription?.plans as { feature_flags?: { featured_per_month?: number } } | null)?.feature_flags;
    const featuredLimit = featureFlags?.featured_per_month ?? 0;
    
    if (featuredLimit === 0) {
      return { success: false, error: 'Ihr Plan erlaubt keine hervorgehobenen Inserate. Bitte upgraden Sie.' };
    }
    
    // Count currently featured listings
    const { count: featuredCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', account.id)
      .eq('featured', true)
      .eq('status', 'active')
      .is('deleted_at', null);
    
    if (featuredLimit !== -1 && (featuredCount || 0) >= featuredLimit) {
      return { 
        success: false, 
        error: `Sie können maximal ${featuredLimit} Inserat${featuredLimit === 1 ? '' : 'e'} hervorheben.` 
      };
    }
  }
  
  // Update featured status
  const { error: updateError } = await supabase
    .from('listings')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', listingId);
  
  if (updateError) {
    console.error('Toggle featured error:', updateError);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
  
  revalidatePath('/seller/inserate');
  return { success: true, data: { featured } };
}

/**
 * Get a public listing by slug (for public display)
 */
export async function getPublicListingBySlug(slug: string): Promise<ActionResult<PublicListing & {
  similar: PublicListing[];
}>> {
  const supabase = await createActionClient();
  
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(*),
      manufacturers(id, name, slug),
      accounts(id, company_name, slug, logo_url, is_verified, is_premium, phone, website, address_city, address_country, created_at)
    `)
    .eq('slug', slug)
    .in('status', ['active', 'sold'])
    .is('deleted_at', null)
    .single();
  
  if (error || !listing) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // View-Tracking wurde in den Client verlagert (/api/track/view)
  // um Doppelzaehlung (generateMetadata + Page), Bot-Traffic und fehlende
  // Deduplizierung zu beheben.

  // Verkäufer-Inserateanzahl ermitteln
  let sellerListingCount = 0;
  if (listing.account_id) {
    const { count: slCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', listing.account_id)
      .eq('status', 'active')
      .is('deleted_at', null);
    sellerListingCount = slCount || 0;
  }
  
  // Get similar listings (same manufacturer, excluding current)
  const { data: similarListings } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(id, url, thumbnail_url, is_primary, sort_order),
      manufacturers(id, name, slug),
      accounts(id, company_name, slug, logo_url, is_verified, is_premium)
    `)
    .eq('manufacturer_id', listing.manufacturer_id)
    .neq('id', listing.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(4);
  
  return { 
    success: true, 
    data: {
      ...listing,
      media: ((listing.listing_media as ListingMedia[]) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      manufacturer: listing.manufacturers as { id: string; name: string; slug: string } | null,
      account: listing.accounts ? {
        ...(listing.accounts as { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean; phone?: string; website?: string; address_city?: string; address_country?: string; created_at?: string }),
        listing_count: sellerListingCount,
      } : null,
      similar: (similarListings || []).map((l) => ({
        ...l,
        media: ((l.listing_media as ListingMedia[]) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        manufacturer: l.manufacturers as { id: string; name: string; slug: string } | null,
        account: l.accounts as { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean } | null,
      })),
    },
  };
}

// Public listing type for external use
export interface PublicListing extends Listing {
  media: ListingMedia[];
  manufacturer: { id: string; name: string; slug: string } | null;
  account?: { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean; listing_count?: number; phone?: string; website?: string; address_city?: string; address_country?: string; created_at?: string } | null;
}

export interface PublicListingFilters {
  search?: string;
  manufacturerId?: string;
  manufacturerSlug?: string;
  accountSlug?: string;
  condition?: 'new' | 'like_new' | 'good' | 'fair';
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  country?: string;
  featured?: boolean;
  status?: 'active' | 'sold';
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc';
}

/**
 * Get all public listings with advanced filtering (for listing page)
 */
export async function getPublicListings(options?: PublicListingFilters): Promise<ActionResult<{ 
  listings: PublicListing[];
  total: number;
}>> {
  const supabase = await createActionClient();
  
  let query = supabase
    .from('listings')
    .select(`
      *,
      listing_media(id, url, thumbnail_url, is_primary, sort_order),
      manufacturers(id, name, slug),
      accounts(id, company_name, slug, logo_url, is_verified, is_premium)
    `, { count: 'exact' })
    .is('deleted_at', null);
  
  // Default to active listings only
  if (options?.status) {
    query = query.eq('status', options.status);
  } else {
    query = query.eq('status', 'active');
  }
  
  // Volltextsuche ueber search_listings RPC (PostgreSQL FTS)
  // Wenn ein Suchbegriff vorhanden ist, wird die RPC statt ILIKE verwendet.
  if (options?.search) {
    const searchTerm = options.search.trim();
    
    if (searchTerm.length > 0) {
      // RPC aufrufen fuer Full-Text-Search mit Ranking
      const rpcParams: Record<string, unknown> = {
        p_search_term: searchTerm,
        p_limit: options?.limit ?? 24,
        p_offset: options?.offset ?? 0,
      };
      if (options?.manufacturerId) rpcParams.p_manufacturer_id = options.manufacturerId;
      if (options?.condition) rpcParams.p_condition = options.condition;
      if (options?.priceMin !== undefined) rpcParams.p_price_min = options.priceMin * 100;
      if (options?.priceMax !== undefined) rpcParams.p_price_max = options.priceMax * 100;
      if (options?.yearMin !== undefined) rpcParams.p_year_min = options.yearMin;
      if (options?.yearMax !== undefined) rpcParams.p_year_max = options.yearMax;
      if (options?.country) rpcParams.p_country = options.country;
      if (options?.featured) rpcParams.p_featured = true;
      if (options?.sortBy === 'price_asc') rpcParams.p_sort_by = 'price_asc';
      else if (options?.sortBy === 'price_desc') rpcParams.p_sort_by = 'price_desc';
      else if (options?.sortBy === 'year_desc') rpcParams.p_sort_by = 'year_desc';
      else rpcParams.p_sort_by = 'relevance';
      
      const { data: rpcResults, error: rpcError } = await supabase.rpc('search_listings', rpcParams);
      
      if (rpcError) {
        console.error('Search RPC error:', rpcError);
        return { success: false, error: 'Fehler bei der Suche' };
      }
      
      const rpcData = (rpcResults || []) as Array<Record<string, unknown>>;
      const totalCount = rpcData.length > 0 ? (rpcData[0].total_count as number) : 0;
      
      // IDs aus RPC-Ergebnis extrahieren und Media/Relationen nachladen
      const ids = rpcData.map((r) => r.id as string);
      
      if (ids.length === 0) {
        return { success: true, data: { listings: [], total: 0 } };
      }
      
      // Volle Listing-Daten mit Relationen laden
      const { data: fullListings, error: fullError } = await supabase
        .from('listings')
        .select(`
          *,
          listing_media(id, url, thumbnail_url, is_primary, sort_order),
          manufacturers(id, name, slug),
          accounts(id, company_name, slug, logo_url, is_verified, is_premium)
        `)
        .in('id', ids);
      
      if (fullError) {
        console.error('Search full listings error:', fullError);
        return { success: false, error: 'Fehler beim Laden der Suchergebnisse' };
      }
      
      // Sortierung aus RPC beibehalten
      const idOrder = new Map(ids.map((id, idx) => [id, idx]));
      const sortedListings = (fullListings || []).sort(
        (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0)
      );
      
      return {
        success: true,
        data: {
          listings: sortedListings.map((listing) => ({
            ...listing,
            media: ((listing.listing_media as ListingMedia[]) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
            manufacturer: listing.manufacturers as { id: string; name: string; slug: string } | null,
            account: listing.accounts as { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean } | null,
          })),
          total: totalCount,
        },
      };
    }
  }
  
  // Manufacturer filter
  if (options?.manufacturerId) {
    query = query.eq('manufacturer_id', options.manufacturerId);
  }
  
  // Manufacturer by slug
  if (options?.manufacturerSlug) {
    const { data: manufacturer } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('slug', options.manufacturerSlug)
      .single();
    
    if (manufacturer) {
      query = query.eq('manufacturer_id', manufacturer.id);
    }
  }
  
  // Account (Unternehmen) by slug
  if (options?.accountSlug) {
    const { data: acc } = await supabase
      .from('accounts')
      .select('id')
      .eq('slug', options.accountSlug)
      .is('deleted_at', null)
      .single();
    
    if (acc) {
      query = query.eq('account_id', acc.id);
    }
  }
  
  // Condition filter
  if (options?.condition) {
    query = query.eq('condition', options.condition);
  }
  
  // Price range filter (prices are in cents)
  if (options?.priceMin !== undefined) {
    query = query.gte('price', options.priceMin * 100);
  }
  if (options?.priceMax !== undefined) {
    query = query.lte('price', options.priceMax * 100);
  }
  
  // Year filter
  if (options?.yearMin !== undefined) {
    query = query.gte('year_built', options.yearMin);
  }
  if (options?.yearMax !== undefined) {
    query = query.lte('year_built', options.yearMax);
  }
  
  // Country filter
  if (options?.country) {
    query = query.eq('location_country', options.country);
  }
  
  // Featured only
  if (options?.featured) {
    query = query.eq('featured', true);
  }
  
  // Sorting
  switch (options?.sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'year_desc':
      query = query.order('year_built', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  }
  
  // Pagination
  const limit = options?.limit ?? 24;
  const offset = options?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);
  
  const { data: listings, error, count } = await query;
  
  if (error) {
    console.error('Get public listings error:', error);
    return { success: false, error: 'Fehler beim Laden der Inserate' };
  }
  
  return { 
    success: true, 
    data: {
      listings: (listings || []).map((listing) => ({
        ...listing,
        media: ((listing.listing_media as ListingMedia[]) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        manufacturer: listing.manufacturers as { id: string; name: string; slug: string } | null,
        account: listing.accounts as { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean } | null,
      })),
      total: count || 0,
    },
  };
}

/**
 * Get featured listings for homepage
 */
export async function getFeaturedListings(limit: number = 4): Promise<ActionResult<PublicListing[]>> {
  const result = await getPublicListings({ featured: true, limit, sortBy: 'newest' });
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  // If not enough featured, fill with recent listings
  if (result.data!.listings.length < limit) {
    const additionalResult = await getPublicListings({ 
      limit: limit - result.data!.listings.length,
      sortBy: 'newest',
    });
    
    if (additionalResult.success && additionalResult.data) {
      const existingIds = new Set(result.data!.listings.map(l => l.id));
      const additional = additionalResult.data.listings.filter(l => !existingIds.has(l.id));
      result.data!.listings.push(...additional);
    }
  }
  
  return { success: true, data: result.data!.listings.slice(0, limit) };
}

/**
 * Get random active listings for homepage showcase
 * Fetches a pool of active listings and returns a shuffled selection
 */
export async function getRandomListings(count: number = 5): Promise<ActionResult<PublicListing[]>> {
  const supabase = await createActionClient();
  
  // Pool von aktiven Inseraten laden
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(id, url, thumbnail_url, is_primary, sort_order, filename),
      manufacturers(id, name, slug),
      accounts(id, company_name, slug, logo_url, is_verified, is_premium)
    `)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(50);
  
  if (error) {
    console.error('Get random listings error:', error);
    return { success: false, error: 'Fehler beim Laden der Inserate' };
  }
  
  if (!listings || listings.length === 0) {
    return { success: true, data: [] };
  }
  
  // Fisher-Yates Shuffle für echte Zufälligkeit
  const shuffled = [...listings];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return {
    success: true,
    data: shuffled.slice(0, count).map((listing) => ({
      ...listing,
      media: ((listing.listing_media as ListingMedia[]) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      manufacturer: listing.manufacturers as { id: string; name: string; slug: string } | null,
      account: listing.accounts as { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean } | null,
    })),
  };
}

/**
 * Get multiple listings by their IDs (for compare page)
 */
export async function getListingsByIds(ids: string[]): Promise<ActionResult<PublicListing[]>> {
  if (!ids.length) {
    return { success: true, data: [] };
  }

  const supabase = await createActionClient();

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(id, url, thumbnail_url, is_primary, sort_order),
      manufacturers(id, name, slug),
      accounts(id, company_name, slug, logo_url, is_verified, is_premium)
    `)
    .in('id', ids)
    .in('status', ['active', 'sold'])
    .is('deleted_at', null);

  if (error) {
    console.error('Get listings by IDs error:', error);
    return { success: false, error: 'Fehler beim Laden der Inserate' };
  }

  // Reihenfolge der IDs beibehalten
  const idOrder = new Map(ids.map((id, idx) => [id, idx]));
  const sorted = (listings || []).sort(
    (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0)
  );

  return {
    success: true,
    data: sorted.map((listing) => ({
      ...listing,
      media: ((listing.listing_media as ListingMedia[]) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      manufacturer: listing.manufacturers as { id: string; name: string; slug: string } | null,
      account: listing.accounts as { id: string; company_name: string; slug: string; logo_url: string | null; is_verified: boolean; is_premium?: boolean } | null,
    })),
  };
}

/**
 * Get all manufacturers (for dropdowns)
 */
export async function getManufacturers(): Promise<ActionResult<{ id: string; name: string; slug: string }[]>> {
  const supabase = await createActionClient();
  
  const { data, error } = await supabase
    .from('manufacturers')
    .select('id, name, slug')
    .order('name');
  
  if (error) {
    console.error('Get manufacturers error:', error);
    return { success: false, error: 'Fehler beim Laden der Hersteller' };
  }
  
  return { success: true, data: data || [] };
}

// Manufacturer type for public display
export interface ManufacturerDetail {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  listingCount: number;
}

/**
 * Get a single manufacturer by slug
 */
export async function getManufacturerBySlug(slug: string): Promise<ActionResult<ManufacturerDetail>> {
  const supabase = await createActionClient();
  
  // Get manufacturer details
  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .select('id, name, slug, logo_url, country, website, description')
    .eq('slug', slug)
    .single();
  
  if (error || !manufacturer) {
    return { success: false, error: 'Hersteller nicht gefunden' };
  }
  
  // Count active listings for this manufacturer
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('manufacturer_id', manufacturer.id)
    .eq('status', 'active')
    .is('deleted_at', null);
  
  return { 
    success: true, 
    data: {
      ...manufacturer,
      listingCount: count || 0,
    },
  };
}

/**
 * Get all manufacturers with listing counts
 */
export async function getManufacturersWithCounts(): Promise<ActionResult<ManufacturerDetail[]>> {
  const supabase = await createActionClient();
  
  // Get all manufacturers
  const { data: manufacturers, error } = await supabase
    .from('manufacturers')
    .select('id, name, slug, logo_url, country, website, description')
    .order('name');
  
  if (error) {
    console.error('Get manufacturers error:', error);
    return { success: false, error: 'Fehler beim Laden der Hersteller' };
  }
  
  // Get listing counts for all manufacturers in one query
  const { data: counts } = await supabase
    .from('listings')
    .select('manufacturer_id')
    .eq('status', 'active')
    .is('deleted_at', null);
  
  // Count listings per manufacturer
  const countMap: Record<string, number> = {};
  (counts || []).forEach((listing) => {
    const mId = listing.manufacturer_id;
    countMap[mId] = (countMap[mId] || 0) + 1;
  });
  
  return {
    success: true,
    data: (manufacturers || []).map((m) => ({
      ...m,
      listingCount: countMap[m.id] || 0,
    })),
  };
}

/**
 * Get a listing for editing (with full details)
 */
export async function getListingForEdit(listingId: string): Promise<ActionResult<Listing & { 
  media: ListingMedia[];
  manufacturer: { id: string; name: string } | null;
}>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media(*),
      manufacturers(id, name)
    `)
    .eq('id', listingId)
    .single();
  
  if (error || !listing) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // Verify ownership
  if (listing.account_id !== account.id) {
    return { success: false, error: 'Keine Berechtigung' };
  }
  
  return { 
    success: true, 
    data: {
      ...listing,
      media: (listing.listing_media as ListingMedia[]) || [],
      manufacturer: listing.manufacturers as { id: string; name: string } | null,
    },
  };
}

/**
 * Archive a listing (soft delete but keep visible in archives)
 */
export async function archiveListing(listingId: string): Promise<ActionResult> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('listings')
    .select('id, account_id, status')
    .eq('id', listingId)
    .single();
  
  if (!existing || existing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  const { error } = await supabase
    .from('listings')
    .update({ status: 'archived' })
    .eq('id', listingId);
  
  if (error) {
    console.error('Archive listing error:', error);
    return { success: false, error: 'Fehler beim Archivieren' };
  }
  
  revalidatePath('/seller/inserate');
  return { success: true };
}

/**
 * Mark listing as sold
 */
export async function markListingAsSold(listingId: string): Promise<ActionResult> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('listings')
    .select('id, account_id, status')
    .eq('id', listingId)
    .single();
  
  if (!existing || existing.account_id !== account.id) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  if (existing.status !== 'active') {
    return { success: false, error: 'Nur aktive Inserate können als verkauft markiert werden' };
  }
  
  const { error } = await supabase
    .from('listings')
    .update({ 
      status: 'sold',
      sold_at: new Date().toISOString(),
    })
    .eq('id', listingId);
  
  if (error) {
    console.error('[markListingAsSold] Error:', error);
    return { success: false, error: 'Fehler beim Markieren als verkauft' };
  }
  
  revalidatePath('/seller/inserate');
  return { success: true };
}

export async function setPrimaryImage(mediaId: string): Promise<ActionResult> {
  const supabase = await createActionClient();
  const account = await getMyAccount();
  
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  // Get the media record and verify ownership
  const { data: media } = await supabase
    .from('listing_media')
    .select(`
      *,
      listings!inner(account_id)
    `)
    .eq('id', mediaId)
    .single();
  
  if (!media || (media.listings as { account_id: string }).account_id !== account.id) {
    return { success: false, error: 'Datei nicht gefunden' };
  }
  
  // Unset all other primary images for this listing
  await supabase
    .from('listing_media')
    .update({ is_primary: false })
    .eq('listing_id', media.listing_id);
  
  // Set this one as primary
  const { error } = await supabase
    .from('listing_media')
    .update({ is_primary: true })
    .eq('id', mediaId);
  
  if (error) {
    console.error('Set primary error:', error);
    return { success: false, error: 'Fehler beim Setzen des Hauptbilds' };
  }
  
  revalidatePath(`/seller/inserate/${media.listing_id}`);
  return { success: true };
}

/**
 * Duplicate a listing (creates a new draft copy without media)
 */
export async function duplicateListing(listingId: string): Promise<ActionResult<Listing>> {
  const supabase = await createActionClient();
  const account = await getMyAccount();

  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }

  // Check plan limits
  const limitCheck = await canCreateListing();
  if (!limitCheck.data?.canCreate) {
    return {
      success: false,
      error: `Sie haben das Limit von ${limitCheck.data?.limit} Inseraten erreicht. Upgraden Sie Ihren Plan fuer mehr Inserate.`,
    };
  }

  // Load original listing
  const { data: original } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .eq('account_id', account.id)
    .single();

  if (!original) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }

  // Generate new slug
  const baseSlug = original.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  // Create copy as draft (without media, views, timestamps)
  const { data: duplicate, error: dupError } = await supabase
    .from('listings')
    .insert({
      account_id: account.id,
      manufacturer_id: original.manufacturer_id,
      model_id: original.model_id,
      model_name_custom: original.model_name_custom,
      title: `${original.title} (Kopie)`,
      slug,
      description: original.description,
      price: original.price,
      price_negotiable: original.price_negotiable,
      currency: original.currency,
      year_built: original.year_built,
      condition: original.condition,
      measuring_range_x: original.measuring_range_x,
      measuring_range_y: original.measuring_range_y,
      measuring_range_z: original.measuring_range_z,
      accuracy_um: original.accuracy_um,
      software: original.software,
      controller: original.controller,
      probe_system: original.probe_system,
      location_country: original.location_country,
      location_city: original.location_city,
      location_postal_code: original.location_postal_code,
      status: 'draft',
    })
    .select()
    .single();

  if (dupError) {
    console.error('[duplicateListing] Error:', dupError);
    return { success: false, error: 'Fehler beim Duplizieren des Inserats' };
  }

  revalidatePath('/seller/inserate');
  return { success: true, data: duplicate };
}

// =============================================================================
// PUBLIC COMPANY PROFILE
// =============================================================================

export interface PublicCompanyProfile {
  id: string;
  company_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  address_city: string | null;
  address_country: string | null;
  is_verified: boolean | null;
  is_premium: boolean | null;
  gallery_urls: { url: string; caption?: string }[];
  certificates: { name: string; url?: string; issued_by?: string }[];
  created_at: string | null;
  listing_count: number;
}

/**
 * Oeffentliches Unternehmensprofil anhand des Slugs laden.
 */
export async function getPublicCompanyBySlug(slug: string): Promise<ActionResult<PublicCompanyProfile>> {
  const supabase = await createActionClient();
  
  const { data: account, error } = await supabase
    .from('accounts')
    .select('id, company_name, slug, logo_url, description, website, phone, address_city, address_country, is_verified, is_premium, gallery_urls, certificates, created_at')
    .eq('slug', slug)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single();
  
  if (error || !account) {
    return { success: false, error: 'Unternehmen nicht gefunden' };
  }
  
  // Aktive Inserate zaehlen
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', account.id)
    .eq('status', 'active')
    .is('deleted_at', null);
  
  return {
    success: true,
    data: {
      ...account,
      gallery_urls: (account.gallery_urls as { url: string; caption?: string }[] | null) || [],
      certificates: (account.certificates as { name: string; url?: string; issued_by?: string }[] | null) || [],
      listing_count: count || 0,
    },
  };
}
