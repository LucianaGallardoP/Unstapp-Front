import { ImagePlus, LoaderCircle, UserRound, X } from 'lucide-react';
import { useState } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (content: string) => Promise<void>;
}

export const CreatePostModal = ({ isOpen, onClose, onPublish }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const trimmedContent = content.trim();

  if (!isOpen) {
    return null;
  }

  // Envia la publicacion y limpia el formulario.
  const handleSubmit = async () => {
    if (!trimmedContent || isPublishing) {
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);
      await onPublish(trimmedContent);
      setContent('');
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
      <section className="w-full max-w-[430px] rounded-[24px] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-w-[520px] sm:p-5">
        <header className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 id="create-post-title" className="text-[18px] font-black text-[#1F2937]">
            Nueva Publicacion
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </header>

        <div className="mt-4 flex gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500"
            aria-label="Foto del usuario actual"
          >
            <UserRound size={20} strokeWidth={2.3} />
          </div>

          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
              placeholder="Que esta pasando en el campus? Que queres compartir con la comunidad?"
              className="min-h-36 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pt-3 pb-8 text-[14px] leading-6 text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#5A55FF] focus:bg-white"
            />
            <span className={`absolute bottom-3 right-4 text-[11px] font-medium ${content.length >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/500
            </span>
          </div>
        </div>

        <footer className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full px-3 text-[13px] font-bold text-[#4967FF]"
            aria-label="Agregar multimedia"
          >
            <ImagePlus size={19} />
            <span>Multimedia</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!trimmedContent || isPublishing}
            className="flex h-10 min-w-28 items-center justify-center gap-2 rounded-full bg-[#243EA6] px-5 text-[13px] font-black text-white transition-colors hover:bg-[#1D338C] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isPublishing && <LoaderCircle size={16} className="animate-spin" />}
            {isPublishing ? 'Publicando' : 'Publicar'}
          </button>
        </footer>

        {publishError && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-[13px] font-semibold text-red-500">
            {publishError}
          </p>
        )}
      </section>
    </div>
  );
};
