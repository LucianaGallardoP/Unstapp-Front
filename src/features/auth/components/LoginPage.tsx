import { TopBar } from '../../../components/common/TopBar';
import { LegalTermsFooter } from '../../../components/common/LegalTermsFooter';
import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar simple /> 
      <main className="flex-grow flex items-center justify-center p-4">
        <LoginForm /> 
      </main>
      <LegalTermsFooter />
    </div>
  );
};
