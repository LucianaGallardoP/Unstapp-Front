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

const asId = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string' ? value : undefined;

const normalizeNotificationType = (notification: ApiRecord): NotificationType => {
  const action = asString(notification.action).toLowerCase();
  const type = asString(notification.type).toLowerCase();

  if (asBoolean(notification.isPriority) || type.includes('institutional')) {
    return 'institutional';
  }

  if (action.includes('public') || type.includes('follow')) {
    return 'followedPost';
  }

  return 'interaction';
};

const mapNotificationFromApi = (apiNotification: unknown): AppNotification => {
  const notification = asRecord(apiNotification);
  const actor = asRecord(notification.actor ?? notification.user ?? notification.fromUser);
  const target = asRecord(notification.target ?? notification.post ?? notification.comment);
  const id = notification.notificationId ?? notification.id ?? crypto.randomUUID();
  const actorName =
    asString(notification.user) ||
    asString(notification.actor) ||
    asString(actor.fullName) ||
    asString(actor.name) ||
    asString(actor.userName) ||
    'Unstapp';

  return {
    id: asId(id) ?? crypto.randomUUID(),
    type: normalizeNotificationType(notification),
    actor: actorName,
    actorId:
      asId(notification.actorId) ||
      asId(notification.userId) ||
      asId(notification.fromUserId) ||
      asId(actor.id) ||
      asId(actor.userId),
    profileId:
      asId(notification.profileId) ||
      asId(notification.targetUserId) ||
      asId(notification.followerId) ||
      asId(actor.id) ||
      asId(actor.userId),
    avatarUrl:
      asString(notification.avatarUrl) ||
      asString(notification.userAvatarUrl) ||
      asString(notification.actorAvatarUrl) ||
      asString(actor.avatarUrl) ||
      asString(actor.profileImageUrl) ||
      asString(actor.photoUrl) ||
      undefined,
    action: asString(notification.action) || asString(notification.message, 'tiene una novedad'),
    target: asString(notification.message) || asString(notification.target) || asString(target.title, 'Nueva notificación'),
    postId:
      asId(notification.postId) ||
      asId(notification.publicationId) ||
      asId(target.postId) ||
      asId(target.id),
    commentId:
      asId(notification.commentId) ||
      asId(notification.responseId) ||
      asId(target.commentId),
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