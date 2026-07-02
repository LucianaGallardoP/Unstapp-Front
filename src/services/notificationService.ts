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

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getNotificationText = (notification: ApiRecord) =>
  normalizeText([
    asString(notification.action),
    asString(notification.type),
    asString(notification.entityType),
    asString(notification.message),
  ].join(' '));

const isFollowNotification = (notification: ApiRecord) => {
  const text = getNotificationText(notification);

  return text.includes('segu') || text.includes('follow') || text.includes('follower');
};

const normalizeNotificationType = (notification: ApiRecord): NotificationType => {
  const text = getNotificationText(notification);

  if (asBoolean(notification.isPriority) || text.includes('institutional') || text.includes('institucional')) {
    return 'institutional';
  }

  if (!isFollowNotification(notification) && (text.includes('public') || text.includes('post'))) {
    return 'followedPost';
  }

  return 'interaction';
};

const mapNotificationFromApi = (apiNotification: unknown): AppNotification => {
  const notification = asRecord(apiNotification);
  const actor = asRecord(notification.actor ?? notification.user ?? notification.fromUser);
  const data = asRecord(notification.data ?? notification.metadata ?? notification.payload ?? notification.extraData);
  const post = asRecord(notification.post ?? data.post ?? notification.publication ?? data.publication);
  const comment = asRecord(notification.comment ?? data.comment ?? notification.response ?? data.response);
  const target = asRecord(notification.target ?? data.target ?? post ?? comment);
  const id = notification.notificationId ?? notification.id ?? crypto.randomUUID();
  const actorName =
    asString(notification.user) ||
    asString(notification.actor) ||
    asString(actor.fullName) ||
    asString(actor.name) ||
    asString(actor.userName) ||
    'Unstapp';
  const isFollow = isFollowNotification(notification);
  const isCommentNotification = getNotificationText(notification).includes('coment') || getNotificationText(notification).includes('comment');
  const actorId =
    asId(notification.actorId) ||
    asId(notification.userId) ||
    asId(notification.fromUserId) ||
    asId(data.actorId) ||
    asId(data.userId) ||
    asId(data.fromUserId) ||
    asId(actor.id) ||
    asId(actor.userId);
  const profileId =
    asId(notification.profileId) ||
    asId(notification.targetUserId) ||
    asId(notification.followerId) ||
    asId(data.profileId) ||
    asId(data.targetUserId) ||
    asId(data.followerId) ||
    (isFollow ? asId(notification.targetId) || asId(notification.entityId) || asId(data.targetId) || asId(data.entityId) : undefined) ||
    actorId;
  const postId = isFollow
    ? undefined
    : asId(notification.postId) ||
      asId(notification.publicationId) ||
      asId(notification.targetId) ||
      asId(notification.entityId) ||
      asId(data.postId) ||
      asId(data.publicationId) ||
      asId(data.targetId) ||
      asId(data.entityId) ||
      asId(post.postId) ||
      asId(post.id) ||
      asId(comment.postId) ||
      asId(target.postId) ||
      asId(target.publicationId) ||
      (isCommentNotification ? undefined : asId(target.id));

  return {
    id: asId(id) ?? crypto.randomUUID(),
    type: normalizeNotificationType(notification),
    actor: actorName,
    actorId,
    profileId,
    avatarUrl:
      asString(notification.avatarUrl) ||
      asString(notification.userAvatarUrl) ||
      asString(notification.actorAvatarUrl) ||
      asString(data.avatarUrl) ||
      asString(data.userAvatarUrl) ||
      asString(data.actorAvatarUrl) ||
      asString(actor.avatarUrl) ||
      asString(actor.profileImageUrl) ||
      asString(actor.profilePictureUrl) ||
      asString(actor.profilePhotoUrl) ||
      asString(actor.photoUrl) ||
      undefined,
    action: asString(notification.action) || asString(notification.message, 'tiene una novedad'),
    target: asString(notification.message) || asString(notification.target) || asString(target.title, 'Nueva notificación'),
    postId,
    commentId:
      asId(notification.commentId) ||
      asId(notification.responseId) ||
      asId(data.commentId) ||
      asId(data.responseId) ||
      asId(comment.commentId) ||
      asId(comment.id) ||
      asId(target.commentId) ||
      asId(target.responseId) ||
      (isCommentNotification ? asId(target.id) : undefined),
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