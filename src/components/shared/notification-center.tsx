'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Bell,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  X,
  Check,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'inquiry' | 'listing_approved' | 'listing_rejected' | 'payment' | 'system';
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: Date;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'inquiry',
    title: 'Neue Anfrage',
    message: 'Thomas M. interessiert sich für Zeiss Contura',
    href: '/seller/anfragen/1',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  },
  {
    id: '2',
    type: 'listing_approved',
    title: 'Inserat freigegeben',
    message: 'Ihr Inserat "Wenzel LH 87" wurde freigeschaltet',
    href: '/maschinen/wenzel-lh-87',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '3',
    type: 'inquiry',
    title: 'Neue Anfrage',
    message: 'Sandra B. möchte mehr über Hexagon Global erfahren',
    href: '/seller/anfragen/2',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '4',
    type: 'payment',
    title: 'Zahlung erfolgreich',
    message: 'Ihr Professional-Abo wurde verlängert',
    href: '/seller/rechnungen',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'inquiry':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'listing_approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'listing_rejected':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'payment':
      return <CreditCard className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export function NotificationCenter() {
  const t = useTranslations('notifications');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return t('justNow');
    if (seconds < 3600) return t('minutesAgo', { minutes: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('hoursAgo', { hours: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('daysAgo', { days: Math.floor(seconds / 86400) });
    return date.toLocaleDateString('de-DE');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{t('title')}</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                {t('markAllRead')}
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'relative flex gap-3 p-4 transition-colors hover:bg-muted/50',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  {/* Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {notification.href ? (
                      <Link
                        href={notification.href}
                        onClick={() => {
                          markAsRead(notification.id);
                          setOpen(false);
                        }}
                        className="block"
                      >
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-start gap-1">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('empty')}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/seller/benachrichtigungen">
                  {t('allNotifications')}
                </Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
