'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  CreditCard,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Plus,
  BarChart3,
  Crown,
  Users,
  Key,
  Mail,
  UserCircle,
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
import { signOut } from '@/lib/actions/auth';
import { NotificationBell } from '@/components/notifications';

// Plan requirements for features
type PlanSlug = 'free' | 'starter' | 'business';
const planOrder: PlanSlug[] = ['free', 'starter', 'business'];

const hasPlanAccess = (currentPlan: PlanSlug, requiredPlan: PlanSlug) => {
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan);
};

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'inquiries' | 'messages';
  requiredPlan?: PlanSlug;
  isNew?: boolean;
}

const navigation: NavItem[] = [
  { nameKey: 'dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { nameKey: 'myListings', href: '/seller/inserate', icon: FileText },
  { nameKey: 'inquiries', href: '/seller/anfragen', icon: MessageSquare, badgeKey: 'inquiries' },
  // Kommunikation + Kontakte zusammengefuehrt unter "Kommunikation"
  { nameKey: 'communication', href: '/seller/communication', icon: Mail, badgeKey: 'messages' },
  // AUSKOMMENTIERT: Kontakte separat (jetzt unter Kommunikation)
  // { nameKey: 'contacts', href: '/seller/kontakte', icon: UserCircle, isNew: true },
  // AUSKOMMENTIERT: Statistiken (wird spaeter als Pay-Feature zurueckkommen)
  // { nameKey: 'statistics', href: '/seller/statistiken', icon: BarChart3 },
  { nameKey: 'team', href: '/seller/team', icon: Users },
  // AUSKOMMENTIERT: API-Zugang (wird spaeter als Pay-Feature zurueckkommen)
  // { nameKey: 'api', href: '/seller/api', icon: Key },
  // AUSKOMMENTIERT: Abo/Subscription (alles ist jetzt Free)
  // { nameKey: 'subscription', href: '/seller/abo', icon: CreditCard },
  { nameKey: 'settings', href: '/seller/konto', icon: Settings },
];

// Props die vom Server kommen (keine DB-Calls mehr noetig)
export interface SellerShellProps {
  displayName: string;
  displayEmail: string;
  planName: string;
  planSlug: string;
  activeListings: number;
  listingLimit: number;
  unreadInquiries: number;
  unreadMessages: number;
  children: React.ReactNode;
}

export function SellerShell({
  displayName,
  displayEmail,
  planName,
  planSlug,
  activeListings,
  listingLimit,
  unreadInquiries,
  unreadMessages,
  children,
}: SellerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const ts = useTranslations('seller');
  const tc = useTranslations('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPlanSlug = (planSlug || 'free') as PlanSlug;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getBadgeValue = (badgeKey?: string): number | undefined => {
    if (badgeKey === 'inquiries' && unreadInquiries > 0) return unreadInquiries;
    if (badgeKey === 'messages' && unreadMessages > 0) return unreadMessages;
    return undefined;
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const hasAccess = !item.requiredPlan || hasPlanAccess(currentPlanSlug, item.requiredPlan);
        const badgeValue = getBadgeValue(item.badgeKey);

        return (
          <Link
            key={item.nameKey}
            href={item.href as any}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {t(item.nameKey as any)}
            {!hasAccess && <Crown className="ml-auto h-4 w-4 text-amber-500" />}
            {hasAccess && item.isNew && (
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 text-xs">{tc('new')}</Badge>
            )}
            {hasAccess && badgeValue !== undefined && (
              <Badge variant={isActive ? 'secondary' : 'default'} className="ml-auto">{badgeValue}</Badge>
            )}
          </Link>
        );
      })}
    </>
  );

  // AUSKOMMENTIERT: PlanWidget (alles ist jetzt Free, kein Upgrade noetig)
  // const PlanWidget = () => (
  //   <div className="rounded-lg border bg-muted/50 p-4">
  //     <div className="flex items-center justify-between text-sm">
  //       <span className="text-muted-foreground">{ts('plan')}</span>
  //       <span className="font-medium">{planName}</span>
  //     </div>
  //     <div className="mt-2">
  //       <div className="flex items-center justify-between text-sm mb-1">
  //         <span className="text-muted-foreground">{ts('listingsUsed')}</span>
  //         <span className="font-medium">
  //           {activeListings}{listingLimit === -1 ? ` (${tc('unlimited')})` : `/${listingLimit}`}
  //         </span>
  //       </div>
  //       {listingLimit !== -1 && listingLimit > 0 && (
  //         <div className="h-2 rounded-full bg-muted">
  //           <div
  //             className="h-2 rounded-full bg-primary"
  //             style={{ width: `${Math.min((activeListings / listingLimit) * 100, 100)}%` }}
  //           />
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  const PlanWidget = () => null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-6">
                  <Link href="/" className="flex items-center">
                    <Image src="/logo.png" alt="CMM24" width={120} height={32} className="h-8 w-auto dark:hidden" />
                    <Image src="/logo-dark.png" alt="CMM24" width={120} height={32} className="h-8 w-auto hidden dark:block" />
                  </Link>
                </div>
                <Separator />
                <nav className="flex flex-col gap-1 p-4"><NavLinks /></nav>
                <Separator />
                <div className="p-4"><PlanWidget /></div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="CMM24" width={100} height={28} className="h-7 w-auto dark:hidden" />
              <Image src="/logo-dark.png" alt="CMM24" width={100} height={28} className="h-7 w-auto hidden dark:block" />
            </Link>

            <Badge variant="secondary" className="hidden md:inline-flex">{ts('area')}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="hidden sm:flex">
              <Link href="/seller/inserate/neu">
                <Plus className="mr-2 h-4 w-4" />
                {ts('newListing')}
              </Link>
            </Button>
            <Button size="icon" asChild className="sm:hidden h-9 w-9">
              <Link href="/seller/inserate/neu">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">{displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/seller/konto"><Settings className="mr-2 h-4 w-4" />{t('settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/"><FileText className="mr-2 h-4 w-4" />{tc('backToWebsite')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />{tc('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
          <div className="sticky top-16 flex flex-col h-[calc(100vh-4rem)]">
            <nav className="flex-1 space-y-1 p-4"><NavLinks /></nav>
            <div className="border-t p-4"><PlanWidget /></div>
          </div>
        </aside>
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
