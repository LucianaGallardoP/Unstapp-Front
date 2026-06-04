import React from 'react';
import { X } from 'lucide-react';

interface EventData {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  theme: 'blue' | 'yellow';
}

const mockEvents: EventData[] = [
  {
    id: '1',
    month: 'ENE',
    day: '05',
    title: 'SISTEMAS OPERATIVOS LAB 3',
    time: '18:00',
    theme: 'blue',
  },
  {
    id: '2',
    month: 'ENE',
    day: '05',
    title: 'FERIA DE EMPLEO: EDICION TECH',
    time: '15:00',
    theme: 'yellow',
  }
];

export const DailyEventsCard: React.FC = () => {
  return (
    <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_12px_40px_-10px_rgb(0,0,0,0.15)] p-8 relative font-sans">
      
      {/* Header */}
      <div className="flex justify-center items-center mb-10 relative">
        <h2 className="text-[#1f4e99] text-[1.3rem] font-bold tracking-tight">
          Eventos del 5 de Enero
        </h2>
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-800 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-6 mb-10">
        {mockEvents.map((event) => (
          <div 
            key={event.id}
            className="bg-white rounded-[100px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] p-2 pr-6 flex items-center justify-between border border-gray-50"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Date Circle */}
              <div 
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] shrink-0
                  ${event.theme === 'blue' 
                    ? 'bg-gradient-to-b from-[#e5f7fa] to-[#f0f9fb] text-[#4db3cd]' 
                    : 'bg-gradient-to-b from-[#fff6d5] to-[#fdfaf0] text-[#efca3b]'}
                `}
              >
                <span className="text-[10px] font-bold leading-none mb-0.5">{event.month}</span>
                <span className="text-[22px] font-bold leading-none">{event.day}</span>
              </div>
              
              {/* Event Title */}
              <p className="text-[13px] font-bold text-black leading-tight flex-1">
                {event.title}
              </p>
            </div>
            
            {/* Event Time */}
            <span className="text-[15px] font-bold text-black ml-3 whitespace-nowrap">
              {event.time}
            </span>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-center">
        <button className="bg-[#21519c] hover:bg-[#1a4079] text-white font-bold py-3.5 px-10 rounded-full transition-colors text-[15px]">
          + Agregar Evento
        </button>
      </div>
    </div>
  );
};
