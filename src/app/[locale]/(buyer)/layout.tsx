'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Search,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/actions/auth';
import { useTranslations } from 'next-intl';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, account, isLoading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('buyer');

  const navigation: NavItem[] = [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('myInquiries'), href: '/dashboard/anfragen', icon: MessageSquare },
    { name: t('settings'), href: '/dashboard/konto', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || t('defaultUser');
  const displayEmail = profile?.email || '';
  const isSeller = !!account;

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-6">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <span className="text-lg font-bold text-primary-foreground">C</span>
                    </div>
                    <span className="text-xl font-bold">CMM24</span>
                  </Link>
                </div>
                <Separator />
                <nav className="flex flex-col gap-1 p-4">
                  <NavLinks />
                </nav>
                <Separator />
                <div className="p-4">
                  {!isSeller && (
                    <Button className="w-full" asChild>
                      <Link href="/seller/registrieren">
                        <Package className="mr-2 h-4 w-4" />
                        {t('sellNow')}
                      </Link>
                    </Button>
                  )}
                  {isSeller && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/seller/dashboard">
                        {t('toSellerDashboard')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="hidden text-xl font-bold sm:inline">CMM24</span>
            </Link>

            <Badge variant="secondary" className="hidden md:inline-flex">
              {t('myArea')}
            </Badge>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="hidden sm:flex">
              <Link href="/maschinen">
                <Search className="mr-2 h-4 w-4" />
                {t('searchMachines')}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  {authLoading ? (
                    <Skeleton className="hidden sm:inline-block h-4 w-24" />
                  ) : (
                    <span className="hidden sm:inline">{displayName}</span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  {authLoading ? (
                    <>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{displayEmail}</p>
                    </>
                  )}
                </div>
                <DropdownMenuSeparator />
                {isSeller && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard">
                      <Package className="mr-2 h-4 w-4" />
                      {t('sellerDashboard')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/konto">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Search className="mr-2 h-4 w-4" />
                    {t('backToWebsite')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
          <div className="sticky top-16 flex flex-col h-[calc(100vh-4rem)]">
            <nav className="flex-1 space-y-1 p-4">
              <NavLinks />
            </nav>

            <div className="border-t p-4 space-y-3">
              {!isSeller ? (
                <div className="rounded-lg border bg-primary/5 p-4 text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">{t('sellMachinesQuestion')}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('createFreeListingDesc')}
                  </p>
                  <Button className="w-full" size="sm" asChild>
                    <Link href="/seller/registrieren">
                      {t('sellNow')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href="/seller/dashboard">
                    <Package className="mr-2 h-4 w-4" />
                    {t('sellerDashboard')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
