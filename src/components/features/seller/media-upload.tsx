'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  GripVertical,
  ImagePlus,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  file?: File;
  url: string;
  name: string;
  type: 'image' | 'document';
  status: 'uploading' | 'complete' | 'error';
  progress?: number;
  isPrimary?: boolean;
}

interface MediaUploadProps {
  images: MediaFile[];
  documents: MediaFile[];
  onImagesChange: (images: MediaFile[]) => void;
  onDocumentsChange: (documents: MediaFile[]) => void;
  maxImages?: number;
  maxDocuments?: number;
  maxImageSize?: number; // in bytes
  maxDocumentSize?: number; // in bytes
}

export function MediaUpload({
  images,
  documents,
  onImagesChange,
  onDocumentsChange,
  maxImages = 10,
  maxDocuments = 5,
  maxImageSize = 10 * 1024 * 1024, // 10MB
  maxDocumentSize = 25 * 1024 * 1024, // 25MB
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    async (files: FileList | File[], type: 'image' | 'document') => {
      const fileArray = Array.from(files);
      const maxSize = type === 'image' ? maxImageSize : maxDocumentSize;
      const current = type === 'image' ? images : documents;
      const max = type === 'image' ? maxImages : maxDocuments;
      const onChange = type === 'image' ? onImagesChange : onDocumentsChange;

      const newFiles: MediaFile[] = [];

      for (const file of fileArray) {
        if (current.length + newFiles.length >= max) break;

        // Validate file size
        if (file.size > maxSize) {
          alert(`Datei "${file.name}" ist zu groß. Maximum: ${maxSize / (1024 * 1024)}MB`);
          continue;
        }

        // Validate file type
        if (type === 'image' && !file.type.startsWith('image/')) {
          continue;
        }
        if (type === 'document' && !file.type.includes('pdf')) {
          continue;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const url = URL.createObjectURL(file);

        newFiles.push({
          id,
          file,
          url,
          name: file.name,
          type,
          status: 'uploading',
          progress: 0,
          isPrimary: current.length === 0 && newFiles.length === 0,
        });
      }

      if (newFiles.length > 0) {
        onChange([...current, ...newFiles]);

        // Simulate upload progress
        for (const newFile of newFiles) {
          await simulateUpload(newFile.id, type === 'image' ? images : documents, onChange);
        }
      }
    },
    [images, documents, maxImages, maxDocuments, maxImageSize, maxDocumentSize, onImagesChange, onDocumentsChange]
  );

  const simulateUpload = async (
    id: string,
    currentFiles: MediaFile[],
    onChange: (files: MediaFile[]) => void
  ) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      onChange(
        currentFiles.map((f) =>
          f.id === id ? { ...f, progress, status: progress === 100 ? 'complete' : 'uploading' } : f
        )
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      const imageFiles: File[] = [];
      const docFiles: File[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        } else if (file.type.includes('pdf')) {
          docFiles.push(file);
        }
      });

      if (imageFiles.length > 0) {
        processFiles(imageFiles, 'image');
      }
      if (docFiles.length > 0) {
        processFiles(docFiles, 'document');
      }
    },
    [processFiles]
  );

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    // If primary was removed, set first as primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onImagesChange(updated);
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const setPrimaryImage = (id: string) => {
    onImagesChange(
      images.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">
            Bilder ({images.length}/{maxImages})
          </label>
          <span className="text-xs text-muted-foreground">
            JPG, PNG, WebP • Max. {maxImageSize / (1024 * 1024)}MB pro Bild
          </span>
        </div>

        {/* Image Grid */}
        <div
          className={cn(
            'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4',
            isDragging && 'opacity-50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group aspect-[4/3] bg-muted rounded-lg overflow-hidden"
            >
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="object-cover"
              />

              {/* Upload Progress Overlay */}
              {image.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <span className="text-sm">{image.progress}%</span>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {image.status === 'error' && (
                <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
              )}

              {/* Actions Overlay */}
              {image.status === 'complete' && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    title="Verschieben"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => removeImage(image.id)}
                    title="Entfernen"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Primary Badge */}
              {image.isPrimary && (
                <Badge className="absolute top-2 left-2 text-xs">Hauptbild</Badge>
              )}

              {/* Set as Primary Button */}
              {!image.isPrimary && image.status === 'complete' && (
                <button
                  className="absolute bottom-2 left-2 text-xs bg-background/80 backdrop-blur px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPrimaryImage(image.id)}
                >
                  Als Hauptbild
                </button>
              )}
            </div>
          ))}

          {/* Upload Button */}
          {images.length < maxImages && (
            <label className="aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer">
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Bild hinzufügen</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    processFiles(e.target.files, 'image');
                  }
                }}
              />
            </label>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Das erste Bild ist das Hauptbild. Ziehen Sie Bilder zum Sortieren.
        </p>
      </div>

      {/* Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">
            Dokumente ({documents.length}/{maxDocuments})
          </label>
          <span className="text-xs text-muted-foreground">
            PDF • Max. {maxDocumentSize / (1024 * 1024)}MB pro Dokument
          </span>
        </div>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm truncate">{doc.name}</span>
              {doc.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {doc.status === 'complete' && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {doc.status === 'error' && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeDocument(doc.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {documents.length < maxDocuments && (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer">
              <Upload className="h-5 w-5" />
              <span className="text-sm">Dokument hinzufügen (PDF)</span>
              <input
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    processFiles(e.target.files, 'document');
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
