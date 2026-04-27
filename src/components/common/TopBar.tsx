import { Search, Moon, Bell } from 'lucide-react';

export const TopBar = () => {
  return (
    // Barra superior fija.
    <header className="sticky top-0 left-0 right-0 z-40 h-12 border-b border-gray-100 bg-white px-3 md:h-14">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        {/* Accion de busqueda */}
        <div className="flex flex-1 justify-start">
          <button
            className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Buscar"
          >
            <Search size={17} />
          </button>
        </div>

        {/* Nombre de la app */}
        <div className="flex flex-1 justify-center">
          <h1 className="text-[14px] font-black text-[#123FA5] md:text-[15px]">
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
      </div>
    </header>
  );
};
