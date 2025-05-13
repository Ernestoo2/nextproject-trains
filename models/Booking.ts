import mongoose, { Document, Schema } from "mongoose";
import { IScheduleDocument } from "@/types/schedule/scheduleBase.types";

export interface IPassenger {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  seatNumber?: string;
  berthPreference?: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE';
}

export interface IBookingFare {
  base: number;
  taxes: number;
  total: number;
  discount?: number;
  promoCode?: string;
}

export interface IBooking {
  userId: Schema.Types.ObjectId;
  scheduleId: Schema.Types.ObjectId | IScheduleDocument;
  pnr: string;
  status: 'INITIATED' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  passengers: IPassenger[];
  fare: IBookingFare;
  class: string;
  transactionId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookingDocument extends IBooking, Document {
  _id: Schema.Types.ObjectId;
}

const passengerSchema = new Schema<IPassenger>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { 
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    required: true 
  },
  seatNumber: String,
  berthPreference: {
    type: String,
    enum: ['LOWER', 'MIDDLE', 'UPPER', 'SIDE']
  }
}, { _id: false });

const fareSchema = new Schema<IBookingFare>({
  base: { type: Number, required: true },
  taxes: { type: Number, required: true },
  total: { type: Number, required: true },
  discount: Number,
  promoCode: String
}, { _id: false });

const bookingSchema = new Schema<IBookingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    pnr: { 
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['INITIATED', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'],
      default: 'INITIATED',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      required: true,
    },
    passengers: [passengerSchema],
    fare: {
      type: fareSchema,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    transactionId: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ scheduleId: 1, status: 1 });
bookingSchema.index({ pnr: 1 }, { unique: true });
bookingSchema.index({ transactionId: 1 });

export const Booking = mongoose.models.Booking as mongoose.Model<IBookingDocument> || 
  mongoose.model<IBookingDocument>("Booking", bookingSchema);