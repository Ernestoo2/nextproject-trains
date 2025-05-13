import { ApiResponse, AuthUser, UserRole } from "@/types/shared";

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthResponse = ApiResponse<AuthUser>;
