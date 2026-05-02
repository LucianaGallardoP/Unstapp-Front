import { useState } from 'react';
import { Search, Moon, Sun, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const [isMoonIcon, setIsMoonIcon] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 right-0 z-40 h-12 border-b border-gray-100 bg-white px-3 md:h-14">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        <div className="flex flex-1 justify-start">
          {isSearchExpanded ? (
            <div className="flex h-9 w-full max-w-[160px] items-center rounded-full bg-gray-100 px-2 shadow-inner transition-all sm:max-w-[220px]">
              <Search size={14} className="ml-1 mr-1 shrink-0 text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full border-none bg-transparent text-[13px] text-gray-700 outline-none"
                autoFocus
              />
              <button 
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="ml-1 shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-600"
                aria-label="Cerrar busqueda"
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

        <button 
          type="button"
          onClick={() => navigate('/feed')}
          className="flex flex-1 cursor-pointer justify-center border-none bg-white"
        >
          <h1 className="text-[14px] font-black text-[#123FA5] md:text-[15px]">
            Unstapp
          </h1>
        </button>

        <div className="flex flex-1 justify-end gap-1">
          <button 
            type="button"
            onClick={() => setIsMoonIcon(!isMoonIcon)}
            className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Cambiar tema"
          >
            {isMoonIcon ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button 
            type="button"
            className="relative flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Notificaciones"
            onClick={() => setNotificationCount((prev) => prev + 1)}
            onContextMenu={(event) => {
              event.preventDefault();
              setNotificationCount((prev) => Math.max(0, prev - 1));
            }}
          >
            <Bell size={16} />
            {notificationCount > 0 && (
              <span className="absolute right-1.5 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-white bg-red-500 px-[3px] text-[8px] font-bold leading-none text-white">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
