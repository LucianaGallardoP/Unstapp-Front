import { apiClient } from '../../../services/apiClient';
import type { LoginRequest, LoginResponse } from '../types/auth.dtos';

export const authService = {
  // Endpoint de Login (Método POST) [cite: 1578]
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Endpoint de prueba pública (Método GET) [cite: 1590]
  testPublic: async () => {
    const response = await apiClient.get('/testAuth/public');
    return response.data;
  },

  // Endpoint de datos del usuario (Requiere Token) [cite: 1598]
  getMe: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.get('/testAuth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};