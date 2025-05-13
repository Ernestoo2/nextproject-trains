import { Booking } from "./database";
import { UserProfile } from "./users";

 

//app/types/shared/payments.ts

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "UPI"
  | "NET_BANKING"
  | "WALLET";

export interface Payment {
  _id: string;
  user: string | UserProfile;
  booking: string | Booking;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  _id: string;
  user: string | UserProfile;
  payments: Payment[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentMethod {
  id: number;
  name: string;
  icon: string;
  description: string;
  isSelected: boolean;
}

export interface PaymentProps {
  methods: PaymentMethod[];
  onMethodSelect: (id: number) => void;
}

export interface PaymentInitiateRequest {
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    status: PaymentStatus;
    gatewayRedirectUrl?: string;
  };
  error?: string;
}
