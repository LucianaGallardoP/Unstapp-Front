import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useLanguage } from '../../../store/languageContext';
import { useCareers } from '../../schedule/hooks/useCareers';
import { EventTypeDropdown } from './EventTypeDropdown';
import type {
  CalendarEventType,
  CreateCalendarEventPayload,
} from '../types/calendar.types';
import { normalizeRoleKey } from '../../../utils/roleLabels';

interface CreateEventModalProps {
  selectedDate: Date;
  isSubmitting?: boolean;
  onClose?: () => void;
  onCreate: (payload: CreateCalendarEventPayload) => Promise<void>;
}

const formatDateTitle = (date: Date, language: 'es' | 'en') =>
  new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-AR', {
    day: 'numeric',
    month: 'long',
  }).format(date);

const timeOptions = Array.from({ length: 24 * 6 }, (_, index) => {
  const hours = String(Math.floor(index / 6)).padStart(2, '0');
  const minutes = String((index % 6) * 10).padStart(2, '0');

  return `${hours}:${minutes}`;
});

const formatDatePart = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatTimePart = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}:00`;
};

const buildLocalDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const eventDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
  );

  return `${formatDatePart(eventDate)}T${formatTimePart(eventDate)}`;
};

const buildLocalEndDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const eventDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
  );

  eventDate.setHours(eventDate.getHours() + 1);

  return `${formatDatePart(eventDate)}T${formatTimePart(eventDate)}`;
};

const getCurrentCalendarRoleKey = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return normalizeRoleKey(Array.isArray(roles) ? roles.join(' ') : String(roles ?? ''));
  } catch {
    return 'student';
  }
};

const teacherEventTypeOptions = [
  { id: 2 as CalendarEventType, labelKey: 'calendar.consultationClass', color: 'bg-[#4db2cd]' },
];

const examReminderDaysBefore = [5, 1];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  selectedDate,
  isSubmitting = false,
  onClose,
  onCreate,
}) => {
  const { language, t } = useLanguage();
  const currentRoleKey = getCurrentCalendarRoleKey();
  const isTeacher = currentRoleKey === 'teacher';
  const canCreateEvent = currentRoleKey === 'admin' || isTeacher;
  const { careers, loading: careersLoading } = useCareers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>(isTeacher ? 2 : 3);
  const [time, setTime] = useState('08:00');
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && time.trim().length > 0 && !isSubmitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const startDate = buildLocalDateTime(selectedDate, time);
    const endDate = buildLocalEndDateTime(selectedDate, time);
    const eventType = isTeacher ? 2 : type;

    setFormError(null);

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        type: eventType,
        startDate,
        endDate,
        careerId: selectedCareerId ? Number(selectedCareerId) : undefined,
        reminderDaysBefore: eventType === 1 ? examReminderDaysBefore : undefined,
      });
      onClose?.();
    } catch {
      setFormError(t('calendar.createError'));
    }
  };

  if (!canCreateEvent) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-h-[calc(100vh-24px)] w-full max-w-[420px] overflow-y-auto rounded-[2rem] border border-gray-50 bg-white px-5 pb-6 pt-12 font-sans shadow-[0_12px_40px_-10px_rgb(0,0,0,0.15)] sm:rounded-[2.5rem] sm:p-8"
    >
      <div className="relative mb-7 flex items-center justify-center sm:mb-9">
        <h2 className="px-7 text-center text-[1.15rem] font-bold tracking-tight text-[#1f4e99] sm:px-0 sm:text-[1.25rem]">
          {t('calendar.createEventForDate', { date: formatDateTitle(selectedDate, language) })}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-[-2.25rem] rounded-full p-1.5 text-gray-800 transition-colors hover:bg-gray-100 sm:top-1/2 sm:-translate-y-1/2"
          aria-label={t('common.close')}
        >
          <X className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mb-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-[14px] font-[800] text-[#2c2c2c]">
          {t('calendar.eventTitleLabel')}
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('calendar.eventTitlePlaceholder')}
            className="rounded-full border border-[#1f4e99] px-4 py-2 text-[13px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
          />
        </label>

        <label className="flex flex-col gap-2 text-[14px] font-[800] text-[#2c2c2c]">
          {t('calendar.eventTypeLabel')}
          <EventTypeDropdown
            value={isTeacher ? 2 : type}
            onChange={setType}
            options={isTeacher ? teacherEventTypeOptions : undefined}
            disabled={isTeacher}
          />
          {!isTeacher && type === 1 && (
            <p className="rounded-2xl bg-[#EFF6FF] px-3 py-2 text-[11px] font-semibold leading-4 text-[#1E4E9D]">
              {t('calendar.examReminderNotice')}
            </p>
          )}
        </label>

        <label className="flex flex-col gap-2 text-[14px] font-[800] text-[#2c2c2c]">
          {t('calendar.eventCareerLabel')}
          <select
            value={selectedCareerId}
            onChange={(event) => setSelectedCareerId(event.target.value)}
            className="rounded-full border border-[#1f4e99] bg-transparent px-4 py-2 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
          >
            <option value="">
              {careersLoading ? t('schedule.loadingCareers') : t('calendar.allCareers')}
            </option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-[14px] font-[800] text-[#2c2c2c]">
          {t('calendar.eventTimeLabel')}
          <select
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="rounded-full border border-[#1f4e99] bg-transparent px-4 py-2 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
          >
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-[14px] font-[800] text-[#2c2c2c]">
          {t('calendar.eventDescriptionLabel')} <span className="text-[11px] font-semibold text-gray-400">{t('calendar.optional')}</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('calendar.eventDescriptionPlaceholder')}
            rows={3}
            className="resize-none rounded-2xl border border-[#1f4e99] px-4 py-3 text-[13px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1f4e99]"
          />
        </label>
      </div>

      {formError && (
        <p className="mb-4 text-center text-[12px] font-bold text-[#E7000B]">
          {formError}
        </p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex min-w-40 items-center justify-center gap-2 rounded-full bg-[#21519c] px-10 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#1a4079] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? t('calendar.creatingEvent') : t('calendar.createEventAction')}
        </button>
      </div>
    </form>
  );
};
