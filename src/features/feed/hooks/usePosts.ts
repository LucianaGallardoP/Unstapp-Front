import { useEffect, useState } from 'react';
import { postService } from '../services/postService';
import type { Post } from '../types/post.types';

interface UsePostsParams {
  fallbackPosts: Post[];
}

export const usePosts = ({ fallbackPosts }: UsePostsParams) => {
  const [posts, setPosts] = useState<Post[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiPosts = await postService.getAll();
        setPosts(apiPosts.length > 0 ? [...apiPosts, ...fallbackPosts] : fallbackPosts);
      } catch {
        setError('No se pudieron cargar las publicaciones.');
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [fallbackPosts]);

  const createPost = async (content: string) => {
    const createdPost = await postService.create(content);
    setPosts((currentPosts) => [createdPost, ...currentPosts]);
  };

  return {
    posts,
    loading,
    error,
    createPost,
  };
};
