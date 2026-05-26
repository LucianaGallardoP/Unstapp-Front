import { useState, useEffect } from 'react';
import {
  profileService,
  type ProfileViewData,
  MOCK_PROFILE_DETAILS,
  MOCK_PUBLIC_PROFILE_DETAILS,
  MOCK_PROFILE_STATS
} from '../services/profileService';

export const useProfile = (userId: string | undefined) => {
  const isPublicProfile = Boolean(userId);
  const fallbackProfile = isPublicProfile ? MOCK_PUBLIC_PROFILE_DETAILS : MOCK_PROFILE_DETAILS;
  
  // Estado inicializado con mocks para evitar parpadeos visuales
  const [profileData, setProfileData] = useState<ProfileViewData>({
    profile: fallbackProfile,
    stats: MOCK_PROFILE_STATS,
    posts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profileId = userId ?? localStorage.getItem('unstapp_user_id');

    setProfileData({
      profile: fallbackProfile,
      stats: MOCK_PROFILE_STATS,
      posts: [],
    });

    if (!profileId) return;

    let isMounted = true;

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

  const handleFollowToggle = async () => {
    if (!userId) return;

    // Actualización visual instantánea (Optimistic Update)
    setProfileData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        isFollowing: !prev.profile.isFollowing
      }
    }));

    try {
      await profileService.follow(userId);
    } catch (err) {
      console.error("Error al seguir:", err);
      // Revertimos en caso de error
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          isFollowing: !prev.profile.isFollowing
        }
      }));
    }
  };

  return {
    profileData,
    isLoading,
    error,
    isPublicProfile,
    handleFollowToggle
  };
};