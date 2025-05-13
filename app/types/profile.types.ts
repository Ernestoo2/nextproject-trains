import { Types } from "mongoose";
import { BaseApiResponse } from "./shared/api";

//app/types/profile.types.ts

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserPreferences {
  language?: string;
  currency?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  berthPreference?: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE';
}

export interface UserDocument {
  type: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVING_LICENSE';
  number: string;
  expiryDate: string;
  isVerified: boolean;
}

export interface UserProfile {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  address?: UserAddress;
  preferences?: UserPreferences;
  documents?: UserDocument[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  address?: UserAddress;
  preferences?: UserPreferences;
}

export interface DocumentUploadRequest {
  type: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVING_LICENSE';
  number: string;
  expiryDate: string;
  file: File;
}

export interface ProfileResponse extends BaseApiResponse {
  data?: UserProfile;
  verificationRequired?: boolean;
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  documents: boolean;
  overall: boolean;
}