'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Separator } from '@/components/ui/separator';

const manufacturers = [
  { name: 'Zeiss', href: '/hersteller/zeiss' as const },
  { name: 'Hexagon', href: '/hersteller/hexagon' as const },
  { name: 'Wenzel', href: '/hersteller/wenzel' as const },
  { name: 'Mitutoyo', href: '/hersteller/mitutoyo' as const },
];

export function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const tc = useTranslations('common');

  const footerLinks = {
    marktplatz: [
      { name: tn('allMachines'), href: '/maschinen' as const },
      { name: tn('manufacturers'), href: '/hersteller' as const },
      { name: tn('categories'), href: '/kategorien' as const },
      { name: tn('compare'), href: '/vergleich' as const },
      { name: tn('howItWorks'), href: '/so-funktionierts' as const },
      { name: t('forSellers'), href: '/verkaufen' as const },
    ],
    wissen: [
      { name: tn('guides'), href: '/ratgeber' as const },
      { name: tn('glossary'), href: '/glossar' as const },
      { name: tn('faq'), href: '/faq' as const },
    ],
    unternehmen: [
      { name: tn('about'), href: '/ueber-uns' as const },
    ],
    rechtliches: [
      { name: t('impressum'), href: '/impressum' as const },
      { name: t('privacy'), href: '/datenschutz' as const },
      { name: t('terms'), href: '/agb' as const },
      { name: t('cancellation'), href: '/widerrufsbelehrung' as const },
      { name: t('cookiePolicy'), href: '/cookie-richtlinie' as const },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="CMM24" width={120} height={32} className="h-8 w-auto dark:hidden" />
              <Image src="/logo-dark.png" alt="CMM24" width={120} height={32} className="h-8 w-auto hidden dark:block" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t('description')}
            </p>
            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{t('verifiedListings')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{t('gdprCompliant')}</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('marketplace')}</h3>
            <ul className="space-y-3">
              {footerLinks.marktplatz.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('knowledge')}</h3>
            <ul className="space-y-3">
              {footerLinks.wissen.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3 className="mb-4 mt-6 text-sm font-semibold">{t('company')}</h3>
            <ul className="space-y-3">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:support@cmm24.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  support@cmm24.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('popularManufacturers')}</h3>
            <ul className="space-y-3">
              {manufacturers.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CMM24. {tc('allRightsReserved')}
          </p>
          <div className="flex flex-wrap gap-4">
            {footerLinks.rechtliches.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
