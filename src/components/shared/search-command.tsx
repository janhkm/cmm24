'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Search, FileText, Users, ArrowRight } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { articles } from '@/data/content/articles';
import { useLocale } from 'next-intl';

interface SearchCommandProps {
  manufacturers?: Array<{ id: string; name: string; slug: string; listingCount?: number }>;
  recentListings?: Array<{ id: string; title: string; slug: string; price: number; manufacturer: { name: string } }>;
}

export function SearchCommand({ manufacturers = [], recentListings = [] }: SearchCommandProps) {
  const t = useTranslations('search');
  const tn = useTranslations('nav');
  const tm = useTranslations('machines');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Suchbegriff zurücksetzen wenn Dialog geschlossen wird
  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  // Freitext-Suche: Navigiert zu /maschinen?q={suchbegriff}
  const handleSearch = useCallback(() => {
    const query = searchValue.trim();
    if (query) {
      setOpen(false);
      router.push(`/maschinen?q=${encodeURIComponent(query)}`);
    }
  }, [searchValue, router]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:w-60 lg:w-72"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t('placeholder')}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t('fullPlaceholder')}
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>
            <button
              onClick={handleSearch}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
              {searchValue.trim()
                ? t('searchFor', { query: searchValue.trim() })
                : t('noResults')}
            </button>
          </CommandEmpty>

          {/* Freitext-Suche als erste Option */}
          {searchValue.trim() && (
            <CommandGroup heading={t('quickAccess')}>
              <CommandItem
                onSelect={handleSearch}
                className="font-medium"
              >
                <Search className="mr-2 h-4 w-4" />
                {t('searchFor', { query: searchValue.trim() })}
                <ArrowRight className="ml-auto h-4 w-4" />
              </CommandItem>
            </CommandGroup>
          )}

          {/* Quick Actions - nur anzeigen wenn kein Suchbegriff */}
          {!searchValue.trim() && (
            <>
              <CommandGroup heading={t('quickAccess')}>
                <CommandItem
                  onSelect={() => runCommand(() => router.push('/maschinen'))}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('browseAll')}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push('/verkaufen'))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t('sellMachine')}
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />
            </>
          )}

          {/* Manufacturers */}
          {manufacturers.length > 0 && (
            <>
              <CommandGroup heading={tn('manufacturers')}>
                {manufacturers.slice(0, 6).map((manufacturer) => (
                  <CommandItem
                    key={manufacturer.id}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/hersteller/${manufacturer.slug}`)
                      )
                    }
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {manufacturer.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {manufacturer.listingCount} {tm('listings')}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Recent Listings */}
          {recentListings.length > 0 && (
            <>
              <CommandGroup heading={t('currentListings')}>
                {recentListings
                  .slice(0, 5)
                  .map((listing) => (
                    <CommandItem
                      key={listing.id}
                      onSelect={() =>
                        runCommand(() => router.push(`/maschinen/${listing.slug}`))
                      }
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{listing.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {listing.manufacturer.name} · {formatPrice(listing.price)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Articles */}
          <CommandGroup heading={tn('guides')}>
            {articles.slice(0, 3).map((article) => (
              <CommandItem
                key={article.id}
                onSelect={() =>
                  runCommand(() => router.push(`/ratgeber/${article.slug}`))
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                {article.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
