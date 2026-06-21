import { apiClient } from '../../../services/apiClient';
import type { PostComment } from '../types/post.types';

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const asOptionalId = (value: unknown) =>
  typeof value === 'number' || typeof value === 'string' ? value : undefined;

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
    author.idUsuario ??
    author.usuarioId ??
    author.autorId ??
    author.idAutor ??
    author.personId ??
    author.idPerson ??
    comment.userId ??
    comment.user_id ??
    comment.authorId ??
    comment.idUsuario ??
    comment.usuarioId ??
    comment.autorId ??
    comment.idAutor ??
    comment.personId ??
    comment.idPerson ??
    comment.createdById
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
      role: 'Alumno',
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
  // Trae comentarios reales de una publicacion.
  getByPostIdFromApi: async (postId: number | string) => {
    const response = await apiClient.get<unknown>(`/posts/${postId}/comments`, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    const comments = Array.isArray(data) ? data : asRecord(data).items ?? asRecord(data).data;

    return Array.isArray(comments)
      ? comments.map((comment) => mapCommentFromApi(comment, ''))
      : [];
  },

  // Guarda un nuevo comentario en backend y mantiene respaldo mock.
  create: async (postId: number | string, content: string) => {
    const response = await apiClient.post<unknown>(
      `/posts/${postId}/comments`,
      { content },
      { headers: getAuthHeaders() },
    );

    return mapCommentFromApi(response.data, content);
  },

  remove: async (commentId: number | string) => {
    await apiClient.delete(`/comments/${commentId}`, {
      headers: getAuthHeaders(),
    });
  },
};
