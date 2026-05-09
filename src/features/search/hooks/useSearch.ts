import { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';
import type { SearchUserDTO } from '../types/search.dtos';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // Rebote de 400ms
    const handler = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchService.searchUsers(query);
      setResults(data);
      setIsLoading(false);
      setHasSearched(true);
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  return { query, setQuery, results, isLoading, hasSearched };
};