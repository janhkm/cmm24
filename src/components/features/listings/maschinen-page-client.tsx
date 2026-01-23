'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight, LayoutGrid, List, ArrowUpDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ListingGrid,
  ListingFiltersSidebar,
  ActiveFilters,
} from '@/components/features/listings';
import { CompareBar } from '@/components/shared/compare-bar';
import { mockListings, sortOptions, manufacturers } from '@/data/mock-data';
import type { ListingFilters } from '@/types';

function MaschinenContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): ListingFilters => {
    const filters: ListingFilters = {};

    const q = searchParams.get('q');
    if (q) filters.query = q;

    const herstellerParam = searchParams.get('hersteller');
    if (herstellerParam) {
      filters.manufacturers = herstellerParam.split(',');
    }

    const zustandParam = searchParams.get('zustand');
    if (zustandParam) {
      filters.condition = zustandParam.split(',') as ListingFilters['condition'];
    }

    const preisMin = searchParams.get('preis_min');
    if (preisMin) filters.priceMin = parseInt(preisMin) * 100;

    const preisMax = searchParams.get('preis_max');
    if (preisMax) filters.priceMax = parseInt(preisMax) * 100;

    const jahrMin = searchParams.get('jahr_min');
    if (jahrMin) filters.yearMin = parseInt(jahrMin);

    const jahrMax = searchParams.get('jahr_max');
    if (jahrMax) filters.yearMax = parseInt(jahrMax);

    const landParam = searchParams.get('land');
    if (landParam) {
      filters.countries = landParam.split(',');
    }

    // Messbereich
    const messbereichMinX = searchParams.get('mb_x_min');
    if (messbereichMinX) filters.measuringRangeXMin = parseInt(messbereichMinX);

    const messbereichMaxX = searchParams.get('mb_x_max');
    if (messbereichMaxX) filters.measuringRangeXMax = parseInt(messbereichMaxX);

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<ListingFilters>(getFiltersFromURL);
  const [sortBy, setSortBy] = useState(searchParams.get('sortierung') || 'relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Sync URL with filters
  const updateURL = useCallback(
    (newFilters: ListingFilters, newSort: string) => {
      const params = new URLSearchParams();

      if (newFilters.query) params.set('q', newFilters.query);
      if (newFilters.manufacturers?.length)
        params.set('hersteller', newFilters.manufacturers.join(','));
      if (newFilters.condition?.length)
        params.set('zustand', newFilters.condition.join(','));
      if (newFilters.priceMin) params.set('preis_min', String(newFilters.priceMin / 100));
      if (newFilters.priceMax) params.set('preis_max', String(newFilters.priceMax / 100));
      if (newFilters.yearMin) params.set('jahr_min', String(newFilters.yearMin));
      if (newFilters.yearMax) params.set('jahr_max', String(newFilters.yearMax));
      if (newFilters.countries?.length) params.set('land', newFilters.countries.join(','));
      if (newFilters.measuringRangeXMin)
        params.set('mb_x_min', String(newFilters.measuringRangeXMin));
      if (newFilters.measuringRangeXMax)
        params.set('mb_x_max', String(newFilters.measuringRangeXMax));
      if (newSort !== 'relevance') params.set('sortierung', newSort);

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [pathname, router]
  );

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: ListingFilters) => {
      setFilters(newFilters);
      updateURL(newFilters, sortBy);
    },
    [sortBy, updateURL]
  );

  // Handle sort changes
  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      updateURL(filters, newSort);
    },
    [filters, updateURL]
  );

  // Handle search
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newFilters = { ...filters, query: searchQuery || undefined };
      handleFiltersChange(newFilters);
    },
    [filters, searchQuery, handleFiltersChange]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    const { query, ...rest } = filters;
    handleFiltersChange(rest);
  }, [filters, handleFiltersChange]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = mockListings.filter((listing) => listing.status === 'active');

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query) ||
          l.manufacturer.name.toLowerCase().includes(query) ||
          l.model?.name?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.manufacturers && filters.manufacturers.length > 0) {
      result = result.filter((l) =>
        filters.manufacturers!.includes(l.manufacturerId)
      );
    }

    if (filters.condition && filters.condition.length > 0) {
      result = result.filter((l) => filters.condition!.includes(l.condition));
    }

    if (filters.priceMin) {
      result = result.filter((l) => l.price >= filters.priceMin!);
    }

    if (filters.priceMax) {
      result = result.filter((l) => l.price <= filters.priceMax!);
    }

    if (filters.yearMin) {
      result = result.filter((l) => l.yearBuilt >= filters.yearMin!);
    }

    if (filters.yearMax) {
      result = result.filter((l) => l.yearBuilt <= filters.yearMax!);
    }

    if (filters.countries && filters.countries.length > 0) {
      result = result.filter((l) => {
        const countryCode =
          l.locationCountry === 'Deutschland'
            ? 'DE'
            : l.locationCountry === 'Österreich'
            ? 'AT'
            : l.locationCountry === 'Schweiz'
            ? 'CH'
            : l.locationCountry === 'Italien'
            ? 'IT'
            : l.locationCountry;
        return filters.countries!.includes(countryCode);
      });
    }

    // Messbereich Filter
    if (filters.measuringRangeXMin) {
      result = result.filter((l) => l.measuringRangeX >= filters.measuringRangeXMin!);
    }
    if (filters.measuringRangeXMax) {
      result = result.filter((l) => l.measuringRangeX <= filters.measuringRangeXMax!);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'date_desc':
        result.sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime()
        );
        break;
      case 'date_asc':
        result.sort(
          (a, b) =>
            new Date(a.publishedAt || a.createdAt).getTime() -
            new Date(b.publishedAt || b.createdAt).getTime()
        );
        break;
      case 'year_desc':
        result.sort((a, b) => b.yearBuilt - a.yearBuilt);
        break;
      case 'year_asc':
        result.sort((a, b) => a.yearBuilt - b.yearBuilt);
        break;
      default:
        // relevance - featured first, then by date
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime()
          );
        });
    }

    return result;
  }, [filters, sortBy]);

  // Get manufacturer name for display
  const getManufacturerNames = () => {
    if (!filters.manufacturers?.length) return null;
    return filters.manufacturers
      .map((id) => manufacturers.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="container-page py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {filters.query
            ? `Suchergebnisse für "${filters.query}"`
            : getManufacturerNames()
            ? `${getManufacturerNames()} Koordinatenmessmaschinen`
            : 'Gebrauchte Koordinatenmessmaschinen'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {filteredListings.length} Maschinen gefunden
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Hersteller, Modell, Stichwort..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Suche löschen"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit">Suchen</Button>
        </div>
      </form>

      <div className="flex gap-8">
        {/* Sidebar Filters - only on desktop */}
        <div className="hidden lg:block">
          <ListingFiltersSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalResults={filteredListings.length}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <ListingFiltersSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  totalResults={filteredListings.length}
                />
              </div>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sortieren" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Rasteransicht"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                aria-label="Listenansicht"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="mb-6">
            <ActiveFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Listings Grid/List */}
          {filteredListings.length > 0 ? (
            <>
              <ListingGrid listings={filteredListings} showCompare viewMode={viewMode} />

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" disabled>
                  Zurück
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="default" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <span className="px-2">...</span>
                  <Button variant="outline" size="sm">
                    10
                  </Button>
                </div>
                <Button variant="outline">Weiter</Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto max-w-md">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Maschinen gefunden</h3>
                <p className="text-muted-foreground mb-4">
                  Versuchen Sie andere Suchbegriffe oder passen Sie Ihre Filter an.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                    router.push(pathname);
                  }}
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare Bar */}
      <CompareBar />
    </div>
  );
}

export function MaschinenPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Lädt...</p>
          </div>
        </div>
      }
    >
      <MaschinenContent />
    </Suspense>
  );
}
