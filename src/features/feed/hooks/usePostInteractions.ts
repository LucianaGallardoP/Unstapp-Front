import { useState } from 'react';
import type { PostComment } from '../types/post.types';

interface UsePostInteractionsParams {
  initialLikes: number;
  initialComments: PostComment[];
}

// Maneja likes y comentarios de una publicacion.
export const usePostInteractions = ({
  initialLikes,
  initialComments,
}: UsePostInteractionsParams) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setLiked((currentLiked) => !currentLiked);
    setLikesCount((currentCount) => currentCount + (liked ? -1 : 1));
  };

  const handleAddComment = () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      return;
    }

    setComments((currentComments) => [
      ...currentComments,
      {
        id: Date.now(),
        author: {
          name: 'Vos',
          role: 'Alumno',
        },
        publishedAt: new Date().toISOString(),
        content: trimmedComment,
      },
    ]);
    setNewComment('');
  };

  const toggleComments = () => {
    setCommentsOpen((isOpen) => !isOpen);
  };

  return {
    liked,
    likesCount,
    commentsOpen,
    comments,
    newComment,
    setNewComment,
    handleLike,
    handleAddComment,
    toggleComments,
  };
};
