import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey, apiError, hasScope } from '@/lib/api/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/v1/inquiries/:id - Einzelne Anfrage
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

  if (!hasScope(auth.scopes || [], 'inquiries:read')) {
    return apiError('forbidden', 'Insufficient permissions', 403);
  }

  const { data: inquiry, error } = await supabaseAdmin
    .from('inquiries')
    .select(`
      *,
      listings!inner(id, title, slug, price, account_id)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !inquiry) {
    return apiError('not_found', 'Inquiry not found', 404);
  }

  // Ownership pruefen
  const listing = inquiry.listings as unknown as { account_id: string };
  if (listing.account_id !== auth.accountId) {
    return apiError('not_found', 'Inquiry not found', 404);
  }

  return Response.json({
    data: {
      ...inquiry,
      listing: inquiry.listings,
      listings: undefined,
    },
  });
}

/**
 * PATCH /api/v1/inquiries/:id - Anfrage-Status/Notizen aktualisieren
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

  if (!hasScope(auth.scopes || [], 'inquiries:write')) {
    return apiError('forbidden', 'Insufficient permissions', 403);
  }

  // Ownership pruefen
  const { data: existing } = await supabaseAdmin
    .from('inquiries')
    .select('id, listings!inner(account_id)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!existing) {
    return apiError('not_found', 'Inquiry not found', 404);
  }

  const existingListing = existing.listings as unknown as { account_id: string };
  if (existingListing.account_id !== auth.accountId) {
    return apiError('not_found', 'Inquiry not found', 404);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  const updateData: Record<string, unknown> = {};
  
  // Erlaubte Status-Werte
  const validStatuses = ['new', 'contacted', 'offer_sent', 'won', 'lost'];
  if (body.status && validStatuses.includes(body.status)) {
    updateData.status = body.status;
  }
  if (body.notes !== undefined) {
    updateData.notes = body.notes;
  }
  if (body.value !== undefined) {
    updateData.value = body.value;
  }
  if (body.lost_reason !== undefined) {
    updateData.lost_reason = body.lost_reason;
  }

  const { data: inquiry, error } = await supabaseAdmin
    .from('inquiries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return apiError('internal_error', 'Failed to update inquiry', 500);
  }

  return Response.json({ data: inquiry });
}
