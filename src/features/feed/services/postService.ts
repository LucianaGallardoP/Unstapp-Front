import { apiClient } from '../../../services/apiClient';
import { commentService } from './commentService';
import { likeService } from './likeService';
import type { CreatePostOptions, Post, PostAudience, PostAuthorRole, PostCategory } from '../types/post.types';
import { normalizeRoleKey } from '../../../utils/roleLabels';

type ApiRecord = Record<string, unknown>;

interface GetPostsOptions {
  filter?: PostsFilterQuery;
  page?: number;
  limit?: number;
}

interface PostsPageResult {
  posts: Post[];
  hasMore: boolean;
}

export type PostsFilterQuery = 1 | 2 | 3;

const DEFAULT_POSTS_PAGE = 1;
const DEFAULT_POSTS_LIMIT = 15;

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};



const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === 'object' ? (value as ApiRecord) : {};

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

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' ? value : fallback;

const asOptionalNumber = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const asFiniteNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const asOptionalBoolean = (value: unknown) =>
  typeof value === 'boolean' ? value : undefined;

const asOptionalId = (value: unknown) =>
  typeof value === 'number' || typeof value === 'string' ? value : undefined;

const normalizeRole = (value: unknown): PostAuthorRole => {
  const roleKey = normalizeRoleKey(asStringList(value).join(' '));

  if (roleKey === 'teacher') return 'Docente';
  if (roleKey === 'admin') return 'Administrativo';
  if (roleKey === 'bar') return 'Bar';

  return 'Alumno';
};

const normalizeAudienceFromApi = (value: unknown): PostAudience => {
  const category = asStringList(value).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (category.includes('admin')) return 'administrativo';
  if (
    category.includes('carrera') ||
    category.includes('facultad') ||
    category.includes('alumno') ||
    category.includes('student') ||
    category.includes('docente') ||
    category.includes('profesor') ||
    category.includes('professor') ||
    category.includes('teacher')
  ) {
    return 'carrera';
  }

  if (value === 1 || value === '1') return 'carrera';
  if (value === 2 || value === '2') return 'administrativo';
  if (value === 0 || value === '0') return 'carrera';

  return 'general';
};

const getPostAudienceSource = (post: ApiRecord, author: ApiRecord) =>
  post.audience ??
  post.targetAudience ??
  post.visibility ??
  post.scope ??
  post.category ??
  post.categoryName ??
  post.postCategory ??
  post.type ??
  author.category ??
  author.audience;

const getPostRoleSource = (post: ApiRecord, author: ApiRecord, audienceSource: unknown) => [
  author.roles,
  author.role,
  author.roleName,
  author.rol,
  author.userRole,
  author.tipoUsuario,
  author.type,
  post.roles,
  post.role,
  post.roleName,
  post.rol,
  post.authorRole,
  post.userRole,
  post.tipoUsuario,
  audienceSource,
  author.name,
  author.fullName,
  author.username,
  post.userName,
  post.authorName,
];

const normalizeCategory = (role: PostAuthorRole): PostCategory => {
  if (role === 'Docente') return 'carrera';
  if (role === 'Administrativo') return 'administrativo';
  if (role === 'Bar') return 'bar';

  return 'alumno';
};

const unwrapPostItems = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;

  const record = asRecord(data);
  const candidates = [
    record.items,
    record.posts,
    record.publications,
    record.results,
    record.value,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    const nestedCandidate = unwrapPostItems(candidate);
    if (nestedCandidate.length > 0) return nestedCandidate;
  }

  return [];
};

const getPaginationValue = (data: unknown, keys: string[]) => {
  const root = asRecord(data);
  const nested = asRecord(root.data ?? root.value ?? root.result);
  const meta = asRecord(root.meta ?? root.pagination ?? nested.meta ?? nested.pagination);

  for (const key of keys) {
    if (root[key] !== undefined) return root[key];
    if (nested[key] !== undefined) return nested[key];
    if (meta[key] !== undefined) return meta[key];
  }

  return undefined;
};

const getHasMorePosts = (data: unknown, postsLength: number, options?: GetPostsOptions) => {
  const explicitHasMore = getPaginationValue(data, ['hasMore', 'hasNextPage', 'hasNext']);

  if (typeof explicitHasMore === 'boolean') {
    return explicitHasMore;
  }

  const page = options?.page ?? asFiniteNumber(getPaginationValue(data, ['page', 'currentPage', 'pageNumber']));
  const limit = options?.limit ?? asFiniteNumber(getPaginationValue(data, ['limit', 'pageSize', 'take']));
  const totalPages = asFiniteNumber(getPaginationValue(data, ['totalPages', 'pagesCount']));
  const totalCount = asFiniteNumber(getPaginationValue(data, ['totalCount', 'totalItems', 'count']));

  if (page && totalPages) {
    return page < totalPages;
  }

  if (page && limit && totalCount !== undefined) {
    return page * limit < totalCount;
  }

  return Boolean(limit && postsLength === limit);
};

const getMediaType = (url: string) => {
  const normalizedUrl = url.toLowerCase();

  if (
    normalizedUrl.includes('/video/upload/') ||
    normalizedUrl.endsWith('.mp4') ||
    normalizedUrl.endsWith('.webm') ||
    normalizedUrl.endsWith('.mov')
  ) {
    return 'video';
  }

  if (
    normalizedUrl.endsWith('.jpg') ||
    normalizedUrl.endsWith('.jpeg') ||
    normalizedUrl.endsWith('.png') ||
    normalizedUrl.endsWith('.gif') ||
    normalizedUrl.includes('/image/upload/')
  ) {
    return 'image';
  }

  return 'file';
};

const getProfileAvatarFromApi = async (authorId: number | string) => {
  try {
    const response = await apiClient.get<unknown>(`/profile/${authorId}`, {
      headers: getAuthHeaders(),
    });
    const root = asRecord(response.data);
    const data = asRecord(root.data ?? root.value ?? root.profile ?? root);
    const user = asRecord(data.user ?? data.profile ?? data.person ?? data);
    const rootUser = asRecord(root.user ?? root.profile ?? root.person);

    return (
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
      undefined
    );
  } catch {
    return undefined;
  }
};

const hydrateAuthorAvatars = async (posts: Post[]) => {
  const uniqueAuthorIds = Array.from(
    new Set(
      posts
        .map((post) => post.author.id)
        .filter((authorId): authorId is number | string => typeof authorId === 'number' || typeof authorId === 'string'),
    ),
  );
  const avatarEntries = await Promise.all(
    uniqueAuthorIds.map(async (authorId) => [String(authorId), await getProfileAvatarFromApi(authorId)] as const),
  );
  const avatarsByAuthorId = new Map(avatarEntries);

  // Completa la foto real del perfil cuando el endpoint de posts no la incluye.
  return posts.map((post) => ({
    ...post,
    author: {
      ...post.author,
      avatarUrl:
        avatarsByAuthorId.get(String(post.author.id)) ||
        post.author.avatarUrl,
    },
  }));
};

const mapPostFromApi = (apiPost: unknown, fallbackContent = ''): Post => {
  const post = asRecord(apiPost);
  const author = asRecord(post.author ?? post.user ?? post.createdBy);
  const audienceSource = getPostAudienceSource(post, author);
  const audience = normalizeAudienceFromApi(audienceSource);
  const role =
    audience === 'administrativo'
      ? 'Administrativo'
      : normalizeRole(getPostRoleSource(post, author, audienceSource));
  const visualCategory = normalizeCategory(role);
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
      id: asOptionalId(author.id ?? author.userId ?? post.userId ?? post.authorId ?? post.createdById),
      name:
        asString(author.name) ||
        asString(author.fullName) ||
        asString(author.username) ||
        asString(post.userName) ||
        asString(post.authorName, 'Usuario'),
      role,
      avatarUrl:
        asString(author.avatarUrl) ||
        asString(author.profileImageUrl) ||
        asString(author.profilePictureUrl) ||
        asString(author.profilePhotoUrl) ||
        asString(author.photoUrl) ||
        asString(author.imageUrl) ||
        asString(post.avatarUrl) ||
        asString(post.profileImageUrl) ||
        asString(post.profilePictureUrl) ||
        asString(post.profilePhotoUrl) ||
        asString(post.photoUrl) ||
        asString(post.imageUrl) ||
        undefined,
      verified: Boolean(author.verified ?? post.verified),
    },
    category: visualCategory,
    audience,
    publishedAt:
      asString(post.publishedAt) ||
      asString(post.createdAt) ||
      asString(post.postDate) ||
      asString(post.date) ||
      new Date().toISOString(),
    content: asString(post.content) || asString(post.text) || asString(post.body) || fallbackContent,
    media: asString(post.mediaUrl)
      ? {
          type: getMediaType(asString(post.mediaUrl)),
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

const hydratePostsWithComments = async (posts: Post[]) =>
  Promise.all(
    posts.map(async (post) => {
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

const fetchPosts = async (options?: GetPostsOptions): Promise<PostsPageResult> => {
  const query = {
    filter: options?.filter ?? 1,
    page: options?.page ?? DEFAULT_POSTS_PAGE,
    limit: options?.limit ?? DEFAULT_POSTS_LIMIT,
  };
  const response = await apiClient.get<unknown>('/posts', {
    params: query,
    headers: getAuthHeaders(),
  });
  const posts = unwrapPostItems(response.data);

  if (posts.length === 0) {
    return { posts: [], hasMore: false };
  }

  const mappedPosts = await hydrateAuthorAvatars(posts.map((post) => mapPostFromApi(post)));
  const postsWithComments = await hydratePostsWithComments(mappedPosts);

  return {
    posts: postsWithComments,
    hasMore: getHasMorePosts(response.data, posts.length, query),
  };
};

export const postService = {
  getPage: async (options: GetPostsOptions): Promise<PostsPageResult> => {
    return fetchPosts(options);
  },

  getAll: async (options?: GetPostsOptions): Promise<Post[]> => {
    const result = await fetchPosts(options);

    return result.posts;
  },

  getById: async (postId: number | string): Promise<Post> => {
    const response = await apiClient.get<unknown>(`/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    const root = asRecord(data);
    const postData = root.data ?? root.value ?? root.post ?? data;
    const [post] = await hydrateAuthorAvatars([mapPostFromApi(postData)]);

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
  },

  create: async (content: string, mediaFile?: File, options?: CreatePostOptions): Promise<Post> => {
    const formData = new FormData();
    
    // Siempre enviamos el contenido
    formData.append('Content', content);

    // Solo adjuntamos el archivo si existe
    if (mediaFile) {
      formData.append('MediaFile', mediaFile);
    }

    if (options?.isImportant) {
      formData.append('IsImportant', 'true');
      formData.append('NotifyAllCareers', String(!options.careerIds?.length));

      options.careerIds?.forEach((careerId) => {
        formData.append('CareerIds', String(careerId));
      });
    }

    const response = await apiClient.post<unknown>('/posts/create', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      }, 
    });

    return mapPostFromApi(response.data, content);
  },

  remove: async (postId: number | string) => {
    await apiClient.delete(`/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
  },
};
