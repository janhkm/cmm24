import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey, checkApiRateLimit, apiError, hasScope } from '@/lib/api/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/v1/listings/:id - Einzelnes Inserat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.accountId) {
    return apiError('unauthorized', auth.error || 'Invalid API key', 401);
  }

  if (!hasScope(auth.scopes || [], 'listings:read')) {
    return apiError('forbidden', 'Insufficient permissions', 403);
  }

  const rateLimit = await checkApiRateLimit(auth.accountId);
  if (!rateLimit.allowed) {
    return apiError('rate_limit_exceeded', 'Rate limit exceeded', 429);
  }

  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .select(`
      *,
      listing_media(id, type, url, thumbnail_url, is_primary, sort_order),
      manufacturers(id, name, slug),
      models(id, name)
    `)
    .eq('id', id)
    .eq('account_id', auth.accountId)
    .is('deleted_at', null)
    .single();

  if (error || !listing) {
    return apiError('not_found', 'Listing not found', 404);
  }

  // Response formatieren
  const response = {
    ...listing,
    specs: {
      measuring_range_x: listing.measuring_range_x,
      measuring_range_y: listing.measuring_range_y,
      measuring_range_z: listing.measuring_range_z,
      accuracy_um: listing.accuracy_um,
      software: listing.software,
      controller: listing.controller,
      probe_system: listing.probe_system,
    },
    location: {
      country: listing.location_country,
      city: listing.location_city,
      postal_code: listing.location_postal_code,
    },
    manufacturer: listing.manufacturers,
    model: listing.models,
    media: listing.listing_media,
  };

  // Rohdaten entfernen
  delete (response as Record<string, unknown>).manufacturers;
  delete (response as Record<string, unknown>).models;
  delete (response as Record<string, unknown>).listing_media;

  return Response.json({ data: response });
}

/**
 * PATCH /api/v1/listings/:id - Inserat aktualisieren
 */
export async function PATCH(
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

  // Ownership pruefen
  const { data: existing } = await supabaseAdmin
    .from('listings')
    .select('id, account_id, status')
    .eq('id', id)
    .eq('account_id', auth.accountId)
    .is('deleted_at', null)
    .single();

  if (!existing) {
    return apiError('not_found', 'Listing not found', 404);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  const updateData: Record<string, unknown> = {};
  
  // Erlaubte Felder
  const allowedFields = [
    'title', 'description', 'price', 'price_negotiable', 'year_built',
    'condition', 'manufacturer_id', 'model_name_custom',
  ];
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Specs
  if (body.specs) {
    const specFields = [
      'measuring_range_x', 'measuring_range_y', 'measuring_range_z',
      'accuracy_um', 'software', 'controller', 'probe_system',
    ];
    for (const field of specFields) {
      if (body.specs[field] !== undefined) {
        updateData[field] = body.specs[field];
      }
    }
  }

  // Location
  if (body.location) {
    if (body.location.country !== undefined) updateData.location_country = body.location.country;
    if (body.location.city !== undefined) updateData.location_city = body.location.city;
    if (body.location.postal_code !== undefined) updateData.location_postal_code = body.location.postal_code;
  }

  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return apiError('internal_error', 'Failed to update listing', 500);
  }

  return Response.json({ data: listing });
}

/**
 * DELETE /api/v1/listings/:id - Inserat loeschen (soft delete)
 */
export async function DELETE(
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

  const { error } = await supabaseAdmin
    .from('listings')
    .update({
      deleted_at: new Date().toISOString(),
      status: 'archived',
    })
    .eq('id', id)
    .eq('account_id', auth.accountId)
    .is('deleted_at', null);

  if (error) {
    return apiError('internal_error', 'Failed to delete listing', 500);
  }

  return new Response(null, { status: 204 });
}
