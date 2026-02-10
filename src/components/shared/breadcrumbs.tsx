'use client';

import { Link } from '@/i18n/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Base URL for generating absolute URLs in JSON-LD schema */
  baseUrl?: string;
  /** Whether to include JSON-LD structured data */
  includeSchema?: boolean;
}

export function Breadcrumbs({ 
  items, 
  className, 
  baseUrl = 'https://cmm24.com',
  includeSchema = true 
}: BreadcrumbsProps) {
  const t = useTranslations('breadcrumb');

  // Generate BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = includeSchema ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('home'),
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
      })),
    ],
  } : null;

  return (
    <>
      {/* JSON-LD Structured Data for Breadcrumbs */}
      {includeSchema && breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      
      <nav 
        aria-label="Breadcrumb" 
        className={cn('py-3', className)}
      >
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {/* Home Link */}
          <li>
            <Link 
              href="/" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">{t('home')}</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.label} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
                {isLast || !item.href ? (
                  <span 
                    className={cn(
                      isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
