import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { postService } from '../services/postService';
import type { Post } from '../types/post.types';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiPosts = await postService.getAll();
      setPosts(apiPosts);
    } catch (requestError) {
      if (requestError instanceof AxiosError && requestError.response?.status === 401) {
        setError('Tu sesion vencio. Volve a iniciar sesion para ver las publicaciones.');
      } else {
        setError('No se pudieron cargar las publicaciones.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const createPost = async (content: string, mediaFile?: File) => {
    const createdPost = await postService.create(content, mediaFile);
    setPosts((currentPosts) => [createdPost, ...currentPosts]);
  };

  return {
    posts,
    loading,
    error,
    createPost,
    refreshPosts,
  };
};
