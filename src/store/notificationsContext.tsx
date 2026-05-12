import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { notificationService } from '../services/notificationService';

export type NotificationType = 'interaction' | 'followedPost' | 'institutional';

export interface AppNotification {
  id: number | string;
  type: NotificationType;
  actor: string;
  avatarUrl?: string;
  action: string;
  target: string;
  postId?: number | string;
  createdAt: string;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  showUnreadIndicator: boolean;
  loading: boolean;
  hideUnreadIndicator: () => void;
  markNotificationAsRead: (notificationId: number | string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: number | string) => Promise<void>;
  removeAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hasUnreadFromApi, setHasUnreadFromApi] = useState(false);
  const [isUnreadIndicatorHidden, setIsUnreadIndicatorHidden] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const showUnreadIndicator =
    (hasUnreadFromApi || unreadCount > 0) && !isUnreadIndicatorHidden;

  const refreshNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const [apiNotifications, hasUnread] = await Promise.all([
        notificationService.getAll(),
        notificationService.hasUnread(),
      ]);

      setNotifications(apiNotifications);
      setHasUnreadFromApi(hasUnread);
      setIsUnreadIndicatorHidden(false);
    } catch {
      setNotifications([]);
      setHasUnreadFromApi(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markNotificationAsRead = useCallback(async (notificationId: number | string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );

    try {
      await notificationService.markAsRead(notificationId);
      setHasUnreadFromApi(await notificationService.hasUnread());
    } catch {
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, read: true })),
    );
    setHasUnreadFromApi(false);
    setIsUnreadIndicatorHidden(true);

    try {
      await notificationService.markAllAsRead();
    } catch {
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const removeNotification = useCallback(async (notificationId: number | string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== notificationId),
    );

    try {
      await notificationService.remove(notificationId);
      setHasUnreadFromApi(await notificationService.hasUnread());
    } catch {
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const removeAllNotifications = useCallback(async () => {
    setNotifications([]);
    setHasUnreadFromApi(false);
    setIsUnreadIndicatorHidden(true);

    try {
      await notificationService.removeAll();
    } catch {
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      showUnreadIndicator,
      loading,
      hideUnreadIndicator: () => {
        setIsUnreadIndicatorHidden(true);
      },
      markNotificationAsRead,
      markAllAsRead,
      removeNotification,
      removeAllNotifications,
      refreshNotifications,
    }),
    [
      notifications,
      unreadCount,
      showUnreadIndicator,
      loading,
      markNotificationAsRead,
      markAllAsRead,
      removeNotification,
      removeAllNotifications,
      refreshNotifications,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationsProvider');
  }

  return context;
};
