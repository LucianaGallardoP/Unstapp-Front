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
  avatarUrl?: string | null;
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
  resetToken?: string;
  registrationToken?: string;
  initialPasswordToken?: string;
  passwordToken?: string;
  message?: string;
  data?: VerifyFirstTimeResponse;
  value?: VerifyFirstTimeResponse;
  result?: VerifyFirstTimeResponse;
}

export interface SetInitialPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  dni: string;
}

export interface ForgotPasswordResponse {
  token?: string;
  resetToken?: string;
  passwordToken?: string;
  setPasswordToken?: string;
  message?: string;
  data?: ForgotPasswordResponse;
  value?: ForgotPasswordResponse;
  result?: ForgotPasswordResponse;
}
