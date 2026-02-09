import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey, checkApiRateLimit, apiError, hasScope } from '@/lib/api/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/v1/inquiries - Alle Anfragen des Accounts
 */
export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.accountId) {
    return apiError('unauthorized', auth.error || 'Invalid API key', 401);
  }

  if (!hasScope(auth.scopes || [], 'inquiries:read')) {
    return apiError('forbidden', 'Insufficient permissions. Required scope: inquiries:read', 403);
  }

  const rateLimit = await checkApiRateLimit(auth.accountId);
  if (!rateLimit.allowed) {
    return apiError('rate_limit_exceeded', 'Rate limit exceeded', 429);
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const status = searchParams.get('status');
  const listingId = searchParams.get('listing_id');

  // Alle Listing-IDs dieses Accounts holen
  const { data: listings } = await supabaseAdmin
    .from('listings')
    .select('id')
    .eq('account_id', auth.accountId)
    .is('deleted_at', null);

  if (!listings || listings.length === 0) {
    return Response.json({
      data: [],
      meta: { page, limit, total: 0, total_pages: 0 },
    });
  }

  const listingIds = listings.map(l => l.id);

  let query = supabaseAdmin
    .from('inquiries')
    .select(`
      id, listing_id, contact_name, contact_email, contact_phone, contact_company,
      message, status, notes, value, created_at, updated_at,
      listings(id, title, slug)
    `, { count: 'exact' })
    .in('listing_id', listingIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (listingId) {
    query = query.eq('listing_id', listingId);
  }

  const { data, count, error } = await query;

  if (error) {
    return apiError('internal_error', 'Database error', 500);
  }

  // Response formatieren
  const inquiries = (data || []).map(d => ({
    ...d,
    listing: d.listings,
    listings: undefined,
  }));

  return Response.json({
    data: inquiries,
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
    },
  });
}
