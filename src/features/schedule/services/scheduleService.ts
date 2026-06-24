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
    const response = await apiClient.get<CareerDto[]>('/Carreras', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getSchedules: async (params?: { careerId?: string | number; dia?: string }): Promise<ScheduleDto[]> => {
    const response = await apiClient.get<ScheduleDto[]>('/horarios', {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  createSchedule: async (data: CreateScheduleRequest): Promise<ScheduleDto> => {
    const response = await apiClient.post<ScheduleDto>('/horarios', data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
