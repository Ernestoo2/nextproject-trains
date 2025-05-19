import { ApiResponse, } from "@/types/shared";
import { AuthUser } from "@/types/shared/auth.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthResponse = ApiResponse<AuthUser>;
