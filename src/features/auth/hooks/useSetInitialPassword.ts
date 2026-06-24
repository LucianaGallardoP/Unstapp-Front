import { useState } from 'react';
import { authService } from '../services/authService';
import type { SetInitialPasswordRequest } from '../types/auth.dtos';

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
  return 'Ocurrió un error al establecer la contraseña';
};

export const useSetInitialPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setInitialPassword = async (data: SetInitialPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.setInitialPassword(data);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setInitialPassword, loading, error };
};
