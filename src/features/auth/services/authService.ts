import { apiClient } from '../../../services/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerifyFirstTimeRequest,
  SetInitialPasswordRequest,
  ResetPasswordRequest,
  VerifyFirstTimeResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from '../types/auth.dtos';

export const authService = {
  // Inicia sesion con DNI y contraseña.
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post('/Auth/register', data);
    return response.data;
  },

  // Valida primer ingreso y obtiene el token para crear contraseña inicial.
  verifyFirstTime: async (data: VerifyFirstTimeRequest): Promise<VerifyFirstTimeResponse> => {
    const response = await apiClient.post<VerifyFirstTimeResponse>('/Auth/verify-first-time', data);
    return response.data;
  },

  // Solicita el enlace/token de recuperacion de contraseña.
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/Auth/forgot-password', data);
    return response.data;
  },

  // Crea la contraseña inicial del primer ingreso.
  setInitialPassword: async (data: SetInitialPasswordRequest) => {
    const response = await apiClient.post('/Auth/set-initial-password', data);
    return response.data;
  },

  // Cambia la contraseña desde el flujo de recuperacion.
  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await apiClient.post('/Auth/reset-password', data);
    return response.data;
  },

  // Endpoint de prueba publica.
  testPublic: async () => {
    const response = await apiClient.get('/testAuth/public');
    return response.data;
  },

  // Endpoint de datos del usuario autenticado.
  getMe: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.get('/testAuth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
