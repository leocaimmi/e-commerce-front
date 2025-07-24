export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  birthday?: string;
  profilePictureUrl?: string;
}

export interface RegisterRequest {
  name: string;
  birthday: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePictureUrl?: string;
  role: 'CLIENT';
}

export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  token: string;
}
export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
};