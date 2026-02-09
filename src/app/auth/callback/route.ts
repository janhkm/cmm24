import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/send';
import { sendWelcomeNotification } from '@/lib/actions/notifications';
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const next = searchParams.get('next') ?? '/seller/dashboard';
  const type = searchParams.get('type'); // 'recovery', 'signup', 'magiclink'

  const supabase = await createClient();

  // --- PKCE Flow: code vorhanden ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      log('error', 'Auth Callback', 'exchangeCodeForSession failed', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
    }
  }

  // --- Implicit/Token-Hash Flow: token_hash vorhanden ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'magiclink' | 'email',
    });
    if (error) {
      log('error', 'Auth Callback', 'verifyOtp failed', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
    }
  }

  // --- Gemeinsame Post-Auth-Logik ---
  // Pruefen ob wir eine gueltige Session haben
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Kein code, kein token_hash, kein User -> Fehler
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  // Handle signup: email_verified_at setzen + Welcome-Email
  if (type === 'signup') {
    // Pruefen ob email_verified_at schon gesetzt ist (Duplikat-Aufruf vermeiden)
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_verified_at, full_name')
      .eq('id', user.id)
      .single();

    if (profile && !profile.email_verified_at) {
      // Email als verifiziert markieren
      await supabase
        .from('profiles')
        .update({ email_verified_at: new Date().toISOString() })
        .eq('id', user.id);

      // Account-Daten fuer Welcome-Email laden
      const { data: account } = await supabase
        .from('accounts')
        .select('company_name')
        .eq('owner_id', user.id)
        .maybeSingle();

      // Welcome-Email und Notification senden (fire and forget)
      if (user.email) {
        const userName = profile.full_name?.split(' ')[0] || 'Nutzer';
        const companyName = account?.company_name || 'Ihr Unternehmen';

        sendWelcomeEmail({ to: user.email, userName, companyName }).catch(err => {
          log('error', 'Auth Callback', 'Failed to send welcome email', err);
        });

        sendWelcomeNotification(user.id).catch(err => {
          log('error', 'Auth Callback', 'Failed to send welcome notification', err);
        });
      }
    }
  }

  // Handle recovery: zum Passwort-Reset weiterleiten
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/passwort-reset`);
  }

  // Redirect basierend auf User-Typ (Kaeufer vs Verkaeufer)
  let redirectPath = next;
  if (redirectPath === '/seller/dashboard') {
    const { data: userAccount } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    redirectPath = userAccount ? '/seller/dashboard' : '/dashboard';
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
  } else {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }
}
