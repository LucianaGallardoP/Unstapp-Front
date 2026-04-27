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
  administrativo: 'bg-red-50 text-red-500',
  carrera: 'bg-violet-50 text-violet-500',
  bar: 'bg-blue-50 text-blue-500',
  alumno: 'bg-orange-50 text-orange-500',
};

const authorIconStyles: Record<PostCategory, string> = {
  administrativo: 'bg-red-50 text-red-500',
  carrera: 'bg-violet-50 text-violet-500',
  bar: 'bg-blue-50 text-blue-500',
  alumno: 'bg-orange-50 text-orange-500',
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
    commentsOpen,
    comments,
    newComment,
    setNewComment,
    handleLike,
    handleAddComment,
    toggleComments,
  } = usePostInteractions({
    initialLikes: post.likes,
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
                    className="shrink-0 text-[#1E7BFF]"
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
      <p className="mt-4 whitespace-pre-line text-[12px] leading-5 text-[#374151] sm:text-[13px] sm:leading-6">
        {post.content}
      </p>

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
          <FileText size={16} className="shrink-0 text-[#4967FF]" />
          <span className="truncate">{post.media.fileName ?? 'Archivo adjunto'}</span>
        </a>
      )}

      <footer className="mt-4">
        {/* Botones de interaccion */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex h-7 items-center gap-1.5 text-[11px] transition-colors sm:text-[12px] ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            aria-pressed={liked}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={toggleComments}
            className="flex h-7 items-center gap-1.5 text-[11px] text-gray-400 transition-colors hover:text-[#4967FF] sm:text-[12px]"
            aria-expanded={commentsOpen}
          >
            <MessageCircle size={16} />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* Hilo de comentarios */}
        {commentsOpen && (
          <section className="mt-3 rounded-2xl bg-gray-50 p-3">
            <div className="flex flex-col gap-3">
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
                  if (event.key === 'Enter') {
                    handleAddComment();
                  }
                }}
                placeholder="Escribir comentario"
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-800 outline-none focus:border-[#4967FF]"
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#243EA6] text-white"
                aria-label="Enviar comentario"
              >
                <Send size={15} />
              </button>
            </div>
          </section>
        )}
      </footer>
    </article>
  );
};
