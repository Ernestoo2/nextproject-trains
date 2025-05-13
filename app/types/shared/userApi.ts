import { Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./api";
import { NotificationChannel, NotificationType } from "./notificationApi";

//app/types/shared/userApi.ts

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface NotificationPreferences {
  BOOKING_CONFIRMATION: NotificationChannel[];
  PAYMENT_SUCCESS: NotificationChannel[];
  PAYMENT_FAILED: NotificationChannel[];
  SCHEDULE_CHANGE: NotificationChannel[];
  BOOKING_REMINDER: NotificationChannel[];
  PLATFORM_UPDATE: NotificationChannel[];
}

export interface TravelPreferences {
  preferredClass?: string;
  preferredSeat?: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
}

export interface UserPreferences {
  language?: string;
  currency?: string;
  notifications: {
    channels: {
      [key in NotificationType]: NotificationChannel[];
    };
    unsubscribed: NotificationType[];
  };
  travelPreferences: {
    preferredClass?: string;
    berthPreference?: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE';
    mealPreference?: 'VEG' | 'NON_VEG' | 'VEGAN' | 'NONE';
    specialAssistance?: string[];
  };
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

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: UserAddress;
  preferences: UserPreferences;
  documents: UserDocument[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    totalBookings: number;
    cancelledBookings: number;
    totalSpent: number;
    preferredRoutes: string[];
    membershipTier?: string;
    loyaltyPoints?: number;
  };
}

export interface UserProfileResponse extends BaseApiResponse {
  data: UserResponse;
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