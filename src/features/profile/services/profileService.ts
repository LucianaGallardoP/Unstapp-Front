import { apiClient } from '../../../services/apiClient';
import type { ProfileEditValues, ProfileResponseDTO, ProfileStatsDTO } from '../types/profile.dtos';
import type { Post, PostAuthorRole, PostCategory } from '../../feed/types/post.types';
import { postService } from '../../feed/services/postService';
import { normalizeRoleKey } from '../../../utils/roleLabels';
import {
  getAvatarUrlFromRecords,
  getRoleCandidatesFromRecord,
  inferRoleFromText,
  normalizeRoleLabel,
} from '../../../utils/apiRoleMapping';

type ApiRecord = Record<string, unknown>;

export interface ProfileViewData {
  profile: ProfileResponseDTO;
  stats: ProfileStatsDTO;
  posts: Post[];
}

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
  typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim() && Number.isFinite(Number(value))
      ? Number(value)
      : fallback;

const asNumberList = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.flatMap(asNumberList);
  }

  const numericValue = asNumber(value, Number.NaN);

  if (Number.isFinite(numericValue)) {
    return [numericValue];
  }

  const record = asRecord(value);
  const nestedValue = asNumber(
    record.id ??
    record.careerId ??
    record.carreraId ??
    record.value,
    Number.NaN,
  );

  return Number.isFinite(nestedValue) ? [nestedValue] : [];
};

const asBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback;

const asOptionalBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;
  }

  return undefined;
};

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

  if (nestedValue) {
    return [nestedValue];
  }

  return [];
};


// 1. Mock de los detalles del Perfil (Basado en la imagen de tu diseño)
export const MOCK_PROFILE_DETAILS: ProfileResponseDTO = {
  userId: 1,
  fullName: "María Gonzales",
  careers: [],
  isOwnProfile: true, // Ponlo en 'false' luego si quieres probar cómo se ve el botón "Seguir"
  isFollowing: false,
  roles: ['Alumno']
};

// Mock para representar un perfil publico visto por otro usuario.
export const MOCK_PUBLIC_PROFILE_DETAILS: ProfileResponseDTO = {
  userId: 2,
  fullName: "Nicolas Zingale",
  careers: [],
  isOwnProfile: false,
  isFollowing: false,
};

export const MOCK_PROFILE_STATS: ProfileStatsDTO = {
  posts: 0,
  followers: 0,
  following: 0,
};



const normalizeProfilePostRole = (role?: string): PostAuthorRole => {
  return normalizeRoleLabel(role);
};

const inferRoleFromProfileText = (...values: unknown[]) => {
  const profileText = values
    .flatMap(asStringList)
    .join(' ');
  const roleKey = normalizeRoleKey(profileText);

  return roleKey === 'student' ? undefined : profileText;
};

const getRolePriority = (role?: string) => {
  const roleKey = normalizeRoleKey(role);

  if (roleKey === 'admin') return 4;
  if (roleKey === 'teacher') return 3;
  if (roleKey === 'bar') return 2;
  if (roleKey === 'library') return 2;
  if (roleKey === 'copyCenter') return 2;

  return 1;
};

const pickPrimaryRole = (roles: string[], inferredRole?: string) => {
  const candidates = [...roles, inferredRole].filter((role): role is string => Boolean(role));

  return candidates.sort((a, b) => getRolePriority(b) - getRolePriority(a))[0];
};

const normalizeProfilePostCategory = (role: PostAuthorRole): PostCategory => {
  if (role === 'Administrativo') return 'administrativo';
  if (role === 'Docente') return 'carrera';
  if (role === 'Bar') return 'bar';
  if (role === 'Biblioteca') return 'biblioteca';
  if (role === 'Fotocopiadora') return 'fotocopiadora';

  return 'alumno';
};

const normalizeComparableText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

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

const getSearchProfileSummaryFromApi = async (profileId: number | string, profileName: string) => {
  if (!profileName) {
    return {};
  }

  try {
    const response = await apiClient.get<unknown>('/search', {
      params: { term: profileName },
      headers: getAuthHeaders(),
    });
    const normalizedProfileName = normalizeComparableText(profileName);
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
        (userId !== undefined && String(userId) === String(profileId)) ||
        normalizeComparableText(userName) === normalizedProfileName
      );
    });

    if (!matchedUser) {
      return {};
    }

    const roles = getRoleCandidatesFromRecord(matchedUser);

    return {
      avatarUrl: getAvatarUrlFromRecords(matchedUser),
      role: pickPrimaryRole(roles),
      roles: roles.length ? roles : undefined,
    };
  } catch {
    return {};
  }
};

const mapPostFromApi = (apiPost: unknown, fallbackAuthor: { id: number; name: string; avatarUrl?: string; role?: string }): Post => {
  const post = asRecord(apiPost);
  const authorRole = normalizeProfilePostRole(fallbackAuthor.role);

  return {
    id: String(post.id ?? post.postId ?? crypto.randomUUID()),
    author: {
      id: fallbackAuthor.id,
      name: fallbackAuthor.name,
      role: authorRole,
      avatarUrl: fallbackAuthor.avatarUrl,
    },
    category: normalizeProfilePostCategory(authorRole),
    audience: 'general',
    publishedAt: asString(post.publishedAt) || asString(post.createdAt) || asString(post.postDate) || asString(post.date) || new Date().toISOString(),
    content:
      asString(post.content) ||
      asString(post.text) ||
      asString(post.body) ||
      'Publicacion sin contenido',
    likes: asNumber(post.likesCount ?? post.likes),
    commentsCount: asNumber(post.commentsCount ?? post.comments),
    comments: [],
  };
};

const mapProfileFromApi = (
  apiProfile: unknown,
  fallbackProfile: ProfileResponseDTO,
  isOwnProfile: boolean,
): ProfileViewData => {
  const root = asRecord(apiProfile);
  const data = asRecord(root.data ?? root.Data ?? root.value ?? root.Value ?? root.profile ?? root.Profile ?? root);
  const user = asRecord(data.user ?? data.User ?? data.profile ?? data.Profile ?? data.person ?? data.Person ?? data);
  const rootUser = asRecord(root.user ?? root.User ?? root.profile ?? root.Profile ?? root.person ?? root.Person);
  const posts = data.posts ?? data.Posts ?? data.publications ?? data.Publications ?? data.userPosts ?? data.UserPosts;
  const apiPostsCount = data.postsCount ?? data.PostsCount ?? user.postsCount ?? user.PostsCount ?? root.postsCount ?? root.PostsCount ?? rootUser.postsCount ?? rootUser.PostsCount ?? data.publicationsCount ?? data.PublicationsCount;
  const careers = [
    ...asStringList(user.careers),
    ...asStringList(user.career),
    ...asStringList(user.carrera),
    ...asStringList(rootUser.careers),
    ...asStringList(rootUser.career),
    ...asStringList(rootUser.carrera),
  ];
  const careerIds = [
    ...asNumberList(user.careerIds),
    ...asNumberList(user.carrerasIds),
    ...asNumberList(user.careers),
    ...asNumberList(user.career),
    ...asNumberList(user.carrera),
    ...asNumberList(data.careerIds),
    ...asNumberList(data.carrerasIds),
    ...asNumberList(data.careers),
    ...asNumberList(data.career),
    ...asNumberList(data.carrera),
    ...asNumberList(rootUser.careerIds),
    ...asNumberList(rootUser.carrerasIds),
    ...asNumberList(rootUser.careers),
    ...asNumberList(rootUser.career),
    ...asNumberList(rootUser.carrera),
    ...asNumberList(root.careerIds),
    ...asNumberList(root.carrerasIds),
    ...asNumberList(root.careers),
    ...asNumberList(root.career),
    ...asNumberList(root.carrera),
  ].filter((careerId, index, allCareerIds) => allCareerIds.indexOf(careerId) === index);
  const roles = [
    ...getRoleCandidatesFromRecord(user),
    ...getRoleCandidatesFromRecord(rootUser),
    ...getRoleCandidatesFromRecord(data),
    ...getRoleCandidatesFromRecord(root),
    ...asStringList(user.roles),
    ...asStringList(user.role),
    ...asStringList(user.roleName),
    ...asStringList(user.rol),
    ...asStringList(user.userRole),
    ...asStringList(user.tipoUsuario),
    ...asStringList(user.type),
    ...asStringList(rootUser.roles),
    ...asStringList(rootUser.role),
    ...asStringList(rootUser.roleName),
    ...asStringList(rootUser.rol),
    ...asStringList(rootUser.userRole),
    ...asStringList(rootUser.tipoUsuario),
    ...asStringList(rootUser.type),
    ...asStringList(data.roles),
    ...asStringList(data.role),
    ...asStringList(data.roleName),
    ...asStringList(data.rol),
    ...asStringList(data.userRole),
    ...asStringList(data.tipoUsuario),
    ...asStringList(data.type),
    ...asStringList(root.roles),
    ...asStringList(root.role),
    ...asStringList(root.roleName),
    ...asStringList(root.rol),
    ...asStringList(root.userRole),
    ...asStringList(root.tipoUsuario),
    ...asStringList(root.type),
  ];
  const fullName =
    asString(user.fullName) ||
    asString(user.FullName) ||
    asString(user.name) ||
    asString(user.Name) ||
    asString(user.username) ||
    asString(user.Username) ||
    asString(rootUser.fullName) ||
    asString(rootUser.FullName) ||
    asString(rootUser.name) ||
    asString(rootUser.Name) ||
    asString(rootUser.username) ||
    asString(rootUser.Username) ||
    asString(root.fullName) ||
    asString(root.FullName) ||
    asString(root.name) ||
    asString(root.Name) ||
    asString(root.username) ||
    asString(root.Username) ||
    fallbackProfile.fullName;
  const inferredRole =
    inferRoleFromText(
      fullName,
      user.bio,
      user.description,
      user.about,
      user.position,
      user.title,
      user.jobTitle,
      rootUser.bio,
      rootUser.description,
      rootUser.about,
      rootUser.position,
      rootUser.title,
      rootUser.jobTitle,
      data.bio,
      data.description,
      data.about,
      data.position,
      data.title,
      data.jobTitle,
      root.bio,
      root.description,
      root.about,
      root.position,
      root.title,
      root.jobTitle,
    ) ||
    inferRoleFromProfileText(
      fullName,
      user.bio,
      user.description,
      rootUser.bio,
      rootUser.description,
      data.bio,
      data.description,
      root.bio,
      root.description,
    );
  const primaryRole = pickPrimaryRole(roles, inferredRole);

  return {
    profile: {
      userId: asNumber(user.userId ?? user.UserId ?? user.id ?? user.Id ?? rootUser.userId ?? rootUser.UserId ?? rootUser.id ?? rootUser.Id ?? root.userId ?? root.UserId ?? root.id ?? root.Id, fallbackProfile.userId),
      fullName,
      careers,
      careerIds,
      role: primaryRole,
      roles: roles.length ? roles : undefined,
      bio: asString(user.bio) || asString(user.description) || undefined,
      avatarUrl:
        getAvatarUrlFromRecords(user, data, rootUser, root) ||
        asString(user.avatarUrl) ||
        asString(user.profileImageUrl) ||
        asString(user.photoUrl) ||
        asString(rootUser.avatarUrl) ||
        asString(rootUser.profileImageUrl) ||
        asString(rootUser.photoUrl) ||
        asString(root.avatarUrl) ||
        asString(root.profileImageUrl) ||
        asString(root.photoUrl) ||
        undefined,
      coverUrl:
        asString(user.coverUrl) ||
        asString(user.coverImageUrl) ||
        asString(rootUser.coverUrl) ||
        asString(rootUser.coverImageUrl) ||
        asString(root.coverUrl) ||
        asString(root.coverImageUrl) ||
        undefined,
      whatsappNotificationsEnabled: asOptionalBoolean(
        user.whatsappNotificationsEnabled ??
        user.whatsAppNotificationsEnabled ??
        user.receiveWhatsappNotifications ??
        user.receiveWhatsAppNotifications ??
        data.whatsappNotificationsEnabled ??
        data.whatsAppNotificationsEnabled ??
        root.whatsappNotificationsEnabled ??
        root.whatsAppNotificationsEnabled,
      ),
      isOwnProfile,
      isFollowing: asBoolean(user.isFollowing ?? user.following ?? rootUser.isFollowing ?? rootUser.following ?? data.isFollowing ?? root.isFollowing, fallbackProfile.isFollowing),
    },
    stats: {
      posts: asNumber(apiPostsCount, Array.isArray(posts) ? posts.length : Number(MOCK_PROFILE_STATS.posts)),
      followers: asNumber(data.followersCount ?? user.followersCount ?? root.followersCount ?? rootUser.followersCount ?? data.followers, Number(MOCK_PROFILE_STATS.followers)),
      following: asNumber(data.followingCount ?? user.followingCount ?? root.followingCount ?? rootUser.followingCount ?? data.following, Number(MOCK_PROFILE_STATS.following)),
    },
    posts: Array.isArray(posts)
      ? posts.map(p => mapPostFromApi(p, {
          id: fallbackProfile.userId,
          name: fallbackProfile.fullName,
          avatarUrl: fallbackProfile.avatarUrl,
          role: primaryRole ?? fallbackProfile.role ?? fallbackProfile.roles?.[0],
        }))
      : [],
  };
};

export const profileService = {
  getById: async (profileId: number | string, isOwnProfile: boolean): Promise<ProfileViewData> => {
    const response = await apiClient.get<unknown>(`/profile/${profileId}`, {
      headers: getAuthHeaders(),
    });
    const fallbackProfile = isOwnProfile ? MOCK_PROFILE_DETAILS : MOCK_PUBLIC_PROFILE_DETAILS;

    const mappedData = mapProfileFromApi(response.data, fallbackProfile, isOwnProfile);

    if (!mappedData.profile.role || !mappedData.profile.avatarUrl) {
      const searchSummary = await getSearchProfileSummaryFromApi(mappedData.profile.userId, mappedData.profile.fullName);

      mappedData.profile = {
        ...mappedData.profile,
        avatarUrl: mappedData.profile.avatarUrl || searchSummary.avatarUrl,
        role: mappedData.profile.role || searchSummary.role,
        roles: mappedData.profile.roles?.length ? mappedData.profile.roles : searchSummary.roles,
      };
    }

    // Si el endpoint de perfil no devolvió posts, los traemos del feed general y los filtramos
    if (!mappedData.posts || mappedData.posts.length === 0) {
      try {
        const allPosts = await postService.getAll();
        // Filtramos asegurándonos de convertir ambos IDs a string para evitar falsos negativos
        mappedData.posts = allPosts.filter(post => String(post.author.id) === String(profileId));
      } catch (err) {
        console.warn('No se pudieron obtener los posts del feed general:', err);
      }
    }

    // En el muro de perfil, cada card conserva el autor del perfil visible.
    const profilePostRole = normalizeProfilePostRole(mappedData.profile.role ?? mappedData.profile.roles?.[0]);
    mappedData.posts = mappedData.posts.map((post) => ({
      ...post,
      category: normalizeProfilePostCategory(profilePostRole),
      author: {
        ...post.author,
        id: mappedData.profile.userId,
        name: mappedData.profile.fullName,
        role: profilePostRole,
        avatarUrl: mappedData.profile.avatarUrl,
      },
    }));

    // El contador debe coincidir con las publicaciones visibles del perfil.
    mappedData.stats.posts = mappedData.posts.length;

    return mappedData;
  },

  follow: async (profileId: number | string) => {
    await apiClient.post(`/users/${profileId}/follow`, undefined, {
      headers: getAuthHeaders(),
    });
  },

  updateProfile: async (values: ProfileEditValues): Promise<Partial<ProfileResponseDTO>> => {
    const formData = new FormData();

    // Envia solo los campos editados al endpoint PATCH de perfil.
    if (values.bio.trim() || values.removeBio) {
      formData.append('Bio', values.bio.trim());
    }

    if (values.avatarFile) {
      formData.append('AvatarFile', values.avatarFile);
    }

    if (values.coverFile) {
      formData.append('CoverFile', values.coverFile);
    }

    formData.append('RemoveBio', String(values.removeBio));
    formData.append('RemoveAvatar', String(values.removeAvatar));
    formData.append('RemoveCover', String(values.removeCover));

    const response = await apiClient.patch<unknown>('/profile', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    const root = asRecord(response.data);
    const data = asRecord(root.data ?? root.value ?? root.profile ?? root);

    return {
      bio: asString(data.bio) || asString(data.description) || undefined,
      avatarUrl:
        asString(data.avatarUrl) ||
        asString(data.profileImageUrl) ||
        asString(data.photoUrl) ||
        undefined,
      coverUrl:
        asString(data.coverUrl) ||
        asString(data.coverImageUrl) ||
        undefined,
    };
  },

  updateWhatsAppNotifications: async (enabled: boolean) => {
    const formData = new FormData();

    // Mantiene sincronizada la preferencia para que el backend pueda decidir si envía WhatsApp.
    formData.append('WhatsappNotificationsEnabled', String(enabled));
    formData.append('WhatsAppNotificationsEnabled', String(enabled));
    formData.append('ReceiveWhatsappNotifications', String(enabled));
    formData.append('ReceiveWhatsAppNotifications', String(enabled));

    await apiClient.patch('/profile', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
