'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Ruler } from 'lucide-react';
import { ListingCard } from './listing-card';
import { useCompareStore } from '@/stores/compare-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/types';

interface ListingGridProps {
  listings: Listing[];
  showCompare?: boolean;
  viewMode?: 'grid' | 'list';
}

export function ListingGrid({ listings, showCompare = true, viewMode = 'grid' }: ListingGridProps) {
  const { toggleItem, isInCompare } = useCompareStore();

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Keine Maschinen gefunden</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Versuchen Sie, Ihre Filter anzupassen oder die Suche zu erweitern.
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showCompare={showCompare}
            isCompared={isInCompare(listing.id)}
            onCompareToggle={toggleItem}
          />
        ))}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <ListingListItem
          key={listing.id}
          listing={listing}
          showCompare={showCompare}
          isCompared={isInCompare(listing.id)}
          onCompareToggle={toggleItem}
        />
      ))}
    </div>
  );
}

// List Item Component for List View
function ListingListItem({
  listing,
  showCompare,
  isCompared,
  onCompareToggle,
}: {
  listing: Listing;
  showCompare: boolean;
  isCompared: boolean;
  onCompareToggle: (id: string) => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: listing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const isSold = listing.status === 'sold';

  return (
    <div className="group flex gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md">
      {/* Image */}
      <Link href={`/maschinen/${listing.slug}`} className="relative shrink-0">
        <div className="relative h-32 w-48 overflow-hidden rounded-md bg-muted">
          {listing.media[0] ? (
            <Image
              src={listing.media[0].url}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Kein Bild
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="secondary">VERKAUFT</Badge>
            </div>
          )}
          {listing.featured && !isSold && (
            <Badge className="absolute left-2 top-2" variant="default">
              Featured
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {listing.manufacturer.name}
              </p>
              <Link href={`/maschinen/${listing.slug}`}>
                <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                  {listing.title}
                </h3>
              </Link>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary">{formatPrice(listing.price)}</p>
              <p className="text-xs text-muted-foreground">
                zzgl. MwSt. {listing.priceNegotiable && '· VB'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Bj. {listing.yearBuilt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              <span>
                {listing.measuringRangeX}×{listing.measuringRangeY}×{listing.measuringRangeZ} mm
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {listing.locationCity}, {listing.locationCountry}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button asChild size="sm" disabled={isSold}>
            <Link href={`/maschinen/${listing.slug}`}>Details ansehen</Link>
          </Button>
          {showCompare && !isSold && (
            <Button
              variant={isCompared ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onCompareToggle(listing.id)}
            >
              {isCompared ? 'Im Vergleich' : 'Vergleichen'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
