import { apiClient } from '../../../services/apiClient';
import type {
  CalendarEvent,
  CalendarEventType,
  CreateCalendarEventPayload,
} from '../types/calendar.types';

type ApiRecord = Record<string, unknown>;

const getToken = () => localStorage.getItem('unstapp_token');

const getAuthHeaders = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === 'object' ? (value as ApiRecord) : {};

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const asEventType = (value: unknown): CalendarEventType => {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if ([1, 2, 3, 4].includes(numericValue)) {
    return numericValue as CalendarEventType;
  }

  return 3;
};

const mapEventFromApi = (apiEvent: unknown): CalendarEvent => {
  const event = asRecord(apiEvent);
  const id = event.id ?? event.eventId ?? crypto.randomUUID();

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : crypto.randomUUID(),
    title: asString(event.title, 'Evento sin titulo'),
    description: asString(event.description),
    type: asEventType(event.type),
    startDate:
      asString(event.startDate) ||
      asString(event.start) ||
      asString(event.date) ||
      new Date().toISOString(),
    endDate:
      asString(event.endDate) ||
      asString(event.end) ||
      asString(event.startDate) ||
      new Date().toISOString(),
  };
};

export const calendarService = {
  getEvents: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<unknown>('/calendar/events', {
      params: { start, end },
      headers: getAuthHeaders(),
    });
    const data = response.data;
    const events = Array.isArray(data) 
      ? data 
      : asRecord(data).events ?? asRecord(data).items ?? asRecord(data).value ?? asRecord(data).data;

    return Array.isArray(events) ? events.map(mapEventFromApi) : [];
  },

  createEvent: async (payload: CreateCalendarEventPayload): Promise<CalendarEvent> => {
    const response = await apiClient.post<unknown>('/calendar/events', payload, {
      headers: getAuthHeaders(),
    });

    return mapEventFromApi(response.data);
  },
};
