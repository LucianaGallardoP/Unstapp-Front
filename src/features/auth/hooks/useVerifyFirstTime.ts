import { useState } from 'react';
import { authService } from '../services/authService';
import type { VerifyFirstTimeRequest } from '../types/auth.dtos';

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = error.response.data;
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  }
  return 'Ocurrió un error al verificar el DNI';
};

export const useVerifyFirstTime = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyFirstTime = async (data: VerifyFirstTimeRequest) => {
    setLoading(true);
    setError(null);
    console.log('[useVerifyFirstTime] Iniciando llamada a authService.verifyFirstTime con datos:', data);

    try {
      const response = await authService.verifyFirstTime(data);
      console.log('[useVerifyFirstTime] Respuesta recibida exitosamente de authService.verifyFirstTime:', response);
      return response;
    } catch (err) {
      console.error('[useVerifyFirstTime] Error capturado en la llamada a authService.verifyFirstTime:', err);
      const errorMessage = getErrorMessage(err);
      console.error('[useVerifyFirstTime] Mensaje de error formateado para el usuario:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verifyFirstTime, loading, error };
};
