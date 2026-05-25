import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { ProfileCard } from './ProfileCard';
import { PostCard } from '../../../components/common/PostCard';
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

export const ProfilePage = () => {
  const { userId } = useParams<{ userId?: string }>();
  
  // Extraemos toda la lógica pesada a nuestro Hook
  const { 
    profileData, 
    isLoading, 
    error, 
    isPublicProfile, 
    handleFollowToggle 
  } = useProfile(userId);

  const postsTitle = isPublicProfile ? 'Publicaciones' : 'Mis Publicaciones';

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
              <PostCard 
                key={post.id} 
                post={post} 
                hideAuthor={true} // <-- Corrección visual clave aplicada
              />
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="perfil" />
    </div>
  );
};