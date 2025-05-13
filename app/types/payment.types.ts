import { Document, Types } from "mongoose";

// Enums
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PROCESSING: "PROCESSING",
} as const;

export const PAYMENT_METHOD = {
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  UPI: "UPI",
  NET_BANKING: "NET_BANKING",
  WALLET: "WALLET",
  PAYPAL: "PAYPAL",
} as const;

// Type definitions
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

// Interfaces
export interface IPayment {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId: string;
  metadata?: Map<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentDocument extends IPayment, Document {
  _id: Types.ObjectId;
  formattedAmount: string; // Virtual
}
