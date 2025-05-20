import mongoose, { Document } from "mongoose";
import { PaymentMethod, PaymentStatus } from "@/types/shared/payments";

// Define enums for schema validation
const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PROCESSING: "PROCESSING",
} as const;

const PAYMENT_METHOD = {
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  UPI: "UPI",
  NET_BANKING: "NET_BANKING",
  WALLET: "WALLET",
  PAYPAL: "PAYPAL",
} as const;

// Define the document interface
export interface PaymentDocument extends Document {
  booking: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId: string;
  gatewayResponse?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentHistorySchema = new mongoose.Schema<PaymentDocument>(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Indexes for frequent queries
paymentHistorySchema.index({ user: 1, status: 1 });
paymentHistorySchema.index({ booking: 1 });

export const PaymentHistory =
  mongoose.models.PaymentHistory ||
  mongoose.model<PaymentDocument>("PaymentHistory", paymentHistorySchema);
