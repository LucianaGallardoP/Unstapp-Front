import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import unstaLogo from '../../../assets/img/UNSTA-logo.png';
import { useVerifyFirstTime } from '../hooks/useVerifyFirstTime';

type VerifyFirstTimePayload = {
  token?: string;
  resetToken?: string;
  registrationToken?: string;
  data?: VerifyFirstTimePayload;
  value?: VerifyFirstTimePayload;
};

const ValidationErrorMessage = ({ message = "DNI incorrecto" }: { message?: string }) => (
  <p className="text-[#E7000B] text-[13px] font-medium mt-1 text-center">
    {message}
  </p>
);

const getInitialPasswordToken = (response: unknown): string => {
  const payload = response as VerifyFirstTimePayload;

  return (
    payload?.token ||
    payload?.resetToken ||
    payload?.registrationToken ||
    payload?.data?.token ||
    payload?.data?.resetToken ||
    payload?.data?.registrationToken ||
    payload?.value?.token ||
    payload?.value?.resetToken ||
    payload?.value?.registrationToken ||
    ''
  );
};

interface DNIValidationFormProps {
  onBackClick?: () => void;
}

export const DNIValidationForm = ({ onBackClick }: DNIValidationFormProps) => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(false);
  const [missingTokenError, setMissingTokenError] = useState(false);

  const [formData, setFormData] = useState({
    dni: ''
  });

  const { verifyFirstTime, loading, error } = useVerifyFirstTime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DNIValidationForm] Se oprimió el botón de enviar. Iniciando verificación para el DNI:', formData.dni);
    setSuccessMessage(false);
    setMissingTokenError(false);

    try {
      const response = await verifyFirstTime({ dni: formData.dni });
      console.log('[DNIValidationForm] Respuesta de verificación exitosa:', response);
      const token = getInitialPasswordToken(response);
      console.log('[DNIValidationForm] Token obtenido:', token);

      if (!token) {
        console.warn('[DNIValidationForm] Advertencia: No se encontró un token en la respuesta.');
        setMissingTokenError(true);
        return;
      }

      setFormData({ dni: '' });
      navigate(`/register?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error('[DNIValidationForm] Error en el flujo de verificación:', err);
      // Error is handled by the hook and will be displayed via the error state
    }
  };

  return (
    <div className="w-full max-w-[400px] p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
      <div className="mb-6 flex justify-center">
        <img src={unstaLogo} alt="Logo UNSTA" className="w-20 h-20 object-contain" />
      </div>
      <h1 className="text-[2.5rem] font-bold text-black text-center leading-tight mb-2">
        Primer ingreso
      </h1>
      <p className="text-gray-500 text-[15px] text-center mb-8 leading-snug">
        Ingresa tu DNI para validar tu cuenta y crear tu contrasena inicial.
      </p>

      {successMessage && (
        <div className="bg-[#E6F4EA] text-[#137333] p-4 rounded-xl mb-6 text-[14.5px] leading-snug font-medium text-center border border-[#CEEAD6]">
          DNI validado correctamente.
        </div>
      )}

      {error && error.toLowerCase().includes('registrado') && (
        <div className="bg-[#FFF8E6] text-[#B38000] p-4 rounded-xl mb-6 text-[14.5px] leading-snug font-medium text-center border border-[#FFE5B4]">
          {error}
        </div>
      )}

      {missingTokenError && (
        <div className="bg-[#FFF8E6] text-[#B38000] p-4 rounded-xl mb-6 text-[14.5px] leading-snug font-medium text-center border border-[#FFE5B4]">
          No se recibio el token para crear la contrasena inicial.
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
            placeholder="Ingresa tu DNI"
            className="placeholder-gray-400"
            value={formData.dni}
            disabled={loading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSuccessMessage(false);
              setMissingTokenError(false);
              setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') });
            }}
          />
          {error && !error.toLowerCase().includes('registrado') && <ValidationErrorMessage message={error} />}
        </div>

        <Button
          type="submit"
          fullWidth
          className="mt-2 hover:bg-[#122b54]"
          disabled={loading || !formData.dni}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              Validando...
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continuar
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
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};