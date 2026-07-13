import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import i18n from '../../../i18n';
import { postService } from '../services/postService';
import type { Post } from '../types/post.types';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [removingPostIds, setRemovingPostIds] = useState<Set<string>>(new Set());
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
        setError(i18n.t('feed.sessionExpired'));
      } else {
        setError(i18n.t('feed.loadError'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Diferimos la ejecucion para evitar actualizar el estado de forma sincrona en el efecto
    const timeoutId = setTimeout(() => {
      refreshPosts();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [refreshPosts]);

  const loadPostById = useCallback(async (postId: number | string) => {
    setError(null);

    try {
      const requestedPost = await postService.getById(postId);

      setPosts((currentPosts) => {
        const exists = currentPosts.some((post) => String(post.id) === String(requestedPost.id));

        return exists
          ? currentPosts.map((post) => String(post.id) === String(requestedPost.id) ? requestedPost : post)
          : [requestedPost, ...currentPosts];
      });
    } catch {
      setError(i18n.t('feed.loadPostError'));
    }
 
  }, []);

  const createPost = async (content: string, mediaFile?: File) => {
    const createdPost = await postService.create(content, mediaFile);
    setPosts((currentPosts) => [createdPost, ...currentPosts]);
  };

  const deletePost = async (postId: number | string) => {
    await postService.remove(postId);

    // Anima la salida antes de retirar la card de la lista.
    setRemovingPostIds((currentIds) => new Set(currentIds).add(String(postId)));
    window.setTimeout(() => {
      setPosts((currentPosts) => currentPosts.filter((post) => String(post.id) !== String(postId)));
      setRemovingPostIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(String(postId));
        return nextIds;
      });
    }, 220);
  };

  return {
    posts,
    removingPostIds,
    loading,
    error,
    createPost,
    deletePost,
    refreshPosts,
    loadPostById,
  };
};
