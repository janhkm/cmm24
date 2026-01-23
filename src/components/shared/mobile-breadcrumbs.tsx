'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
              Zurück zu {previousItem.label}
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Startseite
            </Link>
          )}
        </div>

        {/* Desktop: Full Breadcrumb Trail */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Startseite</span>
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
  return (
    <MobileBreadcrumbs
      items={[
        { label: 'Maschinen', href: '/maschinen' },
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
  return (
    <MobileBreadcrumbs
      items={[
        { label: 'Kategorien', href: '/kategorien' },
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
  return (
    <MobileBreadcrumbs
      items={[
        { label: 'Ratgeber', href: '/ratgeber' },
        ...(categorySlug ? [{ label: category, href: `/ratgeber/kategorie/${categorySlug}` }] : []),
        { label: title },
      ]}
    />
  );
}
