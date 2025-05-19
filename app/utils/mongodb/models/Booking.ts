import mongoose from "mongoose";
import {
  BookingDocument,
  BookingFare,
  Passenger,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  BERTH_PREFERENCES,
  GENDER,
} from "@/types/booking.types";

interface BookingVirtuals {
  formattedFare: string;
}

const passengerSchema = new mongoose.Schema<Passenger>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    type: { type: String, required: true, enum: ["ADULT", "CHILD", "INFANT"] },
    nationality: { type: String, required: true },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true,
    },
    identificationType: String,
    identificationNumber: String,
    seatNumber: String,
    berthPreference: {
      type: String,
      enum: Object.values(BERTH_PREFERENCES),
    },
    seat: String,
    phone: String,
  },
  { _id: false }
);

const fareSchema = new mongoose.Schema<BookingFare>(
  {
    base: { type: Number, required: true },
    taxes: { type: Number, required: true },
    total: { type: Number, required: true },
    discount: Number,
    promoCode: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema<BookingDocument, {}, BookingVirtuals>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
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
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.INITIATED,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ scheduleId: 1, status: 1 });
bookingSchema.index({ transactionId: 1 });

// Virtual for formatted fare
bookingSchema.virtual("formattedFare").get(function (this: BookingDocument) {
  return `₦${this.fare.total.toLocaleString()}`;
});

export const Booking =
  mongoose.models.Booking ||
  mongoose.model<
    BookingDocument,
    mongoose.Model<BookingDocument, {}, BookingVirtuals>
  >("Booking", bookingSchema);
