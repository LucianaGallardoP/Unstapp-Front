import { useCallback, useEffect, useMemo, useState } from 'react';
import { scheduleService } from '../services/scheduleService';
import type { CareerDto, ScheduleDto } from '../types/schedule.dtos';

export type WeekDayId = 'lun' | 'mar' | 'mie' | 'jue' | 'vie';

export interface StudentContext {
  career: string;
  year: string;
  commission: string;
  campus: string;
}

export interface ScheduleClass {
  id: number;
  day: WeekDayId;
  startTime: string;
  durationHours: number;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}

export interface CreateScheduleClassInput {
  day: WeekDayId;
  subject: string;
  startTime: string;
  durationHours: number;
  teacher: string;
  room: string;
}

export const weekDays: { id: WeekDayId; label: string }[] = [
  { id: 'lun', label: 'LUN' },
  { id: 'mar', label: 'MAR' },
  { id: 'mie', label: 'MIE' },
  { id: 'jue', label: 'JUE' },
  { id: 'vie', label: 'VIE' },
];

const defaultStudentContext: StudentContext = {
  career: 'Ingenieria de Software',
  year: '2do año',
  commission: 'Comision B',
  campus: 'Sede Yerba Buena',
};

const getTodayWeekDay = (): WeekDayId => {
  const day = new Date().getDay();

  if (day === 2) return 'mar';
  if (day === 3) return 'mie';
  if (day === 4) return 'jue';
  if (day === 5) return 'vie';

  return 'lun';
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const normalizeWeekDay = (value: string): WeekDayId => {
  const day = normalizeText(value);

  if (day.startsWith('mar')) return 'mar';
  if (day.startsWith('mie') || day.startsWith('wed')) return 'mie';
  if (day.startsWith('jue') || day.startsWith('thu')) return 'jue';
  if (day.startsWith('vie') || day.startsWith('fri')) return 'vie';

  return 'lun';
};

const mapScheduleClass = (schedule: ScheduleDto): ScheduleClass => ({
  id: schedule.id,
  day: normalizeWeekDay(schedule.day),
  startTime: schedule.startTime,
  durationHours: schedule.durationHours,
  subject: schedule.subject,
  teacher: schedule.professor,
  room: schedule.classroom,
  color: '#1E4E9D',
});

const getCareerContext = (career?: CareerDto): StudentContext => ({
  career: career?.name ?? defaultStudentContext.career,
  year: 'Año académico',
  commission: 'Administración',
  campus: 'Sede Yerba Buena',
});

export const useWeeklySchedule = (careerId?: string) => {
  const [selectedDay, setSelectedDay] = useState<WeekDayId>(() => getTodayWeekDay());
  const [scheduleClasses, setScheduleClasses] = useState<ScheduleClass[]>([]);
  const [currentStudentContext, setCurrentStudentContext] = useState<StudentContext>(defaultStudentContext);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  const selectedClasses = useMemo(
    () => scheduleClasses
      .filter((scheduleClass) => scheduleClass.day === selectedDay)
      .sort((firstClass, secondClass) => firstClass.startTime.localeCompare(secondClass.startTime)),
    [scheduleClasses, selectedDay],
  );

  const fetchSchedules = useCallback(async () => {
    try {
      const params = careerId ? { careerId } : { dia: selectedDay };
      const schedules = await scheduleService.getSchedules(params);
      setScheduleClasses(schedules.map(mapScheduleClass));
    } catch {
      setContextError('No se pudieron cargar los horarios.');
    }
  }, [careerId, selectedDay]);

  const addScheduleClass = async (newClass: CreateScheduleClassInput) => {
    if (!careerId) return;

    try {
      await scheduleService.createSchedule({
        careerId: Number(careerId),
        subject: newClass.subject,
        day: newClass.day,
        startTime: newClass.startTime,
        professor: newClass.teacher,
        classroom: newClass.room,
        durationHours: newClass.durationHours,
      });

      setSelectedDay(newClass.day);
      await fetchSchedules();
    } catch {
      setContextError('No se pudo crear la materia.');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    let isMounted = true;

    const loadContext = async () => {
      setIsContextLoading(true);
      setContextError(null);

      try {
        if (careerId) {
          const careers = await scheduleService.getCareers();
          const selectedCareer = careers.find((career) => String(career.id) === String(careerId));

          if (isMounted) {
            setCurrentStudentContext(getCareerContext(selectedCareer));
          }

          return;
        }

        const context = await scheduleService.getMyContext();

        if (isMounted) {
          setCurrentStudentContext(context);
        }
      } catch {
        if (isMounted) {
          setContextError('No se pudo cargar el contexto académico.');
          setCurrentStudentContext(careerId ? getCareerContext() : defaultStudentContext);
        }
      } finally {
        if (isMounted) {
          setIsContextLoading(false);
        }
      }
    };

    loadContext();

    return () => {
      isMounted = false;
    };
  }, [careerId]);

  return {
    studentContext: currentStudentContext,
    isContextLoading,
    contextError,
    weekDays,
    selectedDay,
    selectedClasses,
    addScheduleClass,
    setSelectedDay,
  };
};