export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface AuthUser {
  userId: string;
  nombre: string;
  rol: 'Admin' | 'Defensor';
  token: string;
}
