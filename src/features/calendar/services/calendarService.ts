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

const asNumber = (value: unknown) =>
  typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim() && Number.isFinite(Number(value))
      ? Number(value)
      : undefined;

const asEventType = (value: unknown): CalendarEventType => {
  const numericValue = asNumber(value);

  if (numericValue && [1, 2, 3, 4].includes(numericValue)) {
    return numericValue as CalendarEventType;
  }

  return 3;
};

const unwrapEvent = (apiEvent: unknown) => {
  const root = asRecord(apiEvent);

  return asRecord(root.data ?? root.value ?? root.event ?? root.item ?? root);
};

const mapEventFromApi = (apiEvent: unknown): CalendarEvent => {
  const event = unwrapEvent(apiEvent);
  const id = event.id ?? event.eventId ?? crypto.randomUUID();

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : crypto.randomUUID(),
    title: asString(event.title, 'Evento sin titulo'),
    description: asString(event.description),
    type: asEventType(
      event.type ??
      event.Type ??
      event.eventType ??
      event.EventType ??
      event.calendarEventType ??
      event.CalendarEventType ??
      event.categoryType ??
      event.CategoryType,
    ),
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

  getDailyEvents: async (date: string): Promise<CalendarEvent[]> => {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    return calendarService.getEvents(start.toISOString(), end.toISOString());
  },

  createEvent: async (payload: CreateCalendarEventPayload): Promise<CalendarEvent> => {
    const requestPayload = {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      Type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    const response = await apiClient.post<unknown>('/calendar/events', requestPayload, {
      headers: getAuthHeaders(),
    });
    const createdEvent = mapEventFromApi(response.data);

    return {
      ...createdEvent,
      type: createdEvent.type === 3 && payload.type !== 3 ? payload.type : createdEvent.type,
    };
  },
};
