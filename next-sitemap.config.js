/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://cmm24.de',
  generateRobotsTxt: false, // Wir haben schon eine manuelle robots.txt
  generateIndexSitemap: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  
  // Seiten ausschließen
  exclude: [
    '/seller/*',
    '/admin/*',
    '/api/*',
    '/login',
    '/registrieren',
    '/passwort-vergessen',
    '/passwort-reset',
    '/email-bestaetigen',
    '/404',
    '/500',
    '/maintenance',
  ],

  // Sprachversionen mit hreflang
  alternateRefs: [
    { href: 'https://cmm24.de', hreflang: 'de' },
    { href: 'https://cmm24.de/en', hreflang: 'en' },
    { href: 'https://cmm24.de/fr', hreflang: 'fr' },
    { href: 'https://cmm24.de/nl', hreflang: 'nl' },
    { href: 'https://cmm24.de/it', hreflang: 'it' },
    { href: 'https://cmm24.de/es', hreflang: 'es' },
    { href: 'https://cmm24.de/pl', hreflang: 'pl' },
  ],

  // Zusätzliche Pfade für dynamische Inhalte
  additionalPaths: async (config) => {
    const result = [];
    
    // Statische Seiten mit hoher Priorität
    const highPriorityPaths = [
      '/',
      '/maschinen',
      '/hersteller',
      '/kategorien',
      '/ratgeber',
      '/glossar',
      '/vergleich',
      '/kontakt',
      '/ueber-uns',
      '/faq',
      '/so-funktionierts',
    ];

    for (const path of highPriorityPaths) {
      result.push({
        loc: path,
        changefreq: 'daily',
        priority: path === '/' ? 1.0 : 0.9,
        lastmod: new Date().toISOString(),
      });
    }

    // Hersteller-Seiten
    const manufacturers = [
      'zeiss', 'hexagon', 'wenzel', 'mitutoyo', 
      'coord3', 'lk-metrology', 'aberlink', 'nikon-metrology'
    ];

    for (const slug of manufacturers) {
      result.push({
        loc: `/hersteller/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    }

    // Kategorie-Seiten
    const categories = [
      'portal-messmaschinen', 'ausleger-messmaschinen', 
      'horizontal-arm', 'gantry', 'optische-systeme'
    ];

    for (const slug of categories) {
      result.push({
        loc: `/kategorien/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    }

    return result;
  },

  // Transform für individuelle Seiten
  transform: async (config, path) => {
    // Standardkonfiguration
    let priority = 0.7;
    let changefreq = 'weekly';

    // Prioritäten basierend auf Pfad
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/maschinen/') && path.split('/').length > 2) {
      // Listing-Detail-Seiten
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/hersteller/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/ratgeber/')) {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path.startsWith('/glossar/')) {
      priority = 0.6;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
