import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey, checkApiRateLimit, apiError, hasScope } from '@/lib/api/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/v1/stats - Account-Statistiken
 */
export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.accountId) {
    return apiError('unauthorized', auth.error || 'Invalid API key', 401);
  }

  if (!hasScope(auth.scopes || [], 'stats:read')) {
    return apiError('forbidden', 'Insufficient permissions. Required scope: stats:read', 403);
  }

  const rateLimit = await checkApiRateLimit(auth.accountId);
  if (!rateLimit.allowed) {
    return apiError('rate_limit_exceeded', 'Rate limit exceeded', 429);
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  
  // Zeitraum berechnen
  const periodDays: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '12m': 365,
  };
  const days = periodDays[period] || 30;
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const since = sinceDate.toISOString();

  // Listings-Statistiken
  const { data: listings } = await supabaseAdmin
    .from('listings')
    .select('id, status, views_count')
    .eq('account_id', auth.accountId)
    .is('deleted_at', null);

  const listingStats = {
    total: listings?.length || 0,
    active: listings?.filter(l => l.status === 'active').length || 0,
    draft: listings?.filter(l => l.status === 'draft').length || 0,
    sold: listings?.filter(l => l.status === 'sold').length || 0,
    pending_review: listings?.filter(l => l.status === 'pending_review').length || 0,
  };

  // Views gesamt
  const totalViews = listings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;

  // Listing-IDs fuer Inquiry-Query
  const listingIds = listings?.map(l => l.id) || [];

  // Anfragen-Statistiken
  let inquiryStats = { total: 0, new_count: 0, conversion_rate: 0 };
  
  if (listingIds.length > 0) {
    const { data: inquiries } = await supabaseAdmin
      .from('inquiries')
      .select('id, status, created_at')
      .in('listing_id', listingIds)
      .is('deleted_at', null)
      .gte('created_at', since);

    const totalInquiries = inquiries?.length || 0;
    const newInquiries = inquiries?.filter(i => i.status === 'new').length || 0;
    const wonInquiries = inquiries?.filter(i => i.status === 'won').length || 0;

    inquiryStats = {
      total: totalInquiries,
      new_count: newInquiries,
      conversion_rate: totalInquiries > 0 ? Math.round((wonInquiries / totalInquiries) * 1000) / 10 : 0,
    };
  }

  // Top Listings (nach Views)
  const topListings = (listings || [])
    .filter(l => l.status === 'active')
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      views: l.views_count || 0,
    }));

  return Response.json({
    data: {
      period,
      listings: listingStats,
      views: {
        total: totalViews,
      },
      inquiries: inquiryStats,
      top_listings: topListings,
    },
  }, {
    headers: {
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
    },
  });
}
