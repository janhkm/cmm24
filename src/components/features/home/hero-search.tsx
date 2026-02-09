'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { Search, ArrowRight, Factory, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Manufacturer, Listing } from '@/types';

interface SearchSuggestion {
  type: 'query' | 'manufacturer' | 'listing';
  text: string;
  href: string;
  count?: number;
  subtext?: string;
}

interface HeroSearchProps {
  featuredManufacturers: Manufacturer[];
  recentListings?: Listing[];
}

export function HeroSearch({ featuredManufacturers, recentListings = [] }: HeroSearchProps) {
  const t = useTranslations('search');
  const tn = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on query
  const suggestions: SearchSuggestion[] = [];
  
  if (query.length >= 2) {
    const queryLower = query.toLowerCase();
    
    suggestions.push({
      type: 'query',
      text: query,
      href: `/maschinen?q=${encodeURIComponent(query)}`,
    });

    const matchingManufacturers = featuredManufacturers
      .filter(m => m.name.toLowerCase().includes(queryLower))
      .slice(0, 3);
    
    matchingManufacturers.forEach(m => {
      suggestions.push({
        type: 'manufacturer',
        text: m.name,
        href: `/hersteller/${m.slug}`,
        count: m.listingCount,
      });
    });

    const matchingListings = recentListings
      .filter(l => 
        l.title.toLowerCase().includes(queryLower) ||
        l.manufacturer.name.toLowerCase().includes(queryLower)
      )
      .slice(0, 3);
    
    matchingListings.forEach(l => {
      suggestions.push({
        type: 'listing',
        text: l.title,
        href: `/maschinen/${l.slug}`,
        subtext: `${l.locationCity} · ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(l.price / 100)}`,
      });
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query) {
        router.push(`/maschinen?q=${encodeURIComponent(query)}`);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(suggestions[selectedIndex].href);
          setIsOpen(false);
        } else if (query) {
          router.push(`/maschinen?q=${encodeURIComponent(query)}`);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/maschinen?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(e.target.value.length >= 2);
                setSelectedIndex(-1);
              }}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={t('fullPlaceholder')}
              className="h-12 pl-12 pr-4 text-base"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="search-listbox"
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
              aria-autocomplete="list"
            />
            
            {/* Autocomplete Dropdown */}
            {isOpen && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                id="search-listbox"
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg overflow-hidden z-50"
              >
                {/* Search Query */}
                {suggestions.filter(s => s.type === 'query').map((suggestion, index) => (
                  <Link
                    key={`query-${index}`}
                    href={suggestion.href}
                    id={`suggestion-${suggestions.indexOf(suggestion)}`}
                    role="option"
                    aria-selected={selectedIndex === suggestions.indexOf(suggestion)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors',
                      selectedIndex === suggestions.indexOf(suggestion) && 'bg-accent'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{t('searchFor', { query: suggestion.text })}</span>
                  </Link>
                ))}

                {/* Manufacturers */}
                {suggestions.filter(s => s.type === 'manufacturer').length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
                      {tn('manufacturers')}
                    </div>
                    {suggestions.filter(s => s.type === 'manufacturer').map((suggestion, index) => (
                      <Link
                        key={`manufacturer-${index}`}
                        href={suggestion.href}
                        id={`suggestion-${suggestions.indexOf(suggestion)}`}
                        role="option"
                        aria-selected={selectedIndex === suggestions.indexOf(suggestion)}
                        className={cn(
                          'flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent transition-colors',
                          selectedIndex === suggestions.indexOf(suggestion) && 'bg-accent'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <Factory className="h-4 w-4 text-muted-foreground" />
                          <span>{suggestion.text}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {t('machineCount', { count: suggestion.count || 0 })}
                        </span>
                      </Link>
                    ))}
                  </>
                )}

                {/* Listings */}
                {suggestions.filter(s => s.type === 'listing').length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
                      {tn('allMachines')}
                    </div>
                    {suggestions.filter(s => s.type === 'listing').map((suggestion, index) => (
                      <Link
                        key={`listing-${index}`}
                        href={suggestion.href}
                        id={`suggestion-${suggestions.indexOf(suggestion)}`}
                        role="option"
                        aria-selected={selectedIndex === suggestions.indexOf(suggestion)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors',
                          selectedIndex === suggestions.indexOf(suggestion) && 'bg-accent'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{suggestion.text}</div>
                          <div className="text-sm text-muted-foreground">{suggestion.subtext}</div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {/* View all results */}
                <Link
                  href={`/maschinen?q=${encodeURIComponent(query)}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors border-t"
                  onClick={() => setIsOpen(false)}
                >
                  {t('showAllResults')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          <Button size="lg" type="submit" className="h-12 px-8">
            {tc('search')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Popular Manufacturers */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">{t('popularManufacturers')}</span>
        {featuredManufacturers.slice(0, 4).map((manufacturer) => (
          <Button key={manufacturer.id} variant="outline" size="sm" asChild>
            <Link href={`/hersteller/${manufacturer.slug}`}>
              {manufacturer.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
