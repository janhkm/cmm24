import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey, apiError, hasScope } from '@/lib/api/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/v1/listings/:id/submit - Inserat zur Pruefung einreichen
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.accountId) {
    return apiError('unauthorized', auth.error || 'Invalid API key', 401);
  }

  if (!hasScope(auth.scopes || [], 'listings:write')) {
    return apiError('forbidden', 'Insufficient permissions', 403);
  }

  // Ownership und Status pruefen
  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select('id, account_id, status')
    .eq('id', id)
    .eq('account_id', auth.accountId)
    .is('deleted_at', null)
    .single();

  if (!listing) {
    return apiError('not_found', 'Listing not found', 404);
  }

  if (listing.status !== 'draft') {
    return apiError('conflict', 'Only draft listings can be submitted for review', 409);
  }

  // Mindestens ein Bild pruefen
  const { count: mediaCount } = await supabaseAdmin
    .from('listing_media')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', id)
    .eq('type', 'image');

  if (!mediaCount || mediaCount === 0) {
    return apiError('validation_error', 'At least one image is required', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('listings')
    .update({ status: 'pending_review' })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) {
    return apiError('internal_error', 'Failed to submit listing', 500);
  }

  return Response.json({ data });
}
