import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey, checkApiRateLimit, apiError, hasScope } from '@/lib/api/auth';
import { corsHeaders, handlePreflight } from '@/lib/api/cors';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/v1/listings - Alle Inserate des Accounts
 */
export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.accountId) {
    return apiError('unauthorized', auth.error || 'Invalid API key', 401);
  }

  if (!hasScope(auth.scopes || [], 'listings:read')) {
    return apiError('forbidden', 'Insufficient permissions. Required scope: listings:read', 403);
  }

  const rateLimit = await checkApiRateLimit(auth.accountId);
  if (!rateLimit.allowed) {
    return apiError('rate_limit_exceeded', 'Rate limit exceeded', 429);
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('listings')
    .select('id, title, slug, status, price, price_negotiable, currency, year_built, condition, views_count, featured, published_at, created_at, updated_at', { count: 'exact' })
    .eq('account_id', auth.accountId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;

  if (error) {
    return apiError('internal_error', 'Database error', 500);
  }

  return Response.json({
    data,
    meta: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  }, {
    headers: {
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.reset),
    },
  });
}

/**
 * POST /api/v1/listings - Neues Inserat erstellen
 */
export async function POST(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.accountId) {
    return apiError('unauthorized', auth.error || 'Invalid API key', 401);
  }

  if (!hasScope(auth.scopes || [], 'listings:write')) {
    return apiError('forbidden', 'Insufficient permissions. Required scope: listings:write', 403);
  }

  const rateLimit = await checkApiRateLimit(auth.accountId);
  if (!rateLimit.allowed) {
    return apiError('rate_limit_exceeded', 'Rate limit exceeded', 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  // Listing-Limit pruefen
  const { count } = await supabaseAdmin
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', auth.accountId)
    .in('status', ['draft', 'pending_review', 'active'])
    .is('deleted_at', null);

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('plans(listing_limit)')
    .eq('account_id', auth.accountId)
    .in('status', ['active', 'trialing'])
    .maybeSingle();

  const plans = subscription?.plans as unknown as { listing_limit: number } | null;
  const planLimit = plans?.listing_limit ?? 1;
  
  if ((count || 0) >= planLimit) {
    return apiError('conflict', `Listing limit reached (${count}/${planLimit})`, 409);
  }

  // Slug generieren
  const baseSlug = (body.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .insert({
      account_id: auth.accountId,
      manufacturer_id: body.manufacturer_id,
      model_name_custom: body.model_name_custom || null,
      title: body.title,
      slug,
      description: body.description,
      price: body.price,
      price_negotiable: body.price_negotiable || false,
      year_built: body.year_built,
      condition: body.condition,
      measuring_range_x: body.specs?.measuring_range_x || null,
      measuring_range_y: body.specs?.measuring_range_y || null,
      measuring_range_z: body.specs?.measuring_range_z || null,
      accuracy_um: body.specs?.accuracy_um || null,
      software: body.specs?.software || null,
      controller: body.specs?.controller || null,
      probe_system: body.specs?.probe_system || null,
      location_country: body.location?.country,
      location_city: body.location?.city,
      location_postal_code: body.location?.postal_code,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('[API] Create listing error:', error);
    return apiError('validation_error', 'Failed to create listing', 400);
  }

  return Response.json({ data: listing }, { status: 201 });
}
