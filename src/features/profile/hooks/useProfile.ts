import { useEffect, useState } from 'react';
import {
  profileService,
  type ProfileViewData,
  MOCK_PROFILE_DETAILS,
  MOCK_PUBLIC_PROFILE_DETAILS,
  MOCK_PROFILE_STATS,
} from '../services/profileService';
import { postService } from '../../feed/services/postService';
import type { ProfileEditValues } from '../types/profile.dtos';

const decodeTokenPayload = (token: string) => {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return {};
    }

    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const getCurrentUserId = () => {
  const storedUserId = localStorage.getItem('unstapp_user_id');

  if (storedUserId) {
    return storedUserId;
  }

  const token = localStorage.getItem('unstapp_token');

  if (!token) {
    return null;
  }

  const payload = decodeTokenPayload(token);
  const possibleUserId =
    payload.userId ??
    payload.id ??
    payload.nameid ??
    payload.sub ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

  if (typeof possibleUserId === 'number' || typeof possibleUserId === 'string') {
    localStorage.setItem('unstapp_user_id', String(possibleUserId));
    return String(possibleUserId);
  }

  return null;
};

const getNumericStat = (value: string | number) => {
  const numericValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const useProfile = (userId: string | undefined) => {
  const currentUserId = getCurrentUserId();
  const isPublicProfile = Boolean(userId) && String(userId) !== String(currentUserId);
  const fallbackProfile = isPublicProfile ? MOCK_PUBLIC_PROFILE_DETAILS : MOCK_PROFILE_DETAILS;

  const [profileData, setProfileData] = useState<ProfileViewData>({
    profile: fallbackProfile,
    stats: MOCK_PROFILE_STATS,
    posts: [],
  });
  const [removingPostIds, setRemovingPostIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profileId = userId ?? currentUserId;

    setProfileData({
      profile: fallbackProfile,
      stats: MOCK_PROFILE_STATS,
      posts: [],
    });

    if (!profileId) {
      setError('No se pudo identificar el usuario autenticado.');
      return;
    }

    let isMounted = true;

    // Carga datos reales del perfil desde backend.
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await profileService.getById(profileId, !isPublicProfile);

        if (isMounted) {
          setProfileData(response);
        }
      } catch {
        if (isMounted) {
          setError('No se pudo cargar el perfil actualizado.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, fallbackProfile, isPublicProfile]);

  const handleFollowToggle = async (nextIsFollowing: boolean) => {
    if (!userId) return;

    const previousProfileData = profileData;

    // Actualiza estado y contador de seguidores al instante.
    setProfileData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        isFollowing: nextIsFollowing,
      },
      stats: {
        ...prev.stats,
        followers: nextIsFollowing
          ? getNumericStat(prev.stats.followers) + 1
          : Math.max(getNumericStat(prev.stats.followers) - 1, 0),
      },
    }));

    try {
      await profileService.follow(userId);
    } catch (err) {
      console.error('Error al seguir:', err);
      setProfileData(previousProfileData);
      throw err;
    }
  };

  const deletePost = async (postId: number | string) => {
    await postService.remove(postId);

    // Anima la salida antes de retirar la card del perfil.
    setRemovingPostIds((currentIds) => new Set(currentIds).add(String(postId)));
    window.setTimeout(() => {
      setProfileData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          posts: Math.max(getNumericStat(prev.stats.posts) - 1, 0),
        },
        posts: prev.posts.filter((post) => String(post.id) !== String(postId)),
      }));
      setRemovingPostIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(String(postId));
        return nextIds;
      });
    }, 220);
  };

  const updateProfile = async (values: ProfileEditValues) => {
    // Hasta que exista endpoint, persistimos el cambio en el estado local.
    setProfileData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        avatarUrl: values.avatarUrl,
        coverUrl: values.coverUrl,
        bio: values.bio,
      },
    }));
  };

  return {
    profileData,
    removingPostIds,
    isLoading,
    error,
    isPublicProfile,
    handleFollowToggle,
    deletePost,
    updateProfile,
  };
};
