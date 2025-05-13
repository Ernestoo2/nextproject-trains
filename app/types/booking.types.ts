import { Document, Types } from "mongoose";
import type { ScheduleStatus} from "./shared/base.types";
import type { MongoDocument, Schedule } from "./shared/database";

// Enums
export const BOOKING_STATUS = {
  INITIATED: "INITIATED",
  CONFIRMED: "CONFIRMED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const BERTH_PREFERENCES = {
  LOWER: "LOWER",
  MIDDLE: "MIDDLE",
  UPPER: "UPPER",
  SIDE: "SIDE",
} as const;

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

// Type definitions
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type BerthPreference = typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES];
export type Gender = typeof GENDER[keyof typeof GENDER];

// Interfaces
export interface Passenger {
  firstName: string;
  lastName: string;
  age: number;
  type: "ADULT" | "CHILD" | "INFANT";
  nationality: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  identificationType?: "passport" | "nationalId" | "driverLicense";
  identificationNumber?: string;
  seatNumber?: string;
  berthPreference?: "LOWER" | "UPPPER" | "MIDDLE" | "SIDE";
  seat?: string;
  phone?: string;
}

export interface BookingFare {
  base: number;
  taxes: number;
  total: number;
  discount?: number;
  promoCode?: string;
}

export interface IBooking {
  userId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  pnr: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  passengers: Passenger[];
  fare: BookingFare;
  class: string;
  transactionId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingDocument extends IBooking, Document {
  _id: Types.ObjectId;
  formattedFare: string; // Virtual
  bookingReference: string;
  trainId: string;
  routeId: string;
  classId: string;
  travelDate: Date;
  totalAmount: number;
  paymentId?: string;
  cancellationReason?: string;
  specialRequests?: string[];
}

export interface BookingDetails {
  scheduleId: string;
  trainId: string;
  class: string;
  baseFare: number;
  taxes: number;
  promoDiscount: number;
  has20PercentOffer: boolean;
  totalPrice: number;
  taxAndGST: number;
}

export interface Booking extends MongoDocument {
  user: string;
  schedule: string | Schedule;
  trainClass: string;
  travelers: Passenger[];
  totalFare: number;
  status: ScheduleStatus;
  pnr: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  transactionId?: string;
  promoCode?: string;
  promoDiscount?: number;
  taxes?: number;
  baseFare?: number;
}

export const TAX_RATE = 0.18; // 18% tax rate
export const PROMO_CODES = {
  WELCOME20: 0.2, // 20% discount
  WELCOME10: 0.1, // 10% discount
  SEASONAL50: 0.5, // 50% seasonal discount
} as const;

export type PromoCode = keyof typeof PROMO_CODES;

export interface BookingState {
  passengers: Passenger[];
  selectedClass: string;
  promoCode?: PromoCode;
  has20PercentOffer: boolean;
  has50PercentOffer: boolean;
  totalFare: number;
  bookingDetails?: Partial<Booking>;
}

export type BookingAction =
  | { type: "ADD_PASSENGER"; payload: Passenger }
  | { type: "REMOVE_PASSENGER"; payload: number }
  | { type: "UPDATE_CLASS"; payload: string }
  | { type: "APPLY_PROMO"; payload: PromoCode }
  | { type: "TOGGLE_20_PERCENT_OFFER" }
  | { type: "TOGGLE_50_PERCENT_OFFER" }
  | { type: "CALCULATE_TOTAL"; payload: number }
  | { type: "SET_BOOKING_DETAILS"; payload: Partial<Booking> };
