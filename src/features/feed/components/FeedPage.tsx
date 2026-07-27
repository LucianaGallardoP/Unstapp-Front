import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation, type TabType } from '../../../components/common/BottomNavigation';
import { AddNewBottom } from '../../../components/common/AddNewBottom';
import { usePosts } from '../hooks/usePosts';
import type { PostAudience } from '../types/post.types';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from '../../../components/common/PostCard';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../store/languageContext';
import { LoaderCircle } from 'lucide-react';

type FeedFilter = 'todo' | 'carrera' | 'administrativo';

// Categorias visibles por cada filtro.
const visibleByFilter: Record<FeedFilter, PostAudience[]> = {
  todo: ['general', 'carrera', 'administrativo'],
  carrera: ['carrera'],
  administrativo: ['administrativo'],
};

export const FeedPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('todo');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const requestedPostId = searchParams.get('postId');
  const requestedCommentId = searchParams.get('commentId');
  const shouldOpenComments = searchParams.get('comments') === 'open' || Boolean(requestedCommentId);
  const loadedNotificationTargetRef = useRef<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
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
  } = usePosts();
  const filters: { id: FeedFilter; label: string }[] = [
    { id: 'todo', label: t('feed.all') },
    { id: 'carrera', label: t('feed.myCareer') },
    { id: 'administrativo', label: t('feed.admin') },
  ];

  const handleFilterClick = (filterId: FeedFilter) => {
    setActiveFilter(filterId);
    refreshPosts();
  };

  useEffect(() => {
    if (requestedPostId) {
      setActiveFilter('todo');
    }
  }, [requestedPostId]);

  useEffect(() => {
    if (!requestedPostId || loading) return;

    const targetKey = `${requestedPostId}:${requestedCommentId ?? ''}:${shouldOpenComments ? 'comments' : 'post'}`;
    const exists = posts.some((post) => String(post.id) === String(requestedPostId));
    const shouldReloadForComment = shouldOpenComments && loadedNotificationTargetRef.current !== targetKey;

    if (!exists || shouldReloadForComment) {
      loadedNotificationTargetRef.current = targetKey;
      loadPostById(requestedPostId);
    }
  }, [loadPostById, loading, posts, requestedCommentId, requestedPostId, shouldOpenComments]);

  useEffect(() => {
    if (!requestedPostId || loading) return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById(`post-${requestedPostId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [loading, requestedPostId, posts]);
  // Filtra publicaciones segun la pestaña elegida.
  const visiblePosts = useMemo(() => {
    const visibleCategories = visibleByFilter[activeFilter];

    return posts.filter((post) => visibleCategories.includes(post.audience));
  }, [activeFilter, posts]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel || loading || loadingMore || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMorePosts();
        }
      },
      { rootMargin: '260px 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMorePosts, visiblePosts.length]);

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-3 py-3 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:gap-5 md:py-5 lg:max-w-3xl">
        {/* Filtros del feed */}
        <div className="sticky top-12 z-30 -mx-3 bg-white/95 px-3 py-2 backdrop-blur md:top-14 md:bg-gray-50/95">
          <section
            className="mx-auto grid min-h-8 grid-cols-3 rounded-full border border-gray-200 bg-white p-1 shadow-[0_3px_12px_rgba(15,23,42,0.06)] sm:w-full sm:max-w-[430px] md:max-w-[520px]"
            aria-label="Filtros del feed"
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleFilterClick(filter.id)}
                  disabled={loading}
                  className={`min-w-0 rounded-full px-2 py-1 text-[10px] font-bold transition-colors min-[360px]:text-[11px] sm:text-[12px] ${
                    isActive ? 'bg-[#1E4E9D] text-white' : 'text-[#808080] hover:bg-[#EFF6FF]'
                  } disabled:cursor-wait disabled:opacity-80`}
                >
                  {filter.label}
                </button>
              );
            })}
          </section>
        </div>

        {loading && posts.length === 0 && (
          <p className="rounded-2xl bg-white px-4 py-3 text-center text-[13px] font-semibold text-gray-400">
            {t('feed.loading')}
          </p>
        )}

        {loading && posts.length > 0 && (
          <p className="rounded-2xl bg-white px-4 py-2 text-center text-[12px] font-semibold text-[#808080]">
            {t('feed.updating')}
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-4 py-3 text-center text-[13px] font-semibold text-[#E7000B]">
            {error}
          </p>
        )}

        {/* Lista de publicaciones */}
        <section className="flex flex-col gap-4 lg:gap-5">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isRemoving={removingPostIds.has(String(post.id))}
              onDelete={deletePost}
              domId={'post-' + String(post.id)}
              highlighted={String(post.id) === String(requestedPostId)}
              initialCommentsOpen={String(post.id) === String(requestedPostId) && shouldOpenComments}
              focusedCommentId={String(post.id) === String(requestedPostId) ? requestedCommentId : null}
            />
          ))}
        </section>

        {!loading && !error && visiblePosts.length === 0 && (
          <p className="rounded-2xl bg-white px-4 py-6 text-center text-[13px] font-semibold text-[#808080]">
            {t('feed.emptyCategory')}
          </p>
        )}

        {visiblePosts.length > 0 && (
          <div
            ref={loadMoreRef}
            className="flex min-h-14 items-center justify-center py-4"
            aria-live="polite"
          >
            {hasMore || loadingMore ? (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#526174] shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
                <LoaderCircle size={16} className="animate-spin text-[#155DFC]" />
                {t('feed.loadingMore')}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-gray-400">
                {t('feed.endOfFeed')}
              </span>
            )}
          </div>
        )}
      </main>

      <AddNewBottom onClick={() => setIsCreatePostModalOpen(true)} />

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPublish={createPost}
      />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
