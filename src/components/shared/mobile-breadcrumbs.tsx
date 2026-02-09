'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MobileBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function MobileBreadcrumbs({ items, className }: MobileBreadcrumbsProps) {
  const router = useRouter();
  const t = useTranslations('breadcrumbNav');
  const tBreadcrumb = useTranslations('breadcrumb');

  // Get the previous item (for "back" navigation on mobile)
  const previousItem = items.length > 1 ? items[items.length - 2] : null;
  const currentItem = items[items.length - 1];

  return (
    <div className={cn('border-b bg-muted/30', className)}>
      <div className="container-page py-3">
        {/* Mobile: Back Button */}
        <div className="md:hidden">
          {previousItem ? (
            <button
              onClick={() => previousItem.href ? router.push(previousItem.href) : router.back()}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('backTo', { label: previousItem.label })}
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {tBreadcrumb('home')}
            </Link>
          )}
        </div>

        {/* Desktop: Full Breadcrumb Trail */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">{tBreadcrumb('home')}</span>
          </Link>

          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors max-w-[150px] truncate"
                  title={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'max-w-[200px] truncate',
                    index === items.length - 1 && 'text-foreground'
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Preset for common pages
export function ListingBreadcrumbs({
  manufacturer,
  manufacturerSlug,
  title,
}: {
  manufacturer: string;
  manufacturerSlug: string;
  title: string;
}) {
  const t = useTranslations('breadcrumb');
  return (
    <MobileBreadcrumbs
      items={[
        { label: t('machines'), href: '/maschinen' },
        { label: manufacturer, href: `/hersteller/${manufacturerSlug}` },
        { label: title },
      ]}
    />
  );
}

export function CategoryBreadcrumbs({
  categoryName,
}: {
  categoryName: string;
}) {
  const t = useTranslations('breadcrumb');
  return (
    <MobileBreadcrumbs
      items={[
        { label: t('categories'), href: '/kategorien' },
        { label: categoryName },
      ]}
    />
  );
}

export function ArticleBreadcrumbs({
  category,
  categorySlug,
  title,
}: {
  category: string;
  categorySlug?: string;
  title: string;
}) {
  const t = useTranslations('breadcrumb');
  return (
    <MobileBreadcrumbs
      items={[
        { label: t('guides'), href: '/ratgeber' },
        ...(categorySlug ? [{ label: category, href: `/ratgeber/kategorie/${categorySlug}` }] : []),
        { label: title },
      ]}
    />
  );
}
