'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ListingMedia } from '@/types';

interface ImageGalleryProps {
  media: ListingMedia[];
  title: string;
  badges?: {
    isNew?: boolean;
    isSold?: boolean;
    isReduced?: boolean;
  };
}

export function ImageGallery({ media, title, badges }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');
  const allMedia = [...images, ...videos];

  const currentMedia = allMedia[currentIndex];
  const isVideo = currentMedia?.type === 'video';

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'Escape') setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrevious]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  if (allMedia.length === 0) {
    return (
      <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Keine Bilder verfügbar</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden group">
          {isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <iframe
                src={currentMedia.url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <Image
              src={currentMedia.url}
              alt={`${title} - Bild ${currentIndex + 1}`}
              fill
              className="object-contain cursor-pointer"
              onClick={() => setLightboxOpen(true)}
              priority={currentIndex === 0}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {badges?.isNew && (
              <Badge className="bg-primary">Neu</Badge>
            )}
            {badges?.isSold && (
              <Badge variant="secondary">Verkauft</Badge>
            )}
            {badges?.isReduced && (
              <Badge className="bg-orange-500">Reduziert</Badge>
            )}
          </div>

          {/* Zoom button */}
          {!isVideo && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 right-3 h-9 w-9 bg-background/80 backdrop-blur rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Vergrößern"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          )}

          {/* Navigation Arrows */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Vorheriges Bild"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Nächstes Bild"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {allMedia.length}
          </div>
        </div>

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allMedia.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-15 rounded-lg overflow-hidden border-2 transition-colors',
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                ) : (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && !isVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">
              {currentIndex + 1} / {allMedia.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Schließen"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Lightbox Image */}
          <div
            className="flex-1 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-full max-h-full">
              <Image
                src={currentMedia.url}
                alt={`${title} - Bild ${currentIndex + 1}`}
                width={1200}
                height={900}
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Vorheriges Bild"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Nächstes Bild"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails */}
          <div className="p-4 flex justify-center gap-2 overflow-x-auto">
            {allMedia.map((item, index) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors',
                  index === currentIndex
                    ? 'border-white'
                    : 'border-transparent opacity-50 hover:opacity-100'
                )}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
