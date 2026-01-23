'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { mockListings } from '@/data/mock-data';
import { PdfExportButton } from '@/components/shared/pdf-export-button';

export default function ComparePage() {
  const { items, removeItem, clearItems, maxItems } = useCompareStore();

  const compareListings = useMemo(() => {
    return items
      .map((id) => mockListings.find((l) => l.id === id))
      .filter(Boolean);
  }, [items]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  // Find best values for highlighting
  const lowestPrice = Math.min(...compareListings.map((l) => l!.price));
  const newestYear = Math.max(...compareListings.map((l) => l!.yearBuilt));
  const largestMeasuringRange = Math.max(
    ...compareListings.map(
      (l) => l!.measuringRangeX * l!.measuringRangeY * l!.measuringRangeZ
    )
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container-page py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Startseite
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Vergleich</span>
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
            <h1 className="text-2xl font-bold">Keine Maschinen im Vergleich</h1>
            <p className="mt-2 text-muted-foreground">
              Fügen Sie Maschinen aus der Übersicht hinzu, um sie zu vergleichen.
              Sie können bis zu {maxItems} Maschinen gleichzeitig vergleichen.
            </p>
            <Button asChild className="mt-6">
              <Link href="/maschinen">
                Maschinen suchen
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
              Startseite
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Vergleich</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Maschinenvergleich</h1>
            <p className="mt-1 text-muted-foreground">
              {items.length} von {maxItems} Maschinen
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearItems}>
              Auswahl löschen
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
                  Eigenschaft
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
                            Kein Bild
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
                        Weitere Maschine hinzufügen
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
                  Preis
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {formatPrice(listing!.price, listing!.currency)}
                      </span>
                      {listing!.price === lowestPrice && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Günstigster
                        </Badge>
                      )}
                    </div>
                    {listing!.priceNegotiable && (
                      <span className="text-sm text-muted-foreground">VB</span>
                    )}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Year */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  Baujahr
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    <div className="flex items-center gap-2">
                      <span>{listing!.yearBuilt}</span>
                      {listing!.yearBuilt === newestYear && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Neuester
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
                  Zustand
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.condition === 'new'
                      ? 'Neu'
                      : listing!.condition === 'like_new'
                      ? 'Wie neu'
                      : listing!.condition === 'good'
                      ? 'Gut'
                      : 'Akzeptabel'}
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
                  Technische Daten
                </TableCell>
              </TableRow>

              {/* Measuring Range */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  Messbereich
                </TableCell>
                {compareListings.map((listing) => {
                  const volume =
                    listing!.measuringRangeX *
                    listing!.measuringRangeY *
                    listing!.measuringRangeZ;
                  return (
                    <TableCell key={listing!.id}>
                      <div className="flex items-center gap-2">
                        <span>
                          {listing!.measuringRangeX} × {listing!.measuringRangeY} ×{' '}
                          {listing!.measuringRangeZ} mm
                        </span>
                        {volume === largestMeasuringRange && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            Größter
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
                  Genauigkeit (MPEE)
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.accuracyUm ? `${listing!.accuracyUm} µm` : '-'}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              {/* Software */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  Software
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
                  Steuerung
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
                  Tastsystem
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.probeSystem || '-'}
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
                  Standort
                </TableCell>
              </TableRow>

              {/* Location */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  Stadt
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.locationCity}
                  </TableCell>
                ))}
                {items.length < maxItems && <TableCell />}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  Land
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.locationCountry}
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
                  Verkäufer
                </TableCell>
              </TableRow>

              {/* Seller Name */}
              <TableRow>
                <TableCell className="font-medium bg-muted/50 sticky left-0">
                  Firma
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
                  Verifiziert
                </TableCell>
                {compareListings.map((listing) => (
                  <TableCell key={listing!.id}>
                    {listing!.seller?.isVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Ja</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span>Nein</span>
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
                          Anfrage senden
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/maschinen/${listing!.slug}`}>
                          Details ansehen
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
