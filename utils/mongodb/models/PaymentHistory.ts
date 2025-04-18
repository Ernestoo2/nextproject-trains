import { Schema, model, Document } from 'mongoose';

export interface IPaymentHistory extends Document {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  status: "completed" | "pending" | "failed";
  method: string;
  bookingId: string;
  reference: string;
  metadata?: {
    trainNumber?: string;
    departureStation?: string;
    arrivalStation?: string;
    class?: string;
  };
}

const PaymentHistorySchema = new Schema<IPaymentHistory>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ["completed", "pending", "failed"] 
  },
  method: { type: String, required: true },
  bookingId: { type: String, required: true },
  reference: { type: String, required: true },
  metadata: {
    trainNumber: String,
    departureStation: String,
    arrivalStation: String,
    class: String
  }
}, {
  timestamps: true
});

export const PaymentHistory = model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema); 