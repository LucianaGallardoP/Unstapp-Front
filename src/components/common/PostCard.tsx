import {
  BriefcaseBusiness,
  CheckCircle2,
  Coffee,
  FileText,
  GraduationCap,
  Heart,
  MessageCircle,
  MoreVertical,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostInteractions } from '../../features/feed/hooks/usePostInteractions';
import type { Post, PostCategory } from '../../features/feed/types/post.types';
import { formatRelativeTime } from '../../features/feed/utils/formatRelativeTime';
import { CommentItem } from './CommentItem';

interface PostCardProps {
  post: Post;
  hideAuthor?: boolean;
  canDelete?: boolean;
  isRemoving?: boolean;
  onDelete?: (postId: number | string) => Promise<void>;
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

const getCurrentUserId = () => localStorage.getItem('unstapp_user_id');

export const PostCard = ({
  post,
  hideAuthor = false,
  canDelete,
  isRemoving = false,
  onDelete,
}: PostCardProps) => {
  const navigate = useNavigate();
  // Estados de interaccion local.
  const {
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
  } = usePostInteractions({
    postId: post.id,
    initialLikes: post.likes,
    initialLiked: Boolean(post.likedByCurrentUser),
    initialComments: post.comments,
    initialCommentsCount: post.commentsCount,
  });
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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
  const canSendComment = isAuthenticated && newComment.trim().length > 0 && !commentLoading;
  const canOpenAuthorProfile = Boolean(post.author.id);
  const currentUserId = getCurrentUserId();
  const canShowDeleteAction =
    Boolean(onDelete) &&
    (canDelete ?? Boolean(currentUserId && post.author.id && String(currentUserId) === String(post.author.id)));

  const handleOpenAuthorProfile = () => {
    if (!post.author.id) return;

    navigate(`/perfil/${post.author.id}`);
  };

  const handleDeletePost = async () => {
    if (!onDelete) return;

    setIsDeleteLoading(true);
    setDeleteError(null);

    try {
      await onDelete(post.id);
      setIsConfirmOpen(false);
      setIsActionsOpen(false);
    } catch {
      setDeleteError('No se pudo eliminar la publicacion.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <article
      className={`w-full rounded-[22px] border border-gray-100 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-200 sm:px-5 sm:py-5 md:h-full ${
        isRemoving ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      {/* Encabezado del autor */}
      <header className="flex items-start gap-3">
        {!hideAuthor && (
          <button
            type="button"
            onClick={handleOpenAuthorProfile}
            disabled={!canOpenAuthorProfile}
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-11 sm:w-11 ${authorIconStyles[post.category]}`}
            aria-label={`Ver perfil de ${post.author.name}`}
          >
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={`Foto de ${post.author.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <AuthorIcon size={18} strokeWidth={2.3} />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {!hideAuthor && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleOpenAuthorProfile}
                    disabled={!canOpenAuthorProfile}
                    className="min-w-0 truncate text-left text-[13px] font-bold leading-4 text-[#1F2937] transition-colors hover:text-[#155DFC] disabled:cursor-default disabled:hover:text-[#1F2937] sm:text-[14px]"
                  >
                    {post.author.name}
                  </button>
                  {post.author.verified && (
                    <CheckCircle2
                      size={13}
                      className="shrink-0 text-[#155DFC]"
                      aria-label="Usuario verificado"
                    />
                  )}
                </div>
              )}
              <time
                dateTime={post.publishedAt}
                title={formattedDate}
                className={`${hideAuthor ? '' : 'mt-0.5 '}block text-[9px] font-bold uppercase leading-3 text-gray-400 sm:text-[10px]`}
              >
                {relativeTime}
              </time>
            </div>

            <div className="relative flex shrink-0 items-start gap-1">
              <span
                className={`rounded-full px-2 py-1 text-[8px] font-black tracking-wide sm:text-[9px] ${categoryStyles[post.category]}`}
              >
                {categoryLabels[post.category]}
              </span>

              {canShowDeleteAction && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsActionsOpen((currentValue) => !currentValue)}
                    className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
                    aria-label="Abrir menu de publicacion"
                    aria-expanded={isActionsOpen}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isActionsOpen && (
                    <div className="absolute right-0 top-8 z-20 min-w-44 rounded-xl border border-gray-100 bg-white p-1 shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmOpen(true);
                          setIsActionsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-bold text-[#E7000B] transition-colors hover:bg-[#E7000B]/10"
                      >
                        <Trash2 size={14} />
                        Eliminar Publicación
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
        <button
          type="button"
          onClick={() => setSelectedImageUrl(post.media?.url ?? null)}
          className="mt-3 block w-full overflow-hidden rounded-2xl bg-gray-50"
          aria-label="Ver imagen completa"
        >
          <img
            src={post.media.url}
            alt={post.media.alt ?? 'Contenido multimedia de la publicacion'}
            className="max-h-72 w-full object-cover transition-transform duration-200 hover:scale-[1.01] sm:max-h-80"
          />
        </button>
      )}

      {/* Video opcional */}
      {post.media?.type === 'video' && (
        <video
          src={post.media.url}
          className="mt-3 max-h-80 w-full rounded-2xl bg-black object-contain"
          controls
          preload="metadata"
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

        {deleteError && (
          <p className="mt-2 text-[11px] font-semibold text-[#E7000B]">{deleteError}</p>
        )}

        {/* Hilo de comentarios */}
        {commentsOpen && (
          <section className="mt-3 rounded-2xl bg-gray-50 p-3">
            <div className="flex max-h-56 flex-col gap-3 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const isCommentAuthor = currentUserId && comment.author.id && String(currentUserId) === String(comment.author.id);
                const isPostAuthor = currentUserId && post.author.id && String(currentUserId) === String(post.author.id);

                return (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentDate={currentDate}
                    canDelete={Boolean(isCommentAuthor || isPostAuthor)}
                    onDelete={handleDeleteComment}
                  />
                );
              })}
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

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <section className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
            <h3 className="text-[16px] font-black text-[#1F2937]">
              Eliminar publicación
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-gray-600">
              ¿Estás seguro de eliminar esta publicación?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleteLoading}
                className="rounded-xl px-4 py-2 text-[12px] font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleteLoading}
                className="rounded-xl bg-[#E7000B] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#b80009] disabled:cursor-wait disabled:opacity-70"
              >
                {isDeleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-6"
          onClick={() => setSelectedImageUrl(null)}
        >
          <section
            className="relative max-h-full w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-colors hover:bg-white"
              aria-label="Cerrar imagen"
            >
              <X size={20} />
            </button>
            <img
              src={selectedImageUrl}
              alt={post.media?.alt ?? 'Imagen de la publicacion'}
              className="mx-auto max-h-[calc(100vh-48px)] w-auto max-w-full rounded-2xl object-contain shadow-[0_24px_60px_rgba(0,0,0,0.32)]"
            />
          </section>
        </div>
      )}
    </article>
  );
};
