import {
  BriefcaseBusiness,
  Coffee,
  GraduationCap,
  UserRound,
} from 'lucide-react';
import type { PostAuthorRole } from '../../features/feed/types/post.types';
import { normalizeRoleKey } from '../../utils/roleLabels';

type RoleAvatarProps = {
  avatarUrl?: string | null;
  name: string;
  role?: PostAuthorRole | string | null;
  className?: string;
  iconClassName?: string;
};

const normalizeRole = (role?: PostAuthorRole | string | null): PostAuthorRole => {
  const roleKey = normalizeRoleKey(role);

  if (roleKey === 'admin') return 'Administrativo';
  if (roleKey === 'teacher') return 'Docente';
  if (roleKey === 'bar') return 'Bar';

  return 'Alumno';
};

const roleStyles: Record<PostAuthorRole, string> = {
  Alumno: 'bg-[#EFF6FF] text-[#1E4E9D]',
  Docente: 'bg-[#1d8c57]/10 text-[#1d8c57]',
  Administrativo: 'bg-[#E7000B]/10 text-[#E7000B]',
  Bar: 'bg-[#155DFC]/10 text-[#155DFC]',
};

const roleIcons = {
  Alumno: UserRound,
  Docente: GraduationCap,
  Administrativo: BriefcaseBusiness,
  Bar: Coffee,
};

export const RoleAvatar = ({
  avatarUrl,
  name,
  role,
  className = 'h-10 w-10',
  iconClassName = 'h-5 w-5',
}: RoleAvatarProps) => {
  const normalizedRole = normalizeRole(role);
  const Icon = roleIcons[normalizedRole];

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${avatarUrl ? 'bg-gray-100' : roleStyles[normalizedRole]} ${className}`}
      aria-label={`Avatar de ${name}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Foto de ${name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon className={iconClassName} strokeWidth={2.2} />
      )}
    </span>
  );
};
