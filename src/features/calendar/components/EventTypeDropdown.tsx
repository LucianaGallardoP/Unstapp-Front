import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CalendarEventType } from '../types/calendar.types';

interface EventTypeDropdownProps {
  value: CalendarEventType;
  onChange: (value: CalendarEventType) => void;
}

const options: { id: CalendarEventType; label: string; color: string }[] = [
  { id: 1, label: 'EXAMENES', color: 'bg-[#982015]' },
  { id: 2, label: 'CLASES', color: 'bg-[#4db2cd]' },
  { id: 3, label: 'EVENTOS', color: 'bg-[#facc15]' },
  { id: 4, label: 'FERIADOS', color: 'bg-[#6dc951]' },
];

export const EventTypeDropdown: React.FC<EventTypeDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.id === value) ?? options[2];

  return (
    <div className="relative w-full font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-full border border-[#1f4e99] bg-white px-5 py-2.5 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className="h-5 w-5 text-gray-500" strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-3 flex w-full flex-col gap-3 rounded-[2rem] border border-gray-100 bg-white p-5 shadow-[0_8px_30px_-5px_rgb(0,0,0,0.15)]">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-4 rounded-full border border-[#1f4e99] bg-white px-6 py-2 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
            >
              <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${option.color}`} />
              <span className="text-[13px] font-[800] tracking-tight text-black">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
