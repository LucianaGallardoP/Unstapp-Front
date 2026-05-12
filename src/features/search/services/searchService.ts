import { apiClient } from '../../../services/apiClient';
import type { SearchPostDTO, SearchResponseDTO, SearchUserDTO } from '../types/search.dtos';

const getAuthHeaders = () => {
  const token = localStorage.getItem('unstapp_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const searchService = {
  globalSearch: async (term: string): Promise<SearchResponseDTO> => {
    const normalizeTerm = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const normalizedTerm = normalizeTerm(term);
    const queries = normalizedTerm === term ? [term] : [term, normalizedTerm];
    const responses = await Promise.all(
      queries.map((query) =>
        apiClient.get<SearchResponseDTO>(`/search`, {
          params: { term: query },
          headers: getAuthHeaders(),
        }),
      ),
    );

    const normalizeResponse = (data: SearchResponseDTO | SearchUserDTO[]): SearchResponseDTO =>
      Array.isArray(data)
        ? { users: data, posts: [] }
        : {
            users: Array.isArray(data?.users) ? data.users : [],
            posts: Array.isArray(data?.posts) ? data.posts : [],
          };

    return responses.reduce<SearchResponseDTO>(
      (mergedResults, response) => {
        const currentResults = normalizeResponse(response.data);

        return {
          users: [
            ...mergedResults.users,
            ...currentResults.users.filter(
              (user) =>
                !mergedResults.users.some(
                  (existingUser) =>
                    (existingUser.id ?? existingUser.userId) === (user.id ?? user.userId),
                ),
            ),
          ],
          posts: [
            ...mergedResults.posts,
            ...currentResults.posts.filter(
              (post: SearchPostDTO) =>
                !mergedResults.posts.some(
                  (existingPost) =>
                    (existingPost.id ?? existingPost.postId) === (post.id ?? post.postId),
                ),
            ),
          ],
        };
      },
      { users: [], posts: [] },
    );
  }
};
