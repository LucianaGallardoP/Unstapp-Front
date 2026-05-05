import { ImagePlus, LoaderCircle, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (content: string, mediaFile?: File) => Promise<void>;
}

export const CreatePostModal = ({ isOpen, onClose, onPublish }: CreatePostModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const trimmedContent = content.trim();
  const isVideo = selectedFile?.type.startsWith('video/');

  // Libera la URL temporal de previsualizacion.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [selectedFile]);

  if (!isOpen) {
    return null;
  }

  const clearSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isPublishing) {
      return;
    }

    onClose();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setPublishError(null);
  };

  // Envia la publicacion y limpia el formulario.
  const handleSubmit = async () => {
    if (!trimmedContent || isPublishing) {
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);
      await onPublish(trimmedContent, selectedFile ?? undefined);
      setContent('');
      clearSelectedFile();
      onClose();
    } catch {
      setPublishError('No se pudo publicar. Intentalo nuevamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
    >
      <section className="w-full max-w-[315px] rounded-[6px] bg-white px-4 pb-4 pt-3 shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-w-[390px] sm:px-5 sm:pb-5 md:max-w-[460px] md:px-6 md:pt-4">
        <header className="flex items-start justify-between">
          <h2 id="create-post-title" className="pt-1 text-[16px] font-black uppercase leading-5 text-black md:text-[18px]">
            Nueva Publicacion
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPublishing}
            className="-mr-2 -mt-2 flex h-8 w-8 items-center justify-center text-black transition-colors hover:text-[#1E4E9D] disabled:cursor-not-allowed disabled:text-gray-300"
            aria-label="Cerrar modal"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </header>

        <div className="mt-3 flex gap-3 min-[360px]:gap-4 md:mt-4 md:gap-5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1E4E9D] min-[360px]:h-12 min-[360px]:w-12 md:h-14 md:w-14"
            aria-label="Foto del usuario actual"
          >
            <UserRound className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.2} />
          </div>

          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
              placeholder="¿Qué queres compartir con el campus?"
              className="min-h-[132px] w-full resize-none rounded-[18px] border-2 border-[#808080] bg-white px-3 py-2 text-[14px] leading-7 text-gray-800 outline-none transition-colors placeholder:text-[#808080] focus:border-[#1E4E9D] min-[360px]:min-h-[138px] md:min-h-[170px] md:px-4 md:py-3 md:text-[15px]"
            />
            <span className={`absolute bottom-3 right-4 text-[10px] font-medium ${content.length >= 500 ? 'text-[#E7000B]' : 'text-transparent'}`}>
              {content.length}/500
            </span>
          </div>
        </div>

        {previewUrl && selectedFile && (
          <section className="mt-3 rounded-[18px] border border-[#EFF6FF] bg-[#EFF6FF] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[12px] font-bold text-[#1F2937]">
                {selectedFile.name}
              </p>
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={isPublishing}
                className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-bold text-[#E7000B] transition-colors hover:bg-[#E7000B]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl bg-white">
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="max-h-64 w-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Previsualizacion del archivo seleccionado"
                  className="max-h-64 w-full object-cover"
                />
              )}
            </div>
          </section>
        )}

        <footer className="mt-4 flex items-center justify-end gap-3 pl-14 min-[360px]:pl-16 md:gap-4 md:pl-[76px]">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.mp4,image/jpeg,image/png,video/mp4"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPublishing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1E4E9D] transition-colors hover:bg-[#dcecff] disabled:cursor-not-allowed disabled:text-gray-300 md:h-11 md:w-11"
            aria-label="Agregar multimedia"
          >
            <ImagePlus className="h-[18px] w-[18px] md:h-5 md:w-5" strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!trimmedContent || isPublishing}
            className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#1E4E9D] px-5 text-[13px] font-black uppercase text-white transition-colors hover:bg-[#155DFC] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 min-[360px]:max-w-[174px] md:h-11 md:max-w-[240px] md:text-[14px]"
          >
            {isPublishing && <LoaderCircle size={16} className="animate-spin" />}
            {isPublishing ? 'Publicando' : 'Publicar'}
          </button>
        </footer>

        {publishError && (
          <p className="mt-3 rounded-2xl bg-[#E7000B]/10 px-4 py-3 text-center text-[13px] font-semibold text-[#E7000B]">
            {publishError}
          </p>
        )}
      </section>
    </div>
  );
};
