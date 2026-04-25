import { Plus } from 'lucide-react';

interface AddNewBottomProps {
  onClick?: () => void;
}

export const AddNewBottom = ({ onClick }: AddNewBottomProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-[60px] h-[60px] bg-[#2E4DBA] dark:bg-[#1E3278] hover:bg-[#25409E] dark:hover:bg-[#182860] text-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all hover:scale-105 active:scale-95"
      aria-label="Crear nuevo"
    >
      <Plus size={32} strokeWidth={2} />
    </button>
  );
};
