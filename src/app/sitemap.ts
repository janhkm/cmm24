import type { MetadataRoute } from 'next';
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
 * Wird nur waehrend der Sitemap-Generierung aufgerufen.
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

/**
 * Erzeugt hreflang-Alternates fuer eine gegebene Pfad-Struktur.
 * Default-Locale (de) hat keinen Prefix, alle anderen bekommen /locale/ vorangestellt.
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

  // x-default zeigt auf die Default-Locale (de)
  languages['x-default'] = `${SITE_URL}${path}`;

  return languages;
}

/**
 * Generiert die komplette Sitemap mit:
 * - Statischen Seiten (Homepage, Uebersichtsseiten etc.)
 * - Dynamischen Listings aus Supabase
 * - Dynamischen Herstellern aus Supabase
 * - Dynamischen Unternehmensprofilen aus Supabase
 * - Statischen Kategorien, Ratgebern und Glossar-Eintraegen
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // --- Statische Seiten ---
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: buildAlternates('') },
    },
    {
      url: `${SITE_URL}/maschinen`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: buildAlternates('/maschinen') },
    },
    {
      url: `${SITE_URL}/hersteller`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: buildAlternates('/hersteller') },
    },
    {
      url: `${SITE_URL}/kategorien`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: buildAlternates('/kategorien') },
    },
    {
      url: `${SITE_URL}/ratgeber`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: buildAlternates('/ratgeber') },
    },
    {
      url: `${SITE_URL}/glossar`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: buildAlternates('/glossar') },
    },
    {
      url: `${SITE_URL}/vergleich`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: buildAlternates('/vergleich') },
    },
    {
      url: `${SITE_URL}/ueber-uns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: { languages: buildAlternates('/ueber-uns') },
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: { languages: buildAlternates('/faq') },
    },
    {
      url: `${SITE_URL}/so-funktionierts`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: { languages: buildAlternates('/so-funktionierts') },
    },
    {
      url: `${SITE_URL}/verkaufen`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: buildAlternates('/verkaufen') },
    },
  ];

  // --- Dynamische Listings aus Supabase ---
  let listingPages: MetadataRoute.Sitemap = [];
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
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: { languages: buildAlternates(`/maschinen/${listing.slug}`) },
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Fehler beim Laden der Listings:', error);
  }

  // --- Dynamische Hersteller aus Supabase ---
  let manufacturerPages: MetadataRoute.Sitemap = [];
  try {
    const { data: manufacturers } = await supabase
      .from('manufacturers')
      .select('slug, updated_at')
      .order('name');

    if (manufacturers) {
      manufacturerPages = manufacturers.map((m) => ({
        url: `${SITE_URL}/hersteller/${m.slug}`,
        lastModified: m.updated_at || now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: { languages: buildAlternates(`/hersteller/${m.slug}`) },
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Fehler beim Laden der Hersteller:', error);
  }

  // --- Dynamische Unternehmensprofile aus Supabase ---
  let companyPages: MetadataRoute.Sitemap = [];
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
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: { languages: buildAlternates(`/unternehmen/${c.slug}`) },
      }));
    }
  } catch (error) {
    console.error('[Sitemap] Fehler beim Laden der Unternehmen:', error);
  }

  // --- Statische Kategorien ---
  const categoryEntries: MetadataRoute.Sitemap = categoryPages.map((category) => ({
    url: `${SITE_URL}/kategorien/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: { languages: buildAlternates(`/kategorien/${category.slug}`) },
  }));

  // --- Statische Ratgeber-Artikel ---
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/ratgeber/${article.slug}`,
    lastModified: article.updatedAt || now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: { languages: buildAlternates(`/ratgeber/${article.slug}`) },
  }));

  // --- Statische Glossar-Eintraege ---
  const glossarEntries: MetadataRoute.Sitemap = glossaryEntries.map((entry) => ({
    url: `${SITE_URL}/glossar/${entry.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    alternates: { languages: buildAlternates(`/glossar/${entry.slug}`) },
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
