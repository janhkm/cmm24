'use client';

import { useState } from 'react';
import { Download, Loader2, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  generateListingPdfContent,
  generateComparisonPdfContent,
  openPdfWindow,
  downloadPdfHtml,
} from '@/lib/pdf-export';
import { useTranslations } from 'next-intl';
import type { Listing } from '@/types';

interface PdfExportButtonProps {
  listing?: Listing;
  listings?: Listing[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PdfExportButton({
  listing,
  listings,
  variant = 'outline',
  size = 'default',
  className,
}: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations('pdfExport');

  const handleExport = async (mode: 'print' | 'download') => {
    setIsGenerating(true);

    try {
      let content: string;
      let title: string;
      let filename: string;

      if (listing) {
        content = generateListingPdfContent(listing);
        title = `${listing.manufacturer.name} ${listing.title} - CMM24`;
        filename = `CMM24-${listing.slug}`;
      } else if (listings && listings.length > 0) {
        content = generateComparisonPdfContent(listings);
        title = `${t('machineComparison')} - CMM24`;
        filename = `CMM24-Vergleich-${new Date().toISOString().split('T')[0]}`;
      } else {
        return;
      }

      if (mode === 'print') {
        openPdfWindow(content, title);
      } else {
        downloadPdfHtml(content, filename);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!listing && (!listings || listings.length === 0)) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {size !== 'icon' && (
            <span className="ml-2">
              {listing ? t('asPdf') : t('exportPdf')}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('print')}>
          <Printer className="h-4 w-4 mr-2" />
          {t('printOrSave')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('download')}>
          <FileText className="h-4 w-4 mr-2" />
          {t('downloadHtml')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
