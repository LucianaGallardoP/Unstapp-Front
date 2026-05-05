import { apiClient } from '../../../services/apiClient';

const LIKED_POSTS_KEY = 'unstapp_liked_posts';
const LIKE_COUNTS_KEY = 'unstapp_like_counts';

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const getUserLikeKey = () => {
  const userName = localStorage.getItem('unstapp_user_name');

  return userName ? `${LIKED_POSTS_KEY}_${userName}` : LIKED_POSTS_KEY;
};

const readLikedPosts = () => {
  const savedLikes = localStorage.getItem(getUserLikeKey());

  if (!savedLikes) {
    return new Set<string>();
  }

  try {
    const parsedLikes = JSON.parse(savedLikes);

    return Array.isArray(parsedLikes)
      ? new Set(parsedLikes.map((postId) => String(postId)))
      : new Set<string>();
  } catch {
    return new Set<string>();
  }
};

const saveLikedPosts = (likedPosts: Set<string>) => {
  localStorage.setItem(getUserLikeKey(), JSON.stringify([...likedPosts]));
};

const getUserLikeCountsKey = () => {
  const userName = localStorage.getItem('unstapp_user_name');

  return userName ? `${LIKE_COUNTS_KEY}_${userName}` : LIKE_COUNTS_KEY;
};

const readLikeCounts = () => {
  const savedCounts = localStorage.getItem(getUserLikeCountsKey());

  if (!savedCounts) {
    return {} as Record<string, number>;
  }

  try {
    const parsedCounts = JSON.parse(savedCounts);

    return parsedCounts && typeof parsedCounts === 'object'
      ? (parsedCounts as Record<string, number>)
      : {};
  } catch {
    return {};
  }
};

const saveLikeCount = (postId: number | string, count: number) => {
  const likeCounts = readLikeCounts();
  likeCounts[String(postId)] = Math.max(0, count);
  localStorage.setItem(getUserLikeCountsKey(), JSON.stringify(likeCounts));
};

const saveLikedPost = (postId: number | string) => {
  const likedPosts = readLikedPosts();
  likedPosts.add(String(postId));
  saveLikedPosts(likedPosts);
};

const removeLikedPost = (postId: number | string) => {
  const likedPosts = readLikedPosts();
  likedPosts.delete(String(postId));
  saveLikedPosts(likedPosts);
};

export const likeService = {
  // Consulta el respaldo local cuando el backend aun no informa el like del usuario.
  isLikedByCurrentUser: (postId: number | string) => readLikedPosts().has(String(postId)),

  // Recupera el contador corregido localmente despues de un refresh.
  getStoredLikeCount: (postId: number | string) => readLikeCounts()[String(postId)],

  // Guarda el contador optimista que ve el usuario.
  storeLikeCount: (postId: number | string, count: number) => {
    saveLikeCount(postId, count);
  },

  // Registra el like del usuario autenticado.
  like: async (postId: number | string) => {
    await apiClient.post(`/posts/${postId}/likes`, undefined, {
      headers: getAuthHeaders(),
    });

    saveLikedPost(postId);
  },

  // Elimina el like; si backend usa POST como toggle, lo intenta como respaldo.
  unlike: async (postId: number | string) => {
    try {
      await apiClient.delete(`/posts/${postId}/likes`, {
        headers: getAuthHeaders(),
      });
    } catch {
      await apiClient.post(`/posts/${postId}/likes`, undefined, {
        headers: getAuthHeaders(),
      });
    }

    removeLikedPost(postId);
  },
};
