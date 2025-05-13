import mongoose, { Schema } from "mongoose";
import { BookingStatus } from "@/types/shared/booking";
import { PaymentStatus } from "@/types/shared/payments";

export const BERTH_PREFERENCE = {
  LOWER: "LOWER",
  MIDDLE: "MIDDLE",
  UPPER: "UPPER",
  SIDE: "SIDE",
} as const;

const PassengerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ADULT", "CHILD", "INFANT"],
      required: true,
    },
    berthPreference: {
      type: String,
      enum: Object.values(BERTH_PREFERENCE),
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const BookingSchema = new Schema(
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
      enum: ["DRAFT", "INITIATED", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "DRAFT",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    passengers: [PassengerSchema],
    selectedClass: {
      type: String,
      required: true,
    },
    availableSeats: {
      type: Map,
      of: Number,
      default: {},
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    baseFare: {
      type: Number,
      required: true,
      default: 0,
    },
    taxes: {
      type: Number,
      required: true,
      default: 0,
    },
    promoDiscount: {
      type: Number,
      default: 0,
    },
    promoCode: String,
    has20PercentOffer: {
      type: Boolean,
      default: false,
    },
    has50PercentOffer: {
      type: Boolean,
      default: false,
    },
    fareDetails: {
      perPersonFare: {
        type: Number,
        required: true,
        default: 0,
      },
      baseTicketFare: {
        type: Number,
        required: true,
        default: 0,
      },
      taxes: {
        type: Number,
        required: true,
        default: 0,
      },
      totalFare: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    transactionId: String,
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

