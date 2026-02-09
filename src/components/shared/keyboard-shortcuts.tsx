'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

type ShortcutGroup = {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
};

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('shortcuts');

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: t('navigation'),
      shortcuts: [
        { keys: ['/'], description: t('focusSearch') },
        { keys: ['g', 'h'], description: t('toHomepage') },
        { keys: ['g', 's'], description: t('toSearch') },
        { keys: ['g', 'd'], description: t('toDashboard') },
      ],
    },
    {
      title: t('lists'),
      shortcuts: [
        { keys: ['j', '↓'], description: t('nextItem') },
        { keys: ['k', '↑'], description: t('previousItem') },
        { keys: ['Enter'], description: t('openItem') },
        { keys: ['c'], description: t('addToCompare') },
      ],
    },
    {
      title: t('general'),
      shortcuts: [
        { keys: ['Escape'], description: t('close') },
        { keys: ['?'], description: t('showHelp') },
      ],
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle pending 'g' key combinations
      if (pendingKey === 'g') {
        event.preventDefault();
        setPendingKey(null);
        switch (key) {
          case 'h':
            router.push('/');
            break;
          case 's':
            router.push('/maschinen');
            break;
          case 'd':
            router.push('/seller/dashboard');
            break;
        }
        return;
      }

      // Single key shortcuts
      switch (key) {
        case '/':
          event.preventDefault();
          // Focus search input
          const searchInput = document.querySelector(
            'input[type="search"], input[placeholder*="Suche"], input[placeholder*="suche"]'
          ) as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case '?':
          event.preventDefault();
          setShowHelp(true);
          break;
        case 'escape':
          setShowHelp(false);
          break;
        case 'g':
          setPendingKey('g');
          // Reset pending key after 1 second
          setTimeout(() => setPendingKey(null), 1000);
          break;
      }
    },
    [pendingKey, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="mx-1 text-muted-foreground">/</span>
                          )}
                          <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 text-xs font-medium">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {t('helpHint', { key: '?' })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
