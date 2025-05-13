import mongoose, { Document, Schema } from "mongoose";
import { IBookingDocument } from "./Booking";

export interface IPayment {
  bookingId: Schema.Types.ObjectId | IBookingDocument;
  userId: Schema.Types.ObjectId;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PROCESSING';
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'PAYPAL';
  transactionId: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentDocument extends IPayment, Document {
  _id: Schema.Types.ObjectId;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PROCESSING'],
      default: 'PENDING',
      required: true,
    },
    method: {
      type: String,
      enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'PAYPAL'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.models.Payment as mongoose.Model<IPaymentDocument> || 
  mongoose.model<IPaymentDocument>("Payment", paymentSchema);