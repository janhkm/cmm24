'use client';

import { X, GitCompare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/stores/compare-store';

export function CompareBar() {
  const t = useTranslations('compare');
  const { items, titles, removeItem, clearItems, maxItems } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="container-page py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {t('machinesForCompare', { count: items.length, max: maxItems })}
              </span>
            </div>

            {/* Titel aus dem Store */}
            <div className="hidden sm:flex items-center gap-2">
              {items.map((id) => (
                <div
                  key={id}
                  className="relative group flex items-center gap-2 rounded-md border bg-card px-2 py-1"
                >
                  <span className="text-sm truncate max-w-[150px]">
                    {titles[id] || id.substring(0, 8)}
                  </span>
                  <button
                    onClick={() => removeItem(id)}
                    className="rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearItems}>
              {t('clearSelection')}
            </Button>
            <Button asChild disabled={items.length < 2}>
              <Link href={`/vergleich?ids=${items.join(',')}`}>{t('compare')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
