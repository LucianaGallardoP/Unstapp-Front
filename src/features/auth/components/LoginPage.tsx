import { useState } from 'react';
import { TopBar } from '../../../components/common/TopBar';
import { LegalTermsFooter } from '../../../components/common/LegalTermsFooter';
import { LoginForm } from './LoginForm';
import { DNIValidationForm } from './DNIValidationForm';

export const LoginPage = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar simple /> 
      <main className="flex-grow flex items-center justify-center p-4">
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
