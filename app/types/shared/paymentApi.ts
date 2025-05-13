import { Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./api";
import { NotificationType } from "./notificationApi";

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type PaymentMethod = 
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'WALLET'
  | 'PAYPAL';

export interface PaymentCreateRequest {
  bookingId: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  notificationPreferences?: {
    channels: ('EMAIL' | 'SMS' | 'PUSH')[];
    types: NotificationType[];
  };
}

export interface PaymentVerificationRequest {
  paymentId: Types.ObjectId;
  transactionId: string;
  status: PaymentStatus;
  gatewayResponse: Record<string, any>;
}

export interface PaymentRefundRequest {
  paymentId: Types.ObjectId;
  amount?: number;
  reason?: string;
  refundTo: {
    type: 'ORIGINAL' | 'BANK_ACCOUNT' | 'WALLET';
    details?: Record<string, any>;
  };
}

export interface PaymentResponse {
  id: string;
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayReference?: string;
  refundStatus?: 'NONE' | 'PARTIAL' | 'FULL';
  refundAmount?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  booking?: {
    pnr: string;
    trainNumber: string;
    travelDate: string;
  };
}

export type PaymentListResponse = PaginatedApiResponse<PaymentResponse[]>;

export interface PaymentSearchParams {
  userId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface PaymentGatewayConfig {
  gateway: 'STRIPE' | 'RAZORPAY' | 'PAYPAL';
  mode: 'TEST' | 'PRODUCTION';
  credentials: {
    apiKey: string;
    secretKey: string;
    merchantId?: string;
  };
  webhookSecret?: string;
  options?: Record<string, any>;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  gatewayReference: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaymentWebhookEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
  signature?: string;
}