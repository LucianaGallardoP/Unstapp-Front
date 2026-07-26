type TranslateFn = (key: string) => string;

export type NormalizedRoleKey = 'admin' | 'teacher' | 'bar' | 'student';

export const normalizeRoleKey = (role?: string | null): NormalizedRoleKey => {
  const normalizedRole = String(role ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (
    normalizedRole.includes('admin') ||
    normalizedRole.includes('administrativo') ||
    normalizedRole.includes('administracion') ||
    normalizedRole.includes('institucional')
  ) {
    return 'admin';
  }

  if (
    normalizedRole.includes('docente') ||
    normalizedRole.includes('profesor') ||
    normalizedRole.includes('professor') ||
    normalizedRole.includes('teacher') ||
    normalizedRole.includes('educador') ||
    normalizedRole.includes('instructor')
  ) {
    return 'teacher';
  }

  if (normalizedRole.includes('bar')) {
    return 'bar';
  }

  return 'student';
};

export const getRoleTranslationKey = (role?: string | null) => {
  const roleKey = normalizeRoleKey(role);

  if (roleKey === 'admin') return 'profile.role.admin';
  if (roleKey === 'teacher') return 'profile.role.teacher';
  if (roleKey === 'bar') return 'profile.role.bar';

  return 'profile.role.student';
};

export const translateRole = (role: string | null | undefined, t: TranslateFn) =>
  t(getRoleTranslationKey(role));

export const shouldShowVerifiedForRole = (role?: string | null) =>
  normalizeRoleKey(role) !== 'student';

export const getRoleBadgeClass = (role?: string | null) => {
  const roleKey = normalizeRoleKey(role);

  if (roleKey === 'admin') return 'bg-[#E7000B] text-white';
  if (roleKey === 'teacher') return 'bg-[#1d8c57] text-white';
  if (roleKey === 'bar') return 'bg-[#155DFC] text-white';

  return 'bg-[#FF751F] text-white';
};
