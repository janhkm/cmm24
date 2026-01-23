# Seller Analytics: Selbst-Tracking Konzept

> **Status:** Geplant  
> **Priorität:** Mittel  
> **Geschätzter Aufwand:** ~1 Tag  
> **Erstellt:** 2026-01-23

## Problemstellung

Das Verkäufer-Dashboard und die Statistiken-Seite zeigen aktuell **hardcoded Mock-Daten**:
- `/seller/dashboard` → Zeilen 32-63 in `page.tsx`
- `/seller/statistiken` → Zeilen 47-162 in `page.tsx`

Diese Daten haben keinen Bezug zur Realität. Um echte Statistiken anzuzeigen, brauchen wir ein eigenes Tracking-System.

## Warum Selbst-Tracking (statt externes Tool)?

| Aspekt | Selbst-Tracking | Externes Tool (Plausible, PostHog) |
|--------|-----------------|-----------------------------------|
| Kosten | Kostenlos | 9-29€/Monat |
| Seller-spezifisch | Native | Braucht trotzdem eigene Integration |
| DSGVO | Volle Kontrolle | Abhängig vom Anbieter |
| Komplexität | Einfach für unsere Metriken | Overkill |
| Abhängigkeit | Keine | Vendor Lock-in |

**Fazit:** Für die spezifischen Business-Metriken (Aufrufe pro Inserat, Anfragen pro Seller) ist Selbst-Tracking die bessere Wahl.

---

## Benötigte Metriken

### Must-Have (MVP)
- [ ] **Aufrufe pro Inserat** (total + Zeitraum)
- [ ] **Unique Visitors** (via Session-Hash)
- [ ] **Anfragen pro Inserat** (bereits in DB via `inquiries`)
- [ ] **Konversionsrate** (Anfragen ÷ Aufrufe)
- [ ] **Trend-Vergleich** (diese Woche vs. letzte Woche)

### Nice-to-Have (später)
- [ ] Traffic-Quellen (Referer)
- [ ] Geografische Verteilung (via Vercel/Cloudflare Header)
- [ ] Top-Performer Inserate

### Nicht benötigt
- ❌ Verweildauer (komplex, wenig Mehrwert)
- ❌ Scroll-Tracking
- ❌ Heatmaps
- ❌ Session-Replay

---

## Technische Implementierung

### 1. Datenbank-Schema

```sql
-- Migration: add_page_views_table.sql

CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,           -- Hash der IP für Unique Visitors
  referrer TEXT,                      -- Traffic-Quelle (optional)
  country_code CHAR(2),               -- ISO Country Code (optional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnelle Seller-Queries
CREATE INDEX idx_page_views_listing_created 
  ON page_views(listing_id, created_at DESC);

-- Index für Unique Visitor Counting
CREATE INDEX idx_page_views_listing_session 
  ON page_views(listing_id, session_id);

-- Optional: Partitionierung nach Monat für Performance bei vielen Daten
-- CREATE TABLE page_views_2026_01 PARTITION OF page_views
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 2. Drizzle Schema (falls ihr Drizzle nutzt)

```typescript
// src/db/schema/page-views.ts

import { pgTable, uuid, text, timestamp, char } from 'drizzle-orm/pg-core';
import { listings } from './listings';

export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  referrer: text('referrer'),
  countryCode: char('country_code', { length: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 3. API Endpoint

```typescript
// src/app/api/track/view/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { createHash } from 'crypto';

// IP anonymisieren (DSGVO-konform)
function hashIP(ip: string | null): string {
  if (!ip) return 'unknown';
  // Täglich rotierender Salt für zusätzliche Anonymität
  const dailySalt = new Date().toISOString().split('T')[0];
  return createHash('sha256')
    .update(ip + dailySalt)
    .digest('hex')
    .substring(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json();
    
    if (!listingId) {
      return NextResponse.json({ error: 'listingId required' }, { status: 400 });
    }

    // IP aus Header (Vercel/Cloudflare setzen diese)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] 
            || req.headers.get('x-real-ip');
    
    const sessionId = hashIP(ip);
    const referrer = req.headers.get('referer');
    
    // Geo-Location (kostenlos bei Vercel/Cloudflare)
    const countryCode = req.headers.get('x-vercel-ip-country') 
                     || req.headers.get('cf-ipcountry');

    await db.insert(pageViews).values({
      listingId,
      sessionId,
      referrer,
      countryCode,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Track view error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 4. Frontend Integration

```typescript
// src/hooks/use-track-view.ts

import { useEffect, useRef } from 'react';

export function useTrackView(listingId: string | undefined) {
  const tracked = useRef(false);

  useEffect(() => {
    // Nur einmal pro Page-Load tracken
    if (!listingId || tracked.current) return;
    tracked.current = true;

    // Fire-and-forget (kein await nötig)
    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    }).catch(() => {
      // Silent fail - Tracking sollte nie die UX blocken
    });
  }, [listingId]);
}
```

```typescript
// In der Listing-Detail-Seite einbinden:
// src/app/(main)/maschinen/[slug]/page.tsx

import { useTrackView } from '@/hooks/use-track-view';

export default function ListingPage({ params }: { params: { slug: string } }) {
  const listing = /* fetch listing */;
  
  useTrackView(listing?.id);
  
  return (/* ... */);
}
```

### 5. Dashboard Queries

```typescript
// src/lib/analytics/seller-stats.ts

import { db } from '@/db';
import { pageViews, listings, inquiries } from '@/db/schema';
import { eq, and, gte, sql, count, countDistinct } from 'drizzle-orm';

interface SellerStats {
  totalViews: number;
  uniqueVisitors: number;
  totalInquiries: number;
  conversionRate: number;
  viewsTrend: number; // Prozent vs. Vorperiode
}

export async function getSellerStats(
  sellerId: string, 
  days: number = 30
): Promise<SellerStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const prevStartDate = new Date();
  prevStartDate.setDate(prevStartDate.getDate() - (days * 2));

  // Aktuelle Periode
  const currentStats = await db
    .select({
      totalViews: count(pageViews.id),
      uniqueVisitors: countDistinct(pageViews.sessionId),
    })
    .from(pageViews)
    .innerJoin(listings, eq(pageViews.listingId, listings.id))
    .where(
      and(
        eq(listings.accountId, sellerId),
        gte(pageViews.createdAt, startDate)
      )
    );

  // Vorherige Periode (für Trend)
  const prevStats = await db
    .select({
      totalViews: count(pageViews.id),
    })
    .from(pageViews)
    .innerJoin(listings, eq(pageViews.listingId, listings.id))
    .where(
      and(
        eq(listings.accountId, sellerId),
        gte(pageViews.createdAt, prevStartDate),
        sql`${pageViews.createdAt} < ${startDate}`
      )
    );

  // Anfragen
  const inquiryStats = await db
    .select({
      totalInquiries: count(inquiries.id),
    })
    .from(inquiries)
    .innerJoin(listings, eq(inquiries.listingId, listings.id))
    .where(
      and(
        eq(listings.accountId, sellerId),
        gte(inquiries.createdAt, startDate)
      )
    );

  const totalViews = currentStats[0]?.totalViews || 0;
  const uniqueVisitors = currentStats[0]?.uniqueVisitors || 0;
  const totalInquiries = inquiryStats[0]?.totalInquiries || 0;
  const prevViews = prevStats[0]?.totalViews || 0;

  const conversionRate = totalViews > 0 
    ? (totalInquiries / totalViews) * 100 
    : 0;

  const viewsTrend = prevViews > 0 
    ? ((totalViews - prevViews) / prevViews) * 100 
    : 0;

  return {
    totalViews,
    uniqueVisitors,
    totalInquiries,
    conversionRate: Math.round(conversionRate * 100) / 100,
    viewsTrend: Math.round(viewsTrend * 10) / 10,
  };
}
```

### 6. Stats pro Inserat

```typescript
// src/lib/analytics/listing-stats.ts

export async function getListingPerformance(sellerId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db
    .select({
      listingId: listings.id,
      title: listings.title,
      views: count(pageViews.id),
      uniqueVisitors: countDistinct(pageViews.sessionId),
      inquiries: sql<number>`(
        SELECT COUNT(*) FROM inquiries 
        WHERE inquiries.listing_id = ${listings.id}
        AND inquiries.created_at >= ${startDate}
      )`,
    })
    .from(listings)
    .leftJoin(
      pageViews, 
      and(
        eq(pageViews.listingId, listings.id),
        gte(pageViews.createdAt, startDate)
      )
    )
    .where(eq(listings.accountId, sellerId))
    .groupBy(listings.id)
    .orderBy(sql`views DESC`);
}
```

---

## Daten-Retention & Cleanup

Um die Datenbank nicht zu überlasten, sollten alte Page Views regelmäßig gelöscht werden:

```sql
-- Cron Job: Lösche Page Views älter als 12 Monate
DELETE FROM page_views 
WHERE created_at < NOW() - INTERVAL '12 months';
```

Alternativ: Monatliche Aggregation in eine `page_views_monthly` Tabelle, dann Rohdaten löschen.

---

## Implementierungs-Reihenfolge

1. **DB Migration** - Schema erstellen
2. **API Endpoint** - `/api/track/view`
3. **Hook** - `useTrackView()` 
4. **Einbinden** - In Listing-Detail-Seite
5. **Queries** - `getSellerStats()` und `getListingPerformance()`
6. **Dashboard Update** - Mock-Daten durch echte Queries ersetzen
7. **Statistiken-Seite Update** - Mock-Daten durch echte Queries ersetzen

---

## Offene Fragen

- [ ] Wie lange sollen Rohdaten gespeichert werden? (Vorschlag: 12 Monate)
- [ ] Sollen auch Suchergebnis-Impressionen getrackt werden?
- [ ] Bot-Filtering nötig? (User-Agent Check)

---

## Referenzen

- Aktuelle Dashboard-Seite: `src/app/(seller)/seller/dashboard/page.tsx`
- Aktuelle Statistiken-Seite: `src/app/(seller)/seller/statistiken/page.tsx`
- Mock-Daten: `src/data/mock-data.ts`
