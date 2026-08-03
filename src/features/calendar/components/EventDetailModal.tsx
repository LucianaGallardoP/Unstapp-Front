import { useEffect, useState } from 'react';
import { Bell, CalendarDays, Clock, FileText, Loader2, Tag, Trash2, X } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../types/calendar.types';
import { useLanguage } from '../../../store/languageContext';
import { normalizeRoleKey } from '../../../utils/roleLabels';
import { calendarService } from '../services/calendarService';

interface EventDetailModalProps {
  event: CalendarEvent;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete?: (event: CalendarEvent) => Promise<void> | void;
}

const typeStyles: Record<CalendarEventType, string> = {
  1: 'bg-[#91210e]/10 text-[#91210e]',
  2: 'bg-[#4bedb6]/20 text-[#1d8c57]',
  3: 'bg-[#ffde59]/30 text-[#91210e]',
  4: 'bg-[#7ed957]/20 text-[#1d8c57]',
};

const formatDate = (date: string, language: 'es' | 'en') =>
  new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));

const formatTime = (date: string, language: 'es' | 'en') =>
  new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const getCurrentUserId = () => localStorage.getItem('unstapp_user_id') ?? 'anonymous';

const getCurrentRoleKey = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return normalizeRoleKey(Array.isArray(roles) ? roles.join(' ') : String(roles ?? ''));
  } catch {
    return 'student';
  }
};

const getEventReminderKey = (eventId: number | string) =>
  `unstapp_event_whatsapp_reminder_${getCurrentUserId()}_${eventId}`;

const getStoredEventReminder = (event: CalendarEvent) => {
  if (typeof event.reminderEnabled === 'boolean') {
    return event.reminderEnabled;
  }

  return localStorage.getItem(getEventReminderKey(event.id)) === 'true';
};

export const EventDetailModal = ({
  event,
  isDeleting = false,
  onClose,
  onDelete,
}: EventDetailModalProps) => {
  const { language, t } = useLanguage();
  const isStudent = getCurrentRoleKey() === 'student';
  const shouldShowEventReminder = isStudent;
  const [wantsEventReminder, setWantsEventReminder] = useState(() =>
    getStoredEventReminder(event),
  );
  const [isReminderLoading, setIsReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const translatedTypeLabels: Record<CalendarEventType, string> = {
    1: t('calendar.exams'),
    2: t('calendar.classes'),
    3: t('calendar.events'),
    4: t('calendar.holidays'),
  };

  useEffect(() => {
    setWantsEventReminder(getStoredEventReminder(event));
    setReminderError(null);
  }, [event]);

  const handleEventReminderToggle = async () => {
    if (isReminderLoading) return;

    const previousValue = wantsEventReminder;
    const nextValue = !wantsEventReminder;

    setReminderError(null);
    setIsReminderLoading(true);
    setWantsEventReminder(nextValue);
    localStorage.setItem(getEventReminderKey(event.id), String(nextValue));

    try {
      await calendarService.toggleEventReminder(event.id, nextValue);
    } catch {
      setWantsEventReminder(previousValue);
      localStorage.setItem(getEventReminderKey(event.id), String(previousValue));
      setReminderError(t('calendar.reminderUpdateError'));
    } finally {
      setIsReminderLoading(false);
    }
  };

  return (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
    onClick={onClose}
  >
    <section
      className="w-full max-w-[420px] rounded-[28px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.28)] sm:p-6"
      aria-label={t('calendar.events')}
      onClick={(modalEvent) => modalEvent.stopPropagation()}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${typeStyles[event.type]}`}>
            {translatedTypeLabels[event.type]}
          </span>
          <h2 className="mt-3 text-[20px] font-black leading-6 text-[#1F2937] sm:text-[22px]">
            {event.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
          aria-label={t('common.close')}
        >
          <X size={19} />
        </button>
      </header>

      <dl className="mt-5 flex flex-col gap-3 text-[13px] text-[#1F2937]">
        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">{t('calendar.dayLabel')}</dt>
            <dd className="mt-0.5 font-semibold capitalize">{formatDate(event.startDate, language)}</dd>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">{t('calendar.timeLabel')}</dt>
            <dd className="mt-0.5 font-semibold">
              {formatTime(event.startDate, language)} - {formatTime(event.endDate, language)}
            </dd>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <Tag size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">{t('calendar.typeLabel')}</dt>
            <dd className="mt-0.5 font-semibold">{translatedTypeLabels[event.type]}</dd>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
          <div>
            <dt className="font-black uppercase text-gray-400">{t('calendar.descriptionLabel')}</dt>
            <dd className="mt-0.5 whitespace-pre-line font-semibold leading-5 text-gray-600">
              {event.description || t('calendar.noDescription')}
            </dd>
          </div>
        </div>

        {shouldShowEventReminder && (
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-[#EFF6FF] px-4 py-3 text-[#1F2937]">
            <span className="flex min-w-0 gap-3">
              <Bell size={18} className="mt-0.5 shrink-0 text-[#1E4E9D]" />
              <span className="min-w-0">
                <span className="block text-[12px] font-black uppercase text-[#1E4E9D]">
                  {t('calendar.whatsappEventReminder')}
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-gray-500">
                  {t('calendar.whatsappEventReminderHint')}
                </span>
              </span>
            </span>
            <input
              type="checkbox"
              checked={wantsEventReminder}
              disabled={isReminderLoading}
              onChange={handleEventReminderToggle}
              className="h-5 w-5 shrink-0 accent-[#1E4E9D] disabled:cursor-wait disabled:opacity-70"
            />
          </label>
        )}
      </dl>

      {reminderError && (
        <p className="mt-3 rounded-2xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-4 py-3 text-center text-[12px] font-bold text-[#E7000B]">
          {reminderError}
        </p>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(event)}
          disabled={isDeleting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E7000B] px-4 py-3 text-[13px] font-black uppercase text-white transition-colors hover:bg-[#b80009] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          {isDeleting ? t('calendar.deleting') : t('calendar.deleteEvent')}
        </button>
      )}
    </section>
  </div>
  );
};
