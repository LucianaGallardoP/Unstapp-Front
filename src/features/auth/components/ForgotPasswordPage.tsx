import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../../components/common/TopBar';
import { LegalTermsFooter } from '../../../components/common/LegalTermsFooter';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import unstaLogo from '../../../assets/img/UNSTA-logo.png';
import { authService } from '../services/authService';

type TokenPayload = Record<string, unknown>;

const tokenKeys = new Set([
  'token',
  'resettoken',
  'passwordtoken',
  'setpasswordtoken',
]);

const getResetToken = (response: unknown): string => {
  const visitedObjects = new Set<object>();

  const findToken = (value: unknown): string => {
    if (!value || typeof value !== 'object' || visitedObjects.has(value)) {
      return '';
    }

    visitedObjects.add(value);

    for (const [key, entryValue] of Object.entries(value as TokenPayload)) {
      if (typeof entryValue === 'string' && tokenKeys.has(key.toLowerCase()) && entryValue.trim()) {
        return entryValue.trim();
      }
    }

    for (const entryValue of Object.values(value as TokenPayload)) {
      const nestedToken = findToken(entryValue);

      if (nestedToken) {
        return nestedToken;
      }
    }

    return '';
  };

  return findToken(response);
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!dni || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword({ dni });
      const token = getResetToken(response);

      if (!token) {
        setError('No se recibio el token para recuperar la contrasena.');
        return;
      }

      navigate(`/register?token=${encodeURIComponent(token)}`);
    } catch {
      setError('No se pudo iniciar la recuperacion de contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopBar simple />
      <main className="flex flex-grow items-center justify-center p-4">
        <section className="w-full max-w-[360px] rounded-[24px] border border-gray-200 bg-white px-7 py-8 shadow-sm sm:px-8 sm:py-9">
          <div className="mb-4 flex justify-center">
            <img src={unstaLogo} alt="Logo UNSTA" className="h-16 w-16 object-contain" />
          </div>

          <h1 className="mb-2 text-center text-[28px] font-bold leading-tight text-black">
            Recuperar contrasena
          </h1>
          <p className="mx-auto mb-6 max-w-[250px] text-center text-[13px] leading-snug text-gray-500">
            Ingresa tu DNI para validar tu cuenta y crear una nueva contrasena.
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-4 py-3 text-center text-[12px] font-bold text-[#E7000B]">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="DNI"
              id="forgot-dni"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ingresa tu DNI"
              value={dni}
              disabled={loading}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setError(null);
                setDni(event.target.value.replace(/\D/g, ''));
              }}
            />

            <Button
              type="submit"
              fullWidth
              className="mt-2 !rounded-[8px] !py-3 text-[13px] hover:bg-[#122b54]"
              disabled={loading || !dni}
            >
              {loading ? 'Validando...' : 'Continuar'}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-2 text-[12px] font-medium text-[#1E4E9D] transition-all hover:text-[#122b54] hover:underline"
            >
              Volver al inicio de sesion
            </button>
          </form>
        </section>
      </main>
      <LegalTermsFooter />
    </div>
  );
};
