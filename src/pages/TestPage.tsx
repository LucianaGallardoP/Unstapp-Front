import { TopBar } from '../components/common/TopBar';
import { BottomNavigation, type TabType } from '../components/common/BottomNavigation';

interface TestPageProps {
  activeTab: TabType;
}

export const TestPage = ({ activeTab }: TestPageProps) => {
  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />
      
      {/* Contenido vacio para probar navegacion */}
      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-3 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-5 lg:max-w-3xl">
      </main>

      <BottomNavigation activeTab={activeTab} />
    </div>
  );
};
