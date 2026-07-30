import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { scheduleService } from '../services/scheduleService';

interface ImportScheduleModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const validExcelExtensions = ['.xls', '.xlsx'];
const expectedColumns = ['Carrera', 'Año', 'Materia', 'Día', 'Hora Inicio', 'Duración', 'Profesor', 'Aula'];

const isValidExcelFile = (file: File) => {
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  return validExcelExtensions.includes(fileExtension);
};

export const ImportScheduleModal = ({ onClose, onSuccess }: ImportScheduleModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = (selectedFile: File) => {
    setError(null);

    if (!isValidExcelFile(selectedFile)) {
      setError('Por favor, selecciona un archivo válido (.xls, .xlsx).');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) selectFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await scheduleService.importSchedules(file);
      const count = result.createdCount ?? result.count ?? 0;

      setSuccessMessage(`¡Éxito! Se importaron ${count > 0 ? count : 'las'} materias correctamente.`);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Hubo un error al procesar el archivo. Revisá el formato e intentá de nuevo.';

      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) selectFile(droppedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <section className="relative w-full max-w-[430px] rounded-[18px] bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.28)]">
        <header className="mb-5 flex items-center justify-center">
          <h2 className="text-[15px] font-black text-[#1E4E9D]">
            Importar Horarios
          </h2>
          {!isUploading && !successMessage && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-black transition-colors hover:bg-gray-100"
              aria-label="Cerrar modal"
            >
              <X size={16} />
            </button>
          )}
        </header>

        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 size={48} className="mb-4 text-green-500" />
            <p className="text-center text-[14px] font-bold text-gray-800">{successMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-8 min-w-36 rounded-full bg-[#1E4E9D] px-8 text-[12px] font-black text-white transition-colors hover:bg-[#155DFC]"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              className={`flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-6 transition-colors ${
                file ? 'border-[#1E4E9D] bg-[#EFF6FF]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
            >
              <input
                type="file"
                className="hidden"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isUploading}
              />
              {file ? (
                <>
                  <FileSpreadsheet size={32} className="mb-2 text-[#1E4E9D]" />
                  <p className="text-center text-[12px] font-bold text-[#1E4E9D]">{file.name}</p>
                  <p className="mt-1 text-center text-[10px] text-gray-500">Haz clic para cambiar el archivo</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="mb-2 text-gray-400" />
                  <p className="text-center text-[12px] font-bold text-gray-600">
                    Haz clic o arrastra un archivo Excel aquí
                  </p>
                  <p className="mt-1 text-center text-[10px] text-gray-400">
                    Soporta .xls y .xlsx
                  </p>
                </>
              )}
            </div>

            <div className="rounded-[12px] bg-[#EFF6FF] px-3 py-3">
              <p className="mb-2 text-[10px] font-black uppercase text-[#1E4E9D]">
                Columnas esperadas
              </p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                {expectedColumns.map((column) => (
                  <span
                    key={column}
                    className="rounded-md bg-white px-2 py-1 text-center text-[10px] font-bold text-[#1B2A44]"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-[#E7000B]/10 px-3 py-2 text-center text-[10px] font-bold text-[#E7000B]">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`flex h-8 min-w-36 items-center justify-center rounded-full px-8 text-[12px] font-black text-white transition-colors ${
                  !file || isUploading ? 'cursor-not-allowed bg-gray-300' : 'bg-[#1E4E9D] hover:bg-[#155DFC]'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Subir Archivo'
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
