# Security-Checkliste

## Übersicht

| Kategorie | Priorität | Status |
|-----------|-----------|--------|
| Input Validation | Kritisch | 🔲 |
| Authentication | Kritisch | 🔲 |
| Authorization (RLS) | Kritisch | 🔲 |
| CORS | Hoch | 🔲 |
| CSP Headers | Hoch | 🔲 |
| Rate Limiting | Hoch | 🔲 |
| Stripe Security | Kritisch | 🔲 |
| File Upload | Hoch | 🔲 |
| Secrets Management | Kritisch | 🔲 |
| Logging & Monitoring | Mittel | 🔲 |

---

## 1. Input Validation (Zod)

### Strategie

**Alle User-Inputs werden serverseitig mit Zod validiert.**

```
Client (optional) → Server Action → Zod Validation → Database
```

### Validation Schemas

```typescript
// src/lib/validations/index.ts
export * from './auth';
export * from './listing';
export * from './inquiry';
export * from './account';
export * from './common';
```

#### Auth Validations

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'E-Mail ist erforderlich')
  .email('Ungültige E-Mail-Adresse')
  .max(255, 'E-Mail zu lang');

export const passwordSchema = z
  .string()
  .min(8, 'Mindestens 8 Zeichen')
  .max(72, 'Maximal 72 Zeichen') // bcrypt limit
  .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe')
  .regex(/[a-z]/, 'Mindestens ein Kleinbuchstabe')
  .regex(/[0-9]/, 'Mindestens eine Zahl');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z
    .string()
    .min(2, 'Name zu kurz')
    .max(100, 'Name zu lang')
    .regex(/^[a-zA-ZäöüÄÖÜß\s-]+$/, 'Nur Buchstaben erlaubt'),
  company_name: z
    .string()
    .min(2, 'Firmenname zu kurz')
    .max(100, 'Firmenname zu lang'),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s-()]+$/, 'Ungültige Telefonnummer')
    .optional()
    .or(z.literal('')),
  accepted_terms: z.literal(true, {
    errorMap: () => ({ message: 'AGB müssen akzeptiert werden' }),
  }),
  accepted_marketing: z.boolean().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});
```

#### Listing Validations

```typescript
// src/lib/validations/listing.ts
import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const listingSchema = z.object({
  title: z
    .string()
    .min(10, 'Titel zu kurz (min. 10 Zeichen)')
    .max(100, 'Titel zu lang (max. 100 Zeichen)')
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Ungültiger Inhalt'
    ),
  
  description: z
    .string()
    .min(50, 'Beschreibung zu kurz (min. 50 Zeichen)')
    .max(10000, 'Beschreibung zu lang (max. 10.000 Zeichen)')
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Ungültiger Inhalt'
    ),
  
  price: z
    .number()
    .int('Preis muss eine ganze Zahl sein')
    .min(1, 'Preis muss positiv sein')
    .max(100000000, 'Preis zu hoch'), // Max 1 Mio €
  
  price_negotiable: z.boolean().optional(),
  
  year_built: z
    .number()
    .int()
    .min(1950, 'Baujahr zu alt')
    .max(currentYear + 1, 'Baujahr in der Zukunft'),
  
  condition: z.enum(['new', 'like_new', 'good', 'fair'], {
    errorMap: () => ({ message: 'Ungültiger Zustand' }),
  }),
  
  manufacturer_id: z.string().uuid('Ungültige Hersteller-ID'),
  
  model_id: z.string().uuid('Ungültige Modell-ID').optional().nullable(),
  
  model_name_custom: z
    .string()
    .max(100, 'Modellname zu lang')
    .optional()
    .nullable(),
  
  // Technical specs
  measuring_range_x: z.number().int().min(0).max(100000).optional().nullable(),
  measuring_range_y: z.number().int().min(0).max(100000).optional().nullable(),
  measuring_range_z: z.number().int().min(0).max(100000).optional().nullable(),
  accuracy_um: z.string().max(50).optional().nullable(),
  software: z.string().max(100).optional().nullable(),
  controller: z.string().max(100).optional().nullable(),
  probe_system: z.string().max(100).optional().nullable(),
  
  // Location
  location_country: z
    .string()
    .length(2, 'Ländercode muss 2 Zeichen haben')
    .toUpperCase(),
  
  location_city: z
    .string()
    .min(2, 'Stadt zu kurz')
    .max(100, 'Stadt zu lang'),
  
  location_postal_code: z
    .string()
    .min(3, 'PLZ zu kurz')
    .max(10, 'PLZ zu lang')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Ungültige PLZ'),
});

export type ListingInput = z.infer<typeof listingSchema>;
```

#### Inquiry Validations

```typescript
// src/lib/validations/inquiry.ts
import { z } from 'zod';

export const inquirySchema = z.object({
  listing_id: z.string().uuid('Ungültige Listing-ID'),
  
  contact_name: z
    .string()
    .min(2, 'Name zu kurz')
    .max(100, 'Name zu lang')
    .regex(/^[a-zA-ZäöüÄÖÜß\s-]+$/, 'Nur Buchstaben erlaubt'),
  
  contact_email: z
    .string()
    .email('Ungültige E-Mail')
    .max(255, 'E-Mail zu lang'),
  
  contact_phone: z
    .string()
    .regex(/^[+]?[0-9\s-()]+$/, 'Ungültige Telefonnummer')
    .max(30, 'Telefonnummer zu lang')
    .optional()
    .or(z.literal('')),
  
  contact_company: z
    .string()
    .max(100, 'Firmenname zu lang')
    .optional()
    .or(z.literal('')),
  
  message: z
    .string()
    .min(20, 'Nachricht zu kurz (min. 20 Zeichen)')
    .max(5000, 'Nachricht zu lang (max. 5000 Zeichen)')
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Ungültiger Inhalt'
    ),
});

// Honeypot field für Spam-Schutz
export const inquiryFormSchema = inquirySchema.extend({
  website: z.string().max(0, 'Bot detected').optional(), // Honeypot
});
```

#### Common Validations

```typescript
// src/lib/validations/common.ts
import { z } from 'zod';

export const uuidSchema = z.string().uuid('Ungültige ID');

export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  manufacturer: slugSchema.optional(),
  category: z.enum(['portal', 'cantilever', 'horizontal_arm', 'gantry', 'optical', 'other']).optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair']).optional(),
  price_min: z.coerce.number().int().min(0).optional(),
  price_max: z.coerce.number().int().min(0).optional(),
  year_min: z.coerce.number().int().min(1950).optional(),
  year_max: z.coerce.number().int().max(new Date().getFullYear() + 1).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});
```

### Verwendung in Server Actions

```typescript
// src/lib/actions/listings.ts
'use server';

import { listingSchema, ListingInput } from '@/lib/validations/listing';
import { createActionClient } from '@/lib/supabase/server';

export async function createListing(data: unknown) {
  // 1. Validate input
  const parsed = listingSchema.safeParse(data);
  
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
      message: 'Validierungsfehler',
    };
  }
  
  // 2. Sanitize (zusätzlich zu Zod)
  const sanitized: ListingInput = {
    ...parsed.data,
    title: sanitizeHtml(parsed.data.title),
    description: sanitizeHtml(parsed.data.description),
  };
  
  // 3. Process...
  const supabase = await createActionClient();
  // ...
}
```

---

## 2. Authentication Security

### Supabase Auth Best Practices

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({
            name,
            value,
            ...options,
            // Security: Secure cookies
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}
```

### Session Validation

```typescript
// src/lib/auth/session.ts
import { createClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // WICHTIG: getUser() verifiziert das Token serverseitig
  // getSession() prüft nur lokal - nicht sicher!
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
```

### Auth Checkliste

- [x] Passwort-Mindestanforderungen (8 Zeichen, Mixed Case, Zahl)
- [ ] Rate Limiting für Login (5 Versuche / 15 Min)
- [ ] Account Lockout nach 10 Fehlversuchen
- [ ] Password Reset Token Expiry (1 Stunde)
- [ ] Session Timeout (7 Tage inaktiv)
- [ ] Secure Cookie Flags (httpOnly, secure, sameSite)
- [ ] CSRF Protection (Supabase handled)

---

## 3. Authorization (RLS)

### RLS Checkliste

```sql
-- Sicherstellen, dass RLS auf ALLEN Tabellen aktiviert ist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Alle Tabellen MÜSSEN rowsecurity = true haben
```

### Kritische Policies prüfen

```sql
-- Beispiel: Listings - Owner kann nur eigene bearbeiten
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE
  USING (account_id = get_my_account_id())
  WITH CHECK (account_id = get_my_account_id());

-- Beispiel: Inquiries - Verkäufer sieht nur eigene
CREATE POLICY "Sellers can view own inquiries" ON inquiries
  FOR SELECT
  USING (account_id = get_my_account_id());

-- WICHTIG: Keine Policy ohne WHERE-Bedingung!
```

### Admin-Zugriff absichern

```sql
-- Admin-Funktionen nur für Admins
CREATE POLICY "Only admins can access audit_logs" ON audit_logs
  FOR ALL
  USING (is_admin());

-- Super-Admin für sensible Operationen
CREATE POLICY "Only super_admin can delete accounts" ON accounts
  FOR DELETE
  USING (is_super_admin());
```

---

## 4. CORS Konfiguration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // API Routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'https://cmm24.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 5. Content Security Policy (CSP)

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## 6. Rate Limiting (Detail)

### Upstash Rate Limiter

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  // Auth
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'rl:login',
  }),
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:register',
  }),
  passwordReset: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:pw-reset',
  }),
  
  // Actions
  inquiry: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:inquiry',
  }),
  listingCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl:listing-create',
  }),
  imageUpload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    prefix: 'rl:image-upload',
  }),
  
  // API (Business)
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    prefix: 'rl:api',
  }),
};

export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

export async function checkRateLimit(
  limiter: keyof typeof rateLimiters,
  identifier?: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const ip = identifier || await getClientIP();
  const { success, remaining, reset } = await rateLimiters[limiter].limit(ip);
  
  return { success, remaining, reset };
}
```

### Rate Limit in Server Actions

```typescript
// src/lib/actions/auth.ts
'use server';

import { checkRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations/auth';

export async function signIn(data: unknown) {
  // 1. Rate Limit Check
  const { success, remaining } = await checkRateLimit('login');
  
  if (!success) {
    return {
      error: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.',
      retryAfter: 900, // seconds
    };
  }
  
  // 2. Validation
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Ungültige Eingabe' };
  }
  
  // 3. Auth...
}
```

### Rate Limit Übersicht

| Aktion | Limit | Zeitraum | IP/User |
|--------|-------|----------|---------|
| Login | 5 | 15 Min | IP |
| Register | 3 | 1 Stunde | IP |
| Password Reset | 3 | 1 Stunde | IP |
| Anfrage senden | 5 | 1 Minute | IP |
| Listing erstellen | 10 | 1 Stunde | User |
| Bild hochladen | 50 | 1 Stunde | User |
| API (Business) | 1000 | 1 Stunde | API Key |

---

## 7. Stripe Security

### Webhook Signature Verification

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // KRITISCH: Immer Signatur verifizieren!
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotenz: Event-ID prüfen
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    return Response.json({ received: true, status: 'already_processed' });
  }

  // Event verarbeiten...
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  // Event als verarbeitet markieren
  await supabase
    .from('stripe_events')
    .insert({ stripe_event_id: event.id, type: event.type });

  return Response.json({ received: true });
}
```

### Stripe Checkliste

- [ ] Webhook Secret in Environment
- [ ] Signatur-Verifizierung bei jedem Request
- [ ] Idempotenz (Event-ID speichern)
- [ ] Test vs Live Keys korrekt
- [ ] Restricted API Keys (nur nötige Permissions)
- [ ] PCI Compliance (Stripe.js, keine Kartendaten auf Server)

---

## 8. File Upload Security

```typescript
// src/lib/storage/upload.ts
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const MIME_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // 1. Size Check
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Datei zu groß (max. 10MB)' };
  }

  // 2. MIME Type Check (Header)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Ungültiger Dateityp' };
  }

  // 3. Magic Bytes Check (Content)
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  const signatures = MIME_SIGNATURES[file.type];
  if (!signatures) {
    return { valid: false, error: 'Ungültiger Dateityp' };
  }

  const isValid = signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  );

  if (!isValid) {
    return { valid: false, error: 'Dateiinhalt stimmt nicht mit Typ überein' };
  }

  // 4. Filename Sanitization
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 100);

  return { valid: true };
}
```

---

## 9. Secrets Management

### Environment Variables

```bash
# .env.local (NIEMALS committen!)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx    # Öffentlich, nur für anon RLS
SUPABASE_SERVICE_ROLE_KEY=xxx        # GEHEIM! Nur Server-Side

# Stripe
STRIPE_SECRET_KEY=sk_xxx             # GEHEIM!
STRIPE_WEBHOOK_SECRET=whsec_xxx      # GEHEIM!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx  # Öffentlich

# Rate Limiting
UPSTASH_REDIS_URL=xxx                # GEHEIM!
UPSTASH_REDIS_TOKEN=xxx              # GEHEIM!

# Email
RESEND_API_KEY=re_xxx                # GEHEIM!
```

### Vercel Environment Management

```bash
# Secrets auf Vercel setzen (nicht in Code)
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

### Secrets Checkliste

- [ ] `.env.local` in `.gitignore`
- [ ] Keine Secrets in Code
- [ ] Keine Secrets in Logs
- [ ] Service Role Key nur serverseitig
- [ ] Verschiedene Keys für Dev/Staging/Prod
- [ ] Regelmäßige Key Rotation

---

## 10. Security Headers Zusammenfassung

```typescript
// next.config.js - Komplette Header Konfiguration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];
```

---

## Pre-Launch Security Audit

### Automatisiert

- [ ] `npm audit` – keine kritischen Vulnerabilities
- [ ] Lighthouse Security Audit
- [ ] OWASP ZAP Scan
- [ ] SSL Labs Test (A+ Rating)

### Manuell

- [ ] RLS Policies für alle Tabellen geprüft
- [ ] Alle Server Actions validieren Input
- [ ] Rate Limiting auf kritischen Endpoints
- [ ] Stripe Webhooks verifizieren Signatur
- [ ] File Uploads prüfen Content, nicht nur MIME
- [ ] Keine Secrets in Git History
- [ ] Error Messages leaken keine internen Details
