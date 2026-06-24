import { apiClient } from '../../../services/apiClient';
import type { StudentContext } from '../hooks/useWeeklySchedule';
import type { CareerDto, ScheduleDto, CreateScheduleRequest } from '../types/schedule.dtos';

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

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  return fallback;
};

const unwrapArray = (value: unknown) => {
  if (Array.isArray(value)) return value;

  const root = asRecord(value);
  const candidates = [root.data, root.items, root.value, root.results];

  return candidates.find(Array.isArray) ?? [];
};

const mapCareerFromApi = (apiCareer: unknown): CareerDto => {
  const career = asRecord(apiCareer);

  return {
    id: asNumber(career.id ?? career.careerId ?? career.carreraId),
    name:
      asString(career.name) ||
      asString(career.nombre) ||
      asString(career.careerName) ||
      asString(career.carreraNombre) ||
      'Carrera sin nombre',
  };
};

const mapScheduleFromApi = (apiSchedule: unknown): ScheduleDto => {
  const root = asRecord(apiSchedule);
  const schedule = asRecord(root.data ?? root.value ?? root.horario ?? root.schedule ?? root);

  return {
    id: asNumber(schedule.id ?? schedule.scheduleId ?? schedule.horarioId, Date.now()),
    careerId: asNumber(schedule.careerId ?? schedule.carreraId),
    subject:
      asString(schedule.subject) ||
      asString(schedule.materia) ||
      asString(schedule.title) ||
      'Materia sin nombre',
    day:
      asString(schedule.day) ||
      asString(schedule.dia) ||
      asString(schedule.weekDay) ||
      'lun',
    startTime:
      asString(schedule.startTime) ||
      asString(schedule.horaInicio) ||
      asString(schedule.hour) ||
      '08:00',
    professor:
      asString(schedule.professor) ||
      asString(schedule.profesor) ||
      asString(schedule.teacher) ||
      'Profesor a confirmar',
    classroom:
      asString(schedule.classroom) ||
      asString(schedule.aula) ||
      asString(schedule.room) ||
      'Aula a confirmar',
    durationHours: asNumber(schedule.durationHours ?? schedule.duracionHoras ?? schedule.duration, 1),
  };
};

const mapContextFromApi = (apiContext: unknown): StudentContext => {
  const root = asRecord(apiContext);
  const data = asRecord(root.data ?? root.value ?? root.context ?? root);
  const career = asRecord(data.career ?? data.carrera);
  const campus = asRecord(data.campus ?? data.sede);
  const commission = asRecord(data.commission ?? data.comision);

  return {
    career:
      asString(data.careerName) ||
      asString(data.carreraNombre) ||
      asString(career.name) ||
      asString(career.nombre) ||
      asString(data.career) ||
      asString(data.carrera) ||
      'Ingenieria de Software',
    year:
      asString(data.yearName) ||
      asString(data.academicYear) ||
      asString(data.year) ||
      asString(data.anio) ||
      '2do año',
    commission:
      asString(data.commissionName) ||
      asString(data.comisionNombre) ||
      asString(commission.name) ||
      asString(commission.nombre) ||
      asString(data.commission) ||
      asString(data.comision) ||
      'Comision B',
    campus:
      asString(data.campusName) ||
      asString(data.sedeNombre) ||
      asString(campus.name) ||
      asString(campus.nombre) ||
      asString(data.campus) ||
      asString(data.sede) ||
      'Sede Yerba Buena',
  };
};

export const scheduleService = {
  getMyContext: async () => {
    const response = await apiClient.get<unknown>('/Users/me/context', {
      headers: getAuthHeaders(),
    });

    return mapContextFromApi(response.data);
  },

  getCareers: async (): Promise<CareerDto[]> => {
    const response = await apiClient.get<unknown>('/Carreras', {
      headers: getAuthHeaders(),
    });

    return unwrapArray(response.data).map(mapCareerFromApi).filter((career) => career.id > 0);
  },

  getSchedules: async (params?: { careerId?: string | number; dia?: string }): Promise<ScheduleDto[]> => {
    try {
      const response = await apiClient.get<unknown>('/horarios', {
        params,
        headers: getAuthHeaders(),
      });
      return unwrapArray(response.data).map(mapScheduleFromApi);
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        console.error('[scheduleService.getSchedules] Error del servidor. Detalles de validación:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('[scheduleService.getSchedules] Error al obtener horarios:', error);
      }
      throw error;
    }
  },

  createSchedule: async (data: CreateScheduleRequest): Promise<ScheduleDto> => {
    try {
      const response = await apiClient.post<unknown>('/horarios', data, {
        headers: getAuthHeaders(),
      });
      return mapScheduleFromApi(response.data);
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        console.error('[scheduleService.createSchedule] Error 400 del servidor. Detalles de validación:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('[scheduleService.createSchedule] Error al crear horario:', error);
      }
      throw error;
    }
  },
};