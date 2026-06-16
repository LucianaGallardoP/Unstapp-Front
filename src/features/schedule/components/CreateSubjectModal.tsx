import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateScheduleClassInput } from '../hooks/useWeeklySchedule';

interface CreateSubjectModalProps {
  onClose: () => void;
  onCreate: (values: CreateScheduleClassInput) => void;
}

export const CreateSubjectModal = ({ onClose, onCreate }: CreateSubjectModalProps) => {
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('15:00');
  const [durationHours, setDurationHours] = useState(2);
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');

  const canSubmit = subject.trim().length > 0 && startTime.trim().length > 0 && durationHours > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onCreate({
      subject: subject.trim(),
      startTime,
      durationHours,
      teacher: teacher.trim() || 'Profesor a confirmar',
      room: room.trim() || 'Aula a confirmar',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <section className="relative w-full max-w-[360px] rounded-[18px] bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.28)]">
        <header className="mb-5 flex items-center justify-center">
          <h2 className="text-[15px] font-black text-[#1E4E9D]">
            Agregar Materia
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
          <label className="grid grid-cols-[74px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Materia
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Nombre de la Materia"
              className="h-8 rounded-full border border-[#1E4E9D] px-3 text-[11px] font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-[#1E4E9D]"
            />
          </label>

          <label className="grid grid-cols-[74px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Hora
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-8 rounded-full border border-[#1E4E9D] px-3 text-[11px] font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-[#1E4E9D]"
            />
          </label>

          <label className="grid grid-cols-[74px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Duración
            <input
              type="number"
              min={1}
              max={6}
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              className="h-8 rounded-full border border-[#1E4E9D] px-3 text-[11px] font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-[#1E4E9D]"
            />
          </label>

          <label className="grid grid-cols-[74px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Profesor
            <input
              value={teacher}
              onChange={(event) => setTeacher(event.target.value)}
              className="h-8 rounded-full border border-[#1E4E9D] px-3 text-[11px] font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-[#1E4E9D]"
            />
          </label>

          <label className="grid grid-cols-[74px_1fr] items-center gap-3 text-[11px] font-black text-[#1F2937]">
            Aula
            <input
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              className="h-8 rounded-full border border-[#1E4E9D] px-3 text-[11px] font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-[#1E4E9D]"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-8 min-w-36 rounded-full bg-[#1E4E9D] px-8 text-[12px] font-black text-white transition-colors hover:bg-[#155DFC] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Agregar
          </button>
        </div>
      </section>
    </div>
  );
};