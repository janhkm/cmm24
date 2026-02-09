# API-Dokumentation (Business Feature)

## Übersicht

Die CMM24 REST API ist ein **Business-Tier Feature** und ermöglicht externen Systemen den programmatischen Zugriff auf:

- Eigene Inserate (CRUD)
- Anfragen (Read, Update Status)
- Account-Statistiken

**Basis-URL:** `https://api.cmm24.de/v1`

---

## Zugriffsberechtigung

| Plan | API-Zugang | Rate Limit |
|------|------------|------------|
| Free | ❌ | - |
| Starter | ❌ | - |
| Business | ✅ | 1.000 Requests/Stunde |

---

## Authentifizierung

### API Key

API Keys werden im Seller Portal unter **Einstellungen > API** generiert.

```bash
# Header-Authentifizierung
curl -H "Authorization: Bearer cmm24_sk_live_xxxxxxxxxxxx" \
     https://api.cmm24.de/v1/listings
```

### API Key Format

```
cmm24_sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # Production
cmm24_sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # Test/Sandbox
```

### API Key Management

```typescript
// Datenbank-Schema für API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "ERP Integration", "Website Sync"
  key_hash TEXT NOT NULL,                -- SHA256 Hash des Keys
  key_prefix TEXT NOT NULL,              -- "cmm24_sk_live_xxxx" für Anzeige
  scopes TEXT[] DEFAULT '{}',            -- ['listings:read', 'listings:write']
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_account ON api_keys(account_id);
```

---

## Rate Limiting

| Limit | Wert |
|-------|------|
| Requests pro Stunde | 1.000 |
| Requests pro Minute | 60 |
| Burst | 10 Requests/Sekunde |

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 3600 seconds.",
    "retry_after": 3600
  }
}
```

---

## Endpoints

### Listings

#### Liste aller Inserate

```http
GET /v1/listings
```

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `status` | string | Filter: `draft`, `pending_review`, `active`, `sold`, `archived` |
| `page` | integer | Seite (default: 1) |
| `limit` | integer | Einträge pro Seite (max: 100, default: 20) |

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Zeiss ACCURA II",
      "slug": "zeiss-accura-ii-550e8400",
      "status": "active",
      "price": 4500000,
      "currency": "EUR",
      "year_built": 2018,
      "condition": "good",
      "views_count": 142,
      "published_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

#### Einzelnes Inserat

```http
GET /v1/listings/{id}
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Zeiss ACCURA II",
    "slug": "zeiss-accura-ii-550e8400",
    "description": "Coordinate measuring machine in excellent condition...",
    "status": "active",
    "price": 4500000,
    "price_negotiable": true,
    "currency": "EUR",
    "year_built": 2018,
    "condition": "good",
    "manufacturer": {
      "id": "...",
      "name": "Zeiss",
      "slug": "zeiss"
    },
    "model": {
      "id": "...",
      "name": "ACCURA II"
    },
    "specs": {
      "measuring_range_x": 1200,
      "measuring_range_y": 1000,
      "measuring_range_z": 800,
      "accuracy_um": "1.5 + L/350",
      "software": "CALYPSO",
      "controller": "C99",
      "probe_system": "VAST XXT"
    },
    "location": {
      "country": "DE",
      "city": "München",
      "postal_code": "80331"
    },
    "media": [
      {
        "id": "...",
        "type": "image",
        "url": "https://storage.cmm24.de/...",
        "thumbnail_url": "https://storage.cmm24.de/...",
        "is_primary": true
      }
    ],
    "views_count": 142,
    "featured": false,
    "published_at": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Inserat erstellen

```http
POST /v1/listings
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Wenzel LH 87",
  "description": "High precision CMM with active damping...",
  "price": 3200000,
  "price_negotiable": true,
  "year_built": 2020,
  "condition": "like_new",
  "manufacturer_id": "...",
  "model_id": "...",
  "specs": {
    "measuring_range_x": 800,
    "measuring_range_y": 700,
    "measuring_range_z": 600,
    "accuracy_um": "1.2",
    "software": "OpenDMIS",
    "probe_system": "Renishaw PH20"
  },
  "location": {
    "country": "DE",
    "city": "Stuttgart",
    "postal_code": "70173"
  }
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": "...",
    "status": "draft",
    ...
  }
}
```

#### Inserat aktualisieren

```http
PATCH /v1/listings/{id}
Content-Type: application/json
```

**Request Body:** (nur geänderte Felder)

```json
{
  "price": 2900000,
  "price_negotiable": false
}
```

**Response:** `200 OK`

#### Inserat löschen (Soft-Delete)

```http
DELETE /v1/listings/{id}
```

**Response:** `204 No Content`

#### Inserat zur Prüfung einreichen

```http
POST /v1/listings/{id}/submit
```

**Response:**

```json
{
  "data": {
    "id": "...",
    "status": "pending_review"
  }
}
```

---

### Anfragen (Inquiries)

#### Liste aller Anfragen

```http
GET /v1/inquiries
```

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `status` | string | Filter: `new`, `contacted`, `offer_sent`, `won`, `lost` |
| `listing_id` | uuid | Filter nach Inserat |
| `page` | integer | Seite (default: 1) |
| `limit` | integer | Einträge pro Seite (max: 100, default: 20) |

**Response:**

```json
{
  "data": [
    {
      "id": "...",
      "listing_id": "...",
      "listing_title": "Zeiss ACCURA II",
      "contact_name": "Max Mustermann",
      "contact_email": "max@example.com",
      "contact_company": "Musterfirma GmbH",
      "status": "new",
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "total_pages": 1
  }
}
```

#### Einzelne Anfrage

```http
GET /v1/inquiries/{id}
```

**Response:**

```json
{
  "data": {
    "id": "...",
    "listing_id": "...",
    "listing": {
      "id": "...",
      "title": "Zeiss ACCURA II",
      "slug": "zeiss-accura-ii-550e8400"
    },
    "contact_name": "Max Mustermann",
    "contact_email": "max@example.com",
    "contact_phone": "+49 123 456789",
    "contact_company": "Musterfirma GmbH",
    "message": "We are interested in this machine...",
    "status": "new",
    "notes": null,
    "value": null,
    "created_at": "2024-01-20T14:30:00Z",
    "updated_at": "2024-01-20T14:30:00Z"
  }
}
```

#### Anfrage-Status aktualisieren

```http
PATCH /v1/inquiries/{id}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "contacted",
  "notes": "Telefongespräch am 21.01., sehr interessiert",
  "value": 4200000
}
```

**Response:** `200 OK`

---

### Statistiken

#### Account-Statistiken

```http
GET /v1/stats
```

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `period` | string | `7d`, `30d`, `90d`, `12m` (default: `30d`) |

**Response:**

```json
{
  "data": {
    "period": "30d",
    "listings": {
      "total": 5,
      "active": 3,
      "draft": 1,
      "sold": 1
    },
    "views": {
      "total": 1250,
      "change_percent": 15.5
    },
    "inquiries": {
      "total": 18,
      "new": 5,
      "conversion_rate": 12.5
    },
    "top_listings": [
      {
        "id": "...",
        "title": "Zeiss ACCURA II",
        "views": 450,
        "inquiries": 8
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive integer"
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Beschreibung |
|-------------|------|--------------|
| 400 | `validation_error` | Ungültige Eingabedaten |
| 401 | `unauthorized` | Fehlender oder ungültiger API Key |
| 403 | `forbidden` | Keine Berechtigung für diese Aktion |
| 404 | `not_found` | Ressource nicht gefunden |
| 409 | `conflict` | Konflikt (z.B. Listing-Limit erreicht) |
| 429 | `rate_limit_exceeded` | Rate Limit überschritten |
| 500 | `internal_error` | Interner Serverfehler |

---

## Webhooks (Optional)

Business-Kunden können Webhooks konfigurieren für:

| Event | Trigger |
|-------|---------|
| `inquiry.created` | Neue Anfrage erhalten |
| `listing.approved` | Inserat freigegeben |
| `listing.rejected` | Inserat abgelehnt |

### Webhook Payload

```json
{
  "id": "evt_xxxx",
  "type": "inquiry.created",
  "created_at": "2024-01-20T14:30:00Z",
  "data": {
    "inquiry": {
      "id": "...",
      "listing_id": "...",
      "contact_email": "buyer@example.com"
    }
  }
}
```

### Webhook Security

```http
X-CMM24-Signature: sha256=xxxxxxxxxx
```

---

## SDK (Geplant)

```typescript
// Zukünftig: Official SDK
import { CMM24Client } from '@cmm24/sdk';

const client = new CMM24Client('cmm24_sk_live_xxx');

// Listings
const listings = await client.listings.list({ status: 'active' });
const listing = await client.listings.create({ ... });

// Inquiries
const inquiries = await client.inquiries.list();
await client.inquiries.update(id, { status: 'contacted' });

// Stats
const stats = await client.stats.get({ period: '30d' });
```

---

## Implementation (Server-Side)

### API Route Handler

```typescript
// src/app/api/v1/listings/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyApiKey, checkApiRateLimit } from '@/lib/api/auth';
import { listingSchema } from '@/lib/validations/listing';

export async function GET(request: NextRequest) {
  // 1. API Key verifizieren
  const apiKeyResult = await verifyApiKey(request);
  if (!apiKeyResult.valid) {
    return Response.json(
      { error: { code: 'unauthorized', message: 'Invalid API key' } },
      { status: 401 }
    );
  }

  // 2. Rate Limit prüfen
  const rateLimit = await checkApiRateLimit(apiKeyResult.accountId);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: { code: 'rate_limit_exceeded', message: 'Rate limit exceeded' } },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  // 3. Daten abrufen
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const status = searchParams.get('status');

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('account_id', apiKeyResult.accountId)
    .is('deleted_at', null)
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;

  if (error) {
    return Response.json(
      { error: { code: 'internal_error', message: 'Database error' } },
      { status: 500 }
    );
  }

  return Response.json({
    data,
    meta: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil((count || 0) / limit),
    },
  }, {
    headers: {
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.reset),
    },
  });
}

export async function POST(request: NextRequest) {
  // 1. API Key verifizieren
  const apiKeyResult = await verifyApiKey(request);
  if (!apiKeyResult.valid) {
    return Response.json(
      { error: { code: 'unauthorized', message: 'Invalid API key' } },
      { status: 401 }
    );
  }

  // 2. Scope prüfen
  if (!apiKeyResult.scopes.includes('listings:write')) {
    return Response.json(
      { error: { code: 'forbidden', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }

  // 3. Body validieren
  const body = await request.json();
  const parsed = listingSchema.safeParse(body);
  
  if (!parsed.success) {
    return Response.json({
      error: {
        code: 'validation_error',
        message: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
    }, { status: 400 });
  }

  // 4. Listing-Limit prüfen
  // ...

  // 5. Erstellen
  // ...
}
```

### API Key Verification

```typescript
// src/lib/api/auth.ts
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

interface ApiKeyResult {
  valid: boolean;
  accountId?: string;
  scopes?: string[];
}

export async function verifyApiKey(request: NextRequest): Promise<ApiKeyResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false };
  }

  const apiKey = authHeader.slice(7);
  
  // Validiere Format
  if (!apiKey.startsWith('cmm24_sk_')) {
    return { valid: false };
  }

  // Hash des Keys berechnen
  const keyHash = createHash('sha256').update(apiKey).digest('hex');

  // In DB suchen
  const supabase = await createClient();
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('account_id, scopes, expires_at, is_active')
    .eq('key_hash', keyHash)
    .single();

  if (!keyData || !keyData.is_active) {
    return { valid: false };
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false };
  }

  // Plan prüfen (nur Business hat API-Zugang)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plans(feature_flags)')
    .eq('account_id', keyData.account_id)
    .single();

  if (!subscription?.plans?.feature_flags?.api_access) {
    return { valid: false };
  }

  // Last used aktualisieren
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

  return {
    valid: true,
    accountId: keyData.account_id,
    scopes: keyData.scopes || [],
  };
}
```

---

## API Key UI (Seller Portal)

### Seite: `/seller/einstellungen/api`

**Nur sichtbar für Business-Tier Accounts.**

Features:
- API Keys erstellen (mit Namen und Scopes)
- Keys auflisten (mit last_used_at)
- Keys widerrufen
- API-Dokumentation Link
- Usage-Statistiken

```typescript
// Scopes für API Keys
const AVAILABLE_SCOPES = [
  { id: 'listings:read', label: 'Inserate lesen' },
  { id: 'listings:write', label: 'Inserate erstellen/bearbeiten' },
  { id: 'inquiries:read', label: 'Anfragen lesen' },
  { id: 'inquiries:write', label: 'Anfragen-Status ändern' },
  { id: 'stats:read', label: 'Statistiken lesen' },
];
```

---

## Zusammenfassung

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/v1/listings` | GET | Alle Inserate |
| `/v1/listings` | POST | Inserat erstellen |
| `/v1/listings/{id}` | GET | Einzelnes Inserat |
| `/v1/listings/{id}` | PATCH | Inserat aktualisieren |
| `/v1/listings/{id}` | DELETE | Inserat löschen |
| `/v1/listings/{id}/submit` | POST | Zur Prüfung einreichen |
| `/v1/inquiries` | GET | Alle Anfragen |
| `/v1/inquiries/{id}` | GET | Einzelne Anfrage |
| `/v1/inquiries/{id}` | PATCH | Status aktualisieren |
| `/v1/stats` | GET | Account-Statistiken |
