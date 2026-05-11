import { apiClient } from '../../../services/apiClient';
import type { SearchResponseDTO } from '../types/search.dtos';

export const searchService = {
  globalSearch: async (term: string): Promise<SearchResponseDTO> => {
    const response = await apiClient.get<SearchResponseDTO>(`/search`, {
      params: { term }
    });
    return response.data;
  }
};