import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import unstaLogo from '../../../assets/img/UNSTA-logo.png';
import { useVerifyFirstTime } from '../hooks/useVerifyFirstTime';
import { useLanguage } from '../../../store/languageContext';

type VerifyFirstTimePayload = Record<string, unknown>;

const ValidationErrorMessage = ({ message }: { message: string }) => (
  <p className="text-[#E7000B] text-[13px] font-medium mt-1 text-center">
    {message}
  </p>
);

const tokenKeys = new Set([
  'token',
  'resettoken',
  'registrationtoken',
  'initialpasswordtoken',
  'passwordtoken',
  'setpasswordtoken',
]);

const getInitialPasswordToken = (response: unknown): string => {
  const visitedObjects = new Set<object>();

  const findToken = (value: unknown): string => {
    if (!value || typeof value !== 'object' || visitedObjects.has(value)) {
      return '';
    }

    visitedObjects.add(value);

    for (const [key, entryValue] of Object.entries(value as VerifyFirstTimePayload)) {
      if (typeof entryValue === 'string' && tokenKeys.has(key.toLowerCase()) && entryValue.trim()) {
        return entryValue.trim();
      }
    }

    for (const entryValue of Object.values(value as VerifyFirstTimePayload)) {
      const nestedToken = findToken(entryValue);

      if (nestedToken) {
        return nestedToken;
      }
    }

    return '';
  };

  return findToken(response);
};

const getResponseMessage = (response: unknown, fallback: string): string => {
  if (response && typeof response === 'object' && 'message' in response && typeof response.message === 'string') {
    return response.message;
  }

  return fallback;
};

interface DNIValidationFormProps {
  onBackClick?: () => void;
}

export const DNIValidationForm = ({ onBackClick }: DNIValidationFormProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    dni: ''
  });

  const { verifyFirstTime, loading, error } = useVerifyFirstTime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      const response = await verifyFirstTime({ dni: formData.dni });
      const token = getInitialPasswordToken(response);

      if (token) {
        setFormData({ dni: '' });
        navigate(`/register?token=${encodeURIComponent(token)}`);
        return;
      }

      setSuccessMessage(getResponseMessage(response, t('auth.recoverSuccess')));
      setFormData({ dni: '' });
    } catch (err) {
      // El hook guarda el mensaje de error para mostrarlo en pantalla.
    }
  };

  return (
    <div className="w-full max-w-[400px] p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
      <div className="mb-6 flex justify-center">
        <img src={unstaLogo} alt="Logo UNSTA" className="w-20 h-20 object-contain" />
      </div>
      <h1 className="text-[2.5rem] font-bold text-black text-center leading-tight mb-2">
        {t('auth.firstLoginTitle')}
      </h1>
      <p className="text-gray-500 text-[15px] text-center mb-8 leading-snug">
        {t('auth.firstLoginSubtitle')}
      </p>

      {successMessage && (
        <div className="bg-[#E6F4EA] text-[#137333] p-4 rounded-xl mb-6 text-[14.5px] leading-snug font-medium text-center border border-[#CEEAD6]">
          {successMessage}
        </div>
      )}

      {error && error.toLowerCase().includes('registrado') && (
        <div className="bg-[#FFF8E6] text-[#B38000] p-4 rounded-xl mb-6 text-[14.5px] leading-snug font-medium text-center border border-[#FFE5B4]">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <Input
            label="DNI"
            id="dni"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={t('login.dniPlaceholder')}
            className="placeholder-gray-400"
            value={formData.dni}
            disabled={loading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSuccessMessage(null);
              setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') });
            }}
          />
          {error && !error.toLowerCase().includes('registrado') && (
            <ValidationErrorMessage message={error || t('auth.dniError')} />
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          className="mt-2 hover:bg-[#122b54]"
          disabled={loading || !formData.dni}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              {t('auth.validating')}
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {t('auth.continue')}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          )}
        </Button>

        <div className="text-center mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onBackClick) {
                onBackClick();
              }
            }}
            className="text-[#1E4E9D] font-medium text-[15px] hover:text-[#122b54] hover:underline transition-all"
          >
            {t('auth.back')}
          </button>
        </div>
      </form>
    </div>
  );
};
