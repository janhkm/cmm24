import type { MetadataRoute } from 'next';

const SITE_URL = 'https://cmm24.com';

/**
 * Generiert die robots.txt als Next.js Route Handler.
 * Kontrolliert Crawler-Zugriff und verweist auf die Sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Geschuetzte Bereiche
          '/seller/',
          '/admin/',
          '/api/',
          '/dashboard/',
          '/_next/',

          // Auth-Seiten (mit Locale-Prefix)
          '/*/login',
          '/*/registrieren',
          '/*/passwort-vergessen',
          '/*/passwort-reset',
          '/*/email-bestaetigen',
          '/login',
          '/registrieren',
          '/passwort-vergessen',
          '/passwort-reset',
          '/email-bestaetigen',

          // Suchergebnisse mit Parametern (Duplicate Content)
          '/*?*sortierung=',
          '/*?*q=',

          // Preview/Draft URLs
          '/*?preview=',
          '/*?draft=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
