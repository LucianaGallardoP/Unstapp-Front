import { LayoutGrid, Calendar, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type TabType = 'feed' | 'calendario' | 'horario' | 'perfil';

interface BottomNavigationProps {
  activeTab: TabType | null;
  onTabChange?: (tab: TabType) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navigate = useNavigate();
  // Secciones principales de la app.
  const tabs = [
    { id: 'feed', label: 'FEED', icon: LayoutGrid },
    { id: 'calendario', label: 'CALENDARIO', icon: Calendar },
    { id: 'horario', label: 'HORARIO', icon: Clock },
    { id: 'perfil', label: 'PERFIL', icon: User },
  ] as const;

  const handleTabClick = (tabId: TabType) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    navigate(`/${tabId}`);
  };

  return (
    // Navegacion inferior mobile.
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-1 pb-1 pt-1">
      <ul className="mx-auto flex max-w-[430px] items-center justify-around sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`flex h-14 w-full flex-col items-center justify-center gap-0.5 transition-colors md:h-16 ${
                  isActive 
                    ? 'text-[#1E4E9D]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-black tracking-wide sm:text-[11px]">
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
