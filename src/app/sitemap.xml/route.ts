import { createClient } from '@supabase/supabase-js';
import { locales } from '@/i18n/routing';
import { categoryPages } from '@/data/content/categories';
import { articles } from '@/data/content/articles';
import { glossaryEntries } from '@/data/content/glossary';
import type { Database } from '@/types/supabase';

const SITE_URL = 'https://cmm24.com';
const DEFAULT_LOCALE = 'de';

/**
 * Supabase-Client fuer Build-Time-Abfragen (Service Role, umgeht RLS).
 */
function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ============================================
// Types
// ============================================

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  alternates?: Record<string, string>;
}

// ============================================
// Hilfsfunktionen
// ============================================

/**
 * Erzeugt hreflang-Alternates fuer eine gegebene Pfad-Struktur.
 */
function buildAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    if (locale === DEFAULT_LOCALE) {
      languages[locale] = `${SITE_URL}${path}`;
    } else {
      languages[locale] = `${SITE_URL}/${locale}${path}`;
    }
  }

  languages['x-default'] = `${SITE_URL}${path}`;
  return languages;
}

/**
 * Escaped XML-Sonderzeichen in URLs.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generiert einen einzelnen <url>-Block als formatiertes XML.
 */
function buildUrlEntry(entry: SitemapEntry): string {
  const lines: string[] = [];
  lines.push('  <url>');
  lines.push(`    <loc>${escapeXml(entry.url)}</loc>`);
  lines.push(`    <lastmod>${entry.lastModified}</lastmod>`);
  lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
  lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);

  if (entry.alternates) {
    for (const [lang, href] of Object.entries(entry.alternates)) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`
      );
    }
  }

  lines.push('  </url>');
  return lines.join('\n');
}

// ============================================
// Sitemap-Daten sammeln
// ============================================

async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // --- Statische Seiten ---
  const staticPages: SitemapEntry[] = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: buildAlternates(''),
    },
    {
      url: `${SITE_URL}/maschinen`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: buildAlternates('/maschinen'),
    },
    {
      url: `${SITE_URL}/hersteller`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: buildAlternates('/hersteller'),
    },
    {
      url: `${SITE_URL}/kategorien`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: buildAlternates('/kategorien'),
    },
    {
      url: `${SITE_URL}/ratgeber`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: buildAlternates('/ratgeber'),
    },
    {
      url: `${SITE_URL}/glossar`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: buildAlternates('/glossar'),
    },
    {
      url: `${SITE_URL}/vergleich`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: buildAlternates('/vergleich'),
    },
    {
      url: `${SITE_URL}/ueber-uns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: buildAlternates('/ueber-uns'),
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: buildAlternates('/faq'),
    },
    {
      url: `${SITE_URL}/so-funktionierts`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: buildAlternates('/so-funktionierts'),
    },
    {
      url: `${SITE_URL}/verkaufen`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: buildAlternates('/verkaufen'),
    },
  ];

  // --- Dynamische Listings aus Supabase ---
  let listingPages: SitemapEntry[] = [];
  try {
    const { data: listings } = await supabase
      .from('listings')
      .select('slug, updated_at, published_at')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (listings) {
      listingPages = listings.map((listing) => ({
        url: `${SITE_URL}/maschinen/${listing.slug}`,
        lastModified: listing.updated_at || listing.published_at || now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: buildAlternates(`/maschinen/${listing.slug}`),
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Fehler beim Laden der Listings:', error);
  }

  // --- Dynamische Hersteller aus Supabase ---
  let manufacturerPages: SitemapEntry[] = [];
  try {
    const { data: manufacturers } = await supabase
      .from('manufacturers')
      .select('slug, updated_at')
      .order('name');

    if (manufacturers) {
      manufacturerPages = manufacturers.map((m) => ({
        url: `${SITE_URL}/hersteller/${m.slug}`,
        lastModified: m.updated_at || now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: buildAlternates(`/hersteller/${m.slug}`),
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Fehler beim Laden der Hersteller:', error);
  }

  // --- Dynamische Unternehmensprofile aus Supabase ---
  let companyPages: SitemapEntry[] = [];
  try {
    const { data: companies } = await supabase
      .from('accounts')
      .select('slug, updated_at')
      .eq('status', 'active')
      .is('deleted_at', null)
      .not('slug', 'is', null);

    if (companies) {
      companyPages = companies.map((c) => ({
        url: `${SITE_URL}/unternehmen/${c.slug}`,
        lastModified: c.updated_at || now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: buildAlternates(`/unternehmen/${c.slug}`),
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Fehler beim Laden der Unternehmen:', error);
  }

  // --- Statische Kategorien ---
  const categoryEntries: SitemapEntry[] = categoryPages.map((category) => ({
    url: `${SITE_URL}/kategorien/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: buildAlternates(`/kategorien/${category.slug}`),
  }));

  // --- Statische Ratgeber-Artikel ---
  const articleEntries: SitemapEntry[] = articles.map((article) => ({
    url: `${SITE_URL}/ratgeber/${article.slug}`,
    lastModified: article.updatedAt || now,
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: buildAlternates(`/ratgeber/${article.slug}`),
  }));

  // --- Statische Glossar-Eintraege ---
  const glossarEntries: SitemapEntry[] = glossaryEntries.map((entry) => ({
    url: `${SITE_URL}/glossar/${entry.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: buildAlternates(`/glossar/${entry.slug}`),
  }));

  return [
    ...staticPages,
    ...listingPages,
    ...manufacturerPages,
    ...companyPages,
    ...categoryEntries,
    ...articleEntries,
    ...glossarEntries,
  ];
}

// ============================================
// Route Handler
// ============================================

export async function GET() {
  const entries = await getSitemapEntries();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(buildUrlEntry),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
