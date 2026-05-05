import { apiClient } from '../../../services/apiClient';
import type { PostComment } from '../types/post.types';

const COMMENTS_KEY = 'unstapp_mock_comments';

type SavedComments = Record<string, PostComment[]>;

const readComments = (): SavedComments => {
  const savedComments = localStorage.getItem(COMMENTS_KEY);

  if (!savedComments) {
    return {};
  }

  try {
    const parsedComments = JSON.parse(savedComments);

    return parsedComments && typeof parsedComments === 'object'
      ? (parsedComments as SavedComments)
      : {};
  } catch {
    return {};
  }
};

const saveComments = (comments: SavedComments) => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const mapCommentFromApi = (apiComment: unknown, fallbackContent: string): PostComment => {
  const comment = asRecord(apiComment);
  const author = asRecord(comment.author ?? comment.user ?? comment.createdBy);

  return {
    id:
      typeof comment.id === 'number' || typeof comment.id === 'string'
        ? comment.id
        : Date.now(),
    author: {
      name:
        asString(author.name) ||
        asString(author.fullName) ||
        asString(author.username) ||
        asString(comment.userName) ||
        localStorage.getItem('unstapp_user_name') ||
        'Vos',
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
  // Recupera comentarios mock guardados para una publicacion.
  getByPostId: (postId: number | string) => readComments()[String(postId)] ?? [],

  // Guarda un nuevo comentario en backend y mantiene respaldo mock.
  create: async (postId: number | string, content: string) => {
    const response = await apiClient.post<unknown>(
      `/posts/${postId}/comments`,
      { content },
      { headers: getAuthHeaders() },
    );
    const createdComment = mapCommentFromApi(response.data, content);
    const comments = readComments();
    const postComments = comments[String(postId)] ?? [];

    comments[String(postId)] = [...postComments, createdComment];
    saveComments(comments);

    return createdComment;
  },
};
