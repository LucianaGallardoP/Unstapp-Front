import { useEffect, useMemo, useState } from 'react';
import { calendarService } from '../services/calendarService';
import type {
  CalendarEvent,
  CalendarEventType,
  CreateCalendarEventPayload,
} from '../types/calendar.types';

const isSameDay = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const getMonthRange = (visibleDate: Date) => {
  const start = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

const countByType = (events: CalendarEvent[], type: CalendarEventType) =>
  events.filter((event) => event.type === type).length;

export const useCalendarEvents = (visibleDate: Date, selectedDate: Date) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dailyEvents, setDailyEvents] = useState<CalendarEvent[]>([]);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  const monthRange = useMemo(() => getMonthRange(visibleDate), [visibleDate]);

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
          setError('No se pudieron cargar los eventos del calendario.');
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
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const isToday = isSameDay(selectedDate, new Date());

        const response = await calendarService.getDailyEvents(formattedDate, isToday);

        if (isMounted) {
          // Salvaguarda: filtramos localmente la respuesta del endpoint por si el backend no está 
          // aplicando el filtro de fecha correctamente y devuelve más eventos de los debidos.
          const filteredResponse = response.filter((event) => 
            isSameDay(new Date(event.startDate), selectedDate)
          );
          setDailyEvents(filteredResponse);
        }
      } catch {
        if (isMounted) {
          // Fallback en caso de error: filtramos localmente si el endpoint falla
          setDailyEvents(events.filter((event) => isSameDay(new Date(event.startDate), selectedDate)));
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
      setEvents((currentEvents) => [...currentEvents, createdEvent]);
      return createdEvent;
    } catch (err) {
      setError('No se pudo crear el evento.');
      throw err;
    } finally {
      setIsCreating(false);
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
  };
};
