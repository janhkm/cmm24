import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import '../globals.css';
import { ToasterProvider } from '@/components/shared/toaster-provider';
import { CookieConsent } from '@/components/shared/cookie-consent';
import { BackToTop } from '@/components/shared/back-to-top';
import { KeyboardShortcuts } from '@/components/shared/keyboard-shortcuts';
import { SkipLink } from '@/components/shared/skip-link';

// Inter as primary font per PRD
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

// JetBrains Mono for code/monospace
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0c' },
  ],
};

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon.png?v=2', type: 'image/png', sizes: '500x500' },
    ],
    apple: { url: '/favicon.png?v=2', sizes: '180x180' },
  },
  title: {
    default: 'CMM24 - Gebrauchte Koordinatenmessmaschinen kaufen & verkaufen',
    template: '%s | CMM24',
  },
  description:
    'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. Geprüfte Inserate von Zeiss, Hexagon, Wenzel und mehr.',
  keywords: [
    'Koordinatenmessmaschine',
    'CMM',
    'gebraucht',
    'Messmaschine',
    'Zeiss',
    'Hexagon',
    'Wenzel',
    'Mitutoyo',
    'Messtechnik',
    'B2B Marktplatz',
  ],
  authors: [{ name: 'CMM24' }],
  creator: 'CMM24',
  metadataBase: new URL('https://cmm24.com'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://cmm24.com',
    siteName: 'CMM24',
    title: 'CMM24 - Gebrauchte Koordinatenmessmaschinen',
    description:
      'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CMM24 - Gebrauchte Koordinatenmessmaschinen',
    description:
      'Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Statische Params fuer alle unterstuetzten Locales generieren
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Locale validieren – 404 wenn ungueltig
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Locale fuer statisches Rendering setzen
  setRequestLocale(locale);

  // Uebersetzungen laden
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Google AdSense – Script direkt im Head fuer Account-Verifizierung */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9852604593423676"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {/* Skip Link for Accessibility */}
          <SkipLink />

          {children}
          
          {/* Toast Notifications */}
          <ToasterProvider />
          
          {/* Cookie Consent Banner */}
          <CookieConsent />
          
          
          {/* Back to Top Button */}
          <BackToTop />
          
          {/* Keyboard Shortcuts Handler */}
          <KeyboardShortcuts />
          
          {/* Screen Reader Announcements */}
          <div
            id="announcer"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
