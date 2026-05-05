import { useEffect, useState } from 'react';
import { commentService } from '../services/commentService';
import { likeService } from '../services/likeService';
import type { PostComment } from '../types/post.types';

interface UsePostInteractionsParams {
  postId: number | string;
  initialLikes: number;
  initialLiked: boolean;
  initialComments: PostComment[];
}

// Maneja likes y comentarios de una publicacion.
export const usePostInteractions = ({
  postId,
  initialLikes,
  initialLiked,
  initialComments,
}: UsePostInteractionsParams) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(() => [
    ...initialComments,
    ...commentService.getByPostId(postId),
  ]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const isAuthenticated = Boolean(localStorage.getItem('unstapp_token'));

  // Sincroniza el estado cuando el feed refresca datos desde backend.
  useEffect(() => {
    setLiked(initialLiked);
    setLikesCount(initialLikes);
  }, [initialLiked, initialLikes, postId]);

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
        name: localStorage.getItem('unstapp_user_name') ?? 'Vos',
        role: 'Alumno',
      },
      publishedAt: new Date().toISOString(),
      content: trimmedComment,
    };

    setComments((currentComments) => [...currentComments, optimisticComment]);
    setNewComment('');

    try {
      const createdComment = await commentService.create(postId, trimmedComment);

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === optimisticComment.id ? createdComment : comment,
        ),
      );
    } catch {
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== optimisticComment.id),
      );
      setNewComment(trimmedComment);
      setCommentError('No se pudo publicar el comentario');
    } finally {
      setCommentLoading(false);
    }
  };

  const toggleComments = () => {
    setCommentsOpen((isOpen) => !isOpen);
  };

  return {
    liked,
    likesCount,
    likeLoading,
    likeError,
    isAuthenticated,
    commentsOpen,
    comments,
    newComment,
    commentLoading,
    commentError,
    setNewComment,
    handleLike,
    handleAddComment,
    toggleComments,
  };
};
