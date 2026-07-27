import { apiClient } from '../../../services/apiClient';
import type { StudentContext } from '../hooks/useWeeklySchedule';
import type { CareerDto, ScheduleDto, CreateScheduleRequest, UpdateScheduleRequest } from '../types/schedule.dtos';

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

const asOptionalString = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);

  return undefined;
};

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  return fallback;
};

const unwrapArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const root = asRecord(value);
  const candidates = [
    root.schedules,
    root.horarios,
    root.items,
    root.data,
    root.value,
    root.results,
    root.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;

    const nestedCandidate: unknown[] = unwrapArray(candidate);

    if (nestedCandidate.length > 0) return nestedCandidate;
  }

  return [];
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
    year:
      asOptionalString(career.yearName) ||
      asOptionalString(career.academicYear) ||
      asOptionalString(career.year) ||
      asOptionalString(career.anio) ||
      asOptionalString(career['año']),
  };
};

const mapScheduleFromApi = (apiSchedule: unknown): ScheduleDto => {
  const root = asRecord(apiSchedule);
  const schedule = asRecord(root.data ?? root.value ?? root.horario ?? root.schedule ?? root);

  return {
    id: asNumber(schedule.id ?? schedule.scheduleId ?? schedule.horarioId, Date.now()),
    careerId: asNumber(schedule.careerId ?? schedule.carreraId),
    year:
      asOptionalString(schedule.yearName) ||
      asOptionalString(schedule.academicYear) ||
      asOptionalString(schedule.year) ||
      asOptionalString(schedule.anio) ||
      asOptionalString(schedule['año']),
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
      'Ingeniería de Software',
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
      'Comisión B',
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

type ScheduleQueryParams = {
  careerId?: string | number;
  dia?: string;
  year?: string | number;
};

const getSchedulePrimaryParams = (params?: ScheduleQueryParams): ScheduleQueryParams | undefined => {
  if (!params) return undefined;

  if (params.careerId !== undefined) return { careerId: params.careerId };
  if (params.dia) return { dia: params.dia };

  return params;
};

const getScheduleFallbackParams = (params?: ScheduleQueryParams): ScheduleQueryParams | undefined => {
  if (!params) return undefined;

  return {
    ...(params.careerId !== undefined ? { careerId: params.careerId } : {}),
    ...(params.dia ? { dia: params.dia } : {}),
    ...(params.year !== undefined ? { year: params.year } : {}),
  };
};

const shouldRetryScheduleRequest = (error: any, params?: ScheduleQueryParams) => {
  const status = error?.response?.status;
  const data = asRecord(error?.response?.data);
  const errors = asRecord(data.errors);
  const code = asString(data.code);

  if (status !== 400 || !params) return false;
  if (code === 'YEAR_REQUIRED' && params.year !== undefined) return true;
  if (errors.dia && params.dia) return true;
  if (errors.year && params.year !== undefined) return true;

  return false;
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

  getSchedules: async (params?: ScheduleQueryParams): Promise<ScheduleDto[]> => {
    const primaryParams = getSchedulePrimaryParams(params);

    try {
      const response = await apiClient.get<unknown>('/horarios', {
        params: primaryParams,
        headers: getAuthHeaders(),
      });
      return unwrapArray(response.data).map(mapScheduleFromApi);
    } catch (error: any) {
      const fallbackParams = getScheduleFallbackParams(params);

      if (shouldRetryScheduleRequest(error, fallbackParams)) {
        try {
          const response = await apiClient.get<unknown>('/horarios', {
            params: fallbackParams,
            headers: getAuthHeaders(),
          });
          return unwrapArray(response.data).map(mapScheduleFromApi);
        } catch (fallbackError: any) {
          if (fallbackError && fallbackError.response && fallbackError.response.data) {
            console.error('[scheduleService.getSchedules] Error del servidor:', JSON.stringify(fallbackError.response.data, null, 2));
          } else {
            console.error('[scheduleService.getSchedules] Error al obtener horarios:', fallbackError);
          }
          throw fallbackError;
        }
      }

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
        console.error('[scheduleService.createSchedule] Error del servidor. Detalles de validación:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('[scheduleService.createSchedule] Error al crear horario:', error);
      }
      throw error;
    }
  },

  updateSchedule: async (scheduleId: number | string, data: UpdateScheduleRequest): Promise<ScheduleDto> => {
    try {
      const response = await apiClient.patch<unknown>(`/horarios/${scheduleId}`, data, {
        headers: getAuthHeaders(),
      });
      return mapScheduleFromApi(response.data);
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        console.error('[scheduleService.updateSchedule] Error del servidor. Detalles de validación:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('[scheduleService.updateSchedule] Error al actualizar horario:', error);
      }
      throw error;
    }
  },

  deleteSchedule: async (scheduleId: number | string): Promise<void> => {
    try {
      await apiClient.delete(`/horarios/${scheduleId}`, {
        headers: getAuthHeaders(),
      });
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        console.error('[scheduleService.deleteSchedule] Error del servidor. Detalles de validación:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  importSchedules: async (file: File): Promise<{ message: string; count?: number }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<any>('/horarios/import', formData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        console.error('[scheduleService.importSchedules] Error del servidor:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('[scheduleService.importSchedules] Error al importar horarios:', error);
      }
      throw error;
    }
  },
};
