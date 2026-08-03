import { useState } from 'react';
import { authService } from '../services/authService';
import type { ResetPasswordRequest, SetInitialPasswordRequest } from '../types/auth.dtos';

type ApiErrorRecord = Record<string, unknown>;

const flattenErrors = (value: unknown): string[] => {
  if (!value) return [];

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenErrors);
  }

  if (typeof value === 'object') {
    return Object.values(value as ApiErrorRecord).flatMap(flattenErrors);
  }

  return [];
};

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = error.response.data as ApiErrorRecord | string;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }

      const errors = flattenErrors(data.errors);

      if (errors.length > 0) {
        return errors.join(' ');
      }

      if (typeof data.code === 'string' && data.code.trim()) {
        return data.code;
      }
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

  const resetPassword = async (data: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(data);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setInitialPassword, resetPassword, loading, error };
};
