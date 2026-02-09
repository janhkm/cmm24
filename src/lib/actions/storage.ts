'use server';

import { createActionClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './types';

// =============================================================================
// Types
// =============================================================================

export interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface ListingMediaRecord {
  id: string;
  listing_id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail_url: string | null;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  sort_order: number | null;
  is_primary: boolean | null;
  created_at: string | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function getMyAccount() {
  const supabase = await createActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();
  
  return account;
}

function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

// =============================================================================
// Listing Image Upload
// =============================================================================

/**
 * Upload a listing image to Supabase Storage
 */
export async function uploadListingImage(
  listingId: string,
  formData: FormData
): Promise<ActionResult<ListingMediaRecord>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  const supabase = await createActionClient();
  
  // Verify listing belongs to account
  const { data: listing } = await supabase
    .from('listings')
    .select('id, account_id')
    .eq('id', listingId)
    .eq('account_id', account.id)
    .single();
  
  if (!listing) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'Keine Datei ausgewählt' };
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Ungültiger Dateityp. Erlaubt: JPEG, PNG, WebP, GIF' };
  }
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Datei zu groß. Maximal 10MB erlaubt.' };
  }
  
  // Generate unique filename and path
  const filename = generateUniqueFilename(file.name);
  const filePath = `${account.id}/${listingId}/${filename}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(filePath, file, {
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });
  
  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { success: false, error: 'Fehler beim Hochladen: ' + uploadError.message };
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(filePath);
  
  // Get current max sort order
  const { data: existingMedia } = await supabase
    .from('listing_media')
    .select('sort_order, is_primary')
    .eq('listing_id', listingId)
    .order('sort_order', { ascending: false })
    .limit(1);
  
  const nextSortOrder = (existingMedia?.[0]?.sort_order ?? -1) + 1;
  const isPrimary = !existingMedia || existingMedia.length === 0;
  
  // Create media record in database
  const { data: mediaRecord, error: dbError } = await supabase
    .from('listing_media')
    .insert({
      listing_id: listingId,
      type: 'image' as const,
      url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl, // For now, same as URL (could generate thumbnail later)
      filename: filename,
      mime_type: file.type,
      size_bytes: file.size,
      sort_order: nextSortOrder,
      is_primary: isPrimary,
    })
    .select()
    .single();
  
  if (dbError) {
    console.error('Database error:', dbError);
    // Try to delete uploaded file
    await supabase.storage.from('listing-images').remove([filePath]);
    return { success: false, error: 'Fehler beim Speichern der Bilddaten' };
  }
  
  revalidatePath(`/seller/inserate/${listingId}`);
  return { success: true, data: mediaRecord };
}

/**
 * Delete a listing image
 */
export async function deleteListingImage(mediaId: string): Promise<ActionResult<void>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  const supabase = await createActionClient();
  
  // Get media record to verify ownership and get file path
  const { data: media } = await supabase
    .from('listing_media')
    .select(`
      id,
      url,
      listing_id,
      is_primary,
      listings(account_id)
    `)
    .eq('id', mediaId)
    .single();
  
  if (!media || (media.listings as any)?.account_id !== account.id) {
    return { success: false, error: 'Bild nicht gefunden' };
  }
  
  // Extract file path from URL
  const urlParts = media.url.split('/listing-images/');
  if (urlParts.length === 2) {
    const filePath = urlParts[1];
    // Delete from storage
    await supabase.storage.from('listing-images').remove([filePath]);
  }
  
  // Delete from database
  const { error } = await supabase
    .from('listing_media')
    .delete()
    .eq('id', mediaId);
  
  if (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Fehler beim Löschen' };
  }
  
  // If deleted image was primary, make the next one primary
  if (media.is_primary) {
    const { data: nextMedia } = await supabase
      .from('listing_media')
      .select('id')
      .eq('listing_id', media.listing_id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single();
    
    if (nextMedia) {
      await supabase
        .from('listing_media')
        .update({ is_primary: true })
        .eq('id', nextMedia.id);
    }
  }
  
  revalidatePath(`/seller/inserate/${media.listing_id}`);
  return { success: true, data: undefined };
}

/**
 * Set primary image for a listing
 */
export async function setPrimaryImage(mediaId: string): Promise<ActionResult<void>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  const supabase = await createActionClient();
  
  // Get media record
  const { data: media } = await supabase
    .from('listing_media')
    .select(`
      id,
      listing_id,
      listings(account_id)
    `)
    .eq('id', mediaId)
    .single();
  
  if (!media || (media.listings as any)?.account_id !== account.id) {
    return { success: false, error: 'Bild nicht gefunden' };
  }
  
  // Remove primary from all other images
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
    return { success: false, error: 'Fehler beim Setzen des Hauptbildes' };
  }
  
  revalidatePath(`/seller/inserate/${media.listing_id}`);
  return { success: true, data: undefined };
}

/**
 * Reorder listing images
 */
export async function reorderListingImages(
  listingId: string,
  mediaIds: string[]
): Promise<ActionResult<void>> {
  const account = await getMyAccount();
  if (!account) {
    return { success: false, error: 'Bitte melden Sie sich an' };
  }
  
  const supabase = await createActionClient();
  
  // Verify listing belongs to account
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('account_id', account.id)
    .single();
  
  if (!listing) {
    return { success: false, error: 'Inserat nicht gefunden' };
  }
  
  // Update sort orders
  const updates = mediaIds.map((id, index) => 
    supabase
      .from('listing_media')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('listing_id', listingId)
  );
  
  await Promise.all(updates);
  
  revalidatePath(`/seller/inserate/${listingId}`);
  return { success: true, data: undefined };
}

/**
 * Get listing images
 */
export async function getListingImages(listingId: string): Promise<ActionResult<ListingMediaRecord[]>> {
  const supabase = await createActionClient();
  
  const { data: media, error } = await supabase
    .from('listing_media')
    .select('*')
    .eq('listing_id', listingId)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Get listing images error:', error);
    return { success: false, error: 'Fehler beim Laden der Bilder' };
  }
  
  return { success: true, data: media || [] };
}

// Note: Account logo upload/delete functions are in account.ts
