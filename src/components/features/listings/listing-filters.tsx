'use client';

import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { manufacturers, categories, conditions, countries } from '@/data/mock-data';
import type { ListingFilters } from '@/types';

interface ListingFiltersProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  totalResults: number;
}

export function ListingFiltersSidebar({
  filters,
  onFiltersChange,
  totalResults,
}: ListingFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin ? filters.priceMin / 100 : 0,
    filters.priceMax ? filters.priceMax / 100 : 200000,
  ]);
  const [yearRange, setYearRange] = useState<[number, number]>([
    filters.yearMin || 2010,
    filters.yearMax || new Date().getFullYear(),
  ]);
  const [measuringRangeX, setMeasuringRangeX] = useState<[number, number]>([
    filters.measuringRangeXMin || 0,
    filters.measuringRangeXMax || 3000,
  ]);

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const handleManufacturerToggle = (manufacturerId: string) => {
    const current = filters.manufacturers || [];
    const updated = current.includes(manufacturerId)
      ? current.filter((id) => id !== manufacturerId)
      : [...current, manufacturerId];
    onFiltersChange({ ...filters, manufacturers: updated });
  };

  const handleConditionToggle = (condition: string) => {
    const current = filters.condition || [];
    const updated = current.includes(condition as any)
      ? current.filter((c) => c !== condition)
      : [...current, condition as any];
    onFiltersChange({ ...filters, condition: updated });
  };

  const handleCountryToggle = (country: string) => {
    const current = filters.countries || [];
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    onFiltersChange({ ...filters, countries: updated });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handlePriceCommit = () => {
    onFiltersChange({
      ...filters,
      priceMin: priceRange[0] * 100,
      priceMax: priceRange[1] * 100,
    });
  };

  const handleYearChange = (value: number[]) => {
    setYearRange([value[0], value[1]]);
  };

  const handleYearCommit = () => {
    onFiltersChange({
      ...filters,
      yearMin: yearRange[0],
      yearMax: yearRange[1],
    });
  };

  const handleMeasuringRangeChange = (value: number[]) => {
    setMeasuringRangeX([value[0], value[1]]);
  };

  const handleMeasuringRangeCommit = () => {
    onFiltersChange({
      ...filters,
      measuringRangeXMin: measuringRangeX[0] > 0 ? measuringRangeX[0] : undefined,
      measuringRangeXMax: measuringRangeX[1] < 3000 ? measuringRangeX[1] : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setPriceRange([0, 200000]);
    setYearRange([2010, new Date().getFullYear()]);
    setMeasuringRangeX([0, 3000]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const FilterContent = () => (
    <>
      <Accordion type="multiple" defaultValue={['manufacturer', 'price']} className="w-full">
        {/* Manufacturer Filter */}
        <AccordionItem value="manufacturer">
          <AccordionTrigger className="text-sm font-medium">
            Hersteller
            {filters.manufacturers && filters.manufacturers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.manufacturers.length}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Input
                placeholder="Hersteller suchen..."
                className="mb-2"
              />
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {manufacturers.map((manufacturer) => (
                    <div
                      key={manufacturer.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`manufacturer-${manufacturer.id}`}
                        checked={filters.manufacturers?.includes(manufacturer.id)}
                        onCheckedChange={() => handleManufacturerToggle(manufacturer.id)}
                      />
                      <Label
                        htmlFor={`manufacturer-${manufacturer.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {manufacturer.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        ({manufacturer.listingCount})
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            Preis
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    onBlur={handlePriceCommit}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    placeholder="200.000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    onBlur={handlePriceCommit}
                  />
                </div>
              </div>
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceCommit}
                max={200000}
                step={5000}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Year Filter */}
        <AccordionItem value="year">
          <AccordionTrigger className="text-sm font-medium">
            Baujahr
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Von</Label>
                  <Input
                    type="number"
                    placeholder="2010"
                    value={yearRange[0]}
                    onChange={(e) =>
                      setYearRange([Number(e.target.value), yearRange[1]])
                    }
                    onBlur={handleYearCommit}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Bis</Label>
                  <Input
                    type="number"
                    placeholder={String(new Date().getFullYear())}
                    value={yearRange[1]}
                    onChange={(e) =>
                      setYearRange([yearRange[0], Number(e.target.value)])
                    }
                    onBlur={handleYearCommit}
                  />
                </div>
              </div>
              <Slider
                value={yearRange}
                onValueChange={handleYearChange}
                onValueCommit={handleYearCommit}
                min={2000}
                max={new Date().getFullYear()}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{yearRange[0]}</span>
                <span>{yearRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Condition Filter */}
        <AccordionItem value="condition">
          <AccordionTrigger className="text-sm font-medium">
            Zustand
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {conditions.map((condition) => (
                <div
                  key={condition.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`condition-${condition.value}`}
                    checked={filters.condition?.includes(condition.value as any)}
                    onCheckedChange={() => handleConditionToggle(condition.value)}
                  />
                  <Label
                    htmlFor={`condition-${condition.value}`}
                    className="cursor-pointer text-sm"
                  >
                    {condition.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Measuring Range Filter */}
        <AccordionItem value="measuringRange">
          <AccordionTrigger className="text-sm font-medium">
            Messbereich (X-Achse)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Min (mm)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={measuringRangeX[0]}
                    onChange={(e) =>
                      setMeasuringRangeX([Number(e.target.value), measuringRangeX[1]])
                    }
                    onBlur={handleMeasuringRangeCommit}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Max (mm)</Label>
                  <Input
                    type="number"
                    placeholder="3000"
                    value={measuringRangeX[1]}
                    onChange={(e) =>
                      setMeasuringRangeX([measuringRangeX[0], Number(e.target.value)])
                    }
                    onBlur={handleMeasuringRangeCommit}
                  />
                </div>
              </div>
              <Slider
                value={measuringRangeX}
                onValueChange={handleMeasuringRangeChange}
                onValueCommit={handleMeasuringRangeCommit}
                max={3000}
                step={100}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{measuringRangeX[0]} mm</span>
                <span>{measuringRangeX[1]} mm</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Location Filter */}
        <AccordionItem value="location">
          <AccordionTrigger className="text-sm font-medium">
            Standort
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`country-${country.code}`}
                        checked={filters.countries?.includes(country.code)}
                        onCheckedChange={() => handleCountryToggle(country.code)}
                      />
                      <Label
                        htmlFor={`country-${country.code}`}
                        className="cursor-pointer text-sm"
                      >
                        {country.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-20 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Filter</h2>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto py-1 px-2 text-xs"
              >
                Zurücksetzen
              </Button>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Zurücksetzen
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(90vh-140px)] mt-4">
              <FilterContent />
            </ScrollArea>
            <SheetFooter className="mt-4">
              <Button className="w-full">
                {totalResults} Ergebnisse anzeigen
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Active Filters Chips Component
export function ActiveFilters({
  filters,
  onFiltersChange,
}: {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
}) {
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];

  // Add manufacturer filters
  filters.manufacturers?.forEach((manufacturerId) => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    if (manufacturer) {
      activeFilters.push({
        key: `manufacturer-${manufacturerId}`,
        label: manufacturer.name,
        onRemove: () => {
          onFiltersChange({
            ...filters,
            manufacturers: filters.manufacturers?.filter((id) => id !== manufacturerId),
          });
        },
      });
    }
  });

  // Add condition filters
  filters.condition?.forEach((condition) => {
    const conditionLabel = conditions.find((c) => c.value === condition)?.label;
    if (conditionLabel) {
      activeFilters.push({
        key: `condition-${condition}`,
        label: conditionLabel,
        onRemove: () => {
          onFiltersChange({
            ...filters,
            condition: filters.condition?.filter((c) => c !== condition),
          });
        },
      });
    }
  });

  // Add price filter
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin ? (filters.priceMin / 100).toLocaleString('de-DE') : '0';
    const max = filters.priceMax ? (filters.priceMax / 100).toLocaleString('de-DE') : '∞';
    activeFilters.push({
      key: 'price',
      label: `${min} € - ${max} €`,
      onRemove: () => {
        const { priceMin, priceMax, ...rest } = filters;
        onFiltersChange(rest);
      },
    });
  }

  // Add year filter
  if (filters.yearMin || filters.yearMax) {
    activeFilters.push({
      key: 'year',
      label: `Bj. ${filters.yearMin || '2000'} - ${filters.yearMax || new Date().getFullYear()}`,
      onRemove: () => {
        const { yearMin, yearMax, ...rest } = filters;
        onFiltersChange(rest);
      },
    });
  }

  // Add query filter
  if (filters.query) {
    activeFilters.push({
      key: 'query',
      label: `"${filters.query}"`,
      onRemove: () => {
        const { query, ...rest } = filters;
        onFiltersChange(rest);
      },
    });
  }

  // Add measuring range filter
  if (filters.measuringRangeXMin || filters.measuringRangeXMax) {
    const min = filters.measuringRangeXMin || 0;
    const max = filters.measuringRangeXMax || '∞';
    activeFilters.push({
      key: 'measuringRange',
      label: `X: ${min} - ${max} mm`,
      onRemove: () => {
        const { measuringRangeXMin, measuringRangeXMax, ...rest } = filters;
        onFiltersChange(rest);
      },
    });
  }

  // Add country filters
  filters.countries?.forEach((countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      activeFilters.push({
        key: `country-${countryCode}`,
        label: country.name,
        onRemove: () => {
          onFiltersChange({
            ...filters,
            countries: filters.countries?.filter((c) => c !== countryCode),
          });
        },
      });
    }
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
