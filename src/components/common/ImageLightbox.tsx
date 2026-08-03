import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string;
  alt: string;
  closeLabel: string;
  onClose: () => void;
}

export const ImageLightbox = ({ imageUrl, alt, closeLabel, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex touch-none items-center justify-center overflow-hidden bg-black/95 px-3 py-16"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed left-4 top-4 z-[101] flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
        aria-label={closeLabel}
      >
        <X size={24} strokeWidth={2.2} />
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-h-[calc(100vh-96px)] max-w-[min(100vw-24px,980px)] select-none object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  );
};
