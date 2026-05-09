import type { SearchUserDTO } from '../types/search.dtos';

// Mockdata para testear que ande todo hasta que tengamos el back de search
const MOCK_USERS: SearchUserDTO[] = [
  { id: 1, fullName: 'Juan Pérez', role: 'Alumno' },
  { id: 2, fullName: 'Ing. María García', role: 'Docente' },
  { id: 3, fullName: 'Cafetería Central', role: 'Bar' },
];

export const searchService = {
  searchUsers: async (query: string): Promise<SearchUserDTO[]> => {
    // Simula latencia de red de 500ms (lo tengo que cambiar a 400ms)
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = MOCK_USERS.filter(u => 
          u.fullName.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      }, 500);
    });
  }
};