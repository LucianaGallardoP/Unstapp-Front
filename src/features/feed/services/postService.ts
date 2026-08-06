import { apiClient } from '../../../services/apiClient';
import { AxiosError } from 'axios';
import { commentService } from './commentService';
import { likeService } from './likeService';
import type { CreatePostOptions, Post, PostAudience, PostAuthorRole, PostCategory } from '../types/post.types';
import { normalizeRoleKey } from '../../../utils/roleLabels';
import {
  getAvatarUrlFromRecords,
  getRoleCandidatesFromRecord,
  inferRoleFromText,
  normalizeRoleLabel,
  pickStrongestRoleCandidate,
} from '../../../utils/apiRoleMapping';

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

type EffectivePostsQuery = {
  filter: PostsFilterQuery;
  page: number;
  limit: number;
};

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
  return normalizeRoleLabel(asStringList(value).join(' '));
};

const pickStrongestRole = (...values: unknown[]): PostAuthorRole | undefined => {
  return pickStrongestRoleCandidate(...values);
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

const normalizeComparableText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const getCurrentUserAuthorFallback = (authorId: number | string | undefined, authorName: string) => {
  const currentUserId = localStorage.getItem('unstapp_user_id');
  const currentUserName = localStorage.getItem('unstapp_user_name') ?? '';
  const isCurrentUserPost =
    Boolean(authorId && currentUserId && String(authorId) === String(currentUserId)) ||
    Boolean(currentUserName && normalizeComparableText(authorName) === normalizeComparableText(currentUserName));

  if (!isCurrentUserPost) {
    return undefined;
  }

  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');
    const role = normalizeRole(Array.isArray(roles) ? roles : []);

    return {
      avatarUrl: localStorage.getItem('unstapp_user_avatar_url') || undefined,
      role,
      verified: normalizeRoleKey(role) !== 'student',
    };
  } catch {
    return undefined;
  }
};

const getPostAudienceSource = (post: ApiRecord, author: ApiRecord) =>
  post.audience ??
  post.Audience ??
  post.targetAudience ??
  post.TargetAudience ??
  post.visibility ??
  post.Visibility ??
  post.scope ??
  post.Scope ??
  post.category ??
  post.Category ??
  post.categoryName ??
  post.CategoryName ??
  post.postCategory ??
  post.PostCategory ??
  post.type ??
  post.Type ??
  author.category ??
  author.Category ??
  author.audience ??
  author.Audience;

const getPostRoleSource = (post: ApiRecord, author: ApiRecord, audienceSource: unknown) => [
  ...getRoleCandidatesFromRecord(author),
  ...getRoleCandidatesFromRecord(post),
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
  author.Name,
  author.fullName,
  author.FullName,
  author.username,
  author.Username,
  post.userName,
  post.UserName,
  post.authorName,
  post.AuthorName,
];

const getPostAuthorRecord = (post: ApiRecord) => {
  const candidates = [
    post.author,
    post.Author,
    post.user,
    post.User,
    post.createdBy,
    post.CreatedBy,
    post.createdByUser,
    post.CreatedByUser,
    post.creator,
    post.Creator,
    post.owner,
    post.Owner,
    post.publisher,
    post.Publisher,
    post.account,
    post.Account,
    post.profile,
    post.Profile,
    post.userProfile,
    post.UserProfile,
    post.authorProfile,
    post.AuthorProfile,
    post.person,
    post.Person,
  ];

  for (const candidate of candidates) {
    const record = asRecord(candidate);

    if (Object.keys(record).length > 0) {
      return record;
    }
  }

  return {};
};

const getPostAuthorId = (post: ApiRecord, author: ApiRecord) =>
  asOptionalId(
    author.id ??
    author.Id ??
    author.userId ??
    author.UserId ??
    author.authorId ??
    author.AuthorId ??
    author.profileId ??
    author.ProfileId ??
    author.personId ??
    author.PersonId ??
    post.userId ??
    post.UserId ??
    post.authorId ??
    post.AuthorId ??
    post.authorUserId ??
    post.AuthorUserId ??
    post.createdById ??
    post.CreatedById ??
    post.createdByUserId ??
    post.CreatedByUserId ??
    post.creatorId ??
    post.CreatorId ??
    post.ownerId ??
    post.OwnerId ??
    post.publisherId ??
    post.PublisherId ??
    post.profileId,
  );

const getPostAuthorName = (post: ApiRecord, author: ApiRecord) =>
  asString(author.name) ||
  asString(author.Name) ||
  asString(author.fullName) ||
  asString(author.FullName) ||
  asString(author.username) ||
  asString(author.Username) ||
  asString(author.displayName) ||
  asString(author.DisplayName) ||
  asString(post.userName) ||
  asString(post.UserName) ||
  asString(post.authorName) ||
  asString(post.AuthorName) ||
  asString(post.createdByName) ||
  asString(post.CreatedByName) ||
  asString(post.creatorName) ||
  asString(post.CreatorName) ||
  asString(post.publisherName) ||
  asString(post.PublisherName) ||
  'Usuario';

const normalizeCategory = (role: PostAuthorRole): PostCategory => {
  if (role === 'Docente') return 'carrera';
  if (role === 'Administrativo') return 'administrativo';
  if (role === 'Bar') return 'bar';
  if (role === 'Biblioteca') return 'biblioteca';
  if (role === 'Fotocopiadora') return 'fotocopiadora';

  return 'alumno';
};

const unwrapPostItems = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const record = asRecord(data);
  const candidates = [
    record.posts,
    record.items,
    record.publications,
    record.results,
    record.value,
    record.data,
    record.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;

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
    normalizedUrl.endsWith('.webp') ||
    normalizedUrl.endsWith('.gif') ||
    normalizedUrl.includes('/image/upload/')
  ) {
    return 'image';
  }

  return 'file';
};

const unwrapSearchUsers = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const root = asRecord(payload);
  const data = asRecord(root.data ?? root.value ?? root.result ?? root.results ?? root);
  const candidates = [
    data.users,
    data.usuarios,
    data.people,
    data.personas,
    root.users,
    root.usuarios,
    root.people,
    root.personas,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const getSearchUserSummaryFromApi = async (
  authorId: number | string,
  authorName?: string,
): Promise<{ avatarUrl?: string; role?: PostAuthorRole }> => {
  if (!authorName || authorName === 'Usuario') {
    return {};
  }

  try {
    const response = await apiClient.get<unknown>('/search', {
      params: { term: authorName },
      headers: getAuthHeaders(),
    });
    const normalizedAuthorName = normalizeComparableText(authorName);
    const users = unwrapSearchUsers(response.data)
      .map(asRecord)
      .filter((user) => Object.keys(user).length > 0);
    const matchedUser = users.find((user) => {
      const userId = user.id ?? user.Id ?? user.userId ?? user.UserId ?? user.profileId ?? user.ProfileId;
      const userName =
        asString(user.fullName) ||
        asString(user.FullName) ||
        asString(user.name) ||
        asString(user.Name) ||
        asString(user.userName) ||
        asString(user.UserName) ||
        asString(user.username) ||
        asString(user.Username) ||
        asString(user.displayName);

      return (
        (userId !== undefined && String(userId) === String(authorId)) ||
        normalizeComparableText(userName) === normalizedAuthorName
      );
    });

    if (!matchedUser) {
      return {};
    }

    return {
      avatarUrl: getAvatarUrlFromRecords(matchedUser),
      role: pickStrongestRole(getRoleCandidatesFromRecord(matchedUser)),
    };
  } catch {
    return {};
  }
};

const getProfileSummaryFromApi = async (
  authorId: number | string,
  authorName?: string,
): Promise<{ avatarUrl?: string; role?: PostAuthorRole }> => {
  try {
    const response = await apiClient.get<unknown>(`/profile/${authorId}`, {
      headers: getAuthHeaders(),
    });
    const root = asRecord(response.data);
    const data = asRecord(root.data ?? root.Data ?? root.value ?? root.Value ?? root.profile ?? root.Profile ?? root);
    const user = asRecord(data.user ?? data.User ?? data.profile ?? data.Profile ?? data.person ?? data.Person ?? data);
    const rootUser = asRecord(root.user ?? root.User ?? root.profile ?? root.Profile ?? root.person ?? root.Person);
    const roles = [
      ...getRoleCandidatesFromRecord(user),
      ...getRoleCandidatesFromRecord(data),
      ...getRoleCandidatesFromRecord(rootUser),
      ...getRoleCandidatesFromRecord(root),
    ];
    const inferredRole = inferRoleFromText(
      user.bio,
      user.description,
      user.about,
      user.position,
      user.title,
      user.jobTitle,
      data.bio,
      data.description,
      data.about,
      data.position,
      data.title,
      data.jobTitle,
      rootUser.bio,
      rootUser.description,
      rootUser.about,
      rootUser.position,
      rootUser.title,
      rootUser.jobTitle,
      root.bio,
      root.description,
      root.about,
      root.position,
      root.title,
      root.jobTitle,
    );

    const profileSummary = {
      avatarUrl: getAvatarUrlFromRecords(user, data, rootUser, root),
      role: pickStrongestRole(roles, inferredRole),
    };

    if (!profileSummary.role || !profileSummary.avatarUrl) {
      const searchSummary = await getSearchUserSummaryFromApi(authorId, authorName);

      return {
        avatarUrl: profileSummary.avatarUrl || searchSummary.avatarUrl,
        role: profileSummary.role || searchSummary.role,
      };
    }

    return profileSummary;
  } catch {
    return getSearchUserSummaryFromApi(authorId, authorName);
  }
};

const hydrateAuthorProfiles = async (posts: Post[]) => {
  const authorsById = new Map<string, { id: number | string; name: string }>();

  posts.forEach((post) => {
    const authorId = post.author.id;

    if (typeof authorId === 'number' || typeof authorId === 'string') {
      authorsById.set(String(authorId), {
        id: authorId,
        name: post.author.name,
      });
    }
  });
  const profileEntries = await Promise.all(
    Array.from(authorsById.values()).map(async (author) => [
      String(author.id),
      await getProfileSummaryFromApi(author.id, author.name),
    ] as const),
  );
  const profilesByAuthorId = new Map(profileEntries);

  // Completa foto y rol reales cuando el endpoint de posts no los incluye.
  return posts.map((post) => ({
    ...post,
    author: {
      ...post.author,
      avatarUrl:
        profilesByAuthorId.get(String(post.author.id))?.avatarUrl ||
        post.author.avatarUrl,
      role:
        profilesByAuthorId.get(String(post.author.id))?.role ||
        post.author.role,
    },
  }));
};

const mapPostFromApi = (apiPost: unknown, fallbackContent = ''): Post => {
  const post = asRecord(apiPost);
  const author = getPostAuthorRecord(post);
  const audienceSource = getPostAudienceSource(post, author);
  const audience = normalizeAudienceFromApi(audienceSource);
  const inferredRole = normalizeRole(getPostRoleSource(post, author, audienceSource));
  const authorId = getPostAuthorId(post, author);
  const authorName = getPostAuthorName(post, author);
  const currentUserFallback = getCurrentUserAuthorFallback(authorId, authorName);
  const role =
    currentUserFallback?.role ??
    (audience === 'administrativo' && inferredRole === 'Alumno'
      ? 'Administrativo'
      : inferredRole);
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
      id: authorId,
      name: authorName,
      role,
      avatarUrl:
        currentUserFallback?.avatarUrl ||
        asString(author.avatarUrl) ||
        asString(author.userAvatarUrl) ||
        asString(author.profileImageUrl) ||
        asString(author.profilePictureUrl) ||
        asString(author.profilePhotoUrl) ||
        asString(author.photoUrl) ||
        asString(author.imageUrl) ||
        asString(post.avatarUrl) ||
        asString(post.userAvatarUrl) ||
        asString(post.profileImageUrl) ||
        asString(post.profilePictureUrl) ||
        asString(post.profilePhotoUrl) ||
        asString(post.photoUrl) ||
        asString(post.imageUrl) ||
        undefined,
      verified: currentUserFallback?.verified || Boolean(author.verified ?? post.verified),
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
    media: (
      asString(post.mediaUrl) ||
      asString(post.mediaFileUrl) ||
      asString(post.fileUrl) ||
      asString(post.attachmentUrl) ||
      asString(post.url)
    )
      ? {
          type: getMediaType(
            asString(post.mediaUrl) ||
            asString(post.mediaFileUrl) ||
            asString(post.fileUrl) ||
            asString(post.attachmentUrl) ||
            asString(post.url),
          ),
          url:
            asString(post.mediaUrl) ||
            asString(post.mediaFileUrl) ||
            asString(post.fileUrl) ||
            asString(post.attachmentUrl) ||
            asString(post.url),
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

const shouldRetryPostsRequest = (error: unknown) => {
  if (!(error instanceof AxiosError)) return true;

  const status = error.response?.status;

  return status !== 401 && status !== 403;
};

const getPostsResponse = async (query: EffectivePostsQuery) => {
  try {
    const response = await apiClient.get<unknown>('/posts', {
      params: query,
      headers: getAuthHeaders(),
    });

    return { response, usedLegacyFallback: false };
  } catch (error) {
    if (!shouldRetryPostsRequest(error)) throw error;
  }

  try {
    const response = await apiClient.get<unknown>('/posts/', {
      params: query,
      headers: getAuthHeaders(),
    });

    return { response, usedLegacyFallback: false };
  } catch (error) {
    if (!shouldRetryPostsRequest(error)) throw error;
  }

  const response = await apiClient.get<unknown>('/posts/', {
    params: {
      page: query.page,
      limit: query.limit,
    },
    headers: getAuthHeaders(),
  });

  return { response, usedLegacyFallback: true };
};

const getUnfilteredPostsResponse = async (query: EffectivePostsQuery) => {
  try {
    const response = await apiClient.get<unknown>('/posts', {
      params: {
        page: query.page,
        limit: query.limit,
      },
      headers: getAuthHeaders(),
    });

    return response;
  } catch (error) {
    if (!shouldRetryPostsRequest(error)) throw error;
  }

  return apiClient.get<unknown>('/posts/', {
    params: {
      page: query.page,
      limit: query.limit,
    },
    headers: getAuthHeaders(),
  });
};

const filterLegacyPosts = (posts: Post[], filter: PostsFilterQuery) => {
  if (filter === 2) {
    return posts.filter((post) => post.audience === 'carrera');
  }

  if (filter === 3) {
    return posts.filter((post) => post.audience === 'administrativo');
  }

  return posts;
};

const fetchPosts = async (options?: GetPostsOptions): Promise<PostsPageResult> => {
  const query = {
    filter: options?.filter ?? 1,
    page: options?.page ?? DEFAULT_POSTS_PAGE,
    limit: options?.limit ?? DEFAULT_POSTS_LIMIT,
  };
  const { response, usedLegacyFallback } = await getPostsResponse(query);
  let posts = unwrapPostItems(response.data);
  let shouldApplyLegacyFilter = usedLegacyFallback;

  if (posts.length === 0 && query.filter === 1 && !usedLegacyFallback) {
    const fallbackResponse = await getUnfilteredPostsResponse(query);

    posts = unwrapPostItems(fallbackResponse.data);
    shouldApplyLegacyFilter = true;
  }

  if (posts.length === 0) {
    return { posts: [], hasMore: false };
  }

  const mappedPosts = await hydrateAuthorProfiles(posts.map((post) => mapPostFromApi(post)));
  const visiblePosts = shouldApplyLegacyFilter ? filterLegacyPosts(mappedPosts, query.filter) : mappedPosts;
  const postsWithComments = await hydratePostsWithComments(visiblePosts);

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
    const [post] = await hydrateAuthorProfiles([mapPostFromApi(postData)]);

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
    const trimmedContent = content.trim();
    
    if (options?.subjectId !== undefined && options.subjectId !== null) {
      formData.append('SubjectId', String(options.subjectId));
    }

    formData.append('Content', trimmedContent);

    // Solo adjuntamos el archivo si existe
    if (mediaFile) {
      formData.append('MediaFile', mediaFile);
    }

    formData.append('IsImportant', String(Boolean(options?.isImportant)));

    if (options?.isImportant && options.careerIds?.length) {
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

    const root = asRecord(response.data);
    const postData = root.data ?? root.value ?? root.post ?? response.data;

    return mapPostFromApi(postData, trimmedContent);
  },

  remove: async (postId: number | string) => {
    await apiClient.delete(`/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
  },
};
