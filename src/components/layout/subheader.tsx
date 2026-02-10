'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useTranslations } from 'next-intl';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function Subheader() {
  const [currentLang, setCurrentLang] = useState('de');
  const t = useTranslations('nav');

  const subNavigation = [
    { name: t('manufacturers'), href: '/hersteller' },
    { name: t('guides'), href: '/ratgeber' },
  ];

  return (
    <div className="w-full border-b bg-muted/30">
      <div className="container-page">
        <div className="flex h-8 items-center justify-between">
          {/* Left: Navigation Links */}
          <nav className="hidden sm:flex items-center gap-4">
            {subNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right: Theme Toggle & Language */}
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="uppercase">{currentLang}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={cn(currentLang === lang.code && 'bg-accent')}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
