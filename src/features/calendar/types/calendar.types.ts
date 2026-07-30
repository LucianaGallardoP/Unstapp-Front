export type CalendarEventType = 1 | 2 | 3 | 4;

export interface CalendarEvent {
  id: number | string;
  title: string;
  description: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  careerId?: number | string;
}

export interface CreateCalendarEventPayload {
  title: string;
  description: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  careerId?: number;
  reminderDaysBefore?: number[];
}
