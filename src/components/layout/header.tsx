'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { routing, localeNames, localeFlags } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import {
  Search,
  Menu,
  User,
  LogIn,
  ChevronDown,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchCommand } from '@/components/shared/search-command';
import { signOut } from '@/lib/actions/auth';

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const isLoggedIn = !!user;
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const th = useTranslations('header');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigation = [
    { name: t('allMachines'), href: '/maschinen' as const },
  ];

  const mobileNavigation = [
    { name: t('allMachines'), href: '/maschinen' as const },
    { name: t('manufacturers'), href: '/hersteller' as const },
    { name: t('categories'), href: '/kategorien' as const },
    { name: t('guides'), href: '/ratgeber' as const },
  ];

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as Locale });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="CMM24"
              width={120}
              height={32}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="CMM24"
              width={120}
              height={32}
              className="h-8 w-auto hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <SearchCommand />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Mobile/Tablet */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Switcher - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase">{locale}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
                {routing.locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={locale === loc ? 'bg-accent' : ''}
                  >
                    <span className="mr-2">{localeFlags[loc]}</span>
                    {localeNames[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons / User Menu */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {(user.fullName || user.email || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.fullName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/seller/inserate" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('myListings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/seller/anfragen" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('inquiries')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/seller/konto" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={async () => {
                      await signOut();
                      window.location.href = '/';
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {tc('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    {tc('login')}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/registrieren">{tc('register')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">{t('menu')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={th('searchPlaceholder')}
                      className="w-full pl-10"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    {mobileNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t pt-4">
                    {/* Language Selector Mobile */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        {t('language')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {routing.locales.map((loc) => (
                          <Button
                            key={loc}
                            variant={locale === loc ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchLocale(loc)}
                          >
                            {localeFlags[loc]} {localeNames[loc]}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Auth Buttons Mobile */}
                    {isLoggedIn && user ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {(user.fullName || user.email || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.fullName || user.email?.split('@')[0]}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link
                          href="/seller/inserate"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4" />
                          {t('myListings')}
                        </Link>
                        <Link
                          href="/seller/anfragen"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {t('inquiries')}
                        </Link>
                        <Link
                          href="/seller/konto"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          {t('settings')}
                        </Link>
                        <Button
                          variant="outline"
                          className="text-destructive mt-2"
                          onClick={async () => {
                            await signOut();
                            setMobileMenuOpen(false);
                            window.location.href = '/';
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {tc('logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            {tc('login')}
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/registrieren" onClick={() => setMobileMenuOpen(false)}>
                            {tc('registerFree')}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar (expandable) */}
        {searchOpen && (
          <div className="border-t py-3 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={th('searchPlaceholderFull')}
                className="w-full pl-10"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
