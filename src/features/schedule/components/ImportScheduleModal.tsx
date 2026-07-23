import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { scheduleService } from '../services/scheduleService';

interface ImportScheduleModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportScheduleModal = ({ onClose, onSuccess }: ImportScheduleModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validExtensions = ['.xls', '.xlsx'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Por favor, selecciona un archivo válido (.xls, .xlsx)');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await scheduleService.importSchedules(file);
      // Assuming result contains a count or just success message
      const count = result.count || 0;
      setSuccessMessage(`¡Éxito! Se importaron ${count > 0 ? count : 'las'} materias correctamente.`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Hubo un error al procesar el archivo. Intenta de nuevo.';
      setError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ['.xls', '.xlsx'];
      const fileExtension = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Por favor, selecciona un archivo válido (.xls, .xlsx)');
        setFile(null);
        return;
      }
      
      setFile(droppedFile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <section className="relative w-full max-w-[390px] rounded-[18px] bg-white px-6 py-5 shadow-[0_20px_48px_rgba(15,23,42,0.28)]">
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
              onClick={onClose}
              className="mt-6 h-8 min-w-36 rounded-full bg-[#1E4E9D] px-8 text-[12px] font-black text-white transition-colors hover:bg-[#155DFC]"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div 
              className={`flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-6 transition-colors ${file ? 'border-[#1E4E9D] bg-[#EFF6FF]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
            >
              <input 
                type="file" 
                className="hidden" 
                accept=".xls,.xlsx" 
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
                  !file || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1E4E9D] hover:bg-[#155DFC]'
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
