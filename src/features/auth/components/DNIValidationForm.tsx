import { useState, type ChangeEvent } from 'react';

import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import unstaLogo from '../../../assets/img/UNSTA-logo.png'; 

const ValidationErrorMessage = () => (
  <p className="text-[#E7000B] text-[13px] font-medium mt-1 text-center">
    DNI incorrecto
  </p>
);

interface DNIValidationFormProps {
  onBackClick?: () => void;
}

export const DNIValidationForm = ({ onBackClick }: DNIValidationFormProps) => {
  const [localError, setLocalError] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const [formData, setFormData] = useState({
    dni: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de validación real
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("¡DNI validado!");
      // navigate('/next-step'); 
    } catch {
      setLocalError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
      <div className="mb-6 flex justify-center">
        <img src={unstaLogo} alt="Logo UNSTA" className="w-20 h-20 object-contain" />
      </div>
      <h1 className="text-[2.5rem] font-bold text-black text-center leading-tight mb-2">
        Bienvenido
      </h1>
      <p className="text-gray-500 text-[15px] text-center mb-8 leading-snug">
        Accede a tu comunidad académica y gestiona tu vida universitaria.
      </p>

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
              setLocalError(false);
              setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') });
            }}
          />
          {localError && <ValidationErrorMessage />}
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
              Validar
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
