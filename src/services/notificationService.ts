import { apiClient } from './apiClient';
import type { AppNotification, NotificationType } from '../store/notificationsContext';

type ApiRecord = Record<string, unknown>;

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === 'object' ? (value as ApiRecord) : {};

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const asBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback;

const normalizeNotificationType = (notification: ApiRecord): NotificationType => {
  const action = asString(notification.action).toLowerCase();

  if (asBoolean(notification.isPriority)) {
    return 'institutional';
  }

  if (action.includes('public')) {
    return 'followedPost';
  }

  return 'interaction';
};

const mapNotificationFromApi = (apiNotification: unknown): AppNotification => {
  const notification = asRecord(apiNotification);
  const id = notification.notificationId ?? notification.id ?? crypto.randomUUID();

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : crypto.randomUUID(),
    type: normalizeNotificationType(notification),
    actor: asString(notification.user) || asString(notification.actor, 'Unstapp'),
    action: asString(notification.action) || asString(notification.message, 'tiene una novedad'),
    target: asString(notification.message) || asString(notification.target, 'Nueva notificacion'),
    postId:
      typeof notification.postId === 'number' || typeof notification.postId === 'string'
        ? notification.postId
        : undefined,
    createdAt:
      asString(notification.createdAt) ||
      asString(notification.date) ||
      new Date().toISOString(),
    read: asBoolean(notification.isRead) || asBoolean(notification.read),
  };
};

export const notificationService = {
  getAll: async () => {
    const response = await apiClient.get<unknown>('/notifications', {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    const notifications = Array.isArray(data) ? data : asRecord(data).value ?? asRecord(data).data;

    return Array.isArray(notifications)
      ? notifications.map((notification) => mapNotificationFromApi(notification))
      : [];
  },

  hasUnread: async () => {
    const response = await apiClient.get<boolean>('/notifications/has-unread', {
      headers: getAuthHeaders(),
    });

    return Boolean(response.data);
  },

  markAsRead: async (notificationId: number | string) => {
    await apiClient.patch(`/notifications/${notificationId}/read`, undefined, {
      headers: getAuthHeaders(),
    });
  },

  markAllAsRead: async () => {
    await apiClient.patch('/notifications/read-all', undefined, {
      headers: getAuthHeaders(),
    });
  },

  remove: async (notificationId: number | string) => {
    await apiClient.delete(`/notifications/${notificationId}`, {
      headers: getAuthHeaders(),
    });
  },

  removeAll: async () => {
    await apiClient.delete('/notifications', {
      headers: getAuthHeaders(),
    });
  },
};
