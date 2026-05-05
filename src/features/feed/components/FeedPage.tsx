import { useMemo, useState } from 'react';
import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation, type TabType } from '../../../components/common/BottomNavigation';
import { AddNewBottom } from '../../../components/common/AddNewBottom';
import { usePosts } from '../hooks/usePosts';
import type { PostCategory } from '../types/post.types';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';

type FeedFilter = 'todo' | 'carrera' | 'administrativo';

// Opciones del selector superior.
const filters: { id: FeedFilter; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'carrera', label: 'Mi carrera' },
  { id: 'administrativo', label: 'Administrativo' },
];

// Categorias visibles por cada filtro.
const visibleByFilter: Record<FeedFilter, PostCategory[]> = {
  todo: ['administrativo', 'bar', 'alumno', 'carrera'],
  carrera: ['carrera'],
  administrativo: ['administrativo'],
};

export const FeedPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('todo');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const { posts, loading, error, createPost, refreshPosts } = usePosts();

  const handleFilterClick = (filterId: FeedFilter) => {
    setActiveFilter(filterId);
    refreshPosts();
  };

  // Filtra publicaciones segun la pestaña elegida.
  const visiblePosts = useMemo(() => {
    const visibleCategories = visibleByFilter[activeFilter];

    return posts.filter((post) => visibleCategories.includes(post.category));
  }, [activeFilter, posts]);

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
            Cargando publicaciones...
          </p>
        )}

        {loading && posts.length > 0 && (
          <p className="rounded-2xl bg-white px-4 py-2 text-center text-[12px] font-semibold text-[#808080]">
            Actualizando publicaciones...
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
            <PostCard key={post.id} post={post} />
          ))}
        </section>

        {!loading && !error && visiblePosts.length === 0 && (
          <p className="rounded-2xl bg-white px-4 py-6 text-center text-[13px] font-semibold text-[#808080]">
            No hay publicaciones recientes en esta categoría.
          </p>
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
