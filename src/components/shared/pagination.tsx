'use client';

import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className 
}: PaginationProps) {
  const t = useTranslations('pagination');

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near start: 1 2 3 4 5 ... last
        pages.push(2, 3, 4, 5, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1 ... last-4 last-3 last-2 last-1 last
        pages.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: 1 ... current-1 current current+1 ... last
        pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }

    return pages;
  };

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    url.searchParams.set('page', page.toString());
    return url.pathname + url.search;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label={t('pageNavigation')} 
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
        className="h-9 w-9"
      >
        {currentPage === 1 ? (
          <span>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('previousPage')}</span>
          </span>
        ) : (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('previousPage')}</span>
          </Link>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span 
                key={`ellipsis-${index}`}
                className="h-9 w-9 flex items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              className="h-9 w-9"
              asChild={!isActive}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <span>{page}</span>
              ) : (
                <Link href={getPageUrl(page)}>
                  {page}
                </Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
        className="h-9 w-9"
      >
        {currentPage === totalPages ? (
          <span>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">{t('nextPage')}</span>
          </span>
        ) : (
          <Link href={getPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">{t('nextPage')}</span>
          </Link>
        )}
      </Button>
    </nav>
  );
}

// Mobile-friendly pagination with text
export function PaginationMobile({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className 
}: PaginationProps) {
  const t = useTranslations('pagination');

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    url.searchParams.set('page', page.toString());
    return url.pathname + url.search;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label={t('pageNavigation')} 
      className={cn('flex items-center justify-between gap-4', className)}
    >
      <Button
        variant="outline"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
      >
        {currentPage === 1 ? (
          <span>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </span>
        ) : (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Link>
        )}
      </Button>

      <span className="text-sm text-muted-foreground">
        {t('pageOf', { current: currentPage, total: totalPages })}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
      >
        {currentPage === totalPages ? (
          <span>
            {t('forward')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </span>
        ) : (
          <Link href={getPageUrl(currentPage + 1)}>
            {t('forward')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </Button>
    </nav>
  );
}
