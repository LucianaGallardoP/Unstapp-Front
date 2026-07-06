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

const unwrapEvents = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  const record = asRecord(data);
  const possibleCollections = [
    record.events,
    record.calendarEvents,
    record.items,
    record.value,
    record.data,
    record.result,
  ];

  for (const collection of possibleCollections) {
    if (Array.isArray(collection)) {
      return collection;
    }
  }

  return [];
};

const mapEventFromApi = (apiEvent: unknown): CalendarEvent => {
  const event = unwrapEvent(apiEvent);
  const id = event.id ?? event.eventId ?? event.calendarEventId ?? crypto.randomUUID();
  const startDate =
    asString(event.startDate) ||
    asString(event.StartDate) ||
    asString(event.start) ||
    asString(event.date) ||
    new Date().toISOString();

  return {
    id: typeof id === 'number' || typeof id === 'string' ? id : crypto.randomUUID(),
    title: asString(event.title) || asString(event.Title, 'Evento sin título'),
    description: asString(event.description) || asString(event.Description),
    type: asEventType(
      event.type ??
      event.Type ??
      event.typeId ??
      event.TypeId ??
      event.eventTypeId ??
      event.EventTypeId ??
      event.eventType ??
      event.EventType ??
      event.calendarEventType ??
      event.CalendarEventType ??
      event.categoryType ??
      event.CategoryType,
    ),
    startDate,
    endDate:
      asString(event.endDate) ||
      asString(event.EndDate) ||
      asString(event.end) ||
      startDate,
  };
};

const mapCreatedEvent = (data: unknown, payload: CreateCalendarEventPayload): CalendarEvent => {
  const event = mapEventFromApi(data);

  return {
    ...event,
    title: event.title || payload.title,
    description: event.description || payload.description,
    type: event.type === 3 && payload.type !== 3 ? payload.type : event.type,
    startDate: event.startDate || payload.startDate,
    endDate: event.endDate || payload.endDate,
  };
};

export const calendarService = {
  getEvents: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<unknown>('/calendar/events', {
      params: { start, end },
      headers: getAuthHeaders(),
    });

    return unwrapEvents(response.data).map(mapEventFromApi);
  },

  getTodayEvents: async (): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<unknown>('/calendar/daily', {
      headers: getAuthHeaders(),
    });

    return unwrapEvents(response.data).map(mapEventFromApi);
  },

  getDailyEvents: async (date: string): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<unknown>('/calendar/day', {
      params: { date },
      headers: getAuthHeaders(),
    });

    return unwrapEvents(response.data).map(mapEventFromApi);
  },

  createEvent: async (payload: CreateCalendarEventPayload): Promise<CalendarEvent> => {
    const requestPayload = {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };

    const response = await apiClient.post<unknown>('/calendar/events', requestPayload, {
      headers: getAuthHeaders(),
    });

    return mapCreatedEvent(response.data || requestPayload, payload);
  },
};
