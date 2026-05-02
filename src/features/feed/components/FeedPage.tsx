import { useMemo, useState } from 'react';
import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation, type TabType } from '../../../components/common/BottomNavigation';
import { AddNewBottom } from '../../../components/common/AddNewBottom';
import { usePosts } from '../hooks/usePosts';
import type { Post, PostCategory } from '../types/post.types';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';

type FeedFilter = 'todo' | 'carrera' | 'administrativo';

// Opciones del selector superior.
const filters: { id: FeedFilter; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'carrera', label: 'Mi carrera' },
  { id: 'administrativo', label: 'Administrativo' },
];

// Genera fechas relativas para los datos mock.
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

// Publicaciones de ejemplo hasta conectar backend.
const getInitialPosts = (): Post[] => [
  {
    id: 1,
    author: {
      name: 'Administracion UNSTA',
      role: 'Administrativo',
    },
    category: 'administrativo',
    publishedAt: minutesAgo(10),
    content:
      'AVISO IMPORTANTE: El profesor de Algebra II no asistira el dia de hoy. Por otro lado, la clase de Testeo Automatizado se dictara en el Laboratorio 1. Por favor, difundir.',
    likes: 0,
    comments: [],
  },
  {
    id: 2,
    author: {
      name: 'Bar UNSTA',
      role: 'Bar',
      verified: true,
    },
    category: 'bar',
    publishedAt: minutesAgo(60),
    content:
      'Hoy tenemos promocion especial! Cafe con medialunas a $1500. Valido hasta las 12hs. Los esperamos!',
    likes: 45,
    comments: [
      {
        id: 1,
        author: {
          name: 'Camila Perez',
          role: 'Alumno',
        },
        publishedAt: minutesAgo(42),
        content: 'Paso antes de cursar.',
      },
      {
        id: 2,
        author: {
          name: 'Mateo Ruiz',
          role: 'Alumno',
        },
        publishedAt: minutesAgo(18),
        content: 'Guardame dos medialunas.',
      },
    ],
  },
  {
    id: 3,
    author: {
      name: 'Maria Gonzalez',
      role: 'Alumno',
    },
    category: 'alumno',
    publishedAt: minutesAgo(300),
    content:
      'Alguien tiene el apunte de Derecho Civil II del profesor Rodriguez? Lo necesito urgente para el parcial del viernes.',
    likes: 12,
    comments: [
      {
        id: 3,
        author: {
          name: 'Lucia Fernandez',
          role: 'Alumno',
        },
        publishedAt: minutesAgo(190),
        content: 'Te lo mando por privado.',
      },
      {
        id: 4,
        author: {
          name: 'Tomas Acosta',
          role: 'Alumno',
        },
        publishedAt: minutesAgo(75),
        content: 'Creo que esta en el drive de la materia.',
      },
    ],
  },
  {
    id: 4,
    author: {
      name: 'Facultad de Ingenieria',
      role: 'Docente',
      verified: true,
    },
    category: 'carrera',
    publishedAt: minutesAgo(1440),
    content:
      'Recordatorio: Las inscripciones para las mesas de examenes finales de Ingenieria de Software cierran este viernes. No olviden anotarse!',
    likes: 15,
    comments: [
      {
        id: 5,
        author: {
          name: 'Camila Perez',
          role: 'Alumno',
        },
        publishedAt: minutesAgo(830),
        content: 'Gracias por recordar.',
      },
      {
        id: 6,
        author: {
          name: 'Tomas Acosta',
          role: 'Alumno',
        },
        publishedAt: minutesAgo(610),
        content: 'Ya me anote.',
      },
    ],
  },
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
  const fallbackPosts = useMemo(() => getInitialPosts(), []);
  const { posts, loading, error, createPost } = usePosts({ fallbackPosts });

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
                  onClick={() => setActiveFilter(filter.id)}
                  className={`min-w-0 rounded-full px-2 py-1 text-[10px] font-bold transition-colors min-[360px]:text-[11px] sm:text-[12px] ${
                    isActive ? 'bg-[#5A55FF] text-white' : 'text-[#4B5563] hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </section>
        </div>

        {loading && (
          <p className="rounded-2xl bg-white px-4 py-3 text-center text-[13px] font-semibold text-gray-400">
            Cargando publicaciones...
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-[13px] font-semibold text-red-500">
            {error}
          </p>
        )}

        {/* Lista de publicaciones */}
        <section className="flex flex-col gap-4 lg:gap-5">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
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
