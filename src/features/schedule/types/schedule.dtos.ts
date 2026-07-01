export interface CareerDto {
  id: number;
  name: string;
}

export interface ScheduleDto {
  id: number;
  careerId: number;
  subject: string;
  day: string;
  startTime: string;
  professor: string;
  classroom: string;
  durationHours: number;
}

export interface CreateScheduleRequest {
  careerId: number;
  subject: string;
  day: string;
  startTime: string;
  professor: string;
  classroom: string;
  durationHours: number;
}

export type UpdateScheduleRequest = CreateScheduleRequest;
