import { apiClient } from '../../../services/apiClient';
import { commentService } from './commentService';
import { likeService } from './likeService';
import type { Post, PostAuthorRole, PostCategory } from '../types/post.types';

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

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' ? value : fallback;

const asOptionalNumber = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const asOptionalBoolean = (value: unknown) =>
  typeof value === 'boolean' ? value : undefined;

const normalizeRole = (value: unknown): PostAuthorRole => {
  const role = asString(value).toLowerCase();

  if (role.includes('docente')) return 'Docente';
  if (role.includes('admin')) return 'Administrativo';
  if (role.includes('bar')) return 'Bar';

  return 'Alumno';
};

const normalizeCategoryFromApi = (value: unknown): PostCategory | null => {
  if (value === 0 || value === '0') return 'alumno';
  if (value === 1 || value === '1') return 'alumno';
  if (value === 2 || value === '2') return 'administrativo';
  if (value === 3 || value === '3') return 'bar';

  const category = asString(value).toLowerCase();

  if (category.includes('admin')) return 'administrativo';
  if (category.includes('carrera') || category.includes('facultad')) return 'carrera';
  if (category.includes('bar')) return 'bar';
  if (category.includes('alumno') || category.includes('social')) return 'alumno';

  return null;
};

const normalizeCategory = (role: PostAuthorRole): PostCategory => {
  if (role === 'Docente') return 'carrera';
  if (role === 'Administrativo') return 'administrativo';
  if (role === 'Bar') return 'bar';

  return 'alumno';
};

const roleByCategory: Record<PostCategory, PostAuthorRole> = {
  alumno: 'Alumno',
  carrera: 'Docente',
  administrativo: 'Administrativo',
  bar: 'Bar',
};

const mapPostFromApi = (apiPost: unknown, fallbackContent = ''): Post => {
  const post = asRecord(apiPost);
  const author = asRecord(post.author ?? post.user ?? post.createdBy);
  const category = normalizeCategoryFromApi(post.category);
  const role = category ? roleByCategory[category] : normalizeRole(author.role ?? post.role);
  const id = post.id ?? post.postId ?? crypto.randomUUID();
  const storedLikes = likeService.getStoredLikeCount(id as number | string);
  const apiLikes = asOptionalNumber(post.likes) ?? asOptionalNumber(post.likesCount);
  const apiLiked =
    asOptionalBoolean(post.likedByCurrentUser) ??
    asOptionalBoolean(post.hasLiked) ??
    asOptionalBoolean(post.userLiked) ??
    asOptionalBoolean(post.isLikedByMe) ??
    asOptionalBoolean(post.liked) ??
    asOptionalBoolean(post.isLiked);

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : crypto.randomUUID(),
    author: {
      name:
        asString(author.name) ||
        asString(author.fullName) ||
        asString(author.username) ||
        asString(post.userName) ||
        asString(post.authorName, 'Usuario'),
      role,
      verified: Boolean(author.verified ?? post.verified),
    },
    category: category ?? normalizeCategory(role),
    publishedAt:
      asString(post.publishedAt) ||
      asString(post.createdAt) ||
      asString(post.postDate) ||
      asString(post.date) ||
      new Date().toISOString(),
    content: asString(post.content) || asString(post.text) || asString(post.body) || fallbackContent,
    media: asString(post.mediaUrl)
      ? {
          type: 'image',
          url: asString(post.mediaUrl),
          alt: 'Contenido multimedia de la publicacion',
        }
      : undefined,
    likes: apiLikes ?? storedLikes ?? 0,
    likedByCurrentUser: apiLiked ?? likeService.isLikedByCurrentUser(id as number | string),
    commentsCount: asNumber(post.commentsCount),
    comments: [],
  };
};

export const postService = {
  getAll: async (): Promise<Post[]> => {
    const response = await apiClient.get<unknown>('/posts/', {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    const posts = Array.isArray(data) ? data : asRecord(data).items ?? asRecord(data).data;

    if (!Array.isArray(posts)) {
      return [];
    }

    const mappedPosts = posts.map((post) => mapPostFromApi(post));

    return Promise.all(
      mappedPosts.map(async (post) => {
        if (!post.commentsCount) {
          return post;
        }

        try {
          const comments = await commentService.getByPostIdFromApi(post.id);

          return {
            ...post,
            comments,
            commentsCount: comments.length || post.commentsCount,
          };
        } catch {
          return post;
        }
      }),
    );
  },

  create: async (content: string, mediaFile?: File): Promise<Post> => {
    const formData = new FormData();
    
    // Siempre enviamos el contenido
    formData.append('Content', content);

    // Solo adjuntamos el archivo si existe
    if (mediaFile) {
      formData.append('MediaFile', mediaFile);
    }

    const response = await apiClient.post<unknown>('/posts/create', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      }, 
    });

    return mapPostFromApi(response.data, content);
  },
};
