import { Search, Moon, Bell } from 'lucide-react';

export const TopBar = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white dark:bg-[#0B1121] px-4 h-16 flex items-center justify-between">
      {/* Left side: Search */}
      <div className="flex-1 flex justify-start">
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          aria-label="Buscar"
        >
          <Search size={22} />
        </button>
      </div>

      {/* Center: Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-bold text-[#4285F4] tracking-wide">
          Unstapp
        </h1>
      </div>

      {/* Right side: Actions */}
      <div className="flex-1 flex justify-end gap-1">
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          aria-label="Cambiar tema"
        >
          <Moon size={22} />
        </button>
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors relative"
          aria-label="Notificaciones"
        >
          <Bell size={22} />
          {/* Unread indicator */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0B1121]"></span>
        </button>
      </div>
    </header>
  );
};
