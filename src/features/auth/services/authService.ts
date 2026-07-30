import { apiClient } from '../../../services/apiClient';
import { AxiosError } from 'axios';
import type { 
  LoginRequest, 
  LoginResponse,
  RegisterRequest,
  VerifyFirstTimeRequest,
  SetInitialPasswordRequest,
  VerifyFirstTimeResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse
} from '../types/auth.dtos';

const passwordRecoveryEndpoints = [
  '/Auth/forgot-password',
  '/Auth/request-password-reset',
  '/Auth/recover-password',
  '/Auth/verify-first-time',
];

const shouldTryNextRecoveryEndpoint = (error: unknown) => {
  if (!(error instanceof AxiosError)) return false;

  const status = error.response?.status;

  return status === 404 || status === 405 || status === 501;
};

export const authService = {
  // Endpoint de Login (Metodo POST)
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post('/Auth/register', data);
    return response.data;
  },

  verifyFirstTime: async (data: VerifyFirstTimeRequest): Promise<VerifyFirstTimeResponse> => {
    const response = await apiClient.post<VerifyFirstTimeResponse>('/Auth/verify-first-time', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    let lastError: unknown;

    for (const endpoint of passwordRecoveryEndpoints) {
      try {
        const response = await apiClient.post<ForgotPasswordResponse>(endpoint, data);

        return response.data;
      } catch (error) {
        lastError = error;

        if (!shouldTryNextRecoveryEndpoint(error)) {
          throw error;
        }
      }
    }

    throw lastError;
  },
  setInitialPassword: async (data: SetInitialPasswordRequest) => {
    const response = await apiClient.post('/Auth/set-initial-password', data);
    return response.data;
  },

  // Endpoint de prueba publica (Metodo GET)
  testPublic: async () => {
    const response = await apiClient.get('/testAuth/public');
    return response.data;
  },

  // Endpoint de datos del usuario (Requiere Token)
  getMe: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.get('/testAuth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
