import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const EventTypeDropdown: React.FC = () => {
  // Inicializamos en false para que el dropdown esté cerrado por defecto
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { id: 'exam', label: 'EXÁMENES', color: 'bg-[#982015]' },
    { id: 'class', label: 'CLASES', color: 'bg-[#4db2cd]' },
    { id: 'event', label: 'EVENTOS', color: 'bg-[#facc15]' }, // o #f5c423
    { id: 'holiday', label: 'FERIADOS', color: 'bg-[#6dc951]' },
  ];

  return (
    <div className="relative w-full font-sans">
      {/* Trigger del Dropdown */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-[#1f4e99] rounded-full px-5 py-2.5 bg-white text-gray-400 text-[14px] font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
      >
        <span>Tipo de evento</span>
        <ChevronDown className="w-5 h-5 text-gray-500" strokeWidth={2} />
      </button>

      {/* Lista Desplegable (Modal) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-[2rem] shadow-[0_8px_30px_-5px_rgb(0,0,0,0.15)] p-5 border border-gray-100 flex flex-col gap-3 z-10">
          {options.map((option) => (
            <button 
              key={option.id}
              className="w-full flex items-center gap-4 border border-[#1f4e99] rounded-full px-6 py-2 bg-white hover:bg-blue-50 transition-colors focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
            >
              {/* Círculo de color */}
              <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${option.color}`}></span>
              
              {/* Texto de la opción */}
              <span className="text-[13px] font-[800] text-black tracking-tight">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
