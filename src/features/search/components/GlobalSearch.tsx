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
          placeholder="Buscar en la comunidad..."
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
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