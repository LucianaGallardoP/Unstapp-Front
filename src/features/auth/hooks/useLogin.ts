import { useState } from 'react';
import { authService } from '../services/authService';
import type { LoginRequest, LoginResponse } from '../types/auth.dtos';

const getLoginErrorMessage = (error: unknown) => {
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

  return 'Error al iniciar sesion';
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setData(response);
      localStorage.setItem('unstapp_token', response.token);
      localStorage.setItem('unstapp_user_name', response.fullName);
      localStorage.setItem('unstapp_user_roles', JSON.stringify(response.roles));

      return response;
    } catch (err) {
      const errorMessage = getLoginErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, data };
};
