'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoEmbedProps {
  url: string;
  title?: string;
  thumbnailUrl?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  className?: string;
}

/**
 * Extracts video ID and platform from various video URLs
 */
function parseVideoUrl(url: string): { platform: 'youtube' | 'vimeo' | null; videoId: string | null } {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { platform: 'youtube', videoId: match[1] };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { platform: 'vimeo', videoId: match[1] };
    }
  }

  return { platform: null, videoId: null };
}

function getEmbedUrl(platform: 'youtube' | 'vimeo', videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}?dnt=1`;
    default:
      return '';
  }
}

function getThumbnailUrl(platform: 'youtube' | 'vimeo', videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    case 'vimeo':
      // Vimeo requires API call for thumbnail, use placeholder
      return '';
    default:
      return '';
  }
}

export function VideoEmbed({
  url,
  title = 'Video',
  thumbnailUrl: customThumbnail,
  aspectRatio = '16:9',
  className,
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { platform, videoId } = parseVideoUrl(url);

  if (!platform || !videoId) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-lg',
        aspectRatio === '16:9' && 'aspect-video',
        aspectRatio === '4:3' && 'aspect-[4/3]',
        aspectRatio === '1:1' && 'aspect-square',
        className
      )}>
        <p className="text-muted-foreground text-sm">Ungültiger Video-Link</p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(platform, videoId);
  const thumbnail = customThumbnail || getThumbnailUrl(platform, videoId);

  const aspectClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };

  if (isPlaying) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden', aspectClasses[aspectRatio], className)}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Video schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      className={cn(
        'relative group rounded-lg overflow-hidden cursor-pointer w-full',
        aspectClasses[aspectRatio],
        className
      )}
      aria-label={`Video abspielen: ${title}`}
    >
      {/* Thumbnail */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
          <Play className="h-8 w-8 ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Platform Badge */}
      <div className="absolute bottom-3 left-3">
        <span className="px-2 py-1 text-xs font-medium bg-black/60 text-white rounded">
          {platform === 'youtube' ? 'YouTube' : 'Vimeo'}
        </span>
      </div>
    </button>
  );
}
