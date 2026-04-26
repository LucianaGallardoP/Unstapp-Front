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