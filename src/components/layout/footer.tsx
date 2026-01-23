import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  marktplatz: [
    { name: 'Alle Maschinen', href: '/maschinen' },
    { name: 'Hersteller', href: '/hersteller' },
    { name: 'Kategorien', href: '/kategorien' },
    { name: 'Vergleichen', href: '/vergleich' },
    { name: 'So funktioniert\'s', href: '/so-funktionierts' },
    { name: 'Für Verkäufer', href: '/verkaufen' },
  ],
  wissen: [
    { name: 'Ratgeber', href: '/ratgeber' },
    { name: 'Glossar', href: '/glossar' },
    { name: 'FAQ', href: '/faq' },
  ],
  unternehmen: [
    { name: 'Über uns', href: '/ueber-uns' },
    { name: 'Kontakt', href: '/kontakt' },
  ],
  rechtliches: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
    { name: 'Widerrufsbelehrung', href: '/widerrufsbelehrung' },
    { name: 'Cookie-Richtlinie', href: '/cookie-richtlinie' },
  ],
};

const manufacturers = [
  { name: 'Zeiss', href: '/hersteller/zeiss' },
  { name: 'Hexagon', href: '/hersteller/hexagon' },
  { name: 'Wenzel', href: '/hersteller/wenzel' },
  { name: 'Mitutoyo', href: '/hersteller/mitutoyo' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold">CMM24</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Der führende B2B-Marktplatz für gebrauchte Koordinatenmessmaschinen in Europa. 
              Geprüfte Inserate, seriöse Händler.
            </p>
            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Geprüfte Inserate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>DSGVO-konform</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Marktplatz</h3>
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
            <h3 className="mb-4 text-sm font-semibold">Wissen</h3>
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
            
            <h3 className="mb-4 mt-6 text-sm font-semibold">Unternehmen</h3>
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
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Beliebte Hersteller</h3>
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
            © {new Date().getFullYear()} CMM24. Alle Rechte vorbehalten.
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
