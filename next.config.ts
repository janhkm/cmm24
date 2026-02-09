import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

// Content Security Policy
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.resend.com https://*.sentry.io https://*.ingest.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: NextConfig = {
  // Server Actions Body-Limit erhöhen (Default: 1 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security Headers
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
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // CORS fuer API-Routen wird in den Route-Handlern selbst gesetzt
      // (siehe src/lib/api/cors.ts fuer dynamische Origin-Pruefung)
      // Caching für statische Assets
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts Caching
      {
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Trailing Slash entfernen
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },
};

// next-intl Plugin fuer Internationalisierung
// Auto-Discovery: sucht in src/i18n/request.ts und i18n/request.ts
const withNextIntl = createNextIntlPlugin();

// Sentry nur in Production aktivieren – im Dev-Modus verursacht der Wrapper
// staendige Fast-Refresh-Rebuilds und verlangsamt den Dev-Server erheblich.
const isDev = process.env.NODE_ENV === 'development';

export default isDev
  ? withNextIntl(nextConfig)
  : withSentryConfig(withNextIntl(nextConfig), {
      silent: true,
      widenClientFileUpload: true,
      automaticVercelMonitors: true,
      disableLogger: true,
      tunnelRoute: '/monitoring',
    });
