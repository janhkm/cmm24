'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
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
            Seite nicht gefunden
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Die angeforderte Seite existiert nicht oder wurde verschoben. 
            Vielleicht finden Sie, was Sie suchen, über die Startseite oder die Suche.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Zur Startseite
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/maschinen">
                <Search className="mr-2 h-4 w-4" />
                Maschinen suchen
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            <Button variant="ghost" size="sm" onClick={() => history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur vorherigen Seite
            </Button>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-4">
        <div className="container-page text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CMM24. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
