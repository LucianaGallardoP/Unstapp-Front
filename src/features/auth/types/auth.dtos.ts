// Basado en LoginRequestDto.cs y LoginResponseDto.cs [cite: 667]
export interface LoginRequest {
  dni: string;      // El backend requiere DNI en lugar de email [cite: 668]
  password: string; 
}

export interface LoginResponse {
  userId: number;
  fullName: string;
  roles: string[];  // Refleja el List<string> de C# [cite: 672]
  token: string;    // Tu futuro JWT [cite: 673]
  expiresAt: string; // Formato ISO 8601 [cite: 342, 674]
}