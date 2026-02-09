/**
 * Image Processing mit Sharp.
 * Erzeugt Thumbnails und optimierte Versionen von hochgeladenen Bildern.
 */

import sharp from 'sharp';

// ============================================
// Types
// ============================================

export interface ProcessedImage {
  original: Buffer;
  thumbnail: Buffer;
  medium: Buffer;
  originalMime: string;
}

export interface ImageVariants {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
}

// ============================================
// Konfiguration
// ============================================

const THUMBNAIL_SIZE = { width: 400, height: 300 };
const MEDIUM_SIZE = { width: 800, height: 600 };
const WEBP_QUALITY = { original: 85, thumbnail: 80, medium: 85 };

// ============================================
// Verarbeitung
// ============================================

/**
 * Verarbeitet ein Bild und erzeugt Original (WebP), Thumbnail und Medium.
 */
export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const [original, thumbnail, medium] = await Promise.all([
    // Original: Auto-Rotate + WebP
    sharp(buffer)
      .rotate()
      .webp({ quality: WEBP_QUALITY.original })
      .toBuffer(),
    
    // Thumbnail: 400x300 Cover Crop
    sharp(buffer)
      .rotate()
      .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, { fit: 'cover' })
      .webp({ quality: WEBP_QUALITY.thumbnail })
      .toBuffer(),
    
    // Medium: 800x600 innerhalb behalten
    sharp(buffer)
      .rotate()
      .resize(MEDIUM_SIZE.width, MEDIUM_SIZE.height, { fit: 'inside' })
      .webp({ quality: WEBP_QUALITY.medium })
      .toBuffer(),
  ]);

  return {
    original,
    thumbnail,
    medium,
    originalMime: 'image/webp',
  };
}

/**
 * Gibt die Metadaten eines Bildes zurueck (Breite, Hoehe, Format).
 */
export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
  };
}
