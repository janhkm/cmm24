import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import type { Database } from '@/types/supabase';

// next-intl Middleware erstellen
const handleI18nRouting = createIntlMiddleware(routing);

// =====================================================
// Hilfsfunktionen
// =====================================================

/**
 * Locale aus dem URL-Pfad extrahieren
 */
function getLocaleFromPathname(pathname: string): Locale | null {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}

/**
 * Locale-Prefix aus dem Pfad entfernen
 * z.B. "/en/machines" → "/machines" oder "/maschinen" → "/maschinen"
 */
function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.substring(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

/**
 * Internen Pfad (Deutsch/Dateisystem) aus einem lokalisierten Pfad ermitteln.
 * z.B. "/machines" (EN) → "/maschinen" (intern)
 */
function resolveInternalPath(localizedPathname: string): string {
  const pathnames = routing.pathnames;
  if (!pathnames) return localizedPathname;

  for (const [internalPath, config] of Object.entries(pathnames)) {
    if (typeof config === 'string') {
      if (config === localizedPathname) return internalPath;
      continue;
    }

    for (const localePath of Object.values(config)) {
      // Einfacher Vergleich (ohne dynamische Segmente)
      if (localePath === localizedPathname) return internalPath;

      // Dynamische Segmente: Pattern-Matching
      // z.B. "/machines/[slug]" → Regex "/machines/([^/]+)"
      const pattern = (localePath as string).replace(/\[([^\]]+)\]/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(localizedPathname)) {
        return internalPath;
      }
    }
  }

  return localizedPathname;
}

/**
 * Lokalisierten Pfad fuer eine interne Route + Locale generieren.
 * z.B. ("/email-bestaetigen", "en") → "/verify-email"
 */
function getLocalizedPath(internalPath: string, locale: Locale): string {
  const pathnames = routing.pathnames;
  if (!pathnames) return internalPath;

  const config = pathnames[internalPath as keyof typeof pathnames];
  if (!config) return internalPath;
  if (typeof config === 'string') return config;

  return (config as Record<string, string>)[locale] || internalPath;
}

/**
 * Lokalisierte Redirect-URL bauen
 */
function buildLocalizedUrl(
  request: NextRequest,
  internalPath: string,
  locale: Locale,
): URL {
  const url = request.nextUrl.clone();
  const localizedPath = getLocalizedPath(internalPath, locale);

  if (locale === routing.defaultLocale) {
    // Default-Locale (DE): kein Prefix
    url.pathname = localizedPath;
  } else {
    url.pathname = `/${locale}${localizedPath}`;
  }

  return url;
}

// =====================================================
// Hauptmiddleware
// =====================================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Internationalisierung: Locale-Erkennung, Redirects, Rewrites
  const intlResponse = handleI18nRouting(request);

  // Wenn intl-Middleware einen Redirect sendet (z.B. Locale-Detection),
  // sofort zurueckgeben ohne Supabase-Logik
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // Locale bestimmen
  const locale: Locale = getLocaleFromPathname(pathname) || routing.defaultLocale;

  // Pfad ohne Locale-Prefix ermitteln (z.B. "/en/machines" → "/machines")
  const pathnameWithoutLocale = stripLocalePrefix(pathname);

  // Lokalisierten Pfad auf internen Pfad zurueckfuehren (z.B. "/machines" → "/maschinen")
  const internalPathname = resolveInternalPath(pathnameWithoutLocale);

  // 2. Supabase Session aktualisieren
  // Cookies aus der intl-Response uebernehmen
  let response = intlResponse;

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
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // WICHTIG: Kein Code zwischen createServerClient und getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Route Protection

  // Geschuetzte Routen (Login erforderlich)
  const protectedPaths = ['/seller', '/admin', '/dashboard'];
  const isProtectedPath = protectedPaths.some((path) =>
    internalPathname.startsWith(path),
  );

  // Auth-Seiten (Redirect wenn bereits eingeloggt)
  const authPaths = ['/login'];
  const isAuthPath = authPaths.some((path) =>
    internalPathname.startsWith(path),
  );

  // Nicht eingeloggt + geschuetzte Route → Login
  if (isProtectedPath && !user) {
    const url = buildLocalizedUrl(request, '/login', locale);
    url.searchParams.set('redirect', internalPathname);
    return NextResponse.redirect(url);
  }

  // Eingeloggt + Auth-Seite → Dashboard
  if (isAuthPath && user) {
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    const dashboardPath = account ? '/seller/dashboard' : '/dashboard';
    const url = buildLocalizedUrl(request, dashboardPath, locale);
    return NextResponse.redirect(url);
  }

  // Admin-Routen: Rolle pruefen
  if (internalPathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (
      !profile ||
      !profile.role ||
      !['admin', 'super_admin'].includes(profile.role)
    ) {
      const url = buildLocalizedUrl(request, '/seller/dashboard', locale);
      return NextResponse.redirect(url);
    }

    // Super-Admin Check fuer Stammdaten
    if (
      internalPathname.startsWith('/admin/stammdaten') &&
      profile.role !== 'super_admin'
    ) {
      const url = buildLocalizedUrl(request, '/admin/dashboard', locale);
      return NextResponse.redirect(url);
    }
  }

  // Seller-Routen: Email-Verifizierung und Account-Check
  if (internalPathname.startsWith('/seller') && user) {
    // /seller/registrieren ist fuer Kaeufer die Seller werden wollen
    if (!internalPathname.startsWith('/seller/registrieren')) {
      const { data: profileWithAccounts } = await supabase
        .from('profiles')
        .select(
          'email_verified_at, accounts!accounts_owner_id_fkey(id, status, deleted_at)',
        )
        .eq('id', user.id)
        .single();

      // Email-Verifizierung pruefen
      if (!profileWithAccounts?.email_verified_at) {
        const url = buildLocalizedUrl(
          request,
          '/email-bestaetigen',
          locale,
        );
        return NextResponse.redirect(url);
      }

      // Account aus dem Join extrahieren
      const accounts =
        (profileWithAccounts.accounts as Array<{
          id: string;
          status: string;
          deleted_at: string | null;
        }>) || [];
      const account = accounts.find((a) => !a.deleted_at) || null;

      // Kein Account = Kaeufer → Kaeufer-Dashboard
      if (!account) {
        const url = buildLocalizedUrl(request, '/dashboard', locale);
        return NextResponse.redirect(url);
      }

      // Account gesperrt
      if (
        account.status === 'suspended' &&
        !internalPathname.startsWith('/seller/abo')
      ) {
        const url = buildLocalizedUrl(request, '/seller/abo', locale);
        url.searchParams.set('suspended', 'true');
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, favicon.png
     * - Static assets (images, fonts)
     * - API routes (/api/...)
     * - Auth callback (/auth/...)
     * - Sentry monitoring (/monitoring)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|monitoring|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)$).*)',
  ],
};
