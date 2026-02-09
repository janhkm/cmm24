'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { categories, conditions, countries } from '@/data/constants';
import type { ListingFilters } from '@/types';

interface FilterModalProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  resultCount: number;
  manufacturers?: Array<{ id: string; name: string; slug: string; listingCount?: number }>;
}

export function FilterModal({ 
  filters, 
  onFiltersChange, 
  resultCount,
  manufacturers = [],
}: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);

  // Count active filters
  const activeFilterCount = [
    (localFilters.manufacturers?.length || 0) > 0,
    (localFilters.categories?.length || 0) > 0,
    (localFilters.condition?.length || 0) > 0,
    (localFilters.countries?.length || 0) > 0,
    localFilters.priceMin !== undefined || localFilters.priceMax !== undefined,
    localFilters.yearMin !== undefined || localFilters.yearMax !== undefined,
  ].filter(Boolean).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const toggleManufacturer = (id: string) => {
    const current = localFilters.manufacturers || [];
    const updated = current.includes(id)
      ? current.filter((m) => m !== id)
      : [...current, id];
    setLocalFilters({ ...localFilters, manufacturers: updated });
  };

  const toggleCategory = (value: string) => {
    const current = localFilters.categories || [];
    const updated = current.includes(value as any)
      ? current.filter((c) => c !== value)
      : [...current, value as any];
    setLocalFilters({ ...localFilters, categories: updated });
  };

  const toggleCondition = (value: string) => {
    const current = localFilters.condition || [];
    const updated = current.includes(value as any)
      ? current.filter((c) => c !== value)
      : [...current, value as any];
    setLocalFilters({ ...localFilters, condition: updated });
  };

  const toggleCountry = (code: string) => {
    const current = localFilters.countries || [];
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    setLocalFilters({ ...localFilters, countries: updated });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden relative">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge 
              variant="default" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Zurücksetzen
            </Button>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-140px)] py-4">
          <Accordion type="multiple" defaultValue={['manufacturer', 'price']} className="space-y-2">
            {/* Manufacturer */}
            <AccordionItem value="manufacturer" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  Hersteller
                  {(localFilters.manufacturers?.length || 0) > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {localFilters.manufacturers?.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {manufacturers.map((m) => (
                    <div key={m.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`m-${m.id}`}
                        checked={localFilters.manufacturers?.includes(m.id)}
                        onCheckedChange={() => toggleManufacturer(m.id)}
                      />
                      <Label
                        htmlFor={`m-${m.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {m.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        ({m.listingCount})
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Price */}
            <AccordionItem value="price" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Preis
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceMin">Min €</Label>
                      <Input
                        id="priceMin"
                        type="number"
                        placeholder="0"
                        value={localFilters.priceMin || ''}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            priceMin: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceMax">Max €</Label>
                      <Input
                        id="priceMax"
                        type="number"
                        placeholder="∞"
                        value={localFilters.priceMax || ''}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            priceMax: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Year */}
            <AccordionItem value="year" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Baujahr
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearMin">Von</Label>
                      <Input
                        id="yearMin"
                        type="number"
                        placeholder="2000"
                        value={localFilters.yearMin || ''}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            yearMin: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearMax">Bis</Label>
                      <Input
                        id="yearMax"
                        type="number"
                        placeholder={new Date().getFullYear().toString()}
                        value={localFilters.yearMax || ''}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            yearMax: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Category */}
            <AccordionItem value="category" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  Kategorie
                  {(localFilters.categories?.length || 0) > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {localFilters.categories?.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {categories.map((c) => (
                    <div key={c.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`c-${c.value}`}
                        checked={localFilters.categories?.includes(c.value as any)}
                        onCheckedChange={() => toggleCategory(c.value)}
                      />
                      <Label
                        htmlFor={`c-${c.value}`}
                        className="flex-1 cursor-pointer"
                      >
                        {c.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Condition */}
            <AccordionItem value="condition" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  Zustand
                  {(localFilters.condition?.length || 0) > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {localFilters.condition?.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {conditions.map((c) => (
                    <div key={c.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cond-${c.value}`}
                        checked={localFilters.condition?.includes(c.value as any)}
                        onCheckedChange={() => toggleCondition(c.value)}
                      />
                      <Label
                        htmlFor={`cond-${c.value}`}
                        className="flex-1 cursor-pointer"
                      >
                        {c.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Country */}
            <AccordionItem value="country" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  Standort
                  {(localFilters.countries?.length || 0) > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {localFilters.countries?.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {countries.map((c) => (
                    <div key={c.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${c.code}`}
                        checked={localFilters.countries?.includes(c.code)}
                        onCheckedChange={() => toggleCountry(c.code)}
                      />
                      <Label
                        htmlFor={`country-${c.code}`}
                        className="flex-1 cursor-pointer"
                      >
                        {c.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className="border-t pt-4 gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Abbrechen
          </Button>
          <Button onClick={handleApply} className="flex-1">
            {resultCount} Ergebnisse anzeigen
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
