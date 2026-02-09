'use server';

import { createActionClient, createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { ActionResult } from './types';
import { ErrorMessages } from './types';

type Inquiry = Database['public']['Tables']['inquiries']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type ListingMedia = Database['public']['Tables']['listing_media']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Account = Database['public']['Tables']['accounts']['Row'];
type Plan = Database['public']['Tables']['plans']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface DashboardStats {
  activeListings: number;
  listingLimit: number;
  newInquiries: number;
  totalViews: number;
  conversionRate: number;
  viewsChange: number;      // percentage change vs last period
  inquiriesChange: number;  // percentage change vs last period
}

interface RecentInquiry {
  id: string;
  name: string;  // mapped from contact_name
  email: string; // mapped from contact_email
  company: string | null; // mapped from contact_company
  status: Inquiry['status'];
  created_at: string | null;
  read_at: string | null; // computed, not in DB
  listing: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface RecentListing extends Pick<Listing, 'id' | 'title' | 'slug' | 'status' | 'price' | 'views_count' | 'created_at'> {
  primaryImage: string | null;
  inquiryCount: number;
}

// =====================================================
// Layout-Daten: Wird einmalig serverseitig geladen
// =====================================================

export interface SellerLayoutData {
  profile: Profile;
  account: Account;
  plan: Plan | null;
  subscription: (Subscription & { plans: Plan | null }) | null;
  unreadInquiries: number;
  activeListings: number;
  listingLimit: number;
}

/**
 * Laedt alle Daten die das Seller-Layout braucht in EINEM Server-Call.
 * Wird als Server Component Data-Fetch aufgerufen (kein Client-Round-Trip).
 */
export async function getSellerLayoutData(): Promise<SellerLayoutData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Alles parallel laden - 1 Auth-Call + 3 DB-Queries
  const [profileResult, accountResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('accounts').select('*').eq('owner_id', user.id).is('deleted_at', null).maybeSingle(),
  ]);

  const profile = profileResult.data;
  const account = accountResult.data;

  if (!profile || !account) return null;

  // Subscription + Plan + Inquiry-Count + Listing-Count parallel
  const [subscriptionResult, unreadResult, listingCountResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('account_id', account.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle(),
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', account.id)
      .eq('status', 'new')
      .is('deleted_at', null),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', account.id)
      .in('status', ['draft', 'pending_review', 'active'])
      .is('deleted_at', null),
  ]);

  const sub = subscriptionResult.data;
  const plan = sub ? (sub.plans as Plan) : null;
  const listingLimit = plan?.listing_limit ?? 1;

  return {
    profile,
    account,
    plan,
    subscription: sub as (Subscription & { plans: Plan | null }) | null,
    unreadInquiries: unreadResult.count ?? 0,
    activeListings: listingCountResult.count ?? 0,
    listingLimit,
  };
}

// =====================================================
// Dashboard-Daten: Alles fuer die Dashboard-Page
// =====================================================

export interface SellerDashboardData {
  stats: DashboardStats;
  recentInquiries: RecentInquiry[];
  recentListings: RecentListing[];
}

/**
 * Laedt alle Dashboard-Daten in EINEM Server-Call.
 * Nutzt die accountId direkt (kein erneuter Auth-Check noetig).
 */
export async function getSellerDashboardData(accountId: string): Promise<SellerDashboardData> {
  const supabase = await createClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // ALLE Daten parallel laden - 6 Queries gleichzeitig
  const [
    activeListingsResult,
    newInquiriesResult,
    previousInquiriesResult,
    subscriptionResult,
    recentInquiriesResult,
    recentListingsResult,
  ] = await Promise.all([
    // 1. Active listings with views
    supabase
      .from('listings')
      .select('id, views_count')
      .eq('account_id', accountId)
      .eq('status', 'active')
      .is('deleted_at', null),

    // 2. New inquiries (last 7 days)
    supabase
      .from('inquiries')
      .select('id')
      .eq('account_id', accountId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .is('deleted_at', null),

    // 3. Previous period inquiries (7-14 days ago)
    supabase
      .from('inquiries')
      .select('id')
      .eq('account_id', accountId)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString())
      .is('deleted_at', null),

    // 4. Subscription for plan limit
    supabase
      .from('subscriptions')
      .select('plans(listing_limit)')
      .eq('account_id', accountId)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle(),

    // 5. Recent inquiries (for list)
    supabase
      .from('inquiries')
      .select(`id, contact_name, contact_email, contact_company, status, created_at, listings(id, title, slug)`)
      .eq('account_id', accountId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),

    // 6. Recent listings (for list)
    supabase
      .from('listings')
      .select(`id, title, slug, status, price, views_count, created_at, listing_media(url, is_primary)`)
      .eq('account_id', accountId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  // Stats berechnen
  const activeListings = activeListingsResult.data?.length || 0;
  const totalViews = activeListingsResult.data?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;
  const newInquiries = newInquiriesResult.data?.length || 0;
  const previousInquiries = previousInquiriesResult.data?.length || 0;
  const listingLimit = (subscriptionResult.data?.plans as { listing_limit: number } | null)?.listing_limit || 1;

  const conversionRate = totalViews > 0 ? (newInquiries / totalViews) * 100 : 0;
  const inquiriesChange = previousInquiries > 0
    ? ((newInquiries - previousInquiries) / previousInquiries) * 100
    : (newInquiries > 0 ? 100 : 0);

  // Inquiry counts fuer Listings berechnen
  const listingIds = (recentListingsResult.data || []).map(l => l.id);
  let inquiryCounts: Record<string, number> = {};
  if (listingIds.length > 0) {
    const { data: inqCounts } = await supabase
      .from('inquiries')
      .select('listing_id')
      .in('listing_id', listingIds)
      .is('deleted_at', null);
    (inqCounts || []).forEach(inq => {
      inquiryCounts[inq.listing_id] = (inquiryCounts[inq.listing_id] || 0) + 1;
    });
  }

  // Ergebnisse mappen
  const recentInquiries: RecentInquiry[] = (recentInquiriesResult.data || []).map(d => ({
    id: d.id,
    name: d.contact_name,
    email: d.contact_email,
    company: d.contact_company,
    status: d.status,
    created_at: d.created_at,
    read_at: null,
    listing: d.listings as RecentInquiry['listing'],
  }));

  const recentListings: RecentListing[] = (recentListingsResult.data || []).map(l => {
    const media = l.listing_media as Array<{ url: string; is_primary: boolean | null }> | null;
    const primaryImage = media?.find(m => m.is_primary)?.url || media?.[0]?.url || null;
    return {
      id: l.id, title: l.title, slug: l.slug, status: l.status,
      price: l.price, views_count: l.views_count, created_at: l.created_at,
      primaryImage,
      inquiryCount: inquiryCounts[l.id] || 0,
    };
  });

  return {
    stats: {
      activeListings,
      listingLimit,
      newInquiries,
      totalViews,
      conversionRate: Math.round(conversionRate * 100) / 100,
      viewsChange: 0,
      inquiriesChange: Math.round(inquiriesChange * 10) / 10,
    },
    recentInquiries,
    recentListings,
  };
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
 * Get aggregated dashboard statistics
 */
export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'UNAUTHORIZED' };
    }
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Parallel queries for performance
    const [
      listingsResult,
      newInquiriesResult,
      previousInquiriesResult,
      subscriptionResult,
    ] = await Promise.all([
      // Active listings with views
      supabase
        .from('listings')
        .select('id, views_count')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .is('deleted_at', null),
      
      // New inquiries (last 7 days)
      supabase
        .from('inquiries')
        .select('id, listing_id, listings!inner(account_id)')
        .eq('listings.account_id', accountId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .is('deleted_at', null),
      
      // Previous period inquiries (7-14 days ago)
      supabase
        .from('inquiries')
        .select('id, listing_id, listings!inner(account_id)')
        .eq('listings.account_id', accountId)
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString())
        .is('deleted_at', null),
      
      // Subscription for plan limit
      supabase
        .from('subscriptions')
        .select('plans(listing_limit)')
        .eq('account_id', accountId)
        .in('status', ['active', 'trialing', 'past_due'])
        .maybeSingle(),
    ]);
    
    const activeListings = listingsResult.data?.length || 0;
    const totalViews = listingsResult.data?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;
    const newInquiries = newInquiriesResult.data?.length || 0;
    const previousInquiries = previousInquiriesResult.data?.length || 0;
    const listingLimit = (subscriptionResult.data?.plans as { listing_limit: number } | null)?.listing_limit || 1;
    
    // Calculate conversion rate (inquiries per view)
    const conversionRate = totalViews > 0 ? (newInquiries / totalViews) * 100 : 0;
    
    // Calculate changes vs previous period
    const inquiriesChange = previousInquiries > 0 
      ? ((newInquiries - previousInquiries) / previousInquiries) * 100 
      : (newInquiries > 0 ? 100 : 0);
    
    // Note: Views change would require storing historical data
    // For now, we return 0 as a placeholder
    const viewsChange = 0;
    
    return {
      success: true,
      data: {
        activeListings,
        listingLimit,
        newInquiries,
        totalViews,
        conversionRate: Math.round(conversionRate * 100) / 100,
        viewsChange: Math.round(viewsChange * 10) / 10,
        inquiriesChange: Math.round(inquiriesChange * 10) / 10,
      },
    };
  } catch (error) {
    console.error('[getDashboardStats] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get recent inquiries for dashboard
 */
export async function getRecentInquiries(limit: number = 5): Promise<ActionResult<RecentInquiry[]>> {
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
      return { success: true, data: [] };
    }
    
    const listingIds = listings.map(l => l.id);
    
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id, contact_name, contact_email, contact_company, status, created_at,
        listings(id, title, slug)
      `)
      .in('listing_id', listingIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[getRecentInquiries] Error:', error);
      return { success: false, error: 'Fehler beim Laden der Anfragen', code: 'SERVER_ERROR' };
    }
    
    const recentInquiries: RecentInquiry[] = (data || []).map(d => ({
      id: d.id,
      name: d.contact_name,
      email: d.contact_email,
      company: d.contact_company,
      status: d.status,
      created_at: d.created_at,
      read_at: null, // No read_at column in schema, track via status
      listing: d.listings as RecentInquiry['listing'],
    }));
    
    return { success: true, data: recentInquiries };
  } catch (error) {
    console.error('[getRecentInquiries] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get recent listings for dashboard
 */
export async function getRecentListings(limit: number = 3): Promise<ActionResult<RecentListing[]>> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'UNAUTHORIZED' };
    }
    
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        id, title, slug, status, price, views_count, created_at,
        listing_media(url, is_primary)
      `)
      .eq('account_id', accountId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[getRecentListings] Error:', error);
      return { success: false, error: 'Fehler beim Laden der Inserate', code: 'SERVER_ERROR' };
    }
    
    // Get inquiry counts for these listings
    const listingIds = (listings || []).map(l => l.id);
    const inquiryCounts: Record<string, number> = {};
    
    if (listingIds.length > 0) {
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('listing_id')
        .in('listing_id', listingIds)
        .is('deleted_at', null);
      
      (inquiries || []).forEach(inq => {
        inquiryCounts[inq.listing_id] = (inquiryCounts[inq.listing_id] || 0) + 1;
      });
    }
    
    const recentListings: RecentListing[] = (listings || []).map(l => {
      const media = l.listing_media as ListingMedia[] | null;
      const primaryImage = media?.find(m => m.is_primary)?.url || media?.[0]?.url || null;
      
      return {
        id: l.id,
        title: l.title,
        slug: l.slug,
        status: l.status,
        price: l.price,
        views_count: l.views_count,
        created_at: l.created_at,
        primaryImage,
        inquiryCount: inquiryCounts[l.id] || 0,
      };
    });
    
    return { success: true, data: recentListings };
  } catch (error) {
    console.error('[getRecentListings] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get account statistics for a date range (for statistics page)
 */
export async function getAccountStatistics(options?: {
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<{
  totalViews: number;
  totalInquiries: number;
  conversionRate: number;
  listingStats: Array<{
    id: string;
    title: string;
    views: number;
    inquiries: number;
  }>;
}>> {
  try {
    const supabase = await createActionClient();
    const accountId = await getMyAccountId();
    
    if (!accountId) {
      return { success: false, error: ErrorMessages.ACCOUNT_NOT_FOUND, code: 'UNAUTHORIZED' };
    }
    
    // Default to last 30 days
    const endDate = options?.endDate || new Date().toISOString();
    const startDate = options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get listings with views
    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, views_count')
      .eq('account_id', accountId)
      .is('deleted_at', null);
    
    if (!listings || listings.length === 0) {
      return {
        success: true,
        data: {
          totalViews: 0,
          totalInquiries: 0,
          conversionRate: 0,
          listingStats: [],
        },
      };
    }
    
    const listingIds = listings.map(l => l.id);
    
    // Get inquiries in date range
    const { data: inquiries } = await supabase
      .from('inquiries')
      .select('listing_id')
      .in('listing_id', listingIds)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .is('deleted_at', null);
    
    // Count inquiries per listing
    const inquiryCounts: Record<string, number> = {};
    (inquiries || []).forEach(inq => {
      inquiryCounts[inq.listing_id] = (inquiryCounts[inq.listing_id] || 0) + 1;
    });
    
    const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
    const totalInquiries = (inquiries || []).length;
    const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
    
    const listingStats = listings.map(l => ({
      id: l.id,
      title: l.title,
      views: l.views_count || 0,
      inquiries: inquiryCounts[l.id] || 0,
    }));
    
    // Sort by views descending
    listingStats.sort((a, b) => b.views - a.views);
    
    return {
      success: true,
      data: {
        totalViews,
        totalInquiries,
        conversionRate: Math.round(conversionRate * 100) / 100,
        listingStats,
      },
    };
  } catch (error) {
    console.error('[getAccountStatistics] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}

/**
 * Get all available plans (for upgrade page)
 */
export async function getAllPlans(): Promise<ActionResult<Database['public']['Tables']['plans']['Row'][]>> {
  try {
    const supabase = await createActionClient();
    
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('[getAllPlans] Error:', error);
      return { success: false, error: 'Fehler beim Laden der Pläne', code: 'SERVER_ERROR' };
    }
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getAllPlans] Unexpected error:', error);
    return { success: false, error: ErrorMessages.SERVER_ERROR, code: 'SERVER_ERROR' };
  }
}
