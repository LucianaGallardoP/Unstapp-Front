import type { ProfileResponseDTO, ProfilePostDTO } from '../types/profile.dtos';

// 1. Mock de los detalles del Perfil (Basado en la imagen de tu diseño)
export const MOCK_PROFILE_DETAILS: ProfileResponseDTO = {
  userId: 1,
  fullName: "María Gonzales",
  careers: ["ESTUDIANTE DE INGENIERÍA DE SOFTWARE"],
  bio: "Apasionado por la tecnología y el desarrollo de software. Siempre buscando aprender algo nuevo y compartir conocimiento con la comunidad UNSTA. 🚀",
  // Usamos imágenes de placeholder temporalmente para que tu UI no se rompa
  avatarUrl: "https://i.pravatar.cc/150?img=47", 
  coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop", 
  isOwnProfile: true, // Ponlo en 'false' luego si quieres probar cómo se ve el botón "Seguir"
  isFollowing: false
};

// 2. Mock de las publicaciones del Perfil
export const MOCK_PROFILE_POSTS: ProfilePostDTO[] = [
  {
    id: '1',
    timeAgo: 'AHORA',
    content: 'AVISO IMPORTANTE: El profesor de Álgebra II no asistirá el día de hoy. Por otro lado, la clase de Testeo Automatizado se dictará en el Laboratorio 1. Por favor, difundir.',
    likesCount: 12,
    commentsCount: 23,
  },
  {
    id: '2',
    timeAgo: 'HACE 5 MIN',
    content: 'Recordatorio: Las inscripciones para las mesas de exámenes finales de Ingeniería de Software cierran este viernes. ¡No olviden anotarse!',
    likesCount: 15,
    commentsCount: 2,
  },
  {
    id: '3',
    timeAgo: 'HACE 32 MIN',
    content: '¿Alguien tiene el apunte de Derecho Civil II del profesor Méndez?',
    likesCount: 0,
    commentsCount: 1,
  }
];