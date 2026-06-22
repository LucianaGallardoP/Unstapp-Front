import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../../components/common/TopBar';
import { LegalTermsFooter } from '../../../components/common/LegalTermsFooter';
import { RegisterForm } from './RegisterForm';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // O la ruta que corresponda al login
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar simple /> 
      <main className="flex-grow flex items-center justify-center p-4">
        <RegisterForm onLoginClick={handleLoginClick} />
      </main>
      <LegalTermsFooter />
    </div>
  );
};
