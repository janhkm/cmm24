'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from '@/i18n/navigation';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Database,
  Settings,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Shield,
  AlertTriangle,
  Factory,
  Boxes,
  BarChart3,
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
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { name: string; href: string }[];
}

// Mock admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@cmm24.com',
  role: 'super_admin' as const,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/stammdaten']);
  const t = useTranslations('admin');

  const navigation: NavItem[] = [
    {
      name: t('navDashboard'),
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('navModeration'),
      href: '/admin/moderation',
      icon: FileCheck,
      badge: 3, // pending_review count
    },
    {
      name: t('navAccounts'),
      href: '/admin/accounts',
      icon: Users,
    },
    {
      name: t('navMasterData'),
      href: '/admin/stammdaten',
      icon: Database,
      children: [
        { name: t('navManufacturers'), href: '/admin/stammdaten/hersteller' },
        { name: t('navModels'), href: '/admin/stammdaten/modelle' },
      ],
    },
    {
      name: t('navReports'),
      href: '/admin/reports',
      icon: AlertTriangle,
      badge: 1,
    },
    {
      name: t('navStatistics'),
      href: '/admin/statistiken',
      icon: BarChart3,
    },
  ];

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const isExpanded = expandedItems.includes(item.href);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.name}>
            {hasChildren ? (
              <>
                <button
                  onClick={() => toggleExpanded(item.href)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>
                {isExpanded && item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
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
                {item.badge && (
                  <Badge
                    variant={isActive ? 'secondary' : 'destructive'}
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Logo & Mobile Menu */}
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive">
                      <Shield className="h-4 w-4 text-destructive-foreground" />
                    </div>
                    <span className="text-xl font-bold">CMM24 {t('admin')}</span>
                  </Link>
                </div>
                <Separator />
                <nav className="flex flex-col gap-1 p-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive">
                <Shield className="h-4 w-4 text-destructive-foreground" />
              </div>
              <span className="hidden text-xl font-bold sm:inline">CMM24</span>
            </Link>

            <Badge variant="destructive" className="hidden md:inline-flex">
              {t('admin')}
            </Badge>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                {t('toWebsite')}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">{adminUser.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{adminUser.name}</p>
                  <p className="text-xs text-muted-foreground">{adminUser.email}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {adminUser.role === 'super_admin' ? t('superAdmin') : t('admin')}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/einstellungen">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
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

            <div className="border-t p-4">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <Shield className="h-4 w-4" />
                  {t('adminArea')}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('allActionsLogged')}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
