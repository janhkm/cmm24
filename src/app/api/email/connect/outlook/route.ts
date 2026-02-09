import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getAuthorizationUrl } from '@/lib/email/outlook';
import { log } from '@/lib/logger';

// =============================================================================
// GET /api/email/connect/outlook
// Startet den Microsoft OAuth 2.0 Flow
// =============================================================================

export async function GET() {
  try {
    // 1. User authentifizieren
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=/seller/emails`
      );
    }

    // 2. Prüfen ob User ein Seller-Account hat
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!account) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/seller/emails?error=no_account`
      );
    }

    // 3. CSRF State-Token generieren und in Cookie speichern
    const state = JSON.stringify({
      token: randomBytes(32).toString('hex'),
      accountId: account.id,
      userId: user.id,
    });
    const stateEncoded = Buffer.from(state).toString('base64url');

    const cookieStore = await cookies();
    cookieStore.set('oauth_state', stateEncoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 Minuten
      path: '/',
    });

    // 4. Redirect zu Microsoft OAuth
    const authUrl = getAuthorizationUrl(stateEncoded);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    log('error', 'Outlook Connect', 'Fehler', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/seller/emails?error=connect_failed`
    );
  }
}
