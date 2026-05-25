import { useState, useEffect, useCallback } from 'react';
import { profileService, type ProfileViewData } from '../services/profileService';

export const useProfile = (profileId: string | undefined, currentUserId: number | undefined) => {
  const [profileData, setProfileData] = useState<ProfileViewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lógica de negocio: Si no hay ID en la URL, o si el ID coincide con el del usuario logueado, es su propio perfil.
  const isOwnProfile = !profileId || String(profileId) === String(currentUserId);
  
  // Si no hay parámetro en la URL, asumimos que pide su propio perfil (usamos currentUserId)
  const idToFetch = profileId || currentUserId;

  const fetchProfile = useCallback(async () => {
    if (!idToFetch) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await profileService.getById(idToFetch, isOwnProfile);
      setProfileData(data);
    } catch (err) {
      console.error("Error al obtener el perfil:", err);
      setError("No se pudo cargar la información del perfil.");
    } finally {
      setIsLoading(false);
    }
  }, [idToFetch, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Manejo de la acción de seguir con "Optimistic Update" (actualización visual instantánea)
  const handleFollowToggle = async () => {
    if (!profileData || isOwnProfile || !idToFetch) return;

    // 1. Actualizamos la UI inmediatamente para que el usuario no sienta lag
    setProfileData((prev) => prev ? {
      ...prev,
      profile: {
        ...prev.profile,
        isFollowing: !prev.profile.isFollowing
      }
    } : prev);

    // 2. Hacemos la petición real en segundo plano
    try {
      await profileService.follow(idToFetch);
    } catch (err) {
      console.error("Error al seguir al usuario:", err);
      // Si la petición falla, revertimos el botón a su estado original
      setProfileData((prev) => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          isFollowing: !prev.profile.isFollowing
        }
      } : prev);
    }
  };

  return { profileData, isLoading, error, handleFollowToggle, refetch: fetchProfile };
};