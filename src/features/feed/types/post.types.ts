export type PostAuthorRole = 'Alumno' | 'Docente' | 'Administrativo' | 'Bar';
export type PostCategory = 'alumno' | 'carrera' | 'administrativo' | 'bar';
export type PostAudience = 'general' | 'carrera' | 'administrativo';

// Datos basicos del autor.
export interface PostAuthor {
  name: string;
  role: PostAuthorRole;
  verified?: boolean;
}

// Multimedia opcional del post.
export interface PostMedia {
  type: 'image' | 'video' | 'file';
  url: string;
  alt?: string;
  fileName?: string;
}

// Datos de cada comentario.
export interface PostComment {
  id: number | string;
  author: PostAuthor;
  publishedAt: string;
  content: string;
}

// Estructura completa de una publicacion.
export interface Post {
  id: number | string;
  author: PostAuthor;
  category: PostCategory;
  audience: PostAudience;
  publishedAt: string;
  content: string;
  media?: PostMedia;
  likes: number;
  likedByCurrentUser?: boolean;
  commentsCount?: number;
  comments: PostComment[];
}
