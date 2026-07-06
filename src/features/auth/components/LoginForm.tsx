import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { useLogin } from '../hooks/useLogin';
import unstaLogo from '../../../assets/img/UNSTA-logo.png';

const LoginErrorMessage = () => (
  <p className="text-[#E7000B] text-[12px] font-medium mt-1 text-center">
    Usuario o contraseña incorrectos
  </p>
);

interface LoginFormProps {
  onFirstTimeClick?: () => void;
}

export const LoginForm = ({ onFirstTimeClick }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(false);
  const navigate = useNavigate();
  const { login, loading } = useLogin();

  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData);
      navigate('/feed');
    } catch {
      setLocalError(true);
    }
  };

  const inputStyles = 'placeholder-gray-400 text-[13px] !py-2.5 !rounded-xl';

  return (
    <div className="w-full max-w-[340px] rounded-[24px] border border-gray-200 bg-white px-7 py-8 shadow-sm sm:max-w-[360px] sm:px-8 sm:py-9">
      <div className="mb-4 flex justify-center">
        <img src={unstaLogo} alt="Logo UNSTA" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
      </div>

      <h1 className="mb-2 text-center text-[28px] font-bold leading-tight text-black sm:text-[30px]">
        Bienvenido
      </h1>
      <p className="mx-auto mb-6 max-w-[230px] text-center text-[12px] leading-snug text-gray-500 sm:text-[13px]">
        Accede a tu comunidad académica y gestiona tu vida universitaria.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="DNI"
          id="dni"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ingresá tu DNI"
          className={inputStyles}
          value={formData.dni}
          disabled={loading}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setLocalError(false);
            setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') });
          }}
        />

        <div className="flex flex-col">
          <Input
            label="Contraseña"
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            className={showPassword ? inputStyles : `${inputStyles} text-lg tracking-widest placeholder-gray-300`}
            value={formData.password}
            disabled={loading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setLocalError(false);
              setFormData({ ...formData, password: e.target.value });
            }}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#1E4E9D] hover:text-[#122b54] focus:outline-none"
                disabled={loading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            }
          />
          {localError && <LoginErrorMessage />}
        </div>

        <div className="mt-1 flex flex-col gap-1.5 text-center">
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}
            className="text-[12px] font-medium text-[#1E4E9D] transition-all hover:text-[#122b54] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFirstTimeClick?.();
            }}
            className="text-[12px] font-medium text-[#1E4E9D] transition-all hover:text-[#122b54] hover:underline"
          >
            ¿Es tu primera vez ingresando?
          </button>
        </div>

        <Button
          type="submit"
          fullWidth
          className="mt-3 !rounded-[8px] !py-3 text-[13px] hover:bg-[#122b54]"
          disabled={loading || !formData.dni || !formData.password}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              Iniciando sesión...
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Iniciar Sesión
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};
