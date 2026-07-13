import { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '../../../i18n';
import { calendarService } from '../services/calendarService';
import type {
  CalendarEvent,
  CalendarEventType,
  CreateCalendarEventPayload,
} from '../types/calendar.types';

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getMonthRange = (visibleDate: Date) => {
  const start = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const end = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0);

  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  };
};

const countByType = (events: CalendarEvent[], type: CalendarEventType) =>
  events.filter((event) => event.type === type).length;

const eventMatchesDate = (event: CalendarEvent, dateString: string) => {
  if (event.startDate.startsWith(dateString)) {
    return true;
  }

  const eventDate = new Date(event.startDate);

  return !Number.isNaN(eventDate.getTime()) && formatLocalDate(eventDate) === dateString;
};

const getEventsForDate = (events: CalendarEvent[], date: Date) => {
  const dateString = formatLocalDate(date);

  return events.filter((event) => eventMatchesDate(event, dateString));
};

export const useCalendarEvents = (visibleDate: Date, selectedDate: Date) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dailyEvents, setDailyEvents] = useState<CalendarEvent[]>([]);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  const monthRange = useMemo(() => getMonthRange(visibleDate), [visibleDate]);

  const loadMonthEvents = useCallback(async () => {
    const response = await calendarService.getEvents(monthRange.start, monthRange.end);
    setEvents(response);
    return response;
  }, [monthRange.start, monthRange.end]);

  const loadSelectedDayEvents = useCallback(async (monthlyEvents = events) => {
    const formattedDate = formatLocalDate(selectedDate);
    const fallbackEvents = monthlyEvents.filter((event) => eventMatchesDate(event, formattedDate));

    try {
      const response = await calendarService.getDailyEvents(formattedDate);
      const responseEventsForDate = response.filter((event) => eventMatchesDate(event, formattedDate));
      setDailyEvents(responseEventsForDate.length > 0 ? responseEventsForDate : fallbackEvents);
    } catch {
      setDailyEvents(fallbackEvents);
    }
  }, [events, selectedDate]);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await calendarService.getEvents(monthRange.start, monthRange.end);

        if (isMounted) {
          setEvents(response);
        }
      } catch {
        if (isMounted) {
          setError(i18n.t('calendar.loadError'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [monthRange.start, monthRange.end]);

  useEffect(() => {
    let isMounted = true;

    const loadDailyEvents = async () => {
      setIsDailyLoading(true);
      
      try {
        const formattedDate = formatLocalDate(selectedDate);
        const fallbackEvents = getEventsForDate(events, selectedDate);
        const response = await calendarService.getDailyEvents(formattedDate);
        const responseEventsForDate = response.filter((event) => eventMatchesDate(event, formattedDate));

        if (isMounted) {
          setDailyEvents(responseEventsForDate.length > 0 ? responseEventsForDate : fallbackEvents);
        }
      } catch {
        if (isMounted) {
          setDailyEvents(getEventsForDate(events, selectedDate));
        }
      } finally {
        if (isMounted) {
          setIsDailyLoading(false);
        }
      }
    };

    loadDailyEvents();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, events]);

  const monthlyCounters = useMemo(
    () => ({
      exams: countByType(events, 1),
      classes: countByType(events, 2),
      events: countByType(events, 3),
      holidays: countByType(events, 4),
    }),
    [events],
  );

  const createEvent = async (payload: CreateCalendarEventPayload) => {
    setIsCreating(true);
    setError(null);

    try {
      const createdEvent = await calendarService.createEvent(payload);
      const selectedDateString = formatLocalDate(selectedDate);

      setEvents((currentEvents) => [...currentEvents, createdEvent]);

      if (eventMatchesDate(createdEvent, selectedDateString)) {
        setDailyEvents((currentEvents) => [...currentEvents, createdEvent]);
      }

      try {
        const refreshedEvents = await loadMonthEvents();
        await loadSelectedDayEvents(refreshedEvents);
      } catch {
        // Si el refresco falla, mantenemos la actualización optimista ya aplicada.
      }

      return createdEvent;
    } catch (err) {
      setError(i18n.t('calendar.createError'));
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  const deleteEvent = async (eventId: number | string) => {
    setError(null);

    try {
      await calendarService.deleteEvent(eventId);
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      setDailyEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(i18n.t('calendar.deleteError'));
      throw err;
    }
  };

  return {
    events,
    selectedDayEvents: dailyEvents,
    monthlyCounters,
    isLoading,
    isDailyLoading,
    isCreating,
    error,
    createEvent,
    deleteEvent,
  };
};
