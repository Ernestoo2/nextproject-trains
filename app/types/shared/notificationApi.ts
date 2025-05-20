import { Types } from "mongoose";
import { PaginatedApiResponse } from "./api";

//app/types/shared/notificationApi.ts

export type NotificationType = 
  | 'BOOKING_CONFIRMATION'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SCHEDULE_CHANGE'
  | 'BOOKING_REMINDER'
  | 'PLATFORM_UPDATE';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';

export interface NotificationTemplate {
  type: NotificationType;
  subject: string;
  content: string;
  variables: string[];
}

export interface NotificationCreateRequest {
  userId: Types.ObjectId;
  type: NotificationType;
  channels: NotificationChannel[];
  data: Record<string, any>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledFor?: Date;
}

export interface NotificationResponse {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  channels: NotificationChannel[];
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export type NotificationListResponse = PaginatedApiResponse<NotificationResponse[]>;

export interface NotificationPreferences {
  userId: Types.ObjectId;
  channels: {
    [key in NotificationType]: NotificationChannel[];
  };
  unsubscribed: NotificationType[];
}

export interface NotificationSearchParams {
  userId?: Types.ObjectId;
  type?: NotificationType;
  status?: NotificationStatus;
  isRead?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}