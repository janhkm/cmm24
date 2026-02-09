import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT run any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = ['/seller', '/admin', '/dashboard'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Auth pages that should redirect to dashboard if already logged in
  const authPaths = ['/login'];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If trying to access protected route without being logged in
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If logged in user tries to access auth pages, redirect to appropriate dashboard
  if (isAuthPath && user) {
    // Pruefen ob User ein Seller-Account hat
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();
    
    const url = request.nextUrl.clone();
    url.pathname = account ? '/seller/dashboard' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Admin routes - check for admin role
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.role || !['admin', 'super_admin'].includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/seller/dashboard';
      return NextResponse.redirect(url);
    }
    
    // Super-Admin Check fuer Stammdaten
    if (request.nextUrl.pathname.startsWith('/admin/stammdaten') && profile.role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Seller-Routen: Email-Verifizierung und Account-Check
  // Optimiert: Profile + Account in einer Query laden (spart 1 DB-Round-Trip)
  if (request.nextUrl.pathname.startsWith('/seller') && user) {
    // /seller/registrieren ist fuer Kaeufer die Seller werden wollen - immer erlauben
    if (!request.nextUrl.pathname.startsWith('/seller/registrieren')) {
      // Profile + verknuepfte Accounts in einem Query laden
      const { data: profileWithAccounts } = await supabase
        .from('profiles')
        .select('email_verified_at, accounts!accounts_owner_id_fkey(id, status, deleted_at)')
        .eq('id', user.id)
        .single();

      // Email-Verifizierung pruefen
      if (!profileWithAccounts?.email_verified_at) {
        const url = request.nextUrl.clone();
        url.pathname = '/email-bestaetigen';
        return NextResponse.redirect(url);
      }

      // Account aus dem Join extrahieren
      const accounts = (profileWithAccounts.accounts as Array<{ id: string; status: string; deleted_at: string | null }>) || [];
      const account = accounts.find(a => !a.deleted_at) || null;
      
      // Kein Account = Kaeufer -> zum Kaeufer-Dashboard umleiten
      if (!account) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      
      // Account gesperrt
      if (account.status === 'suspended' && !request.nextUrl.pathname.startsWith('/seller/abo')) {
        const url = request.nextUrl.clone();
        url.pathname = '/seller/abo';
        url.searchParams.set('suspended', 'true');
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
