import { Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./api";
 
export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
 

export interface TravelPreferences {
  preferredClass?: string;
  preferredSeat?: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
}

export interface UserPreferences {
  preferredClass?: string;
  preferredSeat?: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  address?: UserAddress;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocument {
  id: string;
  type: 'passport' | 'id_card' | 'drivers_license' | 'other';
  number: string;
  expiryDate: string;
  country: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  address?: UserAddress;
  preferences?: Partial<UserPreferences>;
}

export interface UserSearchParams {
  email?: string;
  phone?: string;
  isVerified?: boolean;
  membershipTier?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export type UserListResponse = PaginatedApiResponse<UserResponse[]>;

export interface DocumentUploadRequest {
  type: UserDocument['type'];
  number: string;
  expiryDate: string;
  file: File;
}

export interface DocumentVerificationRequest {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;
  verificationStatus: boolean;
  verificationNotes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}