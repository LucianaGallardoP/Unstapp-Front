import { useEffect, useMemo, useState, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';

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

const studentContext: StudentContext = {
  career: 'Ingenieria de Software',
  year: '2do año',
  commission: 'Comision B',
  campus: 'Sede Yerba Buena',
};

const adminCareerContexts: Record<string, StudentContext> = {
  'tec-desarrollo-software': {
    career: 'Tec. Desarrollo de Software',
    year: 'Año 3',
    commission: 'Comision A',
    campus: 'Sede Yerba Buena',
  },
  'ing-inteligencia-artificial': {
    career: 'Ing. en Inteligencia Artificial',
    year: 'Año 2',
    commission: 'Comision A',
    campus: 'Sede Yerba Buena',
  },
  'ing-software': {
    career: 'Ingenieria de Software',
    year: '2do año',
    commission: 'Comision B',
    campus: 'Sede Yerba Buena',
  },
};

// Remove static classes array

const getTodayWeekDay = (): WeekDayId => {
  const day = new Date().getDay();

  if (day === 2) return 'mar';
  if (day === 3) return 'mie';
  if (day === 4) return 'jue';
  if (day === 5) return 'vie';

  return 'lun';
};

export const useWeeklySchedule = (careerId?: string) => {
  const selectedCareerContext = careerId ? (adminCareerContexts[careerId] ?? studentContext) : studentContext;
  const [selectedDay, setSelectedDay] = useState<WeekDayId>(() => getTodayWeekDay());
  const [scheduleClasses, setScheduleClasses] = useState<ScheduleClass[]>([]);
  const [currentStudentContext, setCurrentStudentContext] = useState<StudentContext>(selectedCareerContext);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  const selectedClasses = useMemo(
    () => scheduleClasses
      .filter((scheduleClass) => scheduleClass.day === selectedDay)
      .sort((firstClass, secondClass) => firstClass.startTime.localeCompare(secondClass.startTime)),
    [scheduleClasses, selectedDay],
  );

  const addScheduleClass = async (newClass: CreateScheduleClassInput) => {
    if (!careerId) return;

    try {
      const createdDto = await scheduleService.createSchedule({
        careerId: Number(careerId),
        subject: newClass.subject,
        day: newClass.day,
        startTime: newClass.startTime,
        professor: newClass.teacher,
        classroom: newClass.room,
        durationHours: newClass.durationHours,
      });

      setScheduleClasses((currentClasses) => [
        ...currentClasses,
        {
          id: createdDto.id ?? Date.now(),
          day: newClass.day,
          startTime: newClass.startTime,
          durationHours: newClass.durationHours,
          subject: newClass.subject,
          teacher: newClass.teacher,
          room: newClass.room,
          color: '#1E4E9D',
        },
      ]);
      setSelectedDay(newClass.day);
    } catch (e) {
      console.error("Error al crear la materia", e);
    }
  };

  const fetchSchedules = useCallback(async () => {
    try {
      const params = careerId ? { careerId } : { dia: selectedDay };
      const data = await scheduleService.getSchedules(params);
      const mappedClasses = data.map(dto => ({
        id: dto.id,
        day: dto.day.toLowerCase().substring(0, 3) as WeekDayId,
        startTime: dto.startTime,
        durationHours: dto.durationHours,
        subject: dto.subject,
        teacher: dto.professor,
        room: dto.classroom,
        color: '#1E4E9D',
      }));
      setScheduleClasses(mappedClasses);
    } catch (e) {
      setContextError('No se pudieron cargar los horarios.');
    }
  }, [careerId, selectedDay]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    if (careerId) {
      setCurrentStudentContext(selectedCareerContext);
      setContextError(null);
      setIsContextLoading(false);

      return;
    }

    let isMounted = true;

    const loadContext = async () => {
      setIsContextLoading(true);
      setContextError(null);

      try {
        const context = await scheduleService.getMyContext();

        if (isMounted) {
          setCurrentStudentContext(context);
        }
      } catch {
        if (isMounted) {
          setContextError('No se pudo cargar el contexto académico.');
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
  }, [careerId, selectedCareerContext]);

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