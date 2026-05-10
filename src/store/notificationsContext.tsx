import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type NotificationType = 'interaction' | 'followedPost' | 'institutional';

export interface AppNotification {
  id: number;
  type: NotificationType;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  showUnreadIndicator: boolean;
  hideUnreadIndicator: () => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: number) => void;
}

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

const initialNotifications: AppNotification[] = [
  {
    id: 1,
    type: 'institutional',
    actor: 'Administracion UNSTA',
    action: 'informo un cambio de aula',
    target: 'Ingenieria de Software pasa al Laboratorio 1.',
    createdAt: minutesAgo(8),
    read: false,
  },
  {
    id: 2,
    type: 'interaction',
    actor: 'Juan Perez',
    action: 'comento tu publicacion',
    target: 'PRUEBA SPRINT 3 05/05/2026',
    createdAt: minutesAgo(15),
    read: false,
  },
  {
    id: 3,
    type: 'interaction',
    actor: 'Maria Gonzalez',
    action: 'le dio me gusta a tu publicacion',
    target: 'Hola, este es mi primer post',
    createdAt: minutesAgo(42),
    read: false,
  },
  {
    id: 4,
    type: 'followedPost',
    actor: 'Facultad de Ingenieria',
    action: 'realizo una nueva publicacion',
    target: 'Inscripciones a mesas finales.',
    createdAt: minutesAgo(130),
    read: true,
  },
];

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isUnreadIndicatorHidden, setIsUnreadIndicatorHidden] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      showUnreadIndicator: unreadCount > 0 && !isUnreadIndicatorHidden,
      hideUnreadIndicator: () => {
        setIsUnreadIndicatorHidden(true);
      },
      markAllAsRead: () => {
        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) => ({ ...notification, read: true })),
        );
        setIsUnreadIndicatorHidden(true);
      },
      removeNotification: (notificationId: number) => {
        setNotifications((currentNotifications) =>
          currentNotifications.filter((notification) => notification.id !== notificationId),
        );
      },
    }),
    [notifications, unreadCount, isUnreadIndicatorHidden],
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
