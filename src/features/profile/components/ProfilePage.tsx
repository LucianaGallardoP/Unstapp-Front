import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { ProfileCard } from './ProfileCard';
import { EditProfileModal } from './EditProfileModal';
import { PostCard } from '../../../components/common/PostCard';
import { useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useState } from 'react';
import { useAuth } from '../../../store/authContext';
import { useLanguage } from '../../../store/languageContext';

export const ProfilePage = () => {
  const { t } = useLanguage();
  const { userId } = useParams<{ userId?: string }>();
  const {
    profileData,
    removingPostIds,
    hasLoadedProfile,
    isLoading,
    error,
    isPublicProfile,
    handleFollowToggle,
    deletePost,
    updateProfile,
  } = useProfile(userId);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const { handleLogout } = useAuth();

  const postsTitle = isPublicProfile ? t('profile.posts') : t('profile.myPosts');

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-3 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-5 lg:max-w-3xl">
        {isLoading && (
          <div className="mb-3 rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-gray-500 shadow-sm">
            {t('profile.loading')}
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-4 py-3 text-center text-sm font-bold text-[#E7000B]">
            {error}
          </div>
        )}

        {hasLoadedProfile && (
          <ProfileCard
            profile={profileData.profile}
            stats={profileData.stats}
            onFollowToggle={isPublicProfile ? handleFollowToggle : undefined}
            onEditProfile={!isPublicProfile ? () => setIsEditProfileModalOpen(true) : undefined}
            onLogout={!isPublicProfile ? handleLogout : undefined}
          />
        )}

        {hasLoadedProfile && (
          <div className="mx-auto mt-6 flex w-full max-w-[430px] flex-col gap-4 sm:max-w-[560px] md:max-w-[600px]">
            <h2 className="px-1 text-base font-black uppercase tracking-tight text-black">
              {postsTitle}
            </h2>

            <div className="flex flex-col gap-4 lg:gap-5">
              {profileData.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canDelete={!isPublicProfile}
                  isRemoving={removingPostIds.has(String(post.id))}
                  onDelete={deletePost}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {hasLoadedProfile && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          profile={profileData.profile}
          onClose={() => setIsEditProfileModalOpen(false)}
          onSave={updateProfile}
        />
      )}

      <BottomNavigation activeTab={isPublicProfile ? null : 'perfil'} />
    </div>
  );
};
