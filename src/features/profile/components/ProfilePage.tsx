import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { ProfileCard } from './ProfileCard';
import { ProfilePostCard } from './ProfilePostCard';
import {
  MOCK_PROFILE_DETAILS,
  MOCK_PROFILE_POSTS,
  MOCK_PROFILE_STATS,
  MOCK_PUBLIC_PROFILE_DETAILS,
  profileService,
  type ProfileViewData,
} from '../services/profileService';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const ProfilePage = () => {
  const { userId } = useParams();

  // Si hay id en la URL, se muestra como perfil publico de tercero.
  const isPublicProfile = Boolean(userId);
  const fallbackProfile = isPublicProfile ? MOCK_PUBLIC_PROFILE_DETAILS : MOCK_PROFILE_DETAILS;
  const [profileData, setProfileData] = useState<ProfileViewData>({
    profile: fallbackProfile,
    stats: MOCK_PROFILE_STATS,
    posts: MOCK_PROFILE_POSTS,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const postsTitle = isPublicProfile ? 'Publicaciones' : 'Mis Publicaciones';

  useEffect(() => {
    const profileId = userId ?? localStorage.getItem('unstapp_user_id');

    setProfileData({
      profile: fallbackProfile,
      stats: MOCK_PROFILE_STATS,
      posts: MOCK_PROFILE_POSTS,
    });

    if (!profileId) {
      return;
    }

    let isMounted = true;

    // Trae el perfil real desde backend y conserva mock como respaldo visual.
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
  }, [fallbackProfile, isPublicProfile, userId]);

  const handleFollowToggle = async () => {
    if (!userId) return;

    await profileService.follow(userId);
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-3 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-5 lg:max-w-3xl">
        {isLoading && (
          <div className="mb-3 rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-gray-500 shadow-sm">
            Cargando perfil...
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-4 py-3 text-center text-sm font-bold text-[#E7000B]">
            {error}
          </div>
        )}

        <ProfileCard
          profile={profileData.profile}
          stats={profileData.stats}
          onFollowToggle={isPublicProfile ? handleFollowToggle : undefined}
        />
        
        <div className="mx-auto mt-6 flex w-full max-w-[430px] flex-col gap-4 sm:max-w-[560px] md:max-w-[600px]">
          <h2 className="px-1 text-base font-black uppercase tracking-tight text-black">
            {postsTitle}
          </h2>
          
          <div className="flex flex-col">
            {profileData.posts.map((post) => (
              <ProfilePostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="perfil" />
    </div>
  );
};

