import { useMemo, useState } from 'react';

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const areSameDay = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const buildMonthDays = (visibleDate: Date, today: Date, selectedDate: Date): CalendarDay[] => {
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayFirstOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const days: CalendarDay[] = [];

  // Completa los espacios previos para que el primer dia caiga en su columna.
  for (let index = mondayFirstOffset - 1; index >= 0; index -= 1) {
    const date = new Date(year, month, -index);

    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: areSameDay(date, today),
      isSelected: areSameDay(date, selectedDate),
    });
  }

  // Agrega todos los dias reales del mes seleccionado.
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: areSameDay(date, today),
      isSelected: areSameDay(date, selectedDate),
    });
  }

  // Completa la ultima fila para mantener la grilla estable.
  while (days.length % 7 !== 0) {
    const date = new Date(year, month, daysInMonth + (days.length % 7 === 0 ? 0 : days.length - mondayFirstOffset - daysInMonth + 1));

    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: areSameDay(date, today),
      isSelected: areSameDay(date, selectedDate),
    });
  }

  return days;
};

export const useMonthlyCalendar = () => {
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const today = useMemo(() => new Date(), []);

  const calendarDays = useMemo(
    () => buildMonthDays(visibleDate, today, selectedDate),
    [visibleDate, today, selectedDate],
  );

  const goToPreviousMonth = () => {
    setVisibleDate((currentDate) => {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setSelectedDate(nextDate);
      return nextDate;
    });
  };

  const goToNextMonth = () => {
    setVisibleDate((currentDate) => {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setSelectedDate(nextDate);
      return nextDate;
    });
  };

  const selectDay = (date: Date) => {
    setSelectedDate(date);
    setVisibleDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return {
    calendarDays,
    monthTitle: monthNames[visibleDate.getMonth()],
    selectedDate,
    visibleYear: visibleDate.getFullYear(),
    goToPreviousMonth,
    goToNextMonth,
    selectDay,
  };
};
