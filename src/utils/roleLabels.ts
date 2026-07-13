type TranslateFn = (key: string) => string;

export const getRoleTranslationKey = (role?: string | null) => {
  const normalizedRole = String(role ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalizedRole.includes('admin') || normalizedRole.includes('administrativo')) {
    return 'profile.role.admin';
  }

  if (
    normalizedRole.includes('docente') ||
    normalizedRole.includes('profesor') ||
    normalizedRole.includes('teacher')
  ) {
    return 'profile.role.teacher';
  }

  if (normalizedRole.includes('bar')) {
    return 'profile.role.bar';
  }

  return 'profile.role.student';
};

export const translateRole = (role: string | null | undefined, t: TranslateFn) =>
  t(getRoleTranslationKey(role));
