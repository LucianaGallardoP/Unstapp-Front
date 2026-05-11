import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { Search, Loader2, X } from 'lucide-react';

export const GlobalSearch = () => {
  const { query, setQuery, results, isLoading, hasSearched } = useSearch();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
        aria-label="Buscar"
      >
        <Search size={17} />
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
          placeholder="Buscar..."
          className="w-full border-none bg-transparent text-[13px] text-gray-700 outline-none"
          autoFocus
        />
        <button
          type="button"
          onClick={handleClose}
          className="ml-1 shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar busqueda"
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
                <h3 className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">Personas</h3>
                {results.users.map((user, index) => {
                  const rawName = user.fullName || user.userName || user.name || user.username || user.UserName || user.FullName || '';
                  const displayName = (typeof rawName === 'string' && rawName.trim().length > 0) 
                    ? rawName.trim() 
                    : 'Usuario Desconocido';
                  const avatar = user.avatarUrl || user.avatar || user.profilePicture;
                  return (
                    <li key={`user-${user.id || user.userId || index}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors list-none">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {avatar ? (
                          <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      </div>
                    </li>
                  );
                })}
              </div>
            )}

            {/* SECCIÓN DE PUBLICACIONES */}
            {!isLoading && results.posts.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">Publicaciones</h3>
                {results.posts.map((post, index) => {
                  const rawAuthor = post.authorName || post.userName || post.author?.userName || post.user?.userName || post.author?.name || post.user?.name || '';
                  const authorName = (typeof rawAuthor === 'string' && rawAuthor.trim().length > 0) 
                    ? rawAuthor.trim() 
                    : 'Desconocido';
                  return (
                    <li key={`post-${post.id || post.postId || index}`} className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors list-none">
                      <p className="text-sm text-gray-800 line-clamp-2 italic">"{post.content || 'Sin contenido'}"</p>
                      <p className="text-[10px] text-gray-500 mt-1">Por {authorName}</p>
                    </li>
                  );
                })}
              </div>
            )}

            {/* MENSAJE SIN RESULTADOS (Si ambos arrays están vacíos) */}
            {!isLoading && hasSearched && results.users.length === 0 && results.posts.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                No se encontraron coincidencias para <span className="font-bold">"{query}"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};