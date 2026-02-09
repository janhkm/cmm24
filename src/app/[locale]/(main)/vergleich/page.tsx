'use client';

import { useMemo, useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import {
  ChevronRight,
  X,
  Plus,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCompareStore } from '@/stores/compare-store';
import { getListingsByIds } from '@/lib/actions/listings';
import { PdfExportButton } from '@/components/shared/pdf-export-button';

export default function ComparePage() {
  const t = useTranslations('comparePage');
  const tBreadcrumb = useTranslations('breadcrumb');
  const tConditions = useTranslations('conditions');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { items, removeItem, clearItems, maxItems } = useCompareStore();
  const [compareListings, setCompareListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listings aus der Datenbank laden wenn sich die IDs aendern
  useEffect(() => {
    if (items.length === 0) {
      setCompareListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getListingsByIds(items).then((result) => {
      if (result.success && result.data) {
        setCompareListings(result.data);
      }
      setIsLoading(false);
    });
  }, [items]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  // Find best values for highlighting
  const lowestPrice = compareListings.length > 0 ? Math.min(...compareListings.map((l) => l!.price)) : 0;
  const newestYear = compareListings.length > 0 ? Math.max(...compareListings.map((l) => l!.year_built)) : 0;
  const largestMeasuringRange = compareListings.length > 0 ? Math.max(
    ...compareListings.map(
      (l) => (l!.measuring_range_x || 0) * (l!.measuring_range_y || 0) * (l!.measuring_range_z || 0)
    )
  ) : 0;

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container-page py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                {tBreadcrumb('home')}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{tBreadcrumb('compare')}</span>
            </nav>
          </div>
        </div>

        <div className="container-page py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{t('emptyTitle')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('emptyDesc', { max: maxItems })}
            </p>
            <Button asChild className="mt-6">
              <Link href="/maschinen">
                {t('searchMachines')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {tBreadcrumb('home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{tBreadcrumb('compare')}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="mt-1 text-muted-foreground">
              {t('machinesOf', { count: items.length, max: maxItems })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearItems}>
              {t('clearSelection')}
            </Button>
            <PdfExportButton listings={compareListings.filter(Boolean) as any} />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 bg-muted/50 sticky left-0 z-10">
                  {t('property')}
                </TableHead>
                {compareListings.map((listing) => (
                  <TableHead key={listing!.id} className="min-w-[250px]">
                    <div className="space-y-3">
                      {/* Image */}
                      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-muted">
                        {listing!.media[0] ? (
                          <Image
                            src={listing!.media[0].url}
                            alt={listing!.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            {t('noImage')}
                          </div>
                        )}
                      </div>
                      {/* Title & Remove */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            {listing!.manufacturer.name}
                          </p>
                          <Link
                            href={`/maschinen/${listing!.slug}`}
                            className="font-semibold hover:text-primary"
                          >
                            {listing!.title}
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeItem(listing!.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableHead>
                ))}
                {/* Add More Column */}
                {items.length < maxItems && (
                  <TableHead className="min-w-[200px]">
                    <Link
                      href="/maschinen"
                      className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {t('addMore')}
                      </span>
                    </Link>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Price */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('price')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {formatPrice(listing!.price, listing!.currency)}
                      </span>
                      {listing!.price === lowestPrice && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {t('cheapest')}
                        </Badge>
                      )}
                    </div>
                    {listing!.price_negotiable && (
                      <span className="text-sm text-muted-foreground">{t('negotiable')}</span>
                    )}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Year */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('yearBuilt')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    <div className="flex items-center gap-2">
                      <span>{listing!.year_built}</span>
                      {listing!.year_built === newestYear && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {t('newest')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Condition */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('condition')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {tConditions(listing!.condition)}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Section: Technical Data */}
              <TableRow className="bg-muted/30">
                <TableCell
                  colSpan={compareListings.length + 2}
                  className="font-semibold"
                >
                  {t('technicalData')}
                </TableCell>
              </TableRow>

              {/* Measuring Range */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('measuringRange')}
                </TableCell>
                {compareListings.map((listing) => {
                  const volume =
                    (listing!.measuring_range_x || 0) *
                    (listing!.measuring_range_y || 0) *
                    (listing!.measuring_range_z || 0);
                  return (
                    <TableCell key={listing!.id}>
                      <div className="flex items-center gap-2">
                        <span>
                          {listing!.measuring_range_x ?? '-'} × {listing!.measuring_range_y ?? '-'} ×{' '}
                          {listing!.measuring_range_z ?? '-'} mm
                        </span>
                        {volume === largestMeasuringRange && largestMeasuringRange > 0 && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {t('largest')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Accuracy */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('accuracy')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.accuracy_um ? `${listing!.accuracy_um} µm` : '-'}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Software */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('software')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.software || '-'}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Controller */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('controller')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.controller || '-'}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Probe System */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('probeSystem')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.probe_system || '-'}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Section: Location */}
              <TableRow className="bg-muted/30">
                <TableCell
                  colSpan={compareListings.length + 2}
                  className="font-semibold"
                >
                  {t('locationSection')}
                </TableCell>
              </TableRow>

              {/* Location */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('city')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.location_city}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('country')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.location_country}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Section: Seller */}
              <TableRow className="bg-muted/30">
                <TableCell
                  colSpan={compareListings.length + 2}
                  className="font-semibold"
                >
                  {t('sellerSection')}
                </TableCell>
              </TableRow>

              {/* Seller Name */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('company')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.seller?.companyName || '-'}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Verified */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  {t('verified')}
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.seller?.isVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>{tCommon('yes')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span>{tCommon('no')}</span>
                      </div>
                    )}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Actions */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0" />
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link href={`/maschinen/${listing!.slug}`}>
                          {t('sendInquiry')}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/maschinen/${listing!.slug}`}>
                          {t('viewDetails')}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
