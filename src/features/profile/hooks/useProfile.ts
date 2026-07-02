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
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profileId = userId ?? currentUserId;

    setProfileData({
      profile: fallbackProfile,
      stats: MOCK_PROFILE_STATS,
      posts: [],
    });
    setHasLoadedProfile(false);

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
          setHasLoadedProfile(true);
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
      setProfileData((prev) => {
        const nextPosts = prev.posts.filter((post) => String(post.id) !== String(postId));

        return {
          ...prev,
          stats: {
            ...prev.stats,
            posts: nextPosts.length,
          },
          posts: nextPosts,
        };
      });
      setRemovingPostIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(String(postId));
        return nextIds;
      });
    }, 220);
  };

  const updateProfile = async (values: ProfileEditValues) => {
    const updatedProfile = await profileService.updateProfile(values);
    const nextAvatarUrl = values.removeAvatar && !values.avatarFile
      ? undefined
      : updatedProfile.avatarUrl ?? values.avatarUrl;

    if (nextAvatarUrl) {
      localStorage.setItem('unstapp_user_avatar_url', nextAvatarUrl);
    } else if (values.removeAvatar && !values.avatarFile) {
      localStorage.removeItem('unstapp_user_avatar_url');
    }

    // Refleja el cambio del perfil sin recargar toda la pagina.
    setProfileData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        avatarUrl: values.removeAvatar && !values.avatarFile
          ? undefined
          : updatedProfile.avatarUrl ?? values.avatarUrl ?? prev.profile.avatarUrl,
        coverUrl: values.removeCover && !values.coverFile
          ? undefined
          : updatedProfile.coverUrl ?? values.coverUrl ?? prev.profile.coverUrl,
        bio: values.removeBio && !values.bio.trim()
          ? undefined
          : updatedProfile.bio ?? values.bio,
      },
      posts: prev.posts.map((post) => ({
        ...post,
        author: {
          ...post.author,
          avatarUrl: values.removeAvatar && !values.avatarFile
            ? undefined
            : updatedProfile.avatarUrl ?? values.avatarUrl ?? post.author.avatarUrl,
        },
      })),
    }));
  };

  return {
    profileData,
    removingPostIds,
    hasLoadedProfile,
    isLoading,
    error,
    isPublicProfile,
    handleFollowToggle,
    deletePost,
    updateProfile,
  };
};
