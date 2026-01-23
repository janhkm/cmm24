'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
  showCompare?: boolean;
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
  className?: string;
}

export function ListingCard({
  listing,
  showCompare = false,
  isCompared = false,
  onCompareToggle,
  className,
}: ListingCardProps) {
  const primaryImage = listing.media.find((m) => m.isPrimary) || listing.media[0];
  const isSold = listing.status === 'sold';
  const isNew = listing.publishedAt && 
    new Date(listing.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: listing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        isSold && 'opacity-75',
        className
      )}
    >
      <Link href={`/maschinen/${listing.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-transform duration-300 group-hover:scale-105',
                isSold && 'grayscale'
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">Kein Bild</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isSold && (
              <Badge variant="secondary" className="bg-neutral-800 text-white">
                Verkauft
              </Badge>
            )}
            {isNew && !isSold && (
              <Badge className="bg-primary">Neu</Badge>
            )}
            {listing.featured && !isSold && (
              <Badge variant="outline" className="bg-white/90">
                ⭐ Featured
              </Badge>
            )}
          </div>

          {/* Compare Checkbox */}
          {showCompare && !isSold && (
            <div
              className="absolute right-3 top-3"
              onClick={(e) => e.preventDefault()}
            >
              <label className="flex items-center gap-2 rounded-md bg-white/90 px-2 py-1.5 text-xs font-medium cursor-pointer hover:bg-white">
                <Checkbox
                  checked={isCompared}
                  onCheckedChange={() => onCompareToggle?.(listing.id)}
                />
                Vergleichen
              </label>
            </div>
          )}

          {/* Sold Overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-lg bg-white px-4 py-2 font-semibold text-neutral-800">
                VERKAUFT
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Manufacturer */}
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {listing.manufacturer.name}
        </p>

        {/* Title */}
        <Link href={`/maschinen/${listing.slug}`}>
          <h3 className="mt-1 font-semibold leading-tight hover:text-primary transition-colors line-clamp-1">
            {listing.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {listing.locationCity}, {listing.locationCountry}
          </span>
        </div>

        {/* Seller Badge */}
        {listing.seller?.isVerified && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Verifizierter Verkäufer</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold">
              {formatPrice(listing.price)}
            </p>
            {listing.priceNegotiable && (
              <p className="text-xs text-muted-foreground">VB</p>
            )}
          </div>
          {!isSold && (
            <Button size="sm" asChild>
              <Link href={`/maschinen/${listing.slug}`}>Anfrage</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
