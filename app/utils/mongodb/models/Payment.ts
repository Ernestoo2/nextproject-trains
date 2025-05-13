import mongoose from "mongoose";
import {
  PaymentDocument,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "@/types/payment.types";

interface PaymentVirtuals {
  formattedAmount: string;
}

const paymentSchema = new mongoose.Schema<PaymentDocument, {}, PaymentVirtuals>(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      required: true,
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
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function (this: PaymentDocument) {
  return `₦${this.amount.toLocaleString()}`;
});

export const Payment =
  mongoose.models.Payment ||
  mongoose.model<
    PaymentDocument,
    mongoose.Model<PaymentDocument, {}, PaymentVirtuals>
  >("Payment", paymentSchema);
