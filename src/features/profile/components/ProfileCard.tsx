import { type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ProfileResponseDTO, ProfileStatsDTO } from '../types/profile.dtos';
import { ImageLightbox } from '../../../components/common/ImageLightbox';
import { RoleAvatar } from '../../../components/common/RoleAvatar';
import { useLanguage } from '../../../store/languageContext';
import { getRoleBadgeClass, shouldShowVerifiedForRole, translateRole } from '../../../utils/roleLabels';
import { profileService } from '../services/profileService';

const formatCompactNumber = (value: string | number) => {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  if (numericValue >= 1000000) {
    return `${Number((numericValue / 1000000).toFixed(1))}M`;
  }

  if (numericValue >= 1000) {
    return `${Number((numericValue / 1000).toFixed(1))}k`;
  }

  return numericValue.toString();
};

const getStoredRoles = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return Array.isArray(roles) ? roles.map(String) : [];
  } catch {
    return [];
  }
};

const getWhatsAppNotificationsKey = (userId: number | string) =>
  `unstapp_whatsapp_notifications_${userId}`;

const getStoredWhatsAppNotifications = (userId: number | string, fallback = true) => {
  const storedValue = localStorage.getItem(getWhatsAppNotificationsKey(userId));

  if (storedValue === 'true') return true;
  if (storedValue === 'false') return false;

  return fallback;
};

interface ProfileCardProps {
  profile: ProfileResponseDTO;
  stats?: ProfileStatsDTO;
  onFollowToggle?: (nextIsFollowing: boolean) => Promise<void>;
  onEditProfile?: () => void;
  onLogout?: () => void;
}

export const ProfileCard = ({
  profile,
  stats = {
    posts: 0,
    followers: 0,
    following: 0,
  },
  onFollowToggle,
  onEditProfile,
  onLogout,
}: ProfileCardProps) => {
  const { t } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [followersCount, setFollowersCount] = useState(stats.followers);
  const [whatsAppNotificationsEnabled, setWhatsAppNotificationsEnabled] = useState(() =>
    getStoredWhatsAppNotifications(profile.userId, profile.whatsappNotificationsEnabled ?? true),
  );
  const [isWhatsAppNotificationsLoading, setIsWhatsAppNotificationsLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const rawRole = useMemo(() => {
    const roles = profile.roles?.length ? profile.roles : profile.isOwnProfile ? getStoredRoles() : [];

    return profile.role ?? roles[0] ?? null;
  }, [profile.isOwnProfile, profile.role, profile.roles]);
  const roleLabel = rawRole ? translateRole(rawRole, t) : null;
  const showVerified = shouldShowVerifiedForRole(rawRole);

  const openProfileImage = (imageUrl?: string | null) => (event: SyntheticEvent) => {
    if (!imageUrl) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedImageUrl(imageUrl);
  };

  useEffect(() => {
    setIsFollowing(profile.isFollowing);
    setFollowersCount(stats.followers);
  }, [profile.isFollowing, stats.followers]);

  useEffect(() => {
    setWhatsAppNotificationsEnabled(
      getStoredWhatsAppNotifications(profile.userId, profile.whatsappNotificationsEnabled ?? true),
    );
  }, [profile.userId, profile.whatsappNotificationsEnabled]);

  const updateFollowersCount = (nextIsFollowing: boolean) => {
    setFollowersCount((currentCount) => {
      const numericCount = typeof currentCount === 'number' ? currentCount : Number(currentCount);

      if (!Number.isFinite(numericCount)) {
        return currentCount;
      }

      return nextIsFollowing ? numericCount + 1 : Math.max(numericCount - 1, 0);
    });
  };

  const handleFollowClick = async () => {
    if (isFollowLoading) return;

    const previousIsFollowing = isFollowing;
    const previousFollowersCount = followersCount;
    const nextIsFollowing = !previousIsFollowing;

    setFollowError(null);
    setIsFollowLoading(true);
    setIsFollowing(nextIsFollowing);
    updateFollowersCount(nextIsFollowing);

    try {
      await onFollowToggle?.(nextIsFollowing);
    } catch {
      setIsFollowing(previousIsFollowing);
      setFollowersCount(previousFollowersCount);
      setFollowError(t('profile.followError'));
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleWhatsAppNotificationsToggle = async () => {
    if (isWhatsAppNotificationsLoading) return;

    const previousValue = whatsAppNotificationsEnabled;
    const nextValue = !previousValue;

    setWhatsAppError(null);
    setIsWhatsAppNotificationsLoading(true);
    setWhatsAppNotificationsEnabled(nextValue);
    localStorage.setItem(getWhatsAppNotificationsKey(profile.userId), String(nextValue));

    try {
      await profileService.updateWhatsAppNotifications(nextValue);
    } catch {
      setWhatsAppNotificationsEnabled(previousValue);
      localStorage.setItem(getWhatsAppNotificationsKey(profile.userId), String(previousValue));
      setWhatsAppError(t('profile.whatsappUpdateError'));
    } finally {
      setIsWhatsAppNotificationsLoading(false);
    }
  };

  return (
    <>
    <article className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[16px] border border-gray-200 bg-white pb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-[560px] md:max-w-[600px]">
      <div className="h-32 w-full bg-gray-200 sm:h-40">
        {profile.coverUrl && (
          <button
            type="button"
            onClick={openProfileImage(profile.coverUrl)}
            onTouchEnd={openProfileImage(profile.coverUrl)}
            className="h-full w-full cursor-zoom-in touch-manipulation"
            aria-label="Ver portada del perfil"
          >
            <img
              src={profile.coverUrl}
              alt="Portada del perfil"
              className="h-full w-full object-cover"
            />
          </button>
        )}
      </div>

      <div className="px-5 flex items-end justify-between -mt-10 mb-3 sm:-mt-12 sm:mb-4">
        <div className="relative shrink-0">
          {profile.avatarUrl ? (
            <button
              type="button"
              onClick={openProfileImage(profile.avatarUrl)}
              onTouchEnd={openProfileImage(profile.avatarUrl)}
              className="cursor-zoom-in rounded-[15px] touch-manipulation"
              aria-label={`Ver foto de perfil de ${profile.fullName}`}
            >
              <RoleAvatar
                avatarUrl={profile.avatarUrl}
                name={profile.fullName}
                role={rawRole}
                className="h-[84px] w-[84px] rounded-[15px] sm:h-[100px] sm:w-[100px]"
                iconClassName="h-11 w-11 sm:h-12 sm:w-12"
              />
            </button>
          ) : (
            <RoleAvatar
              avatarUrl={profile.avatarUrl}
              name={profile.fullName}
              role={rawRole}
              className="h-[84px] w-[84px] rounded-[15px] sm:h-[100px] sm:w-[100px]"
              iconClassName="h-11 w-11 sm:h-12 sm:w-12"
            />
          )}
        </div>

        {profile.isOwnProfile ? (
          <div className="mb-1 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onEditProfile}
              className="h-8 rounded-lg bg-[#F0F2F5] px-4 text-[12px] font-bold text-gray-900 transition-colors hover:bg-[#E4E6E9] sm:h-9 sm:px-5 sm:text-[13px]"
            >
              {t('profile.edit')}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="h-8 rounded-lg bg-[#E7000B] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#b80009] sm:h-9 sm:px-5 sm:text-[13px]"
            >
              {t('profile.logout')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFollowClick}
            aria-pressed={isFollowing}
            disabled={isFollowLoading}
            className={`mb-1 h-8 rounded-lg px-4 text-[12px] font-bold transition-colors sm:h-9 sm:px-5 sm:text-[13px] ${
              isFollowing
                ? 'bg-[#F0F2F5] text-gray-900 hover:bg-[#E4E6E9]'
                : 'bg-[#155DFC] text-white hover:bg-blue-700'
            }`}
          >
            {isFollowing ? t('profile.following') : t('profile.follow')}
          </button>
        )}
      </div>

      <div className="px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[22px] font-black tracking-tight text-black sm:text-[24px]">
            {profile.fullName}
          </h2>
          {showVerified && (
            <CheckCircle2
              size={18}
              className="shrink-0 text-[#155DFC]"
              aria-label="Usuario verificado"
            />
          )}
          {roleLabel && (
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${getRoleBadgeClass(rawRole)}`}>
              {roleLabel}
            </span>
          )}
        </div>
        {profile.careers.length > 0 && (
          <p className="mt-0.5 text-[11px] font-bold uppercase text-[#155DFC] sm:text-[12px]">
            {profile.careers.join(', ')}
          </p>
        )}

        {profile.bio && (
          <p className="mt-3 text-[13px] leading-snug text-gray-500 sm:text-[14px]">
            {profile.bio}
          </p>
        )}

        {followError && (
          <p className="mt-3 text-[12px] font-bold text-[#E7000B]">
            {followError}
          </p>
        )}

        {profile.isOwnProfile && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[12px] font-black text-[#1F2937]">
                {t('profile.whatsappNotifications')}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
                {whatsAppNotificationsEnabled
                  ? t('profile.whatsappNotificationsOn')
                  : t('profile.whatsappNotificationsOff')}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={whatsAppNotificationsEnabled}
              onClick={handleWhatsAppNotificationsToggle}
              disabled={isWhatsAppNotificationsLoading}
              className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
                whatsAppNotificationsEnabled ? 'bg-[#1d8c57]' : 'bg-gray-300'
              } disabled:cursor-wait disabled:opacity-70`}
            >
              <span
                className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  whatsAppNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {whatsAppError && (
          <p className="mt-2 text-[11px] font-bold text-[#E7000B]">
            {whatsAppError}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-6 px-5 sm:gap-10">
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{formatCompactNumber(stats.posts)}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">{t('profile.publications')}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{formatCompactNumber(followersCount)}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">{t('profile.followers')}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{formatCompactNumber(stats.following)}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">{t('profile.followingCount')}</span>
        </div>
      </div>
    </article>
    {selectedImageUrl && (
      <ImageLightbox
        imageUrl={selectedImageUrl}
        alt={`Imagen de perfil de ${profile.fullName}`}
        closeLabel={t('post.closeImage')}
        onClose={() => setSelectedImageUrl(null)}
      />
    )}
    </>
  );
};
