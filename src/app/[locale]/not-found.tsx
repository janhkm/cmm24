'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('notFound');
  const tc = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
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

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-[150px] font-bold text-muted-foreground/20 leading-none select-none">
              404
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {t('title')}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t('backToHome')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/maschinen">
                <Search className="mr-2 h-4 w-4" />
                {t('searchMachines')}
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            <Button variant="ghost" size="sm" onClick={() => history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('goBack')}
            </Button>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-4">
        <div className="container-page text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CMM24. {tc('allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
}
