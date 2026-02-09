'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Bell, Check, CheckCheck, Trash2, Loader2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, getNotificationIcon, getTimeAgo } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/lib/actions/notifications';

// Notification type colors
const typeColors: Record<NotificationType, string> = {
  new_inquiry: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  inquiry_replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  listing_approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  listing_rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  listing_expiring: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  subscription_renewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  subscription_expiring: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  payment_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  welcome: 'bg-primary/10 text-primary',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      onClose();
    }
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(notification.id);
  };
  
  const content = (
    <div
      className={cn(
        'relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        'hover:bg-muted/50',
        !notification.is_read && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
          typeColors[notification.type]
        )}
      >
        {getNotificationIcon(notification.type)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium truncate',
              !notification.is_read && 'text-foreground',
              notification.is_read && 'text-muted-foreground'
            )}
          >
            {notification.title}
          </p>
          {/* Unread indicator */}
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {getTimeAgo(notification.created_at)}
        </p>
      </div>
      
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={cn(
          'absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100',
          'hover:bg-destructive/10 text-muted-foreground hover:text-destructive',
          'transition-all'
        )}
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </button>
    </div>
  );
  
  if (notification.link) {
    return (
      <Link href={notification.link} className="block group">
        {content}
      </Link>
    );
  }
  
  return <div className="group">{content}</div>;
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function NotificationBell() {
  const t = useTranslations('notifications');
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
    refresh,
  } = useNotifications({ limit: 20 });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Request notification permission on mount
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      // Don't auto-request, let user decide
    }
  }, []);
  
  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    await markAllAsRead();
    setIsMarkingAll(false);
  };
  
  const handleClearAll = async () => {
    setIsClearing(true);
    await clearAll();
    setIsClearing(false);
    setIsOpen(false);
  };
  
  const requestPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('unread', { count: unreadCount })}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="font-semibold">{t('title')}</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('unreadCount', { count: unreadCount })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="h-8 text-xs"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                {t('markAllRead')}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={requestPermission}>
                  <Bell className="h-4 w-4 mr-2" />
                  {t('browserNotifications')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleClearAll}
                  disabled={isClearing || notifications.length === 0}
                  className="text-destructive"
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {t('deleteAll')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="divide-y">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">{t('empty')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('emptyDesc')}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={remove}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
