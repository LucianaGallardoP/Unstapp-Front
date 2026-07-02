import { useCallback, useState } from 'react';
import { commentService } from '../services/commentService';
import { likeService } from '../services/likeService';
import type { PostComment } from '../types/post.types';

interface UsePostInteractionsParams {
  postId: number | string;
  initialLikes: number;
  initialLiked: boolean;
  initialComments: PostComment[];
  initialCommentsCount?: number;
  initialCommentsOpen?: boolean;
}

// Maneja likes y comentarios de una publicacion.
export const usePostInteractions = ({
  postId,
  initialLikes,
  initialLiked,
  initialComments,
  initialCommentsCount,
  initialCommentsOpen = false,
}: UsePostInteractionsParams) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(initialCommentsOpen);
  const [comments, setComments] = useState(initialComments);
  const [commentsCount, setCommentsCount] = useState(
    initialCommentsCount ?? initialComments.length
  );
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const isAuthenticated = Boolean(localStorage.getItem('unstapp_token'));

  // Sincroniza el estado cuando el feed refresca datos desde backend (evitando cascadas de renders).
  const [prevPostId, setPrevPostId] = useState(postId);
  const [prevInitialLiked, setPrevInitialLiked] = useState(initialLiked);
  const [prevInitialLikes, setPrevInitialLikes] = useState(initialLikes);

  if (postId !== prevPostId || initialLiked !== prevInitialLiked || initialLikes !== prevInitialLikes) {
    setPrevPostId(postId);
    setPrevInitialLiked(initialLiked);
    setPrevInitialLikes(initialLikes);
    setLiked(initialLiked);
    setLikesCount(initialLikes);
    setComments(initialComments);
    setCommentsCount(initialCommentsCount ?? initialComments.length);
    setCommentsOpen(initialCommentsOpen);
  }

  const handleLike = async () => {
    if (likeLoading) {
      return;
    }

    const nextLiked = !liked;

    setLikeLoading(true);
    setLikeError(null);
    setLiked(nextLiked);
    const nextLikesCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLikesCount(nextLikesCount);

    try {
      if (nextLiked) {
        await likeService.like(postId);
      } else {
        await likeService.unlike(postId);
      }
      likeService.storeLikeCount(postId, nextLikesCount);
    } catch {
      setLiked(liked);
      setLikesCount(likesCount);
      setLikeError('No se pudo procesar el like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment || commentLoading) {
      return;
    }

    setCommentLoading(true);
    setCommentError(null);

    const optimisticComment: PostComment = {
      id: Date.now(),
      author: {
        id: localStorage.getItem('unstapp_user_id') || undefined,
        name: localStorage.getItem('unstapp_user_name') ?? 'Vos',
        role: 'Alumno',
      },
      publishedAt: new Date().toISOString(),
      content: trimmedComment,
    };

    setComments((currentComments) => [...currentComments, optimisticComment]);
    setCommentsCount((count) => count + 1);
    setNewComment('');

    try {
      const createdComment = await commentService.create(postId, trimmedComment);
      
      // Ensure the created comment retains the current user's ID if the API didn't return it
      if (!createdComment.author.id) {
        createdComment.author.id = localStorage.getItem('unstapp_user_id') || undefined;
      }

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === optimisticComment.id ? createdComment : comment,
        ),
      );
    } catch {
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== optimisticComment.id),
      );
      setCommentsCount((count) => Math.max(0, count - 1));
      setNewComment(trimmedComment);
      setCommentError('No se pudo publicar el comentario');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number | string) => {
    const commentToDelete = comments.find((c) => c.id === commentId);
    if (!commentToDelete) return;

    setComments((current) => current.filter((c) => c.id !== commentId));
    setCommentsCount((count) => Math.max(0, count - 1));

    try {
      await commentService.remove(commentId);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      setComments((current) => {
        const reverted = [...current, commentToDelete];
        return reverted.sort(
          (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );
      });
      setCommentsCount((count) => count + 1);
      setCommentError('No se pudo eliminar el comentario');
    }
  };

  const toggleComments = () => {
    setCommentsOpen((isOpen) => !isOpen);
  };

  const openComments = useCallback(() => {
    setCommentsOpen(true);
  }, []);

  const closeComments = useCallback(() => {
    setCommentsOpen(false);
  }, []);

  return {
    liked,
    likesCount,
    likeLoading,
    likeError,
    isAuthenticated,
    commentsOpen,
    comments,
    commentsCount,
    newComment,
    commentLoading,
    commentError,
    setNewComment,
    handleLike,
    handleAddComment,
    handleDeleteComment,
    toggleComments,
    openComments,
    closeComments,
  };
};
