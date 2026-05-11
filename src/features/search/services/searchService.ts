import { apiClient } from '../../../services/apiClient';
import type { SearchResponseDTO } from '../types/search.dtos';

const getAuthHeaders = () => {
  const token = localStorage.getItem('unstapp_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const searchService = {
  globalSearch: async (term: string): Promise<SearchResponseDTO> => {
    const response = await apiClient.get<SearchResponseDTO>(`/search`, {
      params: { term },
      headers: getAuthHeaders(),
    });
    return response.data;
  }
};