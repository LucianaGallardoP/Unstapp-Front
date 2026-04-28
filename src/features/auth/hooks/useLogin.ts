import { useState } from 'react';
import { authService } from '../services/authService';
import type { LoginRequest, LoginResponse } from '../types/auth.dtos';

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
      // Aquí podrías guardar el token en localStorage en el futuro
      return response;
    } catch (err: any) {
      // Capturamos el error de la API (ej: "DNI o contraseña incorrectos")
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, data };
};