import { useState } from 'react';
import { TopBar } from '../../../components/common/TopBar';
import { BottomNavigation, type TabType } from '../../../components/common/BottomNavigation';
import { AddNewBottom } from '../../../components/common/AddNewBottom';

export const FeedPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#040814] text-gray-900 dark:text-gray-100 pb-24">
      {/* Top Navigation */}
      <TopBar />
      
      {/* Main Content Area */}
      <main className="px-4 py-4 max-w-2xl mx-auto flex flex-col gap-4">
        {/* Placeholder para los próximos componentes */}
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500 dark:text-gray-400">
          <p>El feed se mostrará aquí</p>
        </div>
      </main>

      {/* Botón flotante para crear nuevo contenido */}
      <AddNewBottom onClick={() => console.log('Nuevo contenido')} />
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
