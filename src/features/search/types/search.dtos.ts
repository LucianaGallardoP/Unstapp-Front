export interface SearchUserDTO {
  id: string | number;
  fullName: string;
  avatarUrl?: string;
  role: 'Alumno' | 'Docente' | 'Administrativo' | 'Bar';
}