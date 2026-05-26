import { apiClient } from '../../../services/apiClient';
import type { ProfileResponseDTO, ProfileStatsDTO } from '../types/profile.dtos';
import type { Post } from '../../feed/types/post.types';
import { postService } from '../../feed/services/postService';

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
  typeof value === 'number' ? value : fallback;

const asBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback;

const asStringList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return [];
};


// 1. Mock de los detalles del Perfil (Basado en la imagen de tu diseño)
export const MOCK_PROFILE_DETAILS: ProfileResponseDTO = {
  userId: 1,
  fullName: "María Gonzales",
  careers: ["ESTUDIANTE DE INGENIERÍA DE SOFTWARE"],
  bio: "Apasionado por la tecnología y el desarrollo de software. Siempre buscando aprender algo nuevo y compartir conocimiento con la comunidad UNSTA. 🚀",
  // Usamos imágenes de placeholder temporalmente para que tu UI no se rompa
  avatarUrl: "https://i.pravatar.cc/150?img=47", 
  coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop", 
  isOwnProfile: true, // Ponlo en 'false' luego si quieres probar cómo se ve el botón "Seguir"
  isFollowing: false
};

// Mock para representar un perfil publico visto por otro usuario.
export const MOCK_PUBLIC_PROFILE_DETAILS: ProfileResponseDTO = {
  userId: 2,
  fullName: "Nicolas Zingale",
  careers: ["ESTUDIANTE DE INGENIERIA DE SOFTWARE"],
  bio: "Alumno de la comunidad UNSTA. Comparte consultas, avisos y recursos utiles para la carrera.",
  avatarUrl: "https://i.pravatar.cc/150?img=12",
  coverUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
  isOwnProfile: false,
  isFollowing: false
};

export const MOCK_PROFILE_STATS: ProfileStatsDTO = {
  posts: 124,
  followers: 1200,
  following: 850,
};



const mapPostFromApi = (apiPost: unknown, fallbackAuthor: { id: number; name: string }): Post => {
  const post = asRecord(apiPost);

  return {
    id: String(post.id ?? post.postId ?? crypto.randomUUID()),
    author: {
      id: fallbackAuthor.id,
      name: fallbackAuthor.name,
      role: 'Alumno',
    },
    category: 'alumno',
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
  const data = asRecord(root.data ?? root.value ?? root.profile ?? root);
  const user = asRecord(data.user ?? data.profile ?? data.person ?? data);
  const posts = data.posts ?? data.publications ?? data.userPosts;
  const careers = [
    ...asStringList(user.careers),
    ...asStringList(user.career),
    ...asStringList(user.carrera),
  ];

  return {
    profile: {
      userId: asNumber(user.userId ?? user.id, fallbackProfile.userId),
      fullName:
        asString(user.fullName) ||
        asString(user.name) ||
        asString(user.username) ||
        fallbackProfile.fullName,
      careers: careers.length ? careers : fallbackProfile.careers,
      bio: asString(user.bio) || asString(user.description) || fallbackProfile.bio,
      avatarUrl:
        asString(user.avatarUrl) ||
        asString(user.profileImageUrl) ||
        asString(user.photoUrl) ||
        fallbackProfile.avatarUrl,
      coverUrl:
        asString(user.coverUrl) ||
        asString(user.coverImageUrl) ||
        fallbackProfile.coverUrl,
      isOwnProfile,
      isFollowing: asBoolean(user.isFollowing ?? user.following ?? data.isFollowing, fallbackProfile.isFollowing),
    },
    stats: {
      posts: asNumber(data.postsCount ?? user.postsCount ?? data.publicationsCount, Number(MOCK_PROFILE_STATS.posts)),
      followers: asNumber(data.followersCount ?? user.followersCount ?? data.followers, Number(MOCK_PROFILE_STATS.followers)),
      following: asNumber(data.followingCount ?? user.followingCount ?? data.following, Number(MOCK_PROFILE_STATS.following)),
    },
    posts: Array.isArray(posts) ? posts.map(p => mapPostFromApi(p, { id: fallbackProfile.userId, name: fallbackProfile.fullName })) : [],
  };
};

export const profileService = {
  getById: async (profileId: number | string, isOwnProfile: boolean): Promise<ProfileViewData> => {
    const response = await apiClient.get<unknown>(`/profile/${profileId}`, {
      headers: getAuthHeaders(),
    });
    const fallbackProfile = isOwnProfile ? MOCK_PROFILE_DETAILS : MOCK_PUBLIC_PROFILE_DETAILS;

    const mappedData = mapProfileFromApi(response.data, fallbackProfile, isOwnProfile);

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

    return mappedData;
  },

  follow: async (profileId: number | string) => {
    await apiClient.post(`/users/${profileId}/follow`, undefined, {
      headers: getAuthHeaders(),
    });
  },
};
