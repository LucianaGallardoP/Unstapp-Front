import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { CheckCircle2, Search, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleAvatar } from '../../../components/common/RoleAvatar';
import { useLanguage } from '../../../store/languageContext';
import { shouldShowVerifiedForRole } from '../../../utils/roleLabels';

export const GlobalSearch = () => {
  const { t } = useLanguage();
  const { query, setQuery, results, isLoading, hasSearched } = useSearch();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
  };

  const handleUserClick = (userId?: number | string) => {
    if (!userId) return;

    handleClose();
    navigate(`/perfil/${userId}`);
  };

  const handlePostClick = (postId?: number | string) => {
    if (!postId) return;

    handleClose();
    navigate(`/feed?postId=${encodeURIComponent(String(postId))}`);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex h-10 w-10 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
        aria-label="Buscar"
      >
        <Search size={20} />
      </button>
    );
  }

  return (
    <div className="relative w-full max-w-[160px] sm:max-w-[220px]">
      <div className="flex h-9 w-full items-center rounded-full bg-gray-100 px-2 shadow-inner transition-all">
        {isLoading ? (
          <Loader2 className="ml-1 mr-1 shrink-0 text-gray-500 w-[14px] h-[14px] animate-spin" />
        ) : (
          <Search size={14} className="ml-1 mr-1 shrink-0 text-gray-500" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full border-none bg-transparent text-[13px] text-gray-700 outline-none"
          autoFocus
        />
        <button
          type="button"
          onClick={handleClose}
          className="ml-1 shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-600"
          aria-label={t('search.close')}
        >
          <X size={14} />
        </button>
      </div>

      {query.length >= 2 && (
        <div className="absolute top-full mt-2 w-[260px] sm:w-[320px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            
            {/* SECCIÓN DE USUARIOS */}
            {!isLoading && results.users.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">{t('search.people')}</h3>
                {results.users.map((user, index) => {
                  const rawName = user.fullName || user.userName || user.name || user.username || user.UserName || user.FullName || '';
                  const displayName = (typeof rawName === 'string' && rawName.trim().length > 0) 
                    ? rawName.trim() 
                    : 'Usuario Desconocido';
                  const avatar = user.avatarUrl || user.avatar || user.profilePicture;
                  const userId = user.id || user.userId;
                  const role = user.role || user.roles?.[0];
                  const showVerified = shouldShowVerifiedForRole(role);

                  return (
                    <li key={`user-${userId || index}`} className="list-none">
                      <button
                        type="button"
                        onClick={() => handleUserClick(userId)}
                        disabled={!userId}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                      <RoleAvatar
                        avatarUrl={avatar}
                        name={displayName}
                        role={role}
                        className="h-8 w-8"
                        iconClassName="h-5 w-5"
                      />
                      <div className="min-w-0">
                        <p className="flex min-w-0 items-center gap-1 text-sm font-medium text-gray-900">
                          <span className="truncate">{displayName}</span>
                          {showVerified && (
                            <CheckCircle2
                              size={13}
                              className="shrink-0 text-[#155DFC]"
                              aria-label="Usuario verificado"
                            />
                          )}
                        </p>
                      </div>
                      </button>
                    </li>
                  );
                })}
              </div>
            )}

            {/* SECCIÓN DE PUBLICACIONES */}
            {!isLoading && results.posts.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">{t('search.posts')}</h3>
                {results.posts.map((post, index) => {
                  const postId = post.id || post.postId;
                  const rawAuthor = post.authorName || post.userName || post.author?.userName || post.user?.userName || post.author?.name || post.user?.name || '';
                  const authorName = (typeof rawAuthor === 'string' && rawAuthor.trim().length > 0) 
                    ? rawAuthor.trim() 
                    : 'Desconocido';
                  return (
                    <li key={`post-${postId || index}`} className="list-none">
                      <button
                        type="button"
                        onClick={() => handlePostClick(postId)}
                        disabled={!postId}
                        className="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <p className="text-sm text-gray-800 line-clamp-2 italic">"{post.content || 'Sin contenido'}"</p>
                        <p className="text-[10px] text-gray-500 mt-1">Por {authorName}</p>
                      </button>
                    </li>
                  );
                })}
              </div>
            )}

            {/* MENSAJE SIN RESULTADOS (Si ambos arrays están vacíos) */}
            {!isLoading && hasSearched && results.users.length === 0 && results.posts.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                {t('search.noResults', { query })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
