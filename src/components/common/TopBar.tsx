import { Search, Moon, Bell } from 'lucide-react';

export const TopBar = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 h-12 border-b border-gray-100 bg-white px-3 md:h-14">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        <div className="flex flex-1 justify-start">
          <button
            className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Buscar"
          >
            <Search size={17} />
          </button>
        </div>

        <div className="flex flex-1 justify-center">
          <h1 className="text-[14px] font-black text-[#123FA5] md:text-[15px]">
            Unstapp
          </h1>
        </div>

        <div className="flex flex-1 justify-end gap-1">
          <button
            className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Cambiar tema"
          >
            <Moon size={16} />
          </button>
          <button
            className="relative flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Notificaciones"
          >
            <Bell size={16} />
            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
