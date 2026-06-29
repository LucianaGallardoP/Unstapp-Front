import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TopBar } from '../../../components/common/TopBar';
import { LegalTermsFooter } from '../../../components/common/LegalTermsFooter';
import { LoginForm } from './LoginForm';
import { DNIValidationForm } from './DNIValidationForm';

export const LoginPage = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar simple />
      <main className="flex-grow flex flex-col items-center justify-center gap-3 p-4">
        {sessionExpired && !isFirstTime && (
          <div className="w-full max-w-[360px] rounded-xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-4 py-3 text-center text-[12px] font-bold text-[#E7000B]">
            Tu sesión expiró. Iniciá sesión nuevamente.
          </div>
        )}

        {isFirstTime ? (
          <DNIValidationForm onBackClick={() => setIsFirstTime(false)} />
        ) : (
          <LoginForm onFirstTimeClick={() => setIsFirstTime(true)} />
        )}
      </main>
      <LegalTermsFooter />
    </div>
  );
};
