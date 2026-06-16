import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { TopBar } from '../../../components/common/TopBar';
import { useWeeklySchedule } from '../hooks/useWeeklySchedule';
import { CreateSubjectModal } from './CreateSubjectModal';

const getIsCurrentUserAdmin = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return Array.isArray(roles) && roles.some((role) => String(role).toLowerCase().includes('admin'));
  } catch {
    return false;
  }
};

export const SchedulePage = () => {
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const isCurrentUserAdmin = getIsCurrentUserAdmin();
  const {
    studentContext,
    isContextLoading,
    contextError,
    weekDays,
    selectedDay,
    selectedClasses,
    addScheduleClass,
    setSelectedDay,
  } = useWeeklySchedule();

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-4 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-6 lg:max-w-3xl">
        <section className="mx-auto w-full max-w-[430px] sm:max-w-[560px] md:max-w-[600px]">
          <article className="relative rounded-[16px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.13)]">
            {isCurrentUserAdmin && (
              <button
                type="button"
                onClick={() => setIsCreateSubjectModalOpen(true)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#1E4E9D] transition-colors hover:bg-[#EFF6FF]"
                aria-label="Agregar materia"
              >
                <Plus size={19} strokeWidth={2.5} />
              </button>
            )}

            <div className="flex items-center gap-3 pr-8">
              <div className="h-14 w-14 shrink-0 rounded-[10px] bg-[#1E4E9D]" />

              <div className="min-w-0 flex-1">
                {isContextLoading && (
                  <p className="mb-1 text-[8px] font-black uppercase text-[#808080]">
                    Cargando contexto...
                  </p>
                )}
                <h1 className="text-[12px] font-black uppercase leading-4 text-black sm:text-[14px]">
                  {studentContext.career}
                </h1>

                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-[9px] font-black uppercase leading-3 text-[#1E4E9D]">
                      {studentContext.year}
                    </p>
                    <p className="text-[7px] font-black uppercase leading-3 text-[#526174]">
                      {studentContext.commission}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase leading-3 text-[#526174]">
                      Sede
                    </p>
                    <p className="text-[7px] font-black uppercase leading-3 text-[#526174]">
                      {studentContext.campus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <span className="h-5 w-8 rounded bg-gray-200" />
              <span className="h-5 w-8 rounded bg-gray-200" />
            </div>

            {contextError && (
              <p className="mt-3 rounded-lg bg-[#E7000B]/10 px-3 py-2 text-[10px] font-bold text-[#E7000B]">
                {contextError}
              </p>
            )}
          </article>

          <nav className="mt-5" aria-label="Selector semanal">
            <ul className="grid grid-cols-5 items-center gap-2">
              {weekDays.map((day) => {
                const isActive = selectedDay === day.id;

                return (
                  <li key={day.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day.id)}
                      className={`h-9 w-full rounded-full text-[11px] font-black transition-colors ${
                        isActive
                          ? 'bg-[#1E4E9D] text-white shadow-[0_8px_18px_rgba(30,78,157,0.24)]'
                          : 'bg-white text-[#526174] hover:bg-[#EFF6FF] hover:text-[#1E4E9D]'
                      }`}
                      aria-pressed={isActive}
                    >
                      {day.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-wide text-[#526174]">
                Cronograma del día
              </h2>
              <span className="text-[9px] font-black uppercase text-[#1E4E9D]">
                {selectedClasses.length} {selectedClasses.length === 1 ? 'materia' : 'materias'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {selectedClasses.map((scheduleClass) => (
                <article
                  key={scheduleClass.id}
                  className="flex min-h-[78px] items-center gap-3 rounded-[12px] bg-white px-3 py-3 shadow-[0_7px_18px_rgba(15,23,42,0.14)]"
                >
                  <span
                    className="h-12 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: scheduleClass.color }}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-black leading-4 text-black">
                      {scheduleClass.startTime}
                    </p>
                    <p className="mt-0.5 text-[8px] font-bold uppercase text-[#808080]">
                      {scheduleClass.durationHours} {scheduleClass.durationHours === 1 ? 'hora' : 'horas'}
                    </p>
                    <h3 className="mt-1 text-[12px] font-black uppercase leading-4 text-black">
                      {scheduleClass.subject}
                    </h3>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="truncate text-[8px] font-bold uppercase text-[#808080]">
                        {scheduleClass.teacher}
                      </p>
                      <p className="shrink-0 text-[8px] font-bold uppercase text-[#808080]">
                        {scheduleClass.room}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              {selectedClasses.length === 0 && (
                <p className="rounded-[12px] bg-white px-4 py-5 text-center text-[12px] font-bold text-[#526174] shadow-[0_7px_18px_rgba(15,23,42,0.1)]">
                  No hay clases cargadas para este día.
                </p>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-[14px] bg-[#4c1d95] px-4 py-4 text-center text-white shadow-[0_10px_24px_rgba(76,29,149,0.26)]">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              <h2 className="text-[12px] font-black uppercase">
                ¿Problemas con tu horario?
              </h2>
            </div>
            <p className="mx-auto mt-1 max-w-[320px] text-[8px] font-bold uppercase leading-3 text-white/80">
              Si notas una inconsistencia, reportala para que administración revise el cronograma.
            </p>
            <button
              type="button"
              className="mt-3 rounded-full bg-white px-6 py-1.5 text-[9px] font-black uppercase text-[#4c1d95]"
            >
              Reportar
            </button>
          </section>
        </section>
      </main>

      {isCreateSubjectModalOpen && (
        <CreateSubjectModal
          onClose={() => setIsCreateSubjectModalOpen(false)}
          onCreate={addScheduleClass}
        />
      )}

      <BottomNavigation activeTab="horario" />
    </div>
  );
};