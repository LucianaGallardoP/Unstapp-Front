import { useEffect, useMemo, useState } from 'react';
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
  subject: string;
  teacher: string;
  room: string;
  color: string;
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
  year: '2do ano',
  commission: 'Comision B',
  campus: 'Sede Yerba Buena',
};

const classes: ScheduleClass[] = [
  {
    id: 1,
    day: 'lun',
    startTime: '09:00',
    subject: 'Advanced Algorithms',
    teacher: 'Prof. Matias Rodriguez',
    room: 'Lab 2',
    color: '#1E4E9D',
  },
  {
    id: 2,
    day: 'lun',
    startTime: '14:15',
    subject: 'Database Systems',
    teacher: 'Prof. Agustina Gomez',
    room: 'Lab 1',
    color: '#ffb000',
  },
  {
    id: 3,
    day: 'lun',
    startTime: '17:45',
    subject: 'Software Architecture',
    teacher: 'Prof. Pedro Gomez',
    room: 'Aula 4',
    color: '#E7000B',
  },
  {
    id: 4,
    day: 'mar',
    startTime: '10:30',
    subject: 'Database Systems',
    teacher: 'Prof. Agustina Gomez',
    room: 'Lab 1',
    color: '#ffb000',
  },
  {
    id: 5,
    day: 'mar',
    startTime: '15:15',
    subject: 'Seminario Informatico',
    teacher: 'Prof. Roberto Suarez',
    room: 'Aula 1',
    color: '#f4ea00',
  },
  {
    id: 6,
    day: 'mie',
    startTime: '08:00',
    subject: 'Advanced Algorithms',
    teacher: 'Prof. Matias Rodriguez',
    room: 'Lab 2',
    color: '#1E4E9D',
  },
  {
    id: 7,
    day: 'mie',
    startTime: '13:45',
    subject: 'Software Architecture',
    teacher: 'Prof. Pedro Gomez',
    room: 'Aula 4',
    color: '#E7000B',
  },
  {
    id: 8,
    day: 'mie',
    startTime: '17:25',
    subject: 'Database Systems',
    teacher: 'Prof. Agustina Gomez',
    room: 'Lab 1',
    color: '#ffb000',
  },
  {
    id: 9,
    day: 'jue',
    startTime: '15:15',
    subject: 'Seminario Informatico',
    teacher: 'Prof. Roberto Suarez',
    room: 'Aula 1',
    color: '#f4ea00',
  },
  {
    id: 10,
    day: 'vie',
    startTime: '08:35',
    subject: 'Seminario Informatico',
    teacher: 'Prof. Roberto Suarez',
    room: 'Aula 1',
    color: '#f4ea00',
  },
  {
    id: 11,
    day: 'vie',
    startTime: '11:20',
    subject: 'Advanced Algorithms',
    teacher: 'Prof. Matias Rodriguez',
    room: 'Lab 2',
    color: '#1E4E9D',
  },
  {
    id: 12,
    day: 'vie',
    startTime: '15:00',
    subject: 'Database Systems',
    teacher: 'Prof. Agustina Gomez',
    room: 'Lab 1',
    color: '#ffb000',
  },
  {
    id: 13,
    day: 'vie',
    startTime: '17:45',
    subject: 'Software Architecture',
    teacher: 'Prof. Pedro Gomez',
    room: 'Aula 4',
    color: '#E7000B',
  },
];

const getTodayWeekDay = (): WeekDayId => {
  const day = new Date().getDay();

  if (day === 2) return 'mar';
  if (day === 3) return 'mie';
  if (day === 4) return 'jue';
  if (day === 5) return 'vie';

  return 'lun';
};

export const useWeeklySchedule = () => {
  const [selectedDay, setSelectedDay] = useState<WeekDayId>(() => getTodayWeekDay());
  const [currentStudentContext, setCurrentStudentContext] = useState<StudentContext>(studentContext);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  const selectedClasses = useMemo(
    () => classes.filter((scheduleClass) => scheduleClass.day === selectedDay),
    [selectedDay],
  );

  useEffect(() => {
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
          setContextError('No se pudo cargar el contexto academico.');
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
  }, []);

  return {
    studentContext: currentStudentContext,
    isContextLoading,
    contextError,
    weekDays,
    selectedDay,
    selectedClasses,
    setSelectedDay,
  };
};
