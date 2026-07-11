import { useEffect, useMemo, useState } from 'react';
import type { ProfileResponseDTO, ProfileStatsDTO } from '../types/profile.dtos';
import { RoleAvatar } from '../../../components/common/RoleAvatar';

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

const formatRoleLabel = (role: string) => {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes('admin')) return 'Administrador';
  if (normalizedRole.includes('docente')) return 'Docente';
  if (normalizedRole.includes('bar')) return 'Bar';

  return 'Alumno';
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
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [followersCount, setFollowersCount] = useState(stats.followers);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const roleLabel = useMemo(() => {
    const roles = profile.roles?.length ? profile.roles : profile.isOwnProfile ? getStoredRoles() : [];
    const primaryRole = roles[0];

    return primaryRole ? formatRoleLabel(primaryRole) : null;
  }, [profile.isOwnProfile, profile.roles]);

  useEffect(() => {
    setIsFollowing(profile.isFollowing);
    setFollowersCount(stats.followers);
  }, [profile.isFollowing, stats.followers]);

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
      setFollowError('No se pudo actualizar el seguimiento');
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <article className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[16px] border border-gray-200 bg-white pb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-[560px] md:max-w-[600px]">
      <div className="h-32 w-full bg-gray-200 sm:h-40">
        {profile.coverUrl && (
          <img
            src={profile.coverUrl}
            alt="Portada del perfil"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="px-5 flex items-end justify-between -mt-10 mb-3 sm:-mt-12 sm:mb-4">
        <div className="relative shrink-0 rounded-[18px] border-[3px] border-white shadow-sm">
          <RoleAvatar
            avatarUrl={profile.avatarUrl}
            name={profile.fullName}
            role={roleLabel}
            className="h-[84px] w-[84px] rounded-[15px] sm:h-[100px] sm:w-[100px]"
            iconClassName="h-11 w-11 sm:h-12 sm:w-12"
          />
        </div>

        {profile.isOwnProfile ? (
          <div className="mb-1 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onEditProfile}
              className="h-8 rounded-lg bg-[#F0F2F5] px-4 text-[12px] font-bold text-gray-900 transition-colors hover:bg-[#E4E6E9] sm:h-9 sm:px-5 sm:text-[13px]"
            >
              Editar Perfil
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="h-8 rounded-lg bg-[#E7000B] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#b80009] sm:h-9 sm:px-5 sm:text-[13px]"
            >
              Cerrar Sesión
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
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        )}
      </div>

      <div className="px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[22px] font-black tracking-tight text-black sm:text-[24px]">
            {profile.fullName}
          </h2>
          {roleLabel && (
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[10px] font-black uppercase text-[#1E4E9D]">
              {roleLabel}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] font-bold uppercase text-[#155DFC] sm:text-[12px]">
          {profile.careers.join(', ')}
        </p>

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
      </div>

      <div className="mt-6 flex justify-center gap-6 px-5 sm:gap-10">
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{formatCompactNumber(stats.posts)}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">PUBLICACIONES</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{formatCompactNumber(followersCount)}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">SEGUIDORES</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{formatCompactNumber(stats.following)}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">SIGUIENDO</span>
        </div>
      </div>
    </article>
  );
};
