import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../../../components/common/BottomNavigation';
import { TopBar } from '../../../components/common/TopBar';
import { useCareers } from '../hooks/useCareers';

const DEFAULT_COLOR = '#1E4E9D';
const DEFAULT_YEAR = 'Año 1';

export const AdminCareerSelectionPage = () => {
  const navigate = useNavigate();
  const { careers, loading, error } = useCareers();

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

          {loading && (
            <p className="text-center text-[12px] font-bold text-[#526174] py-10">
              Cargando carreras...
            </p>
          )}

          {error && (
            <div className="rounded-lg bg-[#E7000B]/10 px-4 py-3 text-[12px] font-bold text-[#E7000B] text-center">
              {error}
            </div>
          )}

          {!loading && !error && careers.length === 0 && (
            <p className="text-center text-[12px] font-bold text-[#526174] py-10">
              No se encontraron carreras.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {careers.map((career) => (
              <button
                key={career.id}
                type="button"
                onClick={() => navigate(`/admin/horarios/${career.id}`)}
                className="group flex min-h-[96px] w-full items-center gap-3 rounded-[14px] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.14)] transition-transform hover:-translate-y-0.5"
              >
                <span
                  className="h-12 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: DEFAULT_COLOR }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="text-[13px] font-black uppercase leading-4 text-black sm:text-[14px]">
                    {career.name}
                  </h2>
                  <p className="mt-2 text-[9px] font-black uppercase text-[#526174]">
                    {DEFAULT_YEAR}
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