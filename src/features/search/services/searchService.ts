import { apiClient } from '../../../services/apiClient';
import type { SearchPostDTO, SearchResponseDTO, SearchUserDTO } from '../types/search.dtos';

type ApiRecord = Record<string, unknown>;

const getAuthHeaders = () => {
  const token = localStorage.getItem('unstapp_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : {};

const asArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const getArrayByKeys = <T>(record: ApiRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) return value as T[];
  }

  return [];
};

const normalizeSearchResponse = (payload: unknown): SearchResponseDTO => {
  if (Array.isArray(payload)) {
    return { users: asArray<SearchUserDTO>(payload), posts: [] };
  }

  const root = asRecord(payload);
  const data = asRecord(root.data ?? root.value ?? root.result ?? root.results ?? root);

  return {
    users: getArrayByKeys<SearchUserDTO>(data, ['users', 'usuarios', 'people', 'personas']),
    posts: getArrayByKeys<SearchPostDTO>(data, ['posts', 'publications', 'publicaciones']),
  };
};

export const searchService = {
  globalSearch: async (term: string): Promise<SearchResponseDTO> => {
    const cleanTerm = term.trim();

    if (!cleanTerm) {
      return { users: [], posts: [] };
    }

    const response = await apiClient.get<unknown>('/search', {
      params: { term: cleanTerm },
      headers: getAuthHeaders(),
    });

    return normalizeSearchResponse(response.data);
  }
};
