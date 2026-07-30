import { apiClient } from '../../../services/apiClient';
import type { PostAuthorRole, PostComment } from '../types/post.types';
import { normalizeRoleKey } from '../../../utils/roleLabels';

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(asStringList);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  const record = asRecord(value);
  const nestedValue =
    asString(record.name) ||
    asString(record.role) ||
    asString(record.roleName) ||
    asString(record.displayName) ||
    asString(record.normalizedName) ||
    asString(record.description);

  return nestedValue ? [nestedValue] : [];
};

const asOptionalId = (value: unknown) =>
  typeof value === 'number' || typeof value === 'string' ? value : undefined;

const normalizeRole = (value: unknown): PostAuthorRole => {
  const roleKey = normalizeRoleKey(asStringList(value).join(' '));

  if (roleKey === 'teacher') return 'Docente';
  if (roleKey === 'admin') return 'Administrativo';
  if (roleKey === 'bar') return 'Bar';
  if (roleKey === 'library') return 'Biblioteca';
  if (roleKey === 'copyCenter') return 'Fotocopiadora';

  return 'Alumno';
};

const getCurrentUserRole = (): PostAuthorRole => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return normalizeRole(Array.isArray(roles) ? roles[0] : undefined);
  } catch {
    return 'Alumno';
  }
};

const getProfileSummaryFromApi = async (authorId: number | string) => {
  try {
    const response = await apiClient.get<unknown>(`/profile/${authorId}`, {
      headers: getAuthHeaders(),
    });
    const root = asRecord(response.data);
    const data = asRecord(root.data ?? root.value ?? root.profile ?? root);
    const user = asRecord(data.user ?? data.profile ?? data.person ?? data);
    const rootUser = asRecord(root.user ?? root.profile ?? root.person);
    const roles =
      user.roles ??
      user.role ??
      rootUser.roles ??
      rootUser.role ??
      data.roles ??
      data.role ??
      root.roles ??
      root.role;

    return {
      avatarUrl:
        asString(user.avatarUrl) ||
        asString(user.profileImageUrl) ||
        asString(user.profilePictureUrl) ||
        asString(user.profilePhotoUrl) ||
        asString(user.photoUrl) ||
        asString(rootUser.avatarUrl) ||
        asString(rootUser.profileImageUrl) ||
        asString(rootUser.profilePictureUrl) ||
        asString(rootUser.profilePhotoUrl) ||
        asString(rootUser.photoUrl) ||
        asString(root.avatarUrl) ||
        asString(root.profileImageUrl) ||
        asString(root.profilePictureUrl) ||
        asString(root.profilePhotoUrl) ||
        asString(root.photoUrl) ||
        undefined,
      role: normalizeRole(roles),
    };
  } catch {
    return undefined;
  }
};

const hydrateCommentAvatars = async (comments: PostComment[]) => {
  const uniqueAuthorIds = Array.from(
    new Set(
      comments
        .map((comment) => comment.author.id)
        .filter((authorId): authorId is number | string => typeof authorId === 'number' || typeof authorId === 'string'),
    ),
  );
  const profileEntries = await Promise.all(
    uniqueAuthorIds.map(async (authorId) => [String(authorId), await getProfileSummaryFromApi(authorId)] as const),
  );
  const profilesByAuthorId = new Map(profileEntries);

  return comments.map((comment) => ({
    ...comment,
    author: {
      ...comment.author,
      avatarUrl: comment.author.avatarUrl || profilesByAuthorId.get(String(comment.author.id))?.avatarUrl,
      role: profilesByAuthorId.get(String(comment.author.id))?.role || comment.author.role,
    },
  }));
};
const mapCommentFromApi = (apiComment: unknown, fallbackContent: string): PostComment => {
  const comment = asRecord(apiComment);
  const author = asRecord(comment.author ?? comment.user ?? comment.createdBy ?? comment.person ?? comment.autor);

  const currentUserName = localStorage.getItem('unstapp_user_name');
  const currentUserId = localStorage.getItem('unstapp_user_id');

  const parsedName =
    asString(author.name) ||
    asString(author.fullName) ||
    asString(author.username) ||
    asString(comment.userName) ||
    asString(comment.autorName) ||
    asString(comment.autor);

  let parsedId = asOptionalId(
    author.id ??
    author.userId ??
    author.user_id ??
    author.profileId ??
    author.idUsuario ??
    author.usuarioId ??
    author.autorId ??
    author.idAutor ??
    author.personId ??
    author.idPerson ??
    comment.userId ??
    comment.user_id ??
    comment.authorId ??
    comment.authorUserId ??
    comment.profileId ??
    comment.createdByUserId ??
    comment.createdById ??
    comment.ownerId ??
    comment.ownerUserId ??
    comment.idUsuario ??
    comment.usuarioId ??
    comment.autorId ??
    comment.idAutor ??
    comment.personId ??
    comment.idPerson
  );

  // Fallback heurístico: si la API no manda el ID pero sí el nombre, 
  // y coincide exactamente con el usuario local, asumimos que es suyo para la UI.
  if (!parsedId && parsedName && currentUserName && parsedName.trim().toLowerCase() === currentUserName.trim().toLowerCase()) {
    parsedId = currentUserId || undefined;
  }

  return {
    id:
      typeof comment.id === 'number' || typeof comment.id === 'string'
        ? comment.id
        : typeof comment.commentId === 'number' || typeof comment.commentId === 'string'
          ? comment.commentId
        : Date.now(),
    author: {
      id: parsedId,
      name: parsedName || currentUserName || 'Vos',
      avatarUrl:
        asString(author.avatarUrl) ||
        asString(author.profileImageUrl) ||
        asString(author.profilePictureUrl) ||
        asString(author.photoUrl) ||
        asString(comment.avatarUrl) ||
        asString(comment.profileImageUrl) ||
        asString(comment.profilePictureUrl) ||
        asString(comment.photoUrl) ||
        undefined,
      role: normalizeRole(
        author.role ??
        author.roles ??
        comment.role ??
        comment.userRole ??
        comment.authorRole ??
        comment.rol ??
        (!parsedId || String(parsedId) === String(currentUserId) ? getCurrentUserRole() : undefined),
      ),
    },
    publishedAt:
      asString(comment.publishedAt) ||
      asString(comment.createdAt) ||
      asString(comment.commentDate) ||
      new Date().toISOString(),
    content:
      asString(comment.content) ||
      asString(comment.text) ||
      asString(comment.body) ||
      fallbackContent,
  };
};

export const commentService = {
  // Trae comentarios reales de una publicación.
  getByPostIdFromApi: async (postId: number | string) => {
    const response = await apiClient.get<unknown>(`/posts/${postId}/comments`, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    const comments = Array.isArray(data) ? data : asRecord(data).items ?? asRecord(data).data;

    return Array.isArray(comments)
      ? hydrateCommentAvatars(comments.map((comment) => mapCommentFromApi(comment, '')))
      : [];
  },

  // Guarda un nuevo comentario en backend y mantiene respaldo mock.
  create: async (postId: number | string, content: string) => {
    const response = await apiClient.post<unknown>(
      `/posts/${postId}/comments`,
      { content },
      { headers: getAuthHeaders() },
    );

    const createdComment = mapCommentFromApi(response.data, content);

    if (!createdComment.author.id) {
      createdComment.author.id = localStorage.getItem('unstapp_user_id') || undefined;
    }

    if (createdComment.author.id) {
      const profileSummary = await getProfileSummaryFromApi(createdComment.author.id);
      createdComment.author.avatarUrl = createdComment.author.avatarUrl || profileSummary?.avatarUrl;
      createdComment.author.role = profileSummary?.role || createdComment.author.role;
    }

    return createdComment;
  },

  remove: async (commentId: number | string) => {
    await apiClient.delete(`/comments/${commentId}`, {
      headers: getAuthHeaders(),
    });
  },
};
