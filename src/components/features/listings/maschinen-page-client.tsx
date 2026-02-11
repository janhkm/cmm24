'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpDown, Search, X, Loader2 } from 'lucide-react';
// AUSKOMMENTIERT: import { LayoutGrid, List } from 'lucide-react';
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
import { getPublicListings, getManufacturers, type PublicListing } from '@/lib/actions/listings';
import type { ListingFilters, Listing, Manufacturer } from '@/types';

// Convert PublicListing to Listing format for ListingGrid compatibility
function convertToListing(pl: PublicListing, unknownLabel: string): Listing {
  return {
    id: pl.id,
    accountId: pl.account_id,
    manufacturerId: pl.manufacturer_id,
    manufacturer: pl.manufacturer ? {
      id: pl.manufacturer.id,
      name: pl.manufacturer.name,
      slug: pl.manufacturer.slug,
      logoUrl: undefined,
      country: undefined,
      listingCount: 0,
    } : {
      id: '',
      name: unknownLabel,
      slug: '',
      logoUrl: undefined,
      country: undefined,
      listingCount: 0,
    },
    title: pl.title,
    slug: pl.slug,
    description: pl.description,
    price: pl.price,
    priceNegotiable: pl.price_negotiable || false,
    currency: pl.currency || 'EUR',
    yearBuilt: pl.year_built,
    condition: pl.condition,
    measuringRangeX: pl.measuring_range_x || undefined,
    measuringRangeY: pl.measuring_range_y || undefined,
    measuringRangeZ: pl.measuring_range_z || undefined,
    accuracyUm: pl.accuracy_um || undefined,
    software: pl.software || undefined,
    controller: pl.controller || undefined,
    probeSystem: pl.probe_system || undefined,
    locationCountry: pl.location_country,
    locationCity: pl.location_city,
    locationPostalCode: pl.location_postal_code,
    status: pl.status || 'active',
    featured: pl.featured || false,
    viewsCount: pl.views_count || 0,
    publishedAt: pl.published_at || undefined,
    createdAt: pl.created_at || '',
    updatedAt: pl.updated_at || '',
    seller: pl.account ? {
      id: pl.account.id,
      companyName: pl.account.company_name,
      slug: pl.account.slug,
      logoUrl: pl.account.logo_url || undefined,
      isVerified: pl.account.is_verified,
      isPremium: pl.account.is_premium || false,
      listingCount: 0,
    } : undefined,
    media: pl.media.map((m) => ({
      id: m.id,
      listingId: pl.id,
      type: 'image' as const,
      url: m.url,
      thumbnailUrl: m.thumbnail_url || m.url,
      filename: m.filename || '',
      sortOrder: m.sort_order || 0,
      isPrimary: m.is_primary || false,
    })),
  };
}

function MaschinenContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('machines');
  const ts = useTranslations('sortOptions');
  const tc = useTranslations('common');
  const locale = useLocale();

  // Sort options using translations
  const sortOpts = [
    { value: 'relevance', label: ts('relevance') },
    { value: 'date_desc', label: ts('date_desc') },
    { value: 'date_asc', label: ts('date_asc') },
    { value: 'price_asc', label: ts('price_asc') },
    { value: 'price_desc', label: ts('price_desc') },
    { value: 'year_desc', label: ts('year_desc') },
    { value: 'year_asc', label: ts('year_asc') },
  ];

  // State
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

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

    const messMin = searchParams.get('mess_min');
    if (messMin) filters.measuringRangeXMin = parseInt(messMin);

    const messMax = searchParams.get('mess_max');
    if (messMax) filters.measuringRangeXMax = parseInt(messMax);

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<ListingFilters>(getFiltersFromURL);
  const [sortBy, setSortBy] = useState(searchParams.get('sortierung') || 'relevance');
  // AUSKOMMENTIERT: Grid/List Toggle — nur noch Listenansicht
  // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const viewMode = 'list' as const;
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Load manufacturers on mount
  useEffect(() => {
    const loadManufacturers = async () => {
      const result = await getManufacturers();
      if (result.success && result.data) {
        setManufacturers(result.data);
      }
    };
    loadManufacturers();
  }, []);

  // Load listings when filters or sort change
  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      
      // Map sort option to API sort parameter
      let apiSortBy: 'newest' | 'price_asc' | 'price_desc' | 'year_desc' = 'newest';
      switch (sortBy) {
        case 'price_asc':
          apiSortBy = 'price_asc';
          break;
        case 'price_desc':
          apiSortBy = 'price_desc';
          break;
        case 'year_desc':
          apiSortBy = 'year_desc';
          break;
        default:
          apiSortBy = 'newest';
      }

      // Build filter options for API — Multi-Select fuer Hersteller, Zustand, Land
      const result = await getPublicListings({
        search: filters.query,
        manufacturerIds: filters.manufacturers?.length ? filters.manufacturers : undefined,
        conditions: filters.condition?.length ? filters.condition : undefined,
        priceMin: filters.priceMin ? filters.priceMin / 100 : undefined,
        priceMax: filters.priceMax ? filters.priceMax / 100 : undefined,
        yearMin: filters.yearMin,
        yearMax: filters.yearMax,
        measuringRangeXMin: filters.measuringRangeXMin,
        measuringRangeXMax: filters.measuringRangeXMax,
        countries: filters.countries?.length ? filters.countries : undefined,
        sortBy: apiSortBy,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });
      
      if (result.success && result.data) {
        setListings(result.data.listings.map((pl) => convertToListing(pl, tc('unknown'))));
        setTotal(result.data.total);
      } else {
        setListings([]);
        setTotal(0);
      }
      
      setIsLoading(false);
    };
    
    loadListings();
  }, [filters, sortBy, currentPage, tc]);

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
      if (newFilters.measuringRangeXMin) params.set('mess_min', String(newFilters.measuringRangeXMin));
      if (newFilters.measuringRangeXMax) params.set('mess_max', String(newFilters.measuringRangeXMax));
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
      setCurrentPage(1); // Reset to first page
      updateURL(newFilters, sortBy);
    },
    [sortBy, updateURL]
  );

  // Handle sort changes
  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      setCurrentPage(1); // Reset to first page
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

  // Get manufacturer name for display
  const getManufacturerNames = () => {
    if (!filters.manufacturers?.length) return null;
    return filters.manufacturers
      .map((id) => manufacturers.find((m) => m.id === id || m.slug === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Pagination
  const totalPages = Math.ceil(total / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-page py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {filters.query
            ? t('searchResults', { query: filters.query })
            : getManufacturerNames()
            ? t('manufacturerResults', { manufacturer: getManufacturerNames() || '' })
            : t('title')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading ? tc('loading') : t('totalFound', { total })}
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
              placeholder={t('searchPlaceholder')}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('clearSearch')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tc('search')}
          </Button>
        </div>
      </form>

      {/* Mobile Inline Filters (eingeklappt, oberhalb der Listings) */}
      <div className="lg:hidden mb-6">
        <ListingFiltersSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalResults={total}
          manufacturers={manufacturers}
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - only on desktop */}
        <ListingFiltersSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalResults={total}
          manufacturers={manufacturers}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Sort Select */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('sort')} />
                </SelectTrigger>
                <SelectContent>
                  {sortOpts.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AUSKOMMENTIERT: View Toggle (nur noch Listenansicht)
            <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
              <Button variant="ghost" size="sm"><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant="secondary" size="sm"><List className="h-4 w-4" /></Button>
            </div>
            */}
          </div>

          {/* Active Filters */}
          <div className="mb-6">
            <ActiveFilters filters={filters} onFiltersChange={handleFiltersChange} manufacturers={manufacturers} />
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : listings.length > 0 ? (
            <>
              <ListingGrid listings={listings} showCompare viewMode={viewMode} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t('prev')}
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t('nextPage')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto max-w-md">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noMachines')}</h3>
                <p className="text-muted-foreground mb-4">
                  {total === 0 && !filters.query && !filters.manufacturers?.length
                    ? t('noMachinesDesc')
                    : t('noMachinesHint')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                    setCurrentPage(1);
                    router.push(pathname);
                  }}
                >
                  {t('resetFilters')}
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
  const tc = useTranslations('common');

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">{tc('loading')}</p>
          </div>
        </div>
      }
    >
      <MaschinenContent />
    </Suspense>
  );
}
