import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateScheduleClassInput, ScheduleClass, WeekDayId } from '../hooks/useWeeklySchedule';
import { weekDays } from '../hooks/useWeeklySchedule';

interface CreateSubjectModalProps {
  initialDay: WeekDayId;
  initialValues?: ScheduleClass;
  mode?: 'create' | 'edit';
  onClose: () => void;
  onCreate: (values: CreateScheduleClassInput) => void;
}

export const CreateSubjectModal = ({
  initialDay,
  initialValues,
  mode = 'create',
  onClose,
  onCreate,
}: CreateSubjectModalProps) => {
  const [selectedDay, setSelectedDay] = useState<WeekDayId>(initialValues?.day ?? initialDay);
  const [subject, setSubject] = useState(initialValues?.subject ?? '');
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? '15:00');
  const [durationHours, setDurationHours] = useState(initialValues?.durationHours ?? 2);
  const [teacher, setTeacher] = useState(initialValues?.teacher ?? '');
  const [room, setRoom] = useState(initialValues?.room ?? '');
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const isSubjectValid = subject.trim().length > 0;
  const isStartTimeValid = startTime.trim().length > 0;
  const isDurationValid = durationHours > 0;
  const isTeacherValid = teacher.trim().length > 0;
  const isRoomValid = room.trim().length > 0;
  const canSubmit = isSubjectValid && isStartTimeValid && isDurationValid && isTeacherValid && isRoomValid;

  const fieldClass = (isValid: boolean) => `h-8 rounded-full border px-3 text-[11px] font-semibold text-gray-700 outline-none transition-colors focus:ring-1 ${
    wasSubmitted && !isValid
      ? 'border-[#E7000B] bg-[#E7000B]/5 focus:ring-[#E7000B]'
      : 'border-[#1E4E9D] focus:ring-[#1E4E9D]'
  }`;

  const handleSubmit = () => {
    setWasSubmitted(true);

    if (!canSubmit) return;

    onCreate({
      day: selectedDay,
      subject: subject.trim(),
      startTime,
      durationHours,
      teacher: teacher.trim(),
      room: room.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <section className="relative w-full max-w-[390px] rounded-[18px] bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.28)]">
        <header className="mb-5 flex items-center justify-center">
          <h2 className="text-[15px] font-black text-[#1E4E9D]">
            {mode === 'edit' ? 'Editar Materia' : 'Agregar Materia'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-black transition-colors hover:bg-gray-100"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <label className="grid grid-cols-[78px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Materia
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Nombre de la Materia"
              className={fieldClass(isSubjectValid)}
            />
          </label>

          <label className="grid grid-cols-[78px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Día
            <select
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value as WeekDayId)}
              className={fieldClass(true)}
            >
              {weekDays.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid grid-cols-[78px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Hora
            <input
              type="time"
              step={900}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={fieldClass(isStartTimeValid)}
            />
          </label>

          <label className="grid grid-cols-[78px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Duración
            <input
              type="number"
              min={0.5}
              max={6}
              step={0.5}
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              className={fieldClass(isDurationValid)}
            />
          </label>

          <label className="grid grid-cols-[78px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Profesor
            <input
              value={teacher}
              onChange={(event) => setTeacher(event.target.value)}
              placeholder="Nombre del Profesor"
              className={fieldClass(isTeacherValid)}
            />
          </label>

          <label className="grid grid-cols-[78px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Aula
            <input
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              placeholder="Aula o laboratorio"
              className={fieldClass(isRoomValid)}
            />
          </label>
        </div>

        {wasSubmitted && !canSubmit && (
          <p className="mt-3 rounded-lg bg-[#E7000B]/10 px-3 py-2 text-[10px] font-bold text-[#E7000B]">
            Completá todos los campos para {mode === 'edit' ? 'editar' : 'agregar'} la materia.
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="h-8 min-w-36 rounded-full bg-[#1E4E9D] px-8 text-[12px] font-black text-white transition-colors hover:bg-[#155DFC]"
          >
            {mode === 'edit' ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </section>
    </div>
  );
};