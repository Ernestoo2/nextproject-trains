import { PAYMENT_METHOD } from "@/types/payment.types";
import { PAYMENT_STATUS } from "@/types/shared/booking.types";
import mongoose, { Schema, Types } from "mongoose";


interface PaymentVirtuals {
  formattedAmount: string;
}

interface PaymentDocument extends Types.Subdocument {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  status: typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
  method: typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];
  transactionId: string;
  gatewayResponse: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument, {}, PaymentVirtuals>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
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
    transactionId: { type: String, required: true, unique: true },
    gatewayResponse: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
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
