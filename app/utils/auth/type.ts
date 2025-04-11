export type UserRole = "user" | "admin";

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: UserType;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
