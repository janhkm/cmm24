import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Google Shopping / Merchant Center XML Feed
 * 
 * Liefert alle aktiven Listings als Google-konformen RSS 2.0 Feed
 * mit dem g: Namespace fuer Google Shopping Attribute.
 * 
 * URL: /api/feed/google-shopping
 * Format: XML (RSS 2.0 mit Google Shopping Erweiterungen)
 * Cache: 1 Stunde (revalidate bei Aenderungen)
 */

// Supabase Admin Client (umgeht RLS fuer Feed-Generierung)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// Condition Mapping: Interne Werte -> Google Merchant Center Werte
function mapCondition(condition: string): 'new' | 'used' | 'refurbished' {
  switch (condition) {
    case 'new': return 'new';
    case 'like_new': return 'used'; // Google kennt kein "like_new"
    case 'good': return 'used';
    case 'fair': return 'used';
    default: return 'used';
  }
}

// XML-Sonderzeichen escapen
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// HTML-Tags entfernen fuer Beschreibung
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Alle aktiven Listings mit Relationen laden
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        listing_media(id, url, is_primary, sort_order, mime_type, filename),
        manufacturers(id, name, slug)
      `)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GoogleShoppingFeed] Error:', error);
      return NextResponse.json({ error: 'Feed generation failed' }, { status: 500 });
    }

    const baseUrl = 'https://cmm24.de';
    const items = (listings || []).map((listing) => {
      const manufacturer = listing.manufacturers as { id: string; name: string; slug: string } | null;
      const manufacturerName = manufacturer?.name || 'Unbekannt';
      const media = ((listing.listing_media as any[]) || []).sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );
      
      // Primäres Bild oder erstes Bild
      const primaryImage = media.find((m) => m.is_primary && !m.filename?.toLowerCase().endsWith('.pdf'));
      const firstImage = media.find((m) => !m.filename?.toLowerCase().endsWith('.pdf') && m.mime_type !== 'application/pdf');
      const mainImage = primaryImage || firstImage;
      
      // Zusätzliche Bilder (max. 10 lt. Google)
      const additionalImages = media
        .filter((m) => m.id !== mainImage?.id && !m.filename?.toLowerCase().endsWith('.pdf') && m.mime_type !== 'application/pdf')
        .slice(0, 9);

      const productUrl = `${baseUrl}/de/maschinen/${listing.slug}`;
      const title = `${manufacturerName} ${listing.title}`;
      const description = stripHtml(listing.description).slice(0, 5000);
      const condition = mapCondition(listing.condition);
      
      // Preis: Nur ausgeben wenn vorhanden und > 0
      const priceInEur = listing.price && listing.price > 0
        ? (listing.price / 100).toFixed(2)
        : null;

      // MPN generieren falls nicht gesetzt
      const mpn = listing.mpn || `${manufacturerName}-${listing.title}`.replace(/\s+/g, '-').substring(0, 70);

      // Google Product Category
      const googleCategory = listing.google_product_category || 'Business & Industrial > Industrial Equipment';

      // Custom Labels fuer Kampagnen-Steuerung
      const customLabel0 = listing.featured ? 'featured' : 'standard';
      const customLabel1 = condition;
      const customLabel2 = listing.machine_type || '';
      const customLabel3 = priceInEur && parseFloat(priceInEur) > 50000 ? 'premium' : priceInEur && parseFloat(priceInEur) > 20000 ? 'mid' : 'entry';

      let itemXml = `    <item>
      <g:id>CMM24-${listing.id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      ${mainImage ? `<g:image_link>${escapeXml(mainImage.url)}</g:image_link>` : ''}
      ${additionalImages.map((img) => `<g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`).join('\n      ')}
      <g:condition>${condition}</g:condition>
      <g:availability>in_stock</g:availability>
      ${priceInEur ? `<g:price>${priceInEur} EUR</g:price>` : ''}
      <g:brand><![CDATA[${manufacturerName}]]></g:brand>
      <g:mpn><![CDATA[${mpn}]]></g:mpn>
      ${listing.gtin ? `<g:gtin>${escapeXml(listing.gtin)}</g:gtin>` : `<g:identifier_exists>false</g:identifier_exists>`}
      <g:google_product_category><![CDATA[${googleCategory}]]></g:google_product_category>
      ${listing.machine_type ? `<g:product_type><![CDATA[Koordinatenmessmaschine > ${escapeXml(listing.machine_type)}]]></g:product_type>` : '<g:product_type><![CDATA[Koordinatenmessmaschine]]></g:product_type>'}
      <g:custom_label_0>${customLabel0}</g:custom_label_0>
      <g:custom_label_1>${customLabel1}</g:custom_label_1>
      ${customLabel2 ? `<g:custom_label_2>${escapeXml(customLabel2)}</g:custom_label_2>` : ''}
      <g:custom_label_3>${customLabel3}</g:custom_label_3>`;

      // Gewicht
      if (listing.weight_kg) {
        itemXml += `\n      <g:shipping_weight>${listing.weight_kg} kg</g:shipping_weight>`;
      }

      // Abmessungen (Laenge x Breite x Hoehe)
      if (listing.dimension_length_mm && listing.dimension_width_mm && listing.dimension_height_mm) {
        itemXml += `\n      <g:product_length>${listing.dimension_length_mm} mm</g:product_length>`;
        itemXml += `\n      <g:product_width>${listing.dimension_width_mm} mm</g:product_width>`;
        itemXml += `\n      <g:product_height>${listing.dimension_height_mm} mm</g:product_height>`;
      }

      // Zusaetzliche Produktdetails
      if (listing.measuring_range_x && listing.measuring_range_y && listing.measuring_range_z) {
        itemXml += `\n      <g:product_detail>
        <g:section_name>Technische Daten</g:section_name>
        <g:attribute_name>Messbereich</g:attribute_name>
        <g:attribute_value>${listing.measuring_range_x} x ${listing.measuring_range_y} x ${listing.measuring_range_z} mm</g:attribute_value>
      </g:product_detail>`;
      }

      if (listing.accuracy_um) {
        itemXml += `\n      <g:product_detail>
        <g:section_name>Technische Daten</g:section_name>
        <g:attribute_name>Genauigkeit (MPEE)</g:attribute_name>
        <g:attribute_value>${escapeXml(listing.accuracy_um)}</g:attribute_value>
      </g:product_detail>`;
      }

      if (listing.software) {
        itemXml += `\n      <g:product_detail>
        <g:section_name>Technische Daten</g:section_name>
        <g:attribute_name>Software</g:attribute_name>
        <g:attribute_value>${escapeXml(listing.software)}</g:attribute_value>
      </g:product_detail>`;
      }

      if (listing.year_built) {
        itemXml += `\n      <g:product_detail>
        <g:section_name>Details</g:section_name>
        <g:attribute_name>Baujahr</g:attribute_name>
        <g:attribute_value>${listing.year_built}</g:attribute_value>
      </g:product_detail>`;
      }

      itemXml += '\n    </item>';
      return itemXml;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CMM24 - Gebrauchte Koordinatenmessmaschinen</title>
    <link>${baseUrl}</link>
    <description>B2B-Marktplatz fuer gebrauchte Koordinatenmessmaschinen. Zeiss, Hexagon, Wenzel und mehr.</description>
${items.join('\n')}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (err) {
    console.error('[GoogleShoppingFeed] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
