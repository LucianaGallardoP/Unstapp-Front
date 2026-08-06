import { normalizeRoleKey } from './roleLabels';

type ApiRecord = Record<string, unknown>;

export type RoleLabel = 'Alumno' | 'Docente' | 'Administrativo' | 'Bar' | 'Biblioteca' | 'Fotocopiadora';

const ROLE_ID_LABELS: Record<number, RoleLabel> = {
  1: 'Alumno',
  2: 'Docente',
  3: 'Administrativo',
  4: 'Bar',
  5: 'Biblioteca',
  6: 'Fotocopiadora',
};

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : {};

const asString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : '';

const asFiniteNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(asStringList);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  const record = asRecord(value);
  const nestedValue =
    asString(record.name) ||
    asString(record.Name) ||
    asString(record.nombre) ||
    asString(record.Nombre) ||
    asString(record.label) ||
    asString(record.Label) ||
    asString(record.title) ||
    asString(record.Title) ||
    asString(record.role) ||
    asString(record.Role) ||
    asString(record.roleName) ||
    asString(record.RoleName) ||
    asString(record.rol) ||
    asString(record.Rol) ||
    asString(record.userRole) ||
    asString(record.UserRole) ||
    asString(record.tipoUsuario) ||
    asString(record.TipoUsuario) ||
    asString(record.typeName) ||
    asString(record.TypeName) ||
    asString(record.normalizedName) ||
    asString(record.NormalizedName) ||
    asString(record.description) ||
    asString(record.Description) ||
    asString(record.value);

  return nestedValue ? [nestedValue] : [];
};

const getRoleFromNumericField = (...values: unknown[]) => {
  for (const value of values) {
    const roleId = asFiniteNumber(value);

    if (roleId !== undefined && ROLE_ID_LABELS[roleId]) {
      return ROLE_ID_LABELS[roleId];
    }
  }

  return undefined;
};

const getRoleFromBooleanFlags = (record: ApiRecord) => {
  if (record.isTeacher || record.IsTeacher || record.isDocente || record.IsDocente || record.isProfessor || record.IsProfessor || record.teacher || record.Teacher || record.docente || record.Docente || record.professor || record.Professor) {
    return 'Docente';
  }

  if (record.isAdmin || record.IsAdmin || record.isAdministrator || record.IsAdministrator || record.isAdministrativo || record.IsAdministrativo || record.admin || record.Admin || record.administrator || record.Administrator) {
    return 'Administrativo';
  }

  if (record.isBar || record.IsBar || record.bar || record.Bar) {
    return 'Bar';
  }

  if (record.isLibrary || record.IsLibrary || record.isBiblioteca || record.IsBiblioteca || record.library || record.Library || record.biblioteca || record.Biblioteca) {
    return 'Biblioteca';
  }

  if (record.isCopyCenter || record.IsCopyCenter || record.isFotocopiadora || record.IsFotocopiadora || record.copyCenter || record.CopyCenter || record.fotocopiadora || record.Fotocopiadora) {
    return 'Fotocopiadora';
  }

  if (record.isStudent || record.IsStudent || record.isAlumno || record.IsAlumno || record.student || record.Student || record.alumno || record.Alumno) {
    return 'Alumno';
  }

  return undefined;
};

export const normalizeRoleLabel = (role?: string | null): RoleLabel => {
  const roleKey = normalizeRoleKey(role);

  if (roleKey === 'teacher') return 'Docente';
  if (roleKey === 'admin') return 'Administrativo';
  if (roleKey === 'bar') return 'Bar';
  if (roleKey === 'library') return 'Biblioteca';
  if (roleKey === 'copyCenter') return 'Fotocopiadora';

  return 'Alumno';
};

export const getRoleCandidatesFromRecord = (record: ApiRecord) => {
  const explicitValues = [
    record.roles,
    record.Roles,
    record.role,
    record.Role,
    record.roleName,
    record.RoleName,
    record.roleNames,
    record.RoleNames,
    record.rolesNames,
    record.RolesNames,
    record.normalizedRoleName,
    record.NormalizedRoleName,
    record.rol,
    record.Rol,
    record.rolesUsuario,
    record.RolesUsuario,
    record.userRole,
    record.UserRole,
    record.userRoles,
    record.UserRoles,
    record.userRoleName,
    record.UserRoleName,
    record.tipoUsuario,
    record.TipoUsuario,
    record.tipoUsuarioNombre,
    record.TipoUsuarioNombre,
    record.userType,
    record.UserType,
    record.userTypeName,
    record.UserTypeName,
    record.profileType,
    record.ProfileType,
    record.profileTypeName,
    record.ProfileTypeName,
    record.accountType,
    record.AccountType,
    record.accountTypeName,
    record.AccountTypeName,
    record.type,
    record.Type,
    record.typeName,
    record.TypeName,
    record.category,
    record.Category,
    record.categoryName,
    record.CategoryName,
  ].flatMap(asStringList);

  const numericRole = getRoleFromNumericField(
    record.roleId,
    record.RoleId,
    record.rolId,
    record.RolId,
    record.userRoleId,
    record.UserRoleId,
    record.userTypeId,
    record.UserTypeId,
    record.profileTypeId,
    record.ProfileTypeId,
    record.accountTypeId,
    record.AccountTypeId,
    record.tipoUsuarioId,
    record.TipoUsuarioId,
    record.typeId,
    record.TypeId,
  );
  const flagRole = getRoleFromBooleanFlags(record);

  return [
    ...explicitValues,
    ...(numericRole ? [numericRole] : []),
    ...(flagRole ? [flagRole] : []),
  ];
};

const getRolePriority = (role?: string) => {
  const roleKey = normalizeRoleKey(role);

  if (roleKey === 'admin') return 5;
  if (roleKey === 'teacher') return 4;
  if (roleKey === 'bar') return 3;
  if (roleKey === 'library') return 3;
  if (roleKey === 'copyCenter') return 3;

  return 1;
};

export const pickStrongestRoleCandidate = (...values: unknown[]) => {
  const roleValues = values.flatMap(asStringList);
  const strongestRole = roleValues.sort((a, b) => getRolePriority(b) - getRolePriority(a))[0];

  return strongestRole ? normalizeRoleLabel(strongestRole) : undefined;
};

export const inferRoleFromText = (...values: unknown[]) => {
  const text = values
    .flatMap(asStringList)
    .join(' ');
  const roleKey = normalizeRoleKey(text);

  return roleKey === 'student' ? undefined : text;
};

export const getAvatarUrlFromRecords = (...records: ApiRecord[]) => {
  for (const record of records) {
    const avatarUrl =
      asString(record.avatarUrl) ||
      asString(record.AvatarUrl) ||
      asString(record.avatar) ||
      asString(record.Avatar) ||
      asString(record.avatarFile) ||
      asString(record.AvatarFile) ||
      asString(record.avatarImage) ||
      asString(record.AvatarImage) ||
      asString(record.image) ||
      asString(record.Image) ||
      asString(record.imageUrl) ||
      asString(record.ImageUrl) ||
      asString(record.pictureUrl) ||
      asString(record.PictureUrl) ||
      asString(record.profileImageUrl) ||
      asString(record.ProfileImageUrl) ||
      asString(record.profilePictureUrl) ||
      asString(record.ProfilePictureUrl) ||
      asString(record.profilePhotoUrl) ||
      asString(record.ProfilePhotoUrl) ||
      asString(record.photoUrl) ||
      asString(record.PhotoUrl) ||
      asString(record.userAvatarUrl) ||
      asString(record.UserAvatarUrl);

    if (avatarUrl) {
      return avatarUrl;
    }
  }

  return undefined;
};
