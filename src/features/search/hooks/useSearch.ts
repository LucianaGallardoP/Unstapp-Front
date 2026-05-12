import { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';
import type { SearchResponseDTO } from '../types/search.dtos';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponseDTO>({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      const clearId = setTimeout(() => {
        setResults({ users: [], posts: [] });
        setHasSearched(false);
      }, 0);
      return () => clearTimeout(clearId);
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const normalizedQuery = query
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        
        const data = await searchService.globalSearch(normalizedQuery);
        if (Array.isArray(data)) {
          setResults({ users: data, posts: [] });
        } else {
          setResults({
            users: Array.isArray(data?.users) ? data.users : [],
            posts: Array.isArray(data?.posts) ? data.posts : []
          });
        }
        setHasSearched(true);
      } catch (error) {
        console.error("Error en la búsqueda real:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  return { query, setQuery, results, isLoading, hasSearched };
};