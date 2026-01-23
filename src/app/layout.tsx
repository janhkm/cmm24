import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
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
  metadataBase: new URL('https://cmm24.de'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://cmm24.de',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
      >
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
      </body>
    </html>
  );
}
