import { CalendarDays, Clock, FileText, Tag, X } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../types/calendar.types';

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

const typeLabels: Record<CalendarEventType, string> = {
  1: 'Examen',
  2: 'Clase',
  3: 'Evento',
  4: 'Feriado',
};

const typeStyles: Record<CalendarEventType, string> = {
  1: 'bg-[#91210e]/10 text-[#91210e]',
  2: 'bg-[#4bedb6]/20 text-[#1d8c57]',
  3: 'bg-[#ffde59]/30 text-[#91210e]',
  4: 'bg-[#7ed957]/20 text-[#1d8c57]',
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));

const formatTime = (date: string) =>
  new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

export const EventDetailModal = ({ event, onClose }: EventDetailModalProps) => (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
    onClick={onClose}
  >
    <section
      className="w-full max-w-[420px] rounded-[28px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.28)] sm:p-6"
      aria-label="Detalle del evento"
      onClick={(modalEvent) => modalEvent.stopPropagation()}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${typeStyles[event.type]}`}>
            {typeLabels[event.type]}
          </span>
          <h2 className="mt-3 text-[20px] font-black leading-6 text-[#1F2937] sm:text-[22px]">
            {event.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
          aria-label="Cerrar detalle del evento"
        >
          <X size={19} />
        </button>
      </header>

      <dl className="mt-5 flex flex-col gap-3 text-[13px] text-[#1F2937]">
        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">Día</dt>
            <dd className="mt-0.5 font-semibold capitalize">{formatDate(event.startDate)}</dd>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">Hora</dt>
            <dd className="mt-0.5 font-semibold">
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </dd>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <Tag size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">Tipo</dt>
            <dd className="mt-0.5 font-semibold">{typeLabels[event.type]}</dd>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">Descripción</dt>
            <dd className="mt-0.5 whitespace-pre-line font-semibold leading-5 text-gray-600">
              {event.description || 'Sin descripción.'}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  </div>
);