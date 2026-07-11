import {
  CheckCircle2,
  FileText,
  Heart,
  MessageCircle,
  MoreVertical,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostInteractions } from '../../features/feed/hooks/usePostInteractions';
import type { Post, PostCategory } from '../../features/feed/types/post.types';
import { formatRelativeTime } from '../../features/feed/utils/formatRelativeTime';
import { useLanguage } from '../../store/languageContext';
import { CommentItem } from './CommentItem';
import { RoleAvatar } from './RoleAvatar';

interface PostCardProps {
  post: Post;
  hideAuthor?: boolean;
  canDelete?: boolean;
  isRemoving?: boolean;
  onDelete?: (postId: number | string) => Promise<void>;
  domId?: string;
  highlighted?: boolean;
  initialCommentsOpen?: boolean;
  focusedCommentId?: number | string | null;
}

const categoryStyles: Record<PostCategory, string> = {
  administrativo: 'bg-[#E7000B] text-white',
  carrera: 'bg-[#9810FA] text-white',
  bar: 'bg-[#155DFC] text-white',
  alumno: 'bg-[#FF751F] text-white',
};

const categoryLabels: Record<PostCategory, string> = {
  administrativo: 'ADMINISTRATIVO',
  carrera: 'CARRERA',
  bar: 'BAR',
  alumno: 'ALUMNO',
};

const getCurrentUserId = () => localStorage.getItem('unstapp_user_id');

const getIsCurrentUserAdmin = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return Array.isArray(roles) && roles.some((role) => String(role).toLowerCase().includes('admin'));
  } catch {
    return false;
  }
};

export const PostCard = ({
  post,
  hideAuthor = false,
  canDelete,
  isRemoving = false,
  onDelete,
  domId,
  highlighted = false,
  initialCommentsOpen = false,
  focusedCommentId = null,
}: PostCardProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
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
    openComments,
    closeComments,
  } = usePostInteractions({
    postId: post.id,
    initialLikes: post.likes,
    initialLiked: Boolean(post.likedByCurrentUser),
    initialComments: post.comments,
    initialCommentsCount: post.commentsCount,
    initialCommentsOpen,
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

  useEffect(() => {
    if (!selectedImageUrl) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedImageUrl]);

  useEffect(() => {
    if (initialCommentsOpen) {
      openComments();
    }
  }, [initialCommentsOpen, openComments]);

  useEffect(() => {
    if (!commentsOpen || !focusedCommentId) return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById('comment-' + String(post.id) + '-' + String(focusedCommentId))?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 160);

    return () => window.clearTimeout(timeoutId);
  }, [commentsOpen, focusedCommentId, post.id]);

  // Fecha completa para mostrar al pasar el mouse.
  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(post.publishedAt));
  const relativeTime = formatRelativeTime(post.publishedAt, currentDate, language);
  const canSendComment = isAuthenticated && newComment.trim().length > 0 && !commentLoading;
  const canOpenAuthorProfile = Boolean(post.author.id);
  const currentUserId = getCurrentUserId();
  const isCurrentUserAdmin = getIsCurrentUserAdmin();
  const canShowDeleteAction =
    Boolean(onDelete) &&
    (isCurrentUserAdmin || (canDelete ?? Boolean(currentUserId && post.author.id && String(currentUserId) === String(post.author.id))));

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
      setDeleteError(t('post.deleteError'));
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <>
    <article
      id={domId}
      className={`w-full rounded-[22px] border ${highlighted ? 'border-[#155DFC] ring-2 ring-[#155DFC]/20' : 'border-gray-100'} bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-200 sm:px-5 sm:py-5 md:h-full ${
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
            className="rounded-full disabled:cursor-default"
            aria-label={`Ver perfil de ${post.author.name}`}
          >
            <RoleAvatar
              avatarUrl={post.author.avatarUrl}
              name={post.author.name}
              role={post.author.role}
              className="h-10 w-10 sm:h-11 sm:w-11"
              iconClassName="h-6 w-6"
            />
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
                    aria-label={t('post.deletePublication')}
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
                        {t('post.deletePost')}
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
          aria-label={t('post.viewImage')}
        >
          <img
            src={post.media.url}
            alt={post.media.alt ?? t('post.imageAlt')}
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
          <span className="truncate">{post.media.fileName ?? t('post.fileAttachment')}</span>
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

      </footer>
    </article>

      {commentsOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end bg-black/35 backdrop-blur-[2px]"
          onClick={closeComments}
        >
          <section
            className="max-h-[82vh] w-full rounded-t-[28px] bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_45px_rgba(15,23,42,0.28)] sm:mx-auto sm:max-w-[560px] sm:rounded-[28px] sm:mb-5 md:max-w-2xl"
            aria-label="Comentarios de la publicación"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200" />
            <header className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="min-w-0">
                <h3 className="text-[15px] font-black uppercase text-[#1F2937] sm:text-[16px]">
                  {t('post.comments')}
                </h3>
                <p className="mt-1 truncate text-[12px] font-semibold text-gray-400">
                  {post.author.name}: {post.content}
                </p>
              </div>
              <button
                type="button"
                onClick={closeComments}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
                aria-label={t('post.closeComments')}
              >
                <X size={18} />
              </button>
            </header>

            <div className="mt-3 flex max-h-[46vh] flex-col gap-3 overflow-y-auto pr-1">
              {comments.length > 0 ? comments.map((comment) => {
                const isCommentAuthor = currentUserId && comment.author.id && String(currentUserId) === String(comment.author.id);
                const isPostAuthor = currentUserId && post.author.id && String(currentUserId) === String(post.author.id);
                const isFocusedComment = focusedCommentId && String(comment.id) === String(focusedCommentId);

                return (
                  <div
                    id={'comment-' + String(post.id) + '-' + String(comment.id)}
                    key={comment.id}
                    className={`rounded-2xl transition-colors ${isFocusedComment ? 'bg-[#155DFC]/10 ring-2 ring-[#155DFC]/25' : ''}`}
                  >
                    <CommentItem
                      comment={comment}
                      currentDate={currentDate}
                      canDelete={Boolean(isCommentAuthor || isPostAuthor || isCurrentUserAdmin)}
                      onDelete={handleDeleteComment}
                    />
                  </div>
                );
              }) : (
                <p className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-[12px] font-semibold text-gray-400">
                  {t('post.noComments')}
                </p>
              )}
            </div>

            <div className="mt-3 rounded-2xl bg-white pt-2">
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && canSendComment) {
                      event.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder={isAuthenticated ? t('post.writeComment') : t('post.loginToComment')}
                  disabled={!isAuthenticated || commentLoading}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-800 outline-none focus:border-[#1E4E9D] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!canSendComment}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E4E9D] text-white transition-colors hover:bg-[#155DFC] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                  aria-label={t('post.sendComment')}
                >
                  <Send size={15} />
                </button>
              </div>

              {commentError && (
                <p className="mt-2 text-[11px] font-semibold text-[#E7000B]">{commentError}</p>
              )}
            </div>
          </section>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <section className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
            <h3 className="text-[16px] font-black text-[#1F2937]">
              {t('post.deleteConfirmTitle')}
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-gray-600">
              {t('post.deleteConfirmText')}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleteLoading}
                className="rounded-xl px-4 py-2 text-[12px] font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-60"
              >
                {t('post.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleteLoading}
                className="rounded-xl bg-[#E7000B] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#b80009] disabled:cursor-wait disabled:opacity-70"
              >
                {isDeleteLoading ? t('post.deleting') : t('post.delete')}
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex touch-none items-center justify-center overflow-hidden bg-black/95 px-3 py-16"
          role="dialog"
          aria-modal="true"
          aria-label={t('post.imageAlt')}
          onClick={() => setSelectedImageUrl(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImageUrl(null)}
            className="fixed left-4 top-4 z-[101] flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label={t('post.closeImage')}
          >
            <X size={24} strokeWidth={2.2} />
          </button>
          <img
            src={selectedImageUrl}
            alt={post.media?.alt ?? t('post.imageAlt')}
            className="max-h-[calc(100vh-96px)] max-w-[min(100vw-24px,980px)] select-none object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
