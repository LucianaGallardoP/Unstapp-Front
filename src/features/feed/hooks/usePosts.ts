import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import i18n from '../../../i18n';
import { postService } from '../services/postService';
import type { CreatePostOptions, Post } from '../types/post.types';

const POSTS_PAGE_SIZE = 15;

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [removingPostIds, setRemovingPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await postService.getPage({ page: 1, limit: POSTS_PAGE_SIZE });

      setPosts(response.posts);
      setPage(1);
      setHasMore(response.hasMore);
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

  const loadMorePosts = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    const nextPage = page + 1;

    setLoadingMore(true);
    setError(null);

    try {
      const response = await postService.getPage({ page: nextPage, limit: POSTS_PAGE_SIZE });

      setPosts((currentPosts) => {
        const currentPostIds = new Set(currentPosts.map((post) => String(post.id)));
        const newPosts = response.posts.filter((post) => !currentPostIds.has(String(post.id)));

        return [...currentPosts, ...newPosts];
      });
      setPage(nextPage);
      setHasMore(response.hasMore);
    } catch (requestError) {
      if (requestError instanceof AxiosError && requestError.response?.status === 401) {
        setError(i18n.t('feed.sessionExpired'));
      } else {
        setError(i18n.t('feed.loadError'));
      }
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loading, loadingMore, page]);

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

  const createPost = async (content: string, mediaFile?: File, options?: CreatePostOptions) => {
    const createdPost = await postService.create(content, mediaFile, options);
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
    loadingMore,
    hasMore,
    error,
    createPost,
    deletePost,
    refreshPosts,
    loadMorePosts,
    loadPostById,
  };
};
