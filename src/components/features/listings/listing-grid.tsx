'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { MapPin, Calendar, Ruler, Building2, ArrowRight, Cpu, Crosshair, ExternalLink } from 'lucide-react';
import { ListingCard } from './listing-card';
import { useCompareStore } from '@/stores/compare-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { Listing } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface ListingGridProps {
  listings: Listing[];
  showCompare?: boolean;
  viewMode?: 'grid' | 'list';
}

export function ListingGrid({ listings, showCompare = true, viewMode = 'grid' }: ListingGridProps) {
  const { toggleItem, isInCompare } = useCompareStore();
  const t = useTranslations('listingGrid');
  const tMachines = useTranslations('machines');

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
        <h3 className="text-lg font-semibold">{t('noMachinesFound')}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {t('adjustFilters')}
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

  // List View — horizontale, informationsreiche Karten
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

// =============================================================================
// List Item — professionelle horizontale Karte
// =============================================================================

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
  const t = useTranslations('listingGrid');
  const tMachines = useTranslations('machines');
  const locale = useLocale();

  const primaryImage = listing.media.find((m) => m.isPrimary) || listing.media[0];
  const isSold = listing.status === 'sold';
  const isNew = listing.publishedAt &&
    new Date(listing.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: listing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const hasMeasuringRange = listing.measuringRangeX || listing.measuringRangeY || listing.measuringRangeZ;

  return (
    <div className={cn(
      'group flex flex-col sm:flex-row gap-0 sm:gap-0 rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg',
      isSold && 'opacity-75'
    )}>
      {/* Bild-Bereich */}
      <Link href={`/maschinen/${listing.slug}`} className="relative shrink-0 sm:w-72 md:w-80">
        <div className="relative aspect-[16/10] sm:aspect-auto sm:h-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-transform duration-300 group-hover:scale-105',
                isSold && 'grayscale'
              )}
              sizes="(max-width: 640px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center text-muted-foreground text-sm">
              {t('noImage')}
            </div>
          )}

          {/* Badges oben links */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {isSold && (
              <Badge variant="secondary" className="bg-neutral-800 text-white text-xs">
                {t('sold')}
              </Badge>
            )}
            {isNew && !isSold && (
              <Badge className="bg-primary text-xs">{t('newBadge') || 'Neu'}</Badge>
            )}
            {listing.featured && !isSold && (
              <Badge variant="outline" className="bg-white/90 text-xs">
                {tMachines('featured')}
              </Badge>
            )}
          </div>

          {/* Compare oben rechts */}
          {showCompare && !isSold && (
            <div className="absolute right-3 top-3" onClick={(e) => e.preventDefault()}>
              <label className="flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-xs font-medium cursor-pointer hover:bg-white">
                <Checkbox
                  checked={isCompared}
                  onCheckedChange={() => onCompareToggle(listing.id)}
                />
                {t('compare')}
              </label>
            </div>
          )}

          {/* Sold Overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-lg bg-white px-4 py-2 font-semibold text-neutral-800 uppercase text-sm">
                {t('sold')}
              </span>
            </div>
          )}

          {/* Bild-Count */}
          {listing.media.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {listing.media.length} {t('photos') || 'Fotos'}
            </div>
          )}
        </div>
      </Link>

      {/* Inhalt-Bereich */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Header: Hersteller + Titel + Preis */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {listing.manufacturer.name}
            </p>
            <Link href={`/maschinen/${listing.slug}`}>
              <h3 className="text-lg font-bold leading-tight hover:text-primary transition-colors line-clamp-1 mt-0.5">
                {listing.title}
              </h3>
            </Link>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-primary">
              {listing.price ? formatPrice(listing.price) : (tMachines('priceOnRequest') || 'VB')}
            </p>
            {!!listing.price && (
              <p className="text-[11px] text-muted-foreground">
                {tMachines('vatExcl')}{listing.priceNegotiable && ` · ${tMachines('negotiable')}`}
              </p>
            )}
          </div>
        </div>

        {/* Technische Details — Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {listing.yearBuilt > 0 && (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
              <Calendar className="h-3 w-3" />
              <span>{t('year') || 'Bj.'} {listing.yearBuilt}</span>
            </div>
          )}
          {hasMeasuringRange && (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
              <Ruler className="h-3 w-3" />
              <span>{listing.measuringRangeX}×{listing.measuringRangeY}×{listing.measuringRangeZ} mm</span>
            </div>
          )}
          {listing.accuracyUm && (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
              <Crosshair className="h-3 w-3" />
              <span>MPEE {listing.accuracyUm}</span>
            </div>
          )}
          {listing.software && (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
              <Cpu className="h-3 w-3" />
              <span>{listing.software}</span>
            </div>
          )}
          {listing.probeSystem && (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
              <Crosshair className="h-3 w-3" />
              <span>{listing.probeSystem}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
            <MapPin className="h-3 w-3" />
            <span>{listing.locationCity}, {listing.locationCountry}</span>
          </div>
        </div>

        {/* Beschreibung (Kurzform) */}
        {listing.description && (
          <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {listing.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
          </p>
        )}

        {/* Separator + Footer */}
        <div className="mt-auto pt-3">
          <Separator className="mb-3" />
          <div className="flex items-center justify-between gap-4">
            {/* Haendler-Info */}
            {listing.seller ? (
              <Link
                href={`/unternehmen/${listing.seller.slug}` as any}
                className="flex items-center gap-2.5 min-w-0 group/seller hover:opacity-80 transition-opacity"
              >
                {listing.seller.logoUrl ? (
                  <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border bg-white">
                    <Image
                      src={listing.seller.logoUrl}
                      alt={listing.seller.companyName}
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate group-hover/seller:text-primary transition-colors">
                    {listing.seller.companyName}
                  </p>
                  {listing.seller.addressCity && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {listing.seller.addressCity}{listing.seller.addressCountry ? `, ${listing.seller.addressCountry}` : ''}
                      {listing.seller.listingCount > 0 && ` · ${listing.seller.listingCount} ${t('listings') || 'Inserate'}`}
                    </p>
                  )}
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover/seller:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <div />
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {showCompare && !isSold && (
                <Button
                  variant={isCompared ? 'secondary' : 'outline'}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onCompareToggle(listing.id)}
                >
                  {isCompared ? (t('inComparison') || 'Im Vergleich') : (t('compare') || 'Vergleichen')}
                </Button>
              )}
              {!isSold && (
                <Button size="sm" className="h-8" asChild>
                  <Link href={`/maschinen/${listing.slug}`}>
                    {t('viewDetails') || 'Details'}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
