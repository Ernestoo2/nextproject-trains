export type UserRole = "user" | "admin" | "staff";
export type Gender = "male" | "female" | "other";
export const USER_ROLES = ["user", "admin", "staff"] as const;

export interface UserDocument {
  name: string;
  email: string;
  password?: string;
  naijaRailsId: string;
  phone: string;
  role: UserRole;
  address: string;
  dob: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  naijaRailsId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends BaseUser {
  phone?: string;
  phoneNumber?: string; // Alternative field name used in some APIs
  address?: string;
  dob?: string;
  image?: string;
  defaultNationality?: string;
  nationality?: string; // Alternative field name used in some APIs
  preferredBerth?: "LOWER" | "MIDDLE" | "UPPER" | "SIDE";
  age?: number;
  gender?: Gender;
  fullName?: string; // Alternative field name used in some APIs
}

export interface AuthUser extends BaseUser {
  password?: string; // Only used during registration/login
}

// Type for the session user
export interface SessionUser extends BaseUser {
  image?: string | null;
}

// NaijaRails specific profile type
export interface NaijaRailsProfile extends Omit<UserProfile, "id" | "role"> {
  userId: string; // Reference to the base user
  naijaRailsId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  defaultNationality: string;
  preferredBerth: "LOWER" | "MIDDLE" | "UPPER" | "SIDE";
  age?: number;
  gender?: Gender;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
