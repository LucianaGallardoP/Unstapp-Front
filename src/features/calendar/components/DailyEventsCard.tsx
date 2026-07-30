import React from 'react';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../../../store/languageContext';
import type { CalendarEvent, CalendarEventType } from '../types/calendar.types';
import { normalizeRoleKey } from '../../../utils/roleLabels';

interface DailyEventsCardProps {
  selectedDate: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
  onClose?: () => void;
  onAddEventClick?: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const typeThemes: Record<CalendarEventType, string> = {
  1: 'bg-gradient-to-b from-[#f8ded8] to-[#fff5f2] text-[#91210e]',
  2: 'bg-gradient-to-b from-[#e5f7fa] to-[#f0f9fb] text-[#4db3cd]',
  3: 'bg-gradient-to-b from-[#fff6d5] to-[#fdfaf0] text-[#efca3b]',
  4: 'bg-gradient-to-b from-[#e8f8dd] to-[#f4fff0] text-[#7ed957]',
};

const getLocale = (language: 'es' | 'en') => language === 'en' ? 'en-US' : 'es-AR';

const getMonthInitials = (date: Date, language: 'es' | 'en') =>
  new Intl.DateTimeFormat(getLocale(language), { month: 'short' })
    .format(date)
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase();

const formatTitleDate = (date: Date, language: 'es' | 'en') =>
  new Intl.DateTimeFormat(getLocale(language), {
    day: 'numeric',
    month: 'long',
  }).format(date);

const formatTime = (date: string, language: 'es' | 'en') =>
  new Intl.DateTimeFormat(getLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const getCurrentCalendarRoleKey = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return normalizeRoleKey(Array.isArray(roles) ? roles.join(' ') : String(roles ?? ''));
  } catch {
    return 'student';
  }
};

export const DailyEventsCard: React.FC<DailyEventsCardProps> = ({
  selectedDate,
  events,
  isLoading = false,
  onClose,
  onAddEventClick,
  onEventClick,
}) => {
  const { language, t } = useLanguage();
  const currentRoleKey = getCurrentCalendarRoleKey();
  const canManageEvents = currentRoleKey === 'admin' || currentRoleKey === 'teacher';

  return (
    <div className="relative w-full max-w-[420px] rounded-[2.5rem] bg-white p-8 font-sans shadow-[0_12px_40px_-10px_rgb(0,0,0,0.15)]">
      <div className="relative mb-8 flex items-center justify-center">
        <h2 className="text-center text-[1.3rem] font-bold tracking-tight text-[#1f4e99]">
          {t('calendar.eventsForDate', { date: formatTitleDate(selectedDate, language) })}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-800 transition-colors hover:bg-gray-100"
          aria-label={t('common.close')}
        >
          <X className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mb-8 flex max-h-[50vh] flex-col gap-4 overflow-y-auto pr-1">
        {isLoading && (
          <p className="rounded-2xl bg-[#EFF6FF] px-4 py-5 text-center text-[13px] font-bold text-[#526174]">
            {t('calendar.loadingEvents')}
          </p>
        )}

        {!isLoading && events.map((event) => {
          const eventDate = new Date(event.startDate);

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventClick?.(event)}
              className="flex w-full items-center justify-between rounded-[100px] border border-gray-50 bg-white p-2 pr-6 text-left shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.01]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] ${typeThemes[event.type]}`}
                >
                  <span className="mb-0.5 text-[10px] font-bold leading-none">
                    {getMonthInitials(eventDate, language)}
                  </span>
                  <span className="text-[22px] font-bold leading-none">
                    {eventDate.getDate()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-bold uppercase leading-tight text-black">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-gray-500">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <span className="ml-3 whitespace-nowrap text-[15px] font-bold text-black">
                {formatTime(event.startDate, language)}
              </span>
            </button>
          );
        })}

        {!isLoading && events.length === 0 && (
          <p className="rounded-2xl bg-[#EFF6FF] px-4 py-5 text-center text-[13px] font-bold text-[#526174]">
            {t('calendar.emptyDay')}
          </p>
        )}
      </div>

      {canManageEvents && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onAddEventClick}
            className="flex items-center gap-2 rounded-full bg-[#21519c] px-10 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#1a4079]"
          >
            <Plus size={17} />
            {t('calendar.addEvent')}
          </button>
        </div>
      )}
    </div>
  );
};
