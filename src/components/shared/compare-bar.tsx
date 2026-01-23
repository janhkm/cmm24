'use client';

import Link from 'next/link';
import { X, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/stores/compare-store';
import { mockListings } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function CompareBar() {
  const { items, removeItem, clearItems, maxItems } = useCompareStore();

  if (items.length === 0) return null;

  const compareListings = items
    .map((id) => mockListings.find((l) => l.id === id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="container-page py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {items.length} von {maxItems} Maschinen zum Vergleichen
              </span>
            </div>

            {/* Thumbnails */}
            <div className="hidden sm:flex items-center gap-2">
              {compareListings.map((listing) => (
                <div
                  key={listing!.id}
                  className="relative group flex items-center gap-2 rounded-md border bg-card px-2 py-1"
                >
                  <span className="text-sm truncate max-w-[150px]">
                    {listing!.title}
                  </span>
                  <button
                    onClick={() => removeItem(listing!.id)}
                    className="rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearItems}>
              Auswahl löschen
            </Button>
            <Button asChild disabled={items.length < 2}>
              <Link href="/vergleich">Vergleichen</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
