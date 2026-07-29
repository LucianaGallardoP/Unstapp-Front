import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { TopBar } from '../../../components/common/TopBar';
import { useWeeklySchedule, type CreateScheduleClassInput, type ScheduleClass } from '../hooks/useWeeklySchedule';
import { CreateSubjectModal } from './CreateSubjectModal';
import { useLanguage } from '../../../store/languageContext';

const getIsCurrentUserAdmin = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return Array.isArray(roles) && roles.some((role) => String(role).toLowerCase().includes('admin'));
  } catch {
    return false;
  }
};

const getYearBadgeParts = (yearText: string, yearLabel: string) => {
  const normalizedYear = yearText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const numberMatch = normalizedYear.match(/\b([1-6])\b/) ?? normalizedYear.match(/([1-6])(?:ro|do|er|to|st|nd|rd|th)/);
  const yearNumber = numberMatch?.[1] ?? '1';

  return {
    ordinal: `${yearNumber}\u00b0`,
    label: yearLabel,
  };
};

export const SchedulePage = () => {
  const { language, t } = useLanguage();
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduleClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<ScheduleClass | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState('1');
  const { careerId } = useParams<{ careerId?: string }>();
  const navigate = useNavigate();
  const isCurrentUserAdmin = getIsCurrentUserAdmin();
  const shouldShowYearFilters = Boolean(isCurrentUserAdmin && careerId);
  const {
    studentContext,
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
  } = useWeeklySchedule(careerId, shouldShowYearFilters ? selectedYearFilter : undefined);
  const visibleWeekDays = weekDays.map((day) => ({
    ...day,
    label: language === 'en'
      ? ({
          lun: 'MOND',
          mar: 'TUES',
          mie: 'WEDN',
          jue: 'THUR',
          vie: 'FRID',
        } as const)[day.id]
      : day.label,
  }));
  const displayStudentContext = {
    ...studentContext,
    year:
      studentContext.year === 'Año académico' || studentContext.year === 'AÃ±o acadÃ©mico'
        ? t('schedule.academicYear')
        : studentContext.year === '2do año' || studentContext.year === '2do aÃ±o'
          ? t('schedule.defaultYear')
          : studentContext.year,
    commission:
      studentContext.commission === 'Administración' || studentContext.commission === 'AdministraciÃ³n'
        ? t('schedule.administration')
        : studentContext.commission === 'Comisión B' || studentContext.commission === 'ComisiÃ³n B'
          ? t('schedule.defaultCommission')
          : studentContext.commission,
    career:
      studentContext.career === 'Ingeniería de Software' || studentContext.career === 'IngenierÃ­a de Software'
        ? t('schedule.defaultCareer')
        : studentContext.career,
  };
  const hasAcademicDetails = Boolean(
    displayStudentContext.year ||
    displayStudentContext.commission ||
    displayStudentContext.campus,
  );
  const yearBadge = displayStudentContext.year
    ? getYearBadgeParts(displayStudentContext.year, t('schedule.yearBadgeLabel'))
    : null;

  const handleEdit = async (values: CreateScheduleClassInput) => {
    if (!editingClass) return;

    await updateScheduleClass(editingClass.id, values);
  };

  const handleDelete = async () => {
    if (!classToDelete) return;

    await removeScheduleClass(classToDelete.id);
    setClassToDelete(null);
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-4 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-6 lg:max-w-3xl">
        <section className="mx-auto w-full max-w-[430px] sm:max-w-[560px] md:max-w-[600px]">
          {isCurrentUserAdmin && careerId && (
            <button
              type="button"
              onClick={() => navigate('/horario')}
              className="mb-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase text-[#1E4E9D] shadow-sm transition-colors hover:bg-[#EFF6FF]"
            >
              <ChevronLeft size={15} />
              {t('schedule.backToCareers')}
            </button>
          )}

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
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#1E4E9D] p-1.5">
                <img
                  src="/UNSTA-logo.png"
                  alt="UNSTA"
                  className="h-full w-full object-contain brightness-0 invert"
                />
              </div>

              <div className="min-w-0 flex-1">
                {isContextLoading && (
                  <p className="mb-1 text-[8px] font-black uppercase text-[#808080]">
                    {t('schedule.loadingContext')}
                  </p>
                )}
                <h1 className="text-[12px] font-black uppercase leading-4 text-black sm:text-[14px]">
                  {displayStudentContext.career || t('schedule.contextUnavailable')}
                </h1>

                {hasAcademicDetails && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                    {(displayStudentContext.year || displayStudentContext.commission) && (
                      <div>
                        {displayStudentContext.year && (
                          <p className="text-[9px] font-black uppercase leading-3 text-[#1E4E9D]">
                            {displayStudentContext.year}
                          </p>
                        )}
                        {displayStudentContext.commission && (
                          <p className="text-[7px] font-black uppercase leading-3 text-[#526174]">
                            {displayStudentContext.commission}
                          </p>
                        )}
                      </div>
                    )}
                    {displayStudentContext.campus && (
                      <div>
                        <p className="text-[9px] font-black uppercase leading-3 text-[#526174]">
                          {t('schedule.campus')}
                        </p>
                        <p className="text-[7px] font-black uppercase leading-3 text-[#526174]">
                          {displayStudentContext.campus}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {yearBadge && (
              <div className="mt-3 flex gap-2">
                <span className="flex h-5 w-8 items-center justify-center rounded bg-white text-[9px] font-black uppercase text-[#1E4E9D] shadow-sm ring-1 ring-[#D8E0EE]">
                  {yearBadge.ordinal}
                </span>
                <span className="flex h-5 w-8 items-center justify-center rounded bg-white text-[7px] font-black uppercase text-[#1E4E9D] shadow-sm ring-1 ring-[#D8E0EE]">
                  {yearBadge.label}
                </span>
              </div>
            )}

            {contextError && (
              <p className="mt-3 rounded-lg bg-[#E7000B]/10 px-3 py-2 text-[10px] font-bold text-[#E7000B]">
                {contextError}
              </p>
            )}
          </article>

          {shouldShowYearFilters && (
            <nav className="mt-4" aria-label={t('schedule.yearFilter')}>
              <ul className="grid grid-cols-6 gap-2">
                {['1', '2', '3', '4', '5', '6'].map((year) => {
                  const isActive = selectedYearFilter === year;

                  return (
                    <li key={year}>
                      <button
                        type="button"
                        onClick={() => setSelectedYearFilter(year)}
                        className={`h-8 w-full rounded-full text-[10px] font-black transition-colors ${
                          isActive
                            ? 'bg-[#1E4E9D] text-white shadow-[0_8px_18px_rgba(30,78,157,0.24)]'
                            : 'bg-white text-[#526174] hover:bg-[#EFF6FF] hover:text-[#1E4E9D]'
                        }`}
                        aria-pressed={isActive}
                      >
                        {year}°
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <nav className="mt-5" aria-label="Selector semanal">
            <ul className="grid grid-cols-5 items-center gap-2">
              {visibleWeekDays.map((day) => {
                const isActive = selectedDay === day.id;

                return (
                  <li key={day.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(day.id);
                        fetchSchedules(day.id);
                      }}
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
                {t('schedule.daySchedule')}
              </h2>
              <span className="text-[9px] font-black uppercase text-[#1E4E9D]">
                {selectedClasses.length} {selectedClasses.length === 1 ? t('schedule.subject') : t('schedule.subjects')}
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
                      {scheduleClass.durationHours} {scheduleClass.durationHours === 1 ? t('schedule.hour') : t('schedule.hours')}
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

                  {isCurrentUserAdmin && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingClass(scheduleClass)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#1E4E9D] transition-colors hover:bg-[#EFF6FF]"
                        aria-label="Editar materia"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setClassToDelete(scheduleClass)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#E7000B] transition-colors hover:bg-[#E7000B]/10"
                        aria-label="Eliminar materia"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {selectedClasses.length === 0 && (
                <p className="rounded-[12px] bg-white px-4 py-5 text-center text-[12px] font-bold text-[#526174] shadow-[0_7px_18px_rgba(15,23,42,0.1)]">
                  {t('schedule.emptyDay')}
                </p>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-[14px] bg-[#4c1d95] px-4 py-4 text-center text-white shadow-[0_10px_24px_rgba(76,29,149,0.26)]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle size={18} />
              <h2 className="text-[13px] font-black uppercase">
                {t('schedule.problemTitle')}
              </h2>
            </div>
            <p className="mx-auto mt-1 max-w-[320px] text-[9.5px] font-bold uppercase leading-snug text-white/90">
              {t('schedule.problemText')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/404')}
              className="mt-4 rounded-full bg-white px-6 py-2 text-[10px] font-black uppercase text-[#4c1d95] transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {t('schedule.report')}
            </button>
          </section>
        </section>
      </main>

      {isCreateSubjectModalOpen && (
        <CreateSubjectModal
          initialDay={selectedDay}
          onClose={() => setIsCreateSubjectModalOpen(false)}
          onCreate={addScheduleClass}
        />
      )}

      {editingClass && (
        <CreateSubjectModal
          mode="edit"
          initialDay={selectedDay}
          initialValues={editingClass}
          onClose={() => setEditingClass(null)}
          onCreate={handleEdit}
        />
      )}

      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <section className="relative w-full max-w-[340px] rounded-[18px] bg-white px-6 py-5 text-center shadow-[0_20px_48px_rgba(15,23,42,0.28)]">
            <button
              type="button"
              onClick={() => setClassToDelete(null)}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-black transition-colors hover:bg-gray-100"
              aria-label={t('schedule.closeDeleteConfirmation')}
            >
              <X size={16} />
            </button>
            <h2 className="text-[15px] font-black text-[#1F2937]">
              {t('schedule.deleteConfirmTitle')}
            </h2>
            <p className="mt-3 text-[12px] font-semibold leading-5 text-[#526174]">
              {t('schedule.deleteConfirmText', { subject: classToDelete.subject })}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="h-8 rounded-full bg-gray-100 px-5 text-[11px] font-black text-[#526174] transition-colors hover:bg-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-8 rounded-full bg-[#E7000B] px-5 text-[11px] font-black text-white transition-colors hover:bg-[#b80009]"
              >
                {t('common.delete')}
              </button>
            </div>
          </section>
        </div>
      )}

      <BottomNavigation activeTab="horario" />
    </div>
  );
};
