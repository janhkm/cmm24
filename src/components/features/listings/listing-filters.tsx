'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Factory, Euro, Ruler, Shield, Calendar, MapPin } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categories, conditions, countries } from '@/data/constants';
import type { ListingFilters } from '@/types';

interface ListingFiltersProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  totalResults: number;
  manufacturers?: Array<{ id: string; name: string; slug: string; listingCount?: number }>;
}

export function ListingFiltersSidebar({
  filters,
  onFiltersChange,
  totalResults,
  manufacturers = [],
}: ListingFiltersProps) {
  const t = useTranslations('filters');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [manufacturerSearch, setManufacturerSearch] = useState('');

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

  // Dirty-State: Pruefen ob lokale Slider/Input-Werte von den committed Filtern abweichen
  const committedPrice: [number, number] = [
    filters.priceMin ? filters.priceMin / 100 : 0,
    filters.priceMax ? filters.priceMax / 100 : 200000,
  ];
  const committedYear: [number, number] = [
    filters.yearMin || 2010,
    filters.yearMax || new Date().getFullYear(),
  ];
  const committedMeasuring: [number, number] = [
    filters.measuringRangeXMin || 0,
    filters.measuringRangeXMax || 3000,
  ];

  const isPriceDirty = priceRange[0] !== committedPrice[0] || priceRange[1] !== committedPrice[1];
  const isYearDirty = yearRange[0] !== committedYear[0] || yearRange[1] !== committedYear[1];
  const isMeasuringDirty = measuringRangeX[0] !== committedMeasuring[0] || measuringRangeX[1] !== committedMeasuring[1];

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
    setManufacturerSearch('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ---- Sektionsheader im Home-Stil ----
  const SectionHeader = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
      <Icon className="h-4 w-4" />
      {children}
    </h3>
  );

  // ---- Desktop Filter Content ----
  const DesktopFilterContent = () => (
    <div className="space-y-6">
      {/* Hersteller */}
      <div>
        <SectionHeader icon={Factory}>{t('manufacturer')}</SectionHeader>
        <Input
          placeholder={t('searchManufacturer')}
          className="mb-2"
          value={manufacturerSearch}
          onChange={(e) => setManufacturerSearch(e.target.value)}
        />
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {manufacturers
              .filter((m) => !manufacturerSearch || m.name.toLowerCase().includes(manufacturerSearch.toLowerCase()))
              .map((manufacturer) => (
              <div
                key={manufacturer.id}
                className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
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
                {manufacturer.listingCount !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ({manufacturer.listingCount})
                  </span>
                )}
              </div>
            ))}
            {manufacturers.filter((m) => !manufacturerSearch || m.name.toLowerCase().includes(manufacturerSearch.toLowerCase())).length === 0 && (
              <p className="text-xs text-muted-foreground py-2 px-2.5">{tc('noResults')}</p>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Preis */}
      <div>
        <SectionHeader icon={Euro}>{t('price')}</SectionHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">{tc('min')}</Label>
              <Input
                type="number"
                placeholder="0"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">{tc('max')}</Label>
              <Input
                type="number"
                placeholder="200.000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
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
          {isPriceDirty && (
            <Button size="sm" className="w-full" onClick={handlePriceCommit}>
              {t('applyFilter')}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Baujahr */}
      <div>
        <SectionHeader icon={Calendar}>{t('yearBuilt')}</SectionHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">{tc('from')}</Label>
              <Input
                type="number"
                placeholder="2010"
                value={yearRange[0]}
                onChange={(e) =>
                  setYearRange([Number(e.target.value), yearRange[1]])
                }
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">{tc('to')}</Label>
              <Input
                type="number"
                placeholder={String(new Date().getFullYear())}
                value={yearRange[1]}
                onChange={(e) =>
                  setYearRange([yearRange[0], Number(e.target.value)])
                }
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
          {isYearDirty && (
            <Button size="sm" className="w-full" onClick={handleYearCommit}>
              {t('applyFilter')}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Zustand */}
      <div>
        <SectionHeader icon={Shield}>{t('condition')}</SectionHeader>
        <div className="space-y-1">
          {conditions.map((condition) => (
            <div
              key={condition.value}
              className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
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
      </div>

      <Separator />

      {/* Messbereich */}
      <div>
        <SectionHeader icon={Ruler}>{t('measuringRange')}</SectionHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">{t('minMm')}</Label>
              <Input
                type="number"
                placeholder="0"
                value={measuringRangeX[0]}
                onChange={(e) =>
                  setMeasuringRangeX([Number(e.target.value), measuringRangeX[1]])
                }
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">{t('maxMm')}</Label>
              <Input
                type="number"
                placeholder="3000"
                value={measuringRangeX[1]}
                onChange={(e) =>
                  setMeasuringRangeX([measuringRangeX[0], Number(e.target.value)])
                }
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
          {isMeasuringDirty && (
            <Button size="sm" className="w-full" onClick={handleMeasuringRangeCommit}>
              {t('applyFilter')}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Standort */}
      <div>
        <SectionHeader icon={MapPin}>{t('location')}</SectionHeader>
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
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
    </div>
  );

  // ---- Mobile Accordion Filter Content (Home-Stil) ----
  const MobileFilterContent = () => (
    <Accordion type="multiple" className="w-full">
      {/* Hersteller */}
      <AccordionItem value="manufacturer">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><Factory className="h-4 w-4" /> {t('manufacturer')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <Input
              placeholder={t('searchManufacturer')}
              className="mb-2"
              value={manufacturerSearch}
              onChange={(e) => setManufacturerSearch(e.target.value)}
            />
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {manufacturers
                  .filter((m) => !manufacturerSearch || m.name.toLowerCase().includes(manufacturerSearch.toLowerCase()))
                  .map((manufacturer) => (
                  <div
                    key={manufacturer.id}
                    className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      id={`m-manufacturer-${manufacturer.id}`}
                      checked={filters.manufacturers?.includes(manufacturer.id)}
                      onCheckedChange={() => handleManufacturerToggle(manufacturer.id)}
                    />
                    <Label
                      htmlFor={`m-manufacturer-${manufacturer.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {manufacturer.name}
                    </Label>
                    {manufacturer.listingCount !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        ({manufacturer.listingCount})
                      </span>
                    )}
                  </div>
                ))}
                {manufacturers.filter((m) => !manufacturerSearch || m.name.toLowerCase().includes(manufacturerSearch.toLowerCase())).length === 0 && (
                  <p className="text-xs text-muted-foreground py-2 px-2.5">{tc('noResults')}</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Preis */}
      <AccordionItem value="price">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><Euro className="h-4 w-4" /> {t('price')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">{tc('min')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">{tc('max')}</Label>
                <Input
                  type="number"
                  placeholder="200.000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
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
            {isPriceDirty && (
              <Button size="sm" className="w-full" onClick={handlePriceCommit}>
                {t('applyFilter')}
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Baujahr */}
      <AccordionItem value="year">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {t('yearBuilt')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">{tc('from')}</Label>
                <Input
                  type="number"
                  placeholder="2010"
                  value={yearRange[0]}
                  onChange={(e) =>
                    setYearRange([Number(e.target.value), yearRange[1]])
                  }
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">{tc('to')}</Label>
                <Input
                  type="number"
                  placeholder={String(new Date().getFullYear())}
                  value={yearRange[1]}
                  onChange={(e) =>
                    setYearRange([yearRange[0], Number(e.target.value)])
                  }
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
            {isYearDirty && (
              <Button size="sm" className="w-full" onClick={handleYearCommit}>
                {t('applyFilter')}
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Zustand */}
      <AccordionItem value="condition">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> {t('condition')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            {conditions.map((condition) => (
              <div
                key={condition.value}
                className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
              >
                <Checkbox
                  id={`m-condition-${condition.value}`}
                  checked={filters.condition?.includes(condition.value as any)}
                  onCheckedChange={() => handleConditionToggle(condition.value)}
                />
                <Label
                  htmlFor={`m-condition-${condition.value}`}
                  className="cursor-pointer text-sm"
                >
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Messbereich */}
      <AccordionItem value="measuringRange">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><Ruler className="h-4 w-4" /> {t('measuringRange')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">{t('minMm')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={measuringRangeX[0]}
                  onChange={(e) =>
                    setMeasuringRangeX([Number(e.target.value), measuringRangeX[1]])
                  }
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">{t('maxMm')}</Label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={measuringRangeX[1]}
                  onChange={(e) =>
                    setMeasuringRangeX([measuringRangeX[0], Number(e.target.value)])
                  }
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
            {isMeasuringDirty && (
              <Button size="sm" className="w-full" onClick={handleMeasuringRangeCommit}>
                {t('applyFilter')}
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Standort */}
      <AccordionItem value="location">
        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t('location')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {countries.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center space-x-2 rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
                >
                  <Checkbox
                    id={`m-country-${country.code}`}
                    checked={filters.countries?.includes(country.code)}
                    onCheckedChange={() => handleCountryToggle(country.code)}
                  />
                  <Label
                    htmlFor={`m-country-${country.code}`}
                    className="cursor-pointer text-sm"
                  >
                    {country.name}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <>
      {/* Desktop Sidebar — gleicher Stil wie Home-Seite */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{t('title')}</h2>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto py-1 px-2 text-xs"
              >
                {t('reset')}
              </Button>
            )}
          </div>
          <DesktopFilterContent />
        </div>
      </aside>

      {/* Mobile Inline Filter (eingeklappt, Accordion im Home-Stil) */}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">{t('title')}</h2>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto py-1 px-2 text-xs"
            >
              {t('reset')}
            </Button>
          )}
        </div>
        <MobileFilterContent />
      </div>
    </>
  );
}

// Active Filters Chips Component
export function ActiveFilters({
  filters,
  onFiltersChange,
  manufacturers = [],
}: {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  manufacturers?: Array<{ id: string; name: string; slug: string }>;
}) {
  const locale = useLocale();

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
    const min = filters.priceMin ? (filters.priceMin / 100).toLocaleString(locale) : '0';
    const max = filters.priceMax ? (filters.priceMax / 100).toLocaleString(locale) : '∞';
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
