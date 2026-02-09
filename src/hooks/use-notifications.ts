'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  type Notification,
  type NotificationType,
} from '@/lib/actions/notifications';
import { useAuth } from './use-auth';

interface UseNotificationsOptions {
  /** Whether to enable realtime updates */
  realtime?: boolean;
  /** Maximum number of notifications to fetch */
  limit?: number;
  /** Play sound on new notification */
  playSound?: boolean;
}

interface UseNotificationsReturn {
  /** List of notifications */
  notifications: Notification[];
  /** Number of unread notifications */
  unreadCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Refresh notifications */
  refresh: () => Promise<void>;
  /** Mark a notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Delete a notification */
  remove: (id: string) => Promise<void>;
  /** Clear all notifications */
  clearAll: () => Promise<void>;
}

// Notification sound (optional)
const playNotificationSound = () => {
  if (typeof window !== 'undefined' && 'Audio' in window) {
    try {
      // Simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Silently fail if audio not supported
    }
  }
};

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { realtime = true, limit = 50, playSound = true } = options;
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if initial load is done to avoid sound on first load
  const initialLoadDone = useRef(false);
  
  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    try {
      const [notifResult, countResult] = await Promise.all([
        getNotifications({ limit }),
        getUnreadNotificationCount(),
      ]);
      
      if (notifResult.success && notifResult.data) {
        setNotifications(notifResult.data);
      }
      
      if (countResult.success && typeof countResult.data === 'number') {
        setUnreadCount(countResult.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Fehler beim Laden der Benachrichtigungen');
    } finally {
      setIsLoading(false);
      initialLoadDone.current = true;
    }
  }, [user, limit]);
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Realtime subscription
  useEffect(() => {
    if (!realtime || !user) return;
    
    const supabase = createClient();
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to list
          setNotifications((prev) => [newNotification, ...prev].slice(0, limit));
          
          // Update unread count
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
            
            // Play sound (only after initial load)
            if (playSound && initialLoadDone.current) {
              playNotificationSound();
            }
            
            // Show browser notification if permitted
            if (
              initialLoadDone.current &&
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/icon-192.png',
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          
          // Update in list
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          
          // Recalculate unread count
          setNotifications((prev) => {
            const newUnread = prev.filter((n) => !n.is_read).length;
            setUnreadCount(newUnread);
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          
          // Remove from list
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
          
          // Recalculate unread count
          setNotifications((prev) => {
            const newUnread = prev.filter((n) => !n.is_read).length;
            setUnreadCount(newUnread);
            return prev;
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtime, user, limit, playSound]);
  
  // Mark single as read
  const markAsRead = useCallback(async (id: string) => {
    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);
  
  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  }, []);
  
  // Remove single notification
  const remove = useCallback(async (id: string) => {
    const result = await deleteNotification(id);
    if (result.success) {
      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  }, [notifications]);
  
  // Clear all notifications
  const clearAll = useCallback(async () => {
    const result = await clearAllNotifications();
    if (result.success) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  };
}

// Helper to get notification icon based on type
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    new_inquiry: '📩',
    inquiry_replied: '💬',
    listing_approved: '✅',
    listing_rejected: '❌',
    listing_expiring: '⏰',
    subscription_renewed: '🎉',
    subscription_expiring: '⚠️',
    payment_failed: '💳',
    welcome: '👋',
    system: 'ℹ️',
  };
  return icons[type] || 'ℹ️';
}

// Helper to get time ago string
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
