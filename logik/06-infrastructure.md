# Infrastruktur – Storage, Email, Caching, Background Jobs

## Übersicht

| Komponente | Lösung | Grund |
|------------|--------|-------|
| **File Storage** | Supabase Storage | Integriert, günstig, RLS |
| **Email** | Resend | React-Email, günstig, DE-Server |
| **Caching** | Next.js ISR + SWR | Eingebaut, kein Extra-Service |
| **Background Jobs** | Supabase Edge Functions + pg_cron | Serverless, integriert |
| **Rate Limiting** | Upstash Redis | Serverless, günstig |

---

## 1. File Storage (Supabase Storage)

### Bucket-Struktur

```
Buckets:
├── listing-media (public)
│   └── {account_id}/{listing_id}/
│       ├── original/
│       │   └── image-001.jpg
│       └── thumbnails/
│           ├── image-001-thumb.webp (400x300)
│           └── image-001-medium.webp (800x600)
│
├── account-logos (public)
│   └── {account_id}/
│       └── logo.webp
│
├── profile-avatars (public)
│   └── {profile_id}/
│       └── avatar.webp
│
└── documents (private)
    └── {account_id}/{listing_id}/
        └── docs/
            └── datasheet.pdf
```

### Storage Policies

```sql
-- listing-media bucket (public read)
CREATE POLICY "Public read listing media"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-media');

-- listing-media bucket (authenticated write for own account)
CREATE POLICY "Account owners can upload listing media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);

-- documents bucket (private)
CREATE POLICY "Account owners can access own documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE owner_id = auth.uid()
  )
);
```

### Image Processing Pipeline

```typescript
// src/lib/storage/upload-image.ts

import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

interface UploadResult {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
}

export async function uploadListingImage(
  accountId: string,
  listingId: string,
  file: File,
  index: number
): Promise<UploadResult> {
  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Validate
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > MAX_SIZE) {
    throw new Error('Datei zu groß (max. 10MB)');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Ungültiges Format (nur JPG, PNG, WebP)');
  }
  
  // Process with Sharp
  const [original, thumbnail, medium] = await Promise.all([
    sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .webp({ quality: 85 })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize(800, 600, { fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer(),
  ]);
  
  const basePath = `${accountId}/${listingId}`;
  const filename = `image-${String(index).padStart(3, '0')}`;
  
  // Upload all versions
  const [originalUpload, thumbnailUpload, mediumUpload] = await Promise.all([
    supabase.storage
      .from('listing-media')
      .upload(`${basePath}/original/${filename}.webp`, original, {
        contentType: 'image/webp',
        upsert: true,
      }),
    supabase.storage
      .from('listing-media')
      .upload(`${basePath}/thumbnails/${filename}-thumb.webp`, thumbnail, {
        contentType: 'image/webp',
        upsert: true,
      }),
    supabase.storage
      .from('listing-media')
      .upload(`${basePath}/thumbnails/${filename}-medium.webp`, medium, {
        contentType: 'image/webp',
        upsert: true,
      }),
  ]);
  
  if (originalUpload.error) throw originalUpload.error;
  
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media`;
  
  return {
    originalUrl: `${baseUrl}/${basePath}/original/${filename}.webp`,
    thumbnailUrl: `${baseUrl}/${basePath}/thumbnails/${filename}-thumb.webp`,
    mediumUrl: `${baseUrl}/${basePath}/thumbnails/${filename}-medium.webp`,
  };
}
```

### Limits pro Plan

| Plan | Max Bilder/Inserat | Max Größe/Bild | Dokumente |
|------|-------------------|----------------|-----------|
| Free | 5 | 10MB | - |
| Starter | 10 | 10MB | 3 PDFs |
| Business | 20 | 10MB | 10 PDFs |

---

## 2. Email (Resend)

### Setup

```bash
npm install resend @react-email/components
```

```typescript
// src/lib/email/client.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Email Templates

```
src/emails/
├── templates/
│   ├── welcome.tsx
│   ├── verify-email.tsx
│   ├── password-reset.tsx
│   ├── magic-link.tsx
│   ├── new-inquiry.tsx
│   ├── inquiry-confirmation.tsx
│   ├── auto-reply.tsx
│   ├── listing-approved.tsx
│   ├── listing-rejected.tsx
│   └── subscription-changed.tsx
└── components/
    ├── layout.tsx
    ├── button.tsx
    ├── footer.tsx
    └── logo.tsx
```

### Email-Typen

| Email | Trigger | Empfänger |
|-------|---------|-----------|
| Welcome | Nach Registrierung | Neuer User |
| Verify Email | Nach Registrierung | Neuer User |
| Password Reset | Anfrage | User |
| Magic Link | Anfrage | User |
| Neue Anfrage | Inquiry erstellt | Seller |
| Anfrage-Bestätigung | Inquiry erstellt | Buyer |
| Auto-Reply | Nach Delay | Buyer |
| Listing Approved | Moderation | Seller |
| Listing Rejected | Moderation | Seller |
| Subscription Changed | Stripe Webhook | Account Owner |
| Invoice | Stripe Webhook | Account Owner |

### Beispiel: Neue Anfrage Email

```typescript
// src/emails/templates/new-inquiry.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/layout';

interface NewInquiryEmailProps {
  sellerName: string;
  listingTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  message: string;
  inquiryUrl: string;
}

export function NewInquiryEmail({
  sellerName,
  listingTitle,
  buyerName,
  buyerEmail,
  buyerCompany,
  message,
  inquiryUrl,
}: NewInquiryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Neue Anfrage zu {listingTitle}</Preview>
      <Body>
        <EmailLayout>
          <Heading>Neue Anfrage erhalten</Heading>
          
          <Text>Hallo {sellerName},</Text>
          
          <Text>
            Sie haben eine neue Anfrage zu Ihrem Inserat
            <strong> {listingTitle}</strong> erhalten.
          </Text>
          
          <Section style={{ background: '#f4f4f5', padding: '16px', borderRadius: '8px' }}>
            <Text><strong>Von:</strong> {buyerName}</Text>
            <Text><strong>Email:</strong> {buyerEmail}</Text>
            {buyerCompany && <Text><strong>Firma:</strong> {buyerCompany}</Text>}
            <Text><strong>Nachricht:</strong></Text>
            <Text>{message}</Text>
          </Section>
          
          <Button href={inquiryUrl}>
            Anfrage ansehen
          </Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
```

### Email senden

```typescript
// src/lib/email/send.ts
import { resend } from './client';
import { NewInquiryEmail } from '@/emails/templates/new-inquiry';

export async function sendNewInquiryEmail(data: {
  to: string;
  sellerName: string;
  listingTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  message: string;
  inquiryId: string;
}) {
  const inquiryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/seller/anfragen/${data.inquiryId}`;
  
  return resend.emails.send({
    from: 'CMM24 <anfragen@cmm24.com>',
    to: data.to,
    subject: `Neue Anfrage zu ${data.listingTitle}`,
    react: NewInquiryEmail({
      sellerName: data.sellerName,
      listingTitle: data.listingTitle,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerCompany: data.buyerCompany,
      message: data.message,
      inquiryUrl,
    }),
  });
}
```

---

## 3. Caching Strategie

### Next.js Caching

```typescript
// Static Generation with ISR
// src/app/(main)/hersteller/page.tsx
export const revalidate = 86400; // 1 Tag

// On-Demand Revalidation
// src/app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { tag, path, secret } = await request.json();
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  if (tag) {
    revalidateTag(tag);
  }
  if (path) {
    revalidatePath(path);
  }
  
  return Response.json({ revalidated: true });
}
```

### Cache Tags

| Tag | Verwendet für | Invalidiert bei |
|-----|---------------|-----------------|
| `listings` | Listing-Liste | Listing erstellt/geändert/gelöscht |
| `listing:${id}` | Listing-Detail | Listing geändert |
| `manufacturers` | Hersteller-Liste | Hersteller geändert |
| `plans` | Plan-Übersicht | Plan geändert |

### SWR für Client-Side

```typescript
// src/hooks/use-listings.ts
import useSWR from 'swr';

export function useMyListings() {
  return useSWR('/api/seller/listings', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 Minute
  });
}
```

---

## 4. Background Jobs

### pg_cron Jobs (in Supabase)

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================
-- Job 1: Expire Featured Listings (täglich 00:00)
-- =============================================
SELECT cron.schedule(
  'expire-featured-listings',
  '0 0 * * *', -- Täglich um Mitternacht
  $$
    UPDATE listings
    SET featured = false, featured_until = NULL
    WHERE featured = true 
      AND featured_until < NOW()
      AND deleted_at IS NULL
  $$
);

-- =============================================
-- Job 2: Cleanup Old Drafts (wöchentlich Sonntag 03:00)
-- =============================================
SELECT cron.schedule(
  'cleanup-old-drafts',
  '0 3 * * 0', -- Sonntag um 03:00
  $$
    UPDATE listings
    SET deleted_at = NOW()
    WHERE status = 'draft'
      AND updated_at < NOW() - INTERVAL '90 days'
      AND deleted_at IS NULL
  $$
);

-- =============================================
-- Job 3: Send Subscription Reminders (täglich 10:00)
-- =============================================
-- Dieser Job ruft eine Edge Function auf
SELECT cron.schedule(
  'subscription-reminders',
  '0 10 * * *',
  $$
    SELECT net.http_post(
      'https://your-project.supabase.co/functions/v1/send-subscription-reminders',
      '{}',
      headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'
    )
  $$
);
```

### Edge Function: Auto-Reply

```typescript
// supabase/functions/process-auto-replies/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Find pending auto-replies
  const { data: pendingInquiries } = await supabase
    .from('inquiries')
    .select(`
      id, contact_email, contact_name, message, created_at,
      accounts!inner(
        auto_reply_enabled, auto_reply_delay_minutes, 
        auto_reply_message, company_name
      ),
      listings!inner(title)
    `)
    .eq('status', 'new')
    .is('auto_reply_sent_at', null)
    .eq('accounts.auto_reply_enabled', true)
    .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 min ago
  
  for (const inquiry of pendingInquiries || []) {
    const delayMs = inquiry.accounts.auto_reply_delay_minutes * 60 * 1000;
    const sendAt = new Date(inquiry.created_at).getTime() + delayMs;
    
    if (Date.now() >= sendAt) {
      // Send auto-reply email
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CMM24 <noreply@cmm24.com>',
          to: inquiry.contact_email,
          subject: `Re: Ihre Anfrage zu ${inquiry.listings.title}`,
          text: inquiry.accounts.auto_reply_message,
        }),
      });
      
      // Mark as sent
      await supabase
        .from('inquiries')
        .update({ auto_reply_sent_at: new Date().toISOString() })
        .eq('id', inquiry.id);
    }
  }
  
  return new Response(JSON.stringify({ processed: pendingInquiries?.length }));
});
```

### Job Schedule

| Job | Frequenz | Beschreibung |
|-----|----------|--------------|
| `expire-featured` | Täglich 00:00 | Featured-Flag zurücksetzen |
| `cleanup-drafts` | Wöchentlich | Alte Entwürfe soft-löschen |
| `subscription-reminders` | Täglich 10:00 | Email 7 Tage vor Ablauf |
| `process-auto-replies` | Alle 5 Min | Auto-Reply Emails senden |

---

## 5. Rate Limiting (Upstash)

### Setup

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different rate limiters for different actions
export const rateLimiters = {
  // Inquiry submission: 5 per minute
  inquiry: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:inquiry',
  }),
  
  // Login attempts: 5 per 15 minutes
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:login',
  }),
  
  // Password reset: 3 per hour
  passwordReset: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'ratelimit:password-reset',
  }),
  
  // Listing creation: 10 per hour
  listingCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:listing-create',
  }),
  
  // API (Business plan): 1000 per hour
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    prefix: 'ratelimit:api',
  }),
};
```

### Usage in API Route

```typescript
// src/app/api/inquiries/route.ts
import { rateLimiters } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  const { success, remaining } = await rateLimiters.inquiry.limit(ip);
  
  if (!success) {
    return Response.json(
      { error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' },
      { 
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() }
      }
    );
  }
  
  // Process inquiry...
}
```

---

## 6. Monitoring & Logging

### Empfohlen: Sentry

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% für Performance
});
```

### Logging-Strategie

| Level | Verwendung |
|-------|------------|
| `error` | Exceptions, Failed Payments, Auth Failures |
| `warn` | Rate Limits, Validation Errors |
| `info` | User Actions (Login, Signup, Inquiry) |
| `debug` | Nur in Development |

---

## Zusammenfassung: Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_...

# Rate Limiting (Upstash)
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...

# Cache
REVALIDATION_SECRET=your-secret-for-revalidation
```
