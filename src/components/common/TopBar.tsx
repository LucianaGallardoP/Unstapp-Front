import { useState } from 'react';
import { Search, Moon, Sun, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const [isMoonIcon, setIsMoonIcon] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();
  return (
    // Barra superior fija.
    <header className="sticky top-0 left-0 right-0 z-40 h-12 border-b border-gray-100 bg-white px-3 md:h-14">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        {/* Accion de busqueda */}
        <div className="flex flex-1 justify-start">
          {isSearchExpanded ? (
            <div className="flex items-center bg-gray-100 rounded-full px-2 h-9 w-full max-w-[150px] md:max-w-[200px] transition-all shadow-inner">
              <Search size={14} className="text-gray-500 ml-1 mr-1 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchExpanded(false)}
                className="text-gray-400 hover:text-gray-600 ml-1 p-1 rounded-full flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
              aria-label="Buscar"
            >
              <Search size={17} />
            </button>
          )}
        </div>

        {/* Nombre de la app */}
        <button 
          onClick={() => navigate('/feed')}
          className="flex flex-1 justify-center bg-white border-none cursor-pointer"
        >
          <h1 className="text-[14px] font-black text-[#123FA5] md:text-[15px]">
            UNSTAPP
          </h1>
        </button>

      {/* Right side: Actions */}
      <div className="flex-1 flex justify-end gap-1">
        <button 
          onClick={() => setIsMoonIcon(!isMoonIcon)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          aria-label="Cambiar tema"
        >
          {isMoonIcon ? <Moon size={22} /> : <Sun size={22} />}
        </button>
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors relative"
          aria-label="Notificaciones"
          onClick={() => setNotificationCount(prev => prev + 1)}
          onContextMenu={(e) => {
            e.preventDefault();
            setNotificationCount(prev => Math.max(0, prev - 1));
          }}
        >
          <Bell size={22} />
          {/* Unread indicator */}
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex min-w-[14px] h-[14px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[9px] font-bold text-white border border-white dark:border-[#0B1121]">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>
      </div>
    </header>
  );
};
