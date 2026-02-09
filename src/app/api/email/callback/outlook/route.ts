import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { exchangeCodeForTokens, getMicrosoftUser } from '@/lib/email/outlook';
import { encryptToken } from '@/lib/email/crypto';
import { log } from '@/lib/logger';

// Supabase Admin für Token-Speicherung
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// =============================================================================
// GET /api/email/callback/outlook
// Empfängt den OAuth-Callback von Microsoft
// =============================================================================

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Microsoft hat einen Fehler zurückgegeben (z.B. User hat abgelehnt)
    if (error) {
      log('error', 'Outlook Callback', `OAuth-Fehler: ${error} ${errorDescription}`);
      const errorParam = error === 'access_denied' ? 'access_denied' : 'oauth_error';
      return NextResponse.redirect(`${baseUrl}/seller/emails?error=${errorParam}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/seller/emails?error=missing_params`);
    }

    // 1. State validieren (CSRF-Schutz)
    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;

    if (!savedState || savedState !== state) {
      log('error', 'Outlook Callback', 'State stimmt nicht ueberein');
      return NextResponse.redirect(`${baseUrl}/seller/emails?error=invalid_state`);
    }

    // State-Cookie löschen
    cookieStore.delete('oauth_state');

    // State dekodieren
    let stateData: { token: string; accountId: string; userId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.redirect(`${baseUrl}/seller/emails?error=invalid_state`);
    }

    // 2. Authorization Code gegen Tokens tauschen
    const tokens = await exchangeCodeForTokens(code);

    // 3. Microsoft User-Profil abrufen
    const msUser = await getMicrosoftUser(tokens.access_token);
    const email = msUser.mail || msUser.userPrincipalName;

    // 4. Tokens verschlüsselt in DB speichern
    const tokenExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    // Prüfen ob bereits eine Verbindung für diesen Account besteht
    const { data: existing } = await supabaseAdmin
      .from('email_connections')
      .select('id')
      .eq('account_id', stateData.accountId)
      .eq('provider', 'outlook')
      .maybeSingle();

    if (existing) {
      // Bestehende Verbindung aktualisieren (Reconnect)
      await supabaseAdmin
        .from('email_connections')
        .update({
          email,
          access_token: encryptToken(tokens.access_token),
          refresh_token: encryptToken(tokens.refresh_token),
          token_expires_at: tokenExpiresAt,
          provider_account_id: msUser.id,
          display_name: msUser.displayName,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Neue Verbindung anlegen
      const { error: insertError } = await supabaseAdmin
        .from('email_connections')
        .insert({
          account_id: stateData.accountId,
          provider: 'outlook',
          email,
          access_token: encryptToken(tokens.access_token),
          refresh_token: encryptToken(tokens.refresh_token),
          token_expires_at: tokenExpiresAt,
          provider_account_id: msUser.id,
          display_name: msUser.displayName,
          is_active: true,
        });

      if (insertError) {
        log('error', 'Outlook Callback', 'DB-Fehler', insertError);
        return NextResponse.redirect(`${baseUrl}/seller/emails?error=db_error`);
      }
    }

    log('info', 'Outlook Callback', `Verbindung hergestellt fuer ${email}`);

    // 5. Redirect zurück zur E-Mail-Seite mit Erfolg
    return NextResponse.redirect(`${baseUrl}/seller/emails?connected=outlook`);
  } catch (err) {
    log('error', 'Outlook Callback', 'Unerwarteter Fehler', err);
    return NextResponse.redirect(`${baseUrl}/seller/emails?error=callback_failed`);
  }
}
