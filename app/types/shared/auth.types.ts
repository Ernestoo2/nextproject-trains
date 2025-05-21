import { Types } from "mongoose"; 
import { ApiResponse } from "./database";

export interface BaseModel {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

//app/types/shared/auth.types.ts

export interface AuthUser extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  lastLogin?: Date;
}

export type UserRole = 'USER';

export interface AuthToken {
  token: string;
  expiresAt: Date;
  type: 'ACCESS' | 'REFRESH' | 'VERIFICATION';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse extends ApiResponse<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> {
  redirectUrl?: string;
}

export interface VerificationData {
  userId: Types.ObjectId;
  token: string;
  type: 'EMAIL' | 'PHONE' | 'PASSWORD_RESET';
  expiresAt: Date;
}

export interface SessionData {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

export interface AuthHeaders {
  Authorization?: string;
  'x-refresh-token'?: string;
}

export type AuthMiddleware = (
  handler: (req: Request) => Promise<Response>
) => (req: Request) => Promise<Response>;