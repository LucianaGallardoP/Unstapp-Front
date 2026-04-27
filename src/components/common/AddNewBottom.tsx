import { Plus } from 'lucide-react';

interface AddNewBottomProps {
  onClick?: () => void;
}

export const AddNewBottom = ({ onClick }: AddNewBottomProps) => {
  return (
    // Boton flotante para crear contenido.
    <button
      onClick={onClick}
      className="fixed bottom-14 right-3 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#243EA6] text-white shadow-[0_8px_20px_rgba(36,62,166,0.35)] transition-all hover:scale-105 active:scale-95 sm:right-[calc((100vw-560px)/2+20px)] md:bottom-16 md:right-[calc((100vw-672px)/2+20px)] lg:right-[calc((100vw-768px)/2+20px)]"
      aria-label="Crear nuevo"
    >
      <Plus size={30} strokeWidth={2} />
    </button>
  );
};
