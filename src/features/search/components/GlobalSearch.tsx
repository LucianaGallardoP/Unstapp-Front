// src/features/search/components/GlobalSearch.tsx
import { useSearch } from '../hooks/useSearch';
import { Search, Loader2 } from 'lucide-react'; // Usando Lucide [cite: 1751]

export const GlobalSearch = () => {
  const { query, setQuery, results, isLoading, hasSearched } = useSearch();

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full bg-gray-100 shadow-inner rounded-full py-1.5 pl-9 pr-4 text-[13px] text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        />
        <div className="absolute left-3 top-[7px] text-gray-500">
          {isLoading ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Search className="w-[15px] h-[15px]" />}
        </div>
      </div>

      {/* Sugerencias en tiempo real [cite: 2512] */}
      {query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* CRITERIO: Diferenciación visual [cite: 2513] */}
          {!isLoading && results.length > 0 && (
            <ul>
              {results.map((user) => (
                <li key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {user.fullName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* CRITERIO: Mensaje sin resultados [cite: 2515] */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron coincidencias para <span className="font-bold">"{query}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};