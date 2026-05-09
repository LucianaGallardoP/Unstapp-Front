import {
  BriefcaseBusiness,
  CheckCircle2,
  Coffee,
  FileText,
  GraduationCap,
  Heart,
  MessageCircle,
  Send,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePostInteractions } from '../hooks/usePostInteractions';
import type { Post, PostCategory } from '../types/post.types';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { CommentItem } from './CommentItem';

interface PostCardProps {
  post: Post;
}

const categoryStyles: Record<PostCategory, string> = {
  administrativo: 'bg-[#E7000B] text-white',
  carrera: 'bg-[#9810FA] text-white',
  bar: 'bg-[#155DFC] text-white',
  alumno: 'bg-[#FF751F] text-white',
};

const authorIconStyles: Record<PostCategory, string> = {
  administrativo: 'bg-[#E7000B]/10 text-[#E7000B]',
  carrera: 'bg-[#9810FA]/10 text-[#9810FA]',
  bar: 'bg-[#155DFC]/10 text-[#155DFC]',
  alumno: 'bg-[#FF751F]/10 text-[#FF751F]',
};

const categoryLabels: Record<PostCategory, string> = {
  administrativo: 'ADMINISTRATIVO',
  carrera: 'CARRERA',
  bar: 'BAR',
  alumno: 'ALUMNO',
};

const categoryIcons = {
  administrativo: BriefcaseBusiness,
  carrera: GraduationCap,
  bar: Coffee,
  alumno: UserRound,
};

export const PostCard = ({ post }: PostCardProps) => {
  // Estados de interaccion local.
  const {
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
  } = usePostInteractions({
    postId: post.id,
    initialLikes: post.likes,
    initialLiked: Boolean(post.likedByCurrentUser),
    initialComments: post.comments,
  });
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Refresca los horarios relativos.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Fecha completa para mostrar al pasar el mouse.
  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(post.publishedAt));
  const relativeTime = formatRelativeTime(post.publishedAt, currentDate);
  const AuthorIcon = categoryIcons[post.category];
  const commentsCount = comments.length || post.commentsCount || 0;
  const canSendComment = isAuthenticated && newComment.trim().length > 0 && !commentLoading;

  return (
    <article className="w-full rounded-[22px] border border-gray-100 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:px-5 sm:py-5 md:h-full">
      {/* Encabezado del autor */}
      <header className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${authorIconStyles[post.category]}`}
          aria-label={`Icono de ${post.author.role}`}
        >
          <AuthorIcon size={18} strokeWidth={2.3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="truncate text-[13px] font-bold leading-4 text-[#1F2937] sm:text-[14px]">
                  {post.author.name}
                </h2>
                {post.author.verified && (
                  <CheckCircle2
                    size={13}
                    className="shrink-0 text-[#155DFC]"
                    aria-label="Usuario verificado"
                  />
                )}
              </div>
              <time
                dateTime={post.publishedAt}
                title={formattedDate}
                className="mt-0.5 block text-[9px] font-bold uppercase leading-3 text-gray-400 sm:text-[10px]"
              >
                {relativeTime}
              </time>
            </div>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black tracking-wide sm:text-[9px] ${categoryStyles[post.category]}`}
            >
              {categoryLabels[post.category]}
            </span>
          </div>
        </div>
      </header>

      {/* Texto principal del post */}
      <div className="mt-4 w-full break-words">
        <p className="whitespace-pre-line text-[12px] leading-5 text-[#374151] sm:text-[13px] sm:leading-6">
          {post.content}
        </p>
      </div>

      {/* Imagen opcional */}
      {post.media?.type === 'image' && (
        <img
          src={post.media.url}
          alt={post.media.alt ?? 'Contenido multimedia de la publicacion'}
          className="mt-3 max-h-72 w-full rounded-2xl object-cover sm:max-h-80"
        />
      )}

      {/* Archivo opcional */}
      {post.media?.type === 'file' && (
        <a
          href={post.media.url}
          className="mt-3 flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 text-[12px] font-semibold text-gray-600 sm:text-[13px]"
        >
          <FileText size={16} className="shrink-0 text-[#155DFC]" />
          <span className="truncate">{post.media.fileName ?? 'Archivo adjunto'}</span>
        </a>
      )}

      <footer className="mt-4">
        {/* Botones de interaccion */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex h-7 items-center gap-1.5 text-[11px] transition-colors sm:text-[12px] ${
              liked ? 'text-[#E7000B]' : 'text-gray-400 hover:text-[#E7000B]'
            } disabled:cursor-wait disabled:opacity-70`}
            aria-pressed={liked}
            aria-busy={likeLoading}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={toggleComments}
            className="flex h-7 items-center gap-1.5 text-[11px] text-gray-400 transition-colors hover:text-[#155DFC] sm:text-[12px]"
            aria-expanded={commentsOpen}
          >
            <MessageCircle size={16} />
            <span>{commentsCount}</span>
          </button>
        </div>

        {likeError && (
          <p className="mt-2 text-[11px] font-semibold text-[#E7000B]">{likeError}</p>
        )}

        {/* Hilo de comentarios */}
        {commentsOpen && (
          <section className="mt-3 rounded-2xl bg-gray-50 p-3">
            <div className="flex max-h-56 flex-col gap-3 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentDate={currentDate}
                />
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && canSendComment) {
                    event.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder={
                  isAuthenticated ? 'Escribir comentario' : 'Inicia sesion para comentar'
                }
                disabled={!isAuthenticated || commentLoading}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-800 outline-none focus:border-[#1E4E9D] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!canSendComment}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E4E9D] text-white transition-colors hover:bg-[#155DFC] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                aria-label="Enviar comentario"
              >
                <Send size={15} />
              </button>
            </div>

            {commentError && (
              <p className="mt-2 text-[11px] font-semibold text-[#E7000B]">{commentError}</p>
            )}
          </section>
        )}
      </footer>
    </article>
  );
};
