'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Bell,
  BarChart3,
  Crown,
  Users,
  Key,
  Mail,
  Check,
  Clock,
  AlertCircle,
  Star,
  TrendingUp,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock notifications
interface Notification {
  id: string;
  type: 'inquiry' | 'system' | 'success' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'inquiry',
    title: 'Neue Anfrage',
    message: 'Max Mustermann interessiert sich für Zeiss ACCURA II',
    time: 'vor 5 Min',
    read: false,
    href: '/seller/anfragen/1',
  },
  {
    id: '2',
    type: 'inquiry',
    title: 'Neue Anfrage',
    message: 'TechCorp GmbH hat eine Frage zu Mitutoyo CRYSTA',
    time: 'vor 2 Std',
    read: false,
    href: '/seller/anfragen/2',
  },
  {
    id: '3',
    type: 'success',
    title: 'Inserat freigeschaltet',
    message: 'Hexagon Global S ist jetzt online',
    time: 'vor 1 Tag',
    read: true,
    href: '/seller/inserate/3',
  },
  {
    id: '4',
    type: 'system',
    title: 'Abo erneuert',
    message: 'Ihr Business-Abo wurde erfolgreich verlängert',
    time: 'vor 3 Tagen',
    read: true,
  },
  {
    id: '5',
    type: 'warning',
    title: 'Inserat läuft ab',
    message: 'Weniger als 7 Tage verbleibend für Renishaw PH10M',
    time: 'vor 5 Tagen',
    read: true,
    href: '/seller/inserate/5',
  },
];

// Plan requirements for features
type PlanSlug = 'free' | 'starter' | 'business';
const planOrder: PlanSlug[] = ['free', 'starter', 'business'];

const hasPlanAccess = (currentPlan: PlanSlug, requiredPlan: PlanSlug) => {
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan);
};

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  requiredPlan?: PlanSlug;
  isNew?: boolean;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/seller/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Meine Inserate',
    href: '/seller/inserate',
    icon: FileText,
  },
  {
    name: 'Anfragen',
    href: '/seller/anfragen',
    icon: MessageSquare,
    badge: 5,
  },
  {
    name: 'E-Mails',
    href: '/seller/emails',
    icon: Mail,
    badge: 2,
    requiredPlan: 'business',
    isNew: true,
  },
  {
    name: 'Statistiken',
    href: '/seller/statistiken',
    icon: BarChart3,
    requiredPlan: 'starter',
  },
  {
    name: 'Team',
    href: '/seller/team',
    icon: Users,
    requiredPlan: 'business',
    isNew: true,
  },
  {
    name: 'API-Zugang',
    href: '/seller/api',
    icon: Key,
    requiredPlan: 'business',
    isNew: true,
  },
  {
    name: 'Abo & Abrechnung',
    href: '/seller/abo',
    icon: CreditCard,
  },
  {
    name: 'Einstellungen',
    href: '/seller/konto',
    icon: Settings,
  },
];

// Mock user data
const user = {
  name: 'Sandra Becker',
  email: 'sandra@precision-gmbh.de',
  company: 'Precision GmbH',
  plan: 'Business',
  planSlug: 'business' as PlanSlug,
  activeListings: 5,
  maxListings: -1, // Unbegrenzt
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Alle Benachrichtigungen als gelesen markiert');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const hasAccess = !item.requiredPlan || hasPlanAccess(user.planSlug, item.requiredPlan);
        
        return (
          <Link
            key={item.name}
            href={hasAccess ? item.href : '/seller/abo/upgrade'}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : hasAccess
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-muted-foreground/50 hover:bg-muted/50'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
            {!hasAccess && (
              <Crown className="ml-auto h-4 w-4 text-amber-500" />
            )}
            {hasAccess && item.isNew && (
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 text-xs">
                Neu
              </Badge>
            )}
            {hasAccess && item.badge && (
              <Badge
                variant={isActive ? 'secondary' : 'default'}
                className="ml-auto"
              >
                {item.badge}
              </Badge>
            )}
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <span className="text-lg font-bold text-primary-foreground">
                        C
                      </span>
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
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{user.plan}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Inserate:</span>
                      <span className="font-medium">
                        {user.activeListings}{user.maxListings === -1 ? '' : `/${user.maxListings}`}
                      </span>
                    </div>
                    <Button className="mt-4 w-full" variant="outline" size="sm" asChild>
                      <Link href="/seller/abo">Upgrade</Link>
                    </Button>
                  </div>
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
              Verkäuferbereich
            </Badge>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="hidden sm:flex">
              <Link href="/seller/inserate/neu">
                <Plus className="mr-2 h-4 w-4" />
                Neues Inserat
              </Link>
            </Button>

            {/* Notification Center */}
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold">Benachrichtigungen</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={markAllAsRead}
                    >
                      Alle gelesen
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[350px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.href || '#'}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.href) setNotificationOpen(false);
                          }}
                          className={cn(
                            'flex gap-3 p-4 transition-colors hover:bg-muted/50',
                            !notification.read && 'bg-primary/5'
                          )}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                'text-sm truncate',
                                !notification.read && 'font-semibold'
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.time}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Keine Benachrichtigungen
                      </p>
                    </div>
                  )}
                </ScrollArea>
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sm"
                    asChild
                  >
                    <Link href="/seller/konto?tab=notifications" onClick={() => setNotificationOpen(false)}>
                      Benachrichtigungseinstellungen
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/seller/konto">
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <FileText className="mr-2 h-4 w-4" />
                    Zurück zur Website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
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
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{user.plan}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Inserate:</span>
                    <span className="font-medium">
                      {user.activeListings}{user.maxListings === -1 ? ' (∞)' : `/${user.maxListings}`}
                    </span>
                  </div>
                  {user.maxListings !== -1 && (
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${(user.activeListings / user.maxListings) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button className="mt-4 w-full" variant="outline" size="sm" asChild>
                  <Link href="/seller/abo">Upgrade</Link>
                </Button>
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
