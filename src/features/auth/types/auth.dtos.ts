export interface LoginRequest {
  dni: string;
  password: string; 
}

export interface LoginResponse {
  userId: number;
  fullName: string;
  roles: string[];
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  dni: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

export interface VerifyFirstTimeRequest {
  dni: string;
}

export interface VerifyFirstTimeResponse {
  token?: string;
  message?: string;
  data?: { token?: string };
  value?: { token?: string };
}

export interface SetInitialPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}