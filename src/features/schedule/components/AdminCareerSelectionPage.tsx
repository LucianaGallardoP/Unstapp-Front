import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { TopBar } from '../../../components/common/TopBar';

interface CareerOption {
  id: string;
  name: string;
  year: string;
  color: string;
}

const careerOptions: CareerOption[] = [
  {
    id: 'tec-desarrollo-software',
    name: 'Tec. Desarrollo de Software',
    year: 'Año 3',
    color: '#f4ea00',
  },
  {
    id: 'ing-inteligencia-artificial',
    name: 'Ing. en Inteligencia Artificial',
    year: 'Año 2',
    color: '#ffb000',
  },
  {
    id: 'ing-software',
    name: 'Ingeniería de Software',
    year: 'Año 2',
    color: '#1E4E9D',
  },
];

export const AdminCareerSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20 text-gray-900 md:bg-gray-50">
      <TopBar />

      <main className="mx-auto flex w-full max-w-[430px] flex-col px-3 py-5 sm:max-w-[560px] sm:px-5 md:max-w-2xl md:py-6 lg:max-w-3xl">
        <section className="mx-auto w-full max-w-[430px] sm:max-w-[560px] md:max-w-[600px]">
          <header className="mb-4">
            <h1 className="text-[10px] font-black uppercase tracking-wide text-[#526174]">
              Carreras de la Facultad
            </h1>
          </header>

          <div className="flex flex-col gap-4">
            {careerOptions.map((career) => (
              <button
                key={career.id}
                type="button"
                onClick={() => navigate(`/admin/horarios/${career.id}`)}
                className="group flex min-h-[96px] w-full items-center gap-3 rounded-[14px] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.14)] transition-transform hover:-translate-y-0.5"
              >
                <span
                  className="h-12 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: career.color }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="text-[13px] font-black uppercase leading-4 text-black sm:text-[14px]">
                    {career.name}
                  </h2>
                  <p className="mt-2 text-[9px] font-black uppercase text-[#526174]">
                    {career.year}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-[#1E4E9D] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation activeTab="horario" />
    </div>
  );
};