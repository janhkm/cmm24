'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Star, Loader2, Image as ImageIcon, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  is_primary: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
  maxImages?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  isUploading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function ImageUploader({
  images,
  onUpload,
  onDelete,
  onSetPrimary,
  maxImages = 20,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  isUploading = false,
  disabled = false,
  required = false,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = [];
    const remainingSlots = maxImages - images.length;
    
    for (const file of files.slice(0, remainingSlots)) {
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`Invalid file type: ${file.name}`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        console.warn(`File too large: ${file.name} (${formatSize(file.size)})`);
        continue;
      }
      validFiles.push(file);
    }
    
    return validFiles;
  }, [images.length, maxImages, maxSizeBytes, acceptedTypes]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      await onUpload(validFiles);
    }
  }, [disabled, isUploading, validateFiles, onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled || isUploading) return;

    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      await onUpload(validFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled, isUploading, validateFiles, onUpload]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }, [onDelete]);

  const canUploadMore = images.length < maxImages && !disabled;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                'relative group aspect-[4/3] rounded-lg overflow-hidden border bg-muted',
                image.is_primary && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <img
                src={image.url}
                alt={image.filename || `Bild ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_primary && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => onSetPrimary(image.id)}
                    title="Als Hauptbild setzen"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                >
                  {deletingId === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Primary badge */}
              {image.is_primary && (
                <Badge className="absolute top-2 left-2 text-xs bg-primary">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Hauptbild
                </Badge>
              )}

              {/* Index number */}
              {!image.is_primary && (
                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {canUploadMore && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            isUploading && 'pointer-events-none opacity-60'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled || isUploading}
          />
          
          <div className="p-8 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="font-medium">Wird hochgeladen...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bitte warten Sie.
                </p>
              </>
            ) : isDragging ? (
              <>
                <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
                <p className="font-medium text-primary">Dateien hier ablegen</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">
                  {images.length === 0
                    ? 'Bilder hochladen'
                    : 'Weitere Bilder hinzufügen'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ziehen Sie Bilder hierher oder klicken Sie zum Auswählen
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  JPG, PNG oder WebP • Max. {formatSize(maxSizeBytes)} pro Bild • 
                  Noch {maxImages - images.length} von {maxImages} möglich
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Limit reached message */}
      {images.length >= maxImages && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum von {maxImages} Bildern erreicht.
        </p>
      )}

      {/* Required hint */}
      {required && images.length === 0 && (
        <p className="text-sm text-destructive">
          Mindestens ein Bild ist erforderlich.
        </p>
      )}
    </div>
  );
}
