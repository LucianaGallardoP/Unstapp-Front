import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { TopBar } from '../../../components/common/TopBar';
import { useMonthlyCalendar } from '../hooks/useMonthlyCalendar';

const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const eventTypeStyles = {
  classes: 'bg-[#4bedb6]/20 text-[#1d8c57]',
  event: 'bg-[#ffde59]/30 text-[#91210e]',
};

const dailyEvents = [
  {
    id: 1,
    title: 'Sistemas Operativos Lab 3',
    type: 'classes',
  },
  {
    id: 2,
    title: 'Feria de Empleo Edicion Tech',
    type: 'event',
  },
] as const;

const viewFilters = [
  {
    id: 'exams',
    label: 'Examenes',
    color: '#91210e',
    count: 0,
  },
  {
    id: 'classes',
    label: 'Clases',
    color: '#4bedb6',
    count: 1,
  },
  {
    id: 'events',
    label: 'Eventos',
    color: '#ffde59',
    count: 1,
  },
  {
    id: 'holidays',
    label: 'Feriados',
    color: '#7ed957',
    count: 0,
  },
] as const;

const getMonthInitials = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', { month: 'short' })
    .format(date)
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase();

export const CalendarPage = () => {
  const {
    calendarDays,
    monthTitle,
    selectedDate,
    visibleYear,
    goToPreviousMonth,
    goToNextMonth,
    selectDay,
  } = useMonthlyCalendar();

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-5 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-7 lg:max-w-3xl">
        <section className="mx-auto w-full max-w-[430px] sm:max-w-[560px] md:max-w-[600px]">
          <header className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] font-black leading-none tracking-tight text-black sm:text-[34px]">
                {monthTitle}
              </h1>
              <p className="mt-1 text-[8px] font-black uppercase leading-3 text-[#155DFC] sm:text-[10px]">
                Agenda Académica {visibleYear}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#526174] transition-colors hover:bg-[#1E4E9D] hover:text-white"
                aria-label="Ver mes anterior"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#526174] transition-colors hover:bg-[#1E4E9D] hover:text-white"
                aria-label="Ver mes siguiente"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </header>

          <section
            className="mt-5 rounded-[22px] bg-white px-4 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.16)] sm:px-6 sm:py-6"
            aria-label={`Calendario de ${monthTitle} ${visibleYear}`}
          >
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((weekDay) => (
                <span
                  key={weekDay}
                  className="flex h-8 items-center justify-center text-[10px] font-black uppercase text-gray-300 sm:text-[11px]"
                >
                  {weekDay}
                </span>
              ))}

              {calendarDays.map((day) => (
                <button
                  key={day.date.toISOString()}
                  type="button"
                  onClick={() => selectDay(day.date)}
                  className={`mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-[11px] font-black transition-colors sm:max-w-12 sm:text-[12px] ${
                    day.isToday
                      ? 'bg-[#155DFC] text-white shadow-[0_8px_18px_rgba(21,93,252,0.28)]'
                      : day.isSelected
                        ? 'bg-[#EFF6FF] text-[#155DFC] ring-2 ring-[#155DFC]/30'
                      : day.isCurrentMonth
                        ? 'text-[#526174] hover:bg-gray-100'
                        : 'text-gray-200'
                  }`}
                  aria-current={day.isToday ? 'date' : undefined}
                  aria-label={`Seleccionar dia ${day.dayNumber}`}
                >
                  {day.dayNumber}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-black uppercase tracking-tight text-black sm:text-[20px]">
                Eventos del dia
              </h2>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#1E4E9D] transition-colors hover:bg-[#EFF6FF]"
                aria-label="Crear nuevo evento"
              >
                <Plus size={18} strokeWidth={2.4} />
              </button>
            </header>

            <div className="mt-3 flex flex-col gap-3">
              {dailyEvents.map((event) => (
                <article
                  key={event.id}
                  className="flex min-h-[70px] items-center gap-3 rounded-[10px] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.14)]"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full text-center ${eventTypeStyles[event.type]}`}
                    aria-label={`Fecha del evento ${selectedDate.getDate()} de ${getMonthInitials(selectedDate)}`}
                  >
                    <span className="text-[8px] font-black leading-none">
                      {getMonthInitials(selectedDate)}
                    </span>
                    <span className="mt-0.5 text-[12px] font-black leading-none">
                      {selectedDate.getDate()}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-[11px] font-black uppercase leading-4 text-[#1F2937] sm:text-[12px]">
                    {event.title}
                  </h3>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-[10px] bg-[#123866] px-4 py-4 text-white shadow-[0_10px_24px_rgba(15,23,42,0.24)]">
            <h2 className="text-[9px] font-black uppercase tracking-wide text-white sm:text-[10px]">
              Filtros de Vista
            </h2>

            <ul className="mt-3 flex flex-col gap-2.5">
              {viewFilters.map((filter) => (
                <li
                  key={filter.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: filter.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[9px] font-black uppercase sm:text-[10px]">
                      {filter.label}
                    </span>
                  </div>

                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#808080] px-1.5 text-[9px] font-black leading-none text-white">
                    {filter.count}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </section>
      </main>

      <BottomNavigation activeTab="calendario" />
    </div>
  );
};
