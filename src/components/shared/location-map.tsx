'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationMapProps {
  city: string;
  country: string;
  postalCode?: string;
  /** Approximate coordinates (not exact for privacy) */
  latitude?: number;
  longitude?: number;
  className?: string;
  /** Show interactive map or just static preview */
  interactive?: boolean;
}

// Static map component using OpenStreetMap
export function LocationMap({
  city,
  country,
  postalCode,
  latitude,
  longitude,
  className,
  interactive = false,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(false);

  // For now, we'll use a static map preview
  // In production, this would integrate with Leaflet or Mapbox
  const locationString = [city, postalCode, country].filter(Boolean).join(', ');
  
  // Create a static map URL using OpenStreetMap
  const getStaticMapUrl = () => {
    if (latitude && longitude) {
      // Use OpenStreetMap static image service
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=10&size=400x200&maptype=mapnik`;
    }
    return null;
  };

  const staticMapUrl = getStaticMapUrl();

  // Fallback to a styled placeholder if no coordinates
  if (!latitude || !longitude || !interactive) {
    return (
      <div
        className={cn(
          'relative rounded-lg overflow-hidden bg-muted',
          className
        )}
      >
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Location Info */}
        <div className="relative flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <p className="font-medium text-foreground">{city}</p>
          <p className="text-sm text-muted-foreground">
            {postalCode && `${postalCode}, `}{country}
          </p>
          
          {/* Privacy Notice */}
          <p className="mt-4 text-xs text-muted-foreground max-w-[200px]">
            Genauer Standort wird nach Anfrage mitgeteilt
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 flex gap-1">
          <div className="h-2 w-2 rounded-full bg-primary/40" />
          <div className="h-2 w-2 rounded-full bg-primary/30" />
          <div className="h-2 w-2 rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  // Interactive map placeholder - would use Leaflet in production
  return (
    <div
      ref={mapRef}
      className={cn(
        'relative rounded-lg overflow-hidden bg-muted',
        className
      )}
    >
      {staticMapUrl && !error ? (
        <img
          src={staticMapUrl}
          alt={`Karte von ${locationString}`}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
          onLoad={() => setMapLoaded(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="font-medium">{city}</p>
          <p className="text-sm text-muted-foreground">{country}</p>
        </div>
      )}

      {/* Location Pin Overlay */}
      {mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <MapPin className="h-8 w-8 text-primary drop-shadow-lg" fill="currentColor" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-sm" />
          </div>
        </div>
      )}

      {/* Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <p className="text-white text-sm font-medium">{locationString}</p>
      </div>
    </div>
  );
}

// Simple inline location display
export function LocationBadge({
  city,
  country,
  className,
}: {
  city: string;
  country: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5 text-muted-foreground', className)}>
      <MapPin className="h-4 w-4" />
      <span className="text-sm">
        {city}, {country}
      </span>
    </div>
  );
}
