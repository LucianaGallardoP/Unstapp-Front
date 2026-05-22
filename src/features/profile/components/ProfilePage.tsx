import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { ProfileCard } from './ProfileCard';
import { ProfilePostCard } from './ProfilePostCard';
import { MOCK_PROFILE_DETAILS, MOCK_PROFILE_POSTS, MOCK_PUBLIC_PROFILE_DETAILS } from '../services/profileService';
import { useParams } from 'react-router-dom';

export const ProfilePage = () => {
  const { userId } = useParams();

  // Si hay id en la URL, se muestra como perfil publico de tercero.
  const isPublicProfile = Boolean(userId);
  const profile = isPublicProfile ? MOCK_PUBLIC_PROFILE_DETAILS : MOCK_PROFILE_DETAILS;
  const postsTitle = isPublicProfile ? 'Publicaciones' : 'Mis Publicaciones';

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-3 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-5 lg:max-w-3xl">
        <ProfileCard profile={profile} />
        
        <div className="mx-auto mt-6 flex w-full max-w-[430px] flex-col gap-4 sm:max-w-[560px] md:max-w-[600px]">
          <h2 className="px-1 text-base font-black uppercase tracking-tight text-black">
            {postsTitle}
          </h2>
          
          <div className="flex flex-col">
            {MOCK_PROFILE_POSTS.map((post) => (
              <ProfilePostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="perfil" />
    </div>
  );
};

