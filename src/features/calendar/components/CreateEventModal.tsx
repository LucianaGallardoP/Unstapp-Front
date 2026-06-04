import React from 'react';
import { X } from 'lucide-react';

export const CreateEventModal: React.FC = () => {
  return (
    <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_12px_40px_-10px_rgb(0,0,0,0.15)] p-8 relative font-sans border border-gray-50">
      
      {/* Header */}
      <div className="flex justify-center items-center mb-10 relative">
        <h2 className="text-[#1f4e99] text-[1.25rem] font-bold tracking-tight">
          Crear Evento - 1 de Junio
        </h2>
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-800 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex flex-col gap-8 mb-10">
        {/* Titulo */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-[14px] font-[800] text-[#2c2c2c] whitespace-nowrap">
            Titulo del evento
          </label>
          <input 
            type="text"
            placeholder="Titulo para el evento"
            className="w-[55%] border border-[#1f4e99] rounded-full px-4 py-2 text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1f4e99] placeholder-gray-400"
          />
        </div>

        {/* Tipo */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-[14px] font-[800] text-[#2c2c2c] whitespace-nowrap">
            Tipo de evento
          </label>
          {/* Espacio en blanco respetando el diseño proporcionado */}
          <div className="w-[55%]"></div>
        </div>

        {/* Hora */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-[14px] font-[800] text-[#2c2c2c] whitespace-nowrap">
            Hora del evento
          </label>
          <input 
            type="text"
            className="w-[55%] border border-[#1f4e99] rounded-full px-4 py-4 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1f4e99] bg-transparent"
          />
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-center">
        <button className="bg-[#21519c] hover:bg-[#1a4079] text-white font-bold py-3.5 px-12 rounded-full transition-colors text-[15px]">
          Crear Evento
        </button>
      </div>
    </div>
  );
};
