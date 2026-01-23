'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  preview?: string;
}

interface UploadProgressProps {
  onFilesSelect: (files: File[]) => void;
  onFileRemove?: (id: string) => void;
  onReorder?: (files: FileUpload[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  uploads?: FileUpload[];
  className?: string;
}

export function UploadProgress({
  onFilesSelect,
  onFileRemove,
  onReorder,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = 'image/*,.pdf',
  uploads = [],
  className,
}: UploadProgressProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const validFiles = files.filter(
          (file) => file.size <= maxSizeMB * 1024 * 1024
        );
        onFilesSelect(validFiles);
      }
    },
    [maxSizeMB, onFilesSelect]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(
        (file) => file.size <= maxSizeMB * 1024 * 1024
      );
      onFilesSelect(validFiles);
    }
    // Reset input
    e.target.value = '';
  };

  // Drag and drop reorder
  const handleItemDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId && onReorder) {
      const draggedIndex = uploads.findIndex((u) => u.id === draggedItem);
      const targetIndex = uploads.findIndex((u) => u.id === targetId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newUploads = [...uploads];
        const [removed] = newUploads.splice(draggedIndex, 1);
        newUploads.splice(targetIndex, 0, removed);
        onReorder(newUploads);
      }
    }
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const remainingSlots = maxFiles - uploads.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      {remainingSlots > 0 && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>

          <p className="text-center">
            <span className="font-medium">Dateien hierher ziehen</span>
            <br />
            <span className="text-sm text-muted-foreground">
              oder klicken zum Auswählen
            </span>
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Max. {maxSizeMB}MB pro Datei · Noch {remainingSlots} Datei(en)
            möglich
          </p>
        </div>
      )}

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {uploads.length} von {maxFiles} Dateien
          </p>

          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                draggable={upload.status === 'complete' && !!onReorder}
                onDragStart={(e) => handleItemDragStart(e, upload.id)}
                onDragOver={(e) => handleItemDragOver(e, upload.id)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-card p-3 transition-all',
                  draggedItem === upload.id && 'opacity-50',
                  upload.status === 'complete' && onReorder && 'cursor-grab active:cursor-grabbing'
                )}
              >
                {/* Drag Handle */}
                {onReorder && upload.status === 'complete' && (
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                )}

                {/* Preview / Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted overflow-hidden">
                  {upload.preview ? (
                    <img
                      src={upload.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getFileIcon(upload.file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(upload.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="h-1 mt-2" />
                  )}

                  {/* Error Message */}
                  {upload.status === 'error' && upload.error && (
                    <p className="text-xs text-destructive mt-1">{upload.error}</p>
                  )}
                </div>

                {/* Status / Actions */}
                <div className="shrink-0">
                  {upload.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground">
                      {upload.progress}%
                    </span>
                  )}
                  {upload.status === 'complete' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {upload.status === 'pending' && (
                    <span className="text-xs text-muted-foreground">Wartend...</span>
                  )}
                </div>

                {/* Remove Button */}
                {onFileRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => onFileRemove(upload.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
