import { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '../../../i18n';
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
  year?: string;
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
  career: 'Ingeniería de Software',
  year: '2do año',
  commission: 'Comisión B',
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

const getScheduleColor = (startTime: string) => {
  const [hourValue] = startTime.split(':');
  const hour = Number(hourValue);

  if (!Number.isFinite(hour)) return '#1E4E9D';
  if (hour >= 14 && hour < 16) return '#ffde59';
  if (hour >= 16 && hour < 18) return '#FF751F';
  if (hour >= 18 && hour < 20) return '#91210e';

  return '#1E4E9D';
};

const mapScheduleClass = (schedule: ScheduleDto): ScheduleClass => ({
  id: schedule.id,
  day: normalizeWeekDay(schedule.day),
  year: schedule.year,
  startTime: schedule.startTime,
  durationHours: schedule.durationHours,
  subject: schedule.subject,
  teacher: schedule.professor,
  room: schedule.classroom,
  color: getScheduleColor(schedule.startTime),
});

const getCareerContext = (career?: CareerDto): StudentContext => ({
  career: career?.name ?? defaultStudentContext.career,
  year: 'Año académico',
  commission: 'Administración',
  campus: 'Sede Yerba Buena',
});

export const useWeeklySchedule = (careerId?: string, selectedYear?: string) => {
  const [selectedDay, setSelectedDay] = useState<WeekDayId>(() => getTodayWeekDay());
  const [scheduleClasses, setScheduleClasses] = useState<ScheduleClass[]>([]);
  const [currentStudentContext, setCurrentStudentContext] = useState<StudentContext>(defaultStudentContext);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  const selectedClasses = useMemo(
    () => scheduleClasses
      .filter((sc) => sc.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [scheduleClasses, selectedDay],
  );

  const fetchSchedules = useCallback(async (dayOverride?: WeekDayId) => {
    const day = dayOverride ?? selectedDay;

    try {
      const params = careerId
        ? { careerId, dia: day, ...(selectedYear ? { year: selectedYear, anio: selectedYear } : {}) }
        : { dia: day };
      const schedules = await scheduleService.getSchedules(params);
      const visibleSchedules = selectedYear
        ? schedules.filter((schedule) => !schedule.year || String(schedule.year).includes(selectedYear))
        : schedules;

      setScheduleClasses(visibleSchedules.map((schedule) => ({ ...mapScheduleClass(schedule), day })));
    } catch {
      setContextError(i18n.t('schedule.loadError'));
    }
  }, [careerId, selectedDay, selectedYear]);

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
      await fetchSchedules(newClass.day);
    } catch {
      setContextError(i18n.t('schedule.createError'));
    }
  };

  const updateScheduleClass = async (classId: number, values: CreateScheduleClassInput) => {
    if (!careerId) return;

    try {
      await scheduleService.updateSchedule(classId, {
        careerId: Number(careerId),
        subject: values.subject,
        day: values.day,
        startTime: values.startTime,
        professor: values.teacher,
        classroom: values.room,
        durationHours: values.durationHours,
      });

      setScheduleClasses((currentClasses) =>
        currentClasses.map((scheduleClass) =>
          scheduleClass.id === classId
            ? {
                ...scheduleClass,
                day: values.day,
                subject: values.subject,
                startTime: values.startTime,
                durationHours: values.durationHours,
                teacher: values.teacher,
                room: values.room,
                color: getScheduleColor(values.startTime),
              }
            : scheduleClass,
        ),
      );
      setSelectedDay(values.day);
    } catch {
      setContextError(i18n.t('schedule.updateError'));
      throw new Error(i18n.t('schedule.updateError'));
    }
  };

  const removeScheduleClass = async (classId: number) => {
    try {
      await scheduleService.deleteSchedule(classId);
      setScheduleClasses((currentClasses) => currentClasses.filter((scheduleClass) => scheduleClass.id !== classId));
    } catch {
      setContextError(i18n.t('schedule.deleteError'));
      throw new Error(i18n.t('schedule.deleteError'));
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
          setContextError(i18n.t('schedule.contextLoadError'));
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
    updateScheduleClass,
    removeScheduleClass,
    setSelectedDay,
    fetchSchedules,
  };
};
