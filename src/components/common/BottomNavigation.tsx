import { LayoutGrid, Users, Calendar, Clock, User } from 'lucide-react';

export type TabType = 'feed' | 'comunidad' | 'calendario' | 'horario' | 'perfil';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange?: (tab: TabType) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'feed', label: 'FEED', icon: LayoutGrid },
    { id: 'comunidad', label: 'COMUNIDAD', icon: Users },
    { id: 'calendario', label: 'CALENDARIO', icon: Calendar },
    { id: 'horario', label: 'HORARIO', icon: Clock },
    { id: 'perfil', label: 'PERFIL', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#F9FAFB] dark:bg-[#0B1121] border-t border-gray-200 dark:border-gray-800 px-2 pb-safe pt-2 z-40">
      <ul className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => onTabChange?.(tab.id)}
                className={`w-full flex flex-col items-center justify-center gap-1 p-2 transition-colors ${
                  isActive 
                    ? 'text-[#4285F4]' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
