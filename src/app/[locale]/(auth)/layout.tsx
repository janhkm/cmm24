import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = await getTranslations('common');
  const tFooter = await getTranslations('footer');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header for Auth Pages */}
      <header className="border-b">
        <div className="container-page py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-xl font-bold">CMM24</span>
          </Link>
        </div>
      </header>

      {/* Auth Content */}
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">{children}</div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-4">
        <div className="container-page text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CMM24. {tCommon('allRightsReserved')}</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/impressum" className="hover:text-foreground">
              {tFooter('impressum')}
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground">
              {tFooter('privacy')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
