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
          {!isLoading && results.length > 0 && (
            <ul>
              {results.map((user) => (
                <li key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {user.fullName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron resultados <span className="font-bold">"{query}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};