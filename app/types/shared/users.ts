import { BerthPreference } from "../booking.types";

export type UserRole = "USER";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export const USER_ROLES = ["USER"];

// Base user fields that are always required
interface BaseUserFields {
  id: string;
  naijaRailsId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Optional user profile fields
interface OptionalUserFields {
  phone?: string;
  address?: string;
  dob?: string;
  image?: string;
  defaultNationality?: string;
  preferredBerth?: BerthPreference;
  gender?: Gender;
  age?: number;
}

// Main user profile type
export interface UserProfile extends BaseUserFields, OptionalUserFields { }

// Database specific fields
export interface UserDocument extends Omit<UserProfile, 'id'> {
  _id: string;
  password: string;
  isVerified: boolean;
  lastLogin?: Date;
}

// Type for updating user profile - only optional fields can be updated
export type UserProfileUpdate = Partial<OptionalUserFields>;

// Next-Auth session user type
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  naijaRailsId: string;
  image?: string;
}
