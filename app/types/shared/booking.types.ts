import { IdentificationType } from "./trains";

export const BERTH_PREFERENCES = {
  LOWER: "lower",
  MIDDLE: "middle",
  UPPER: "upper",
} as const;

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PassengerType = "ADULT" | "CHILD" | "INFANT";

export interface BookingFare {
  base: number;
  taxes: number;
  total: number;
  discount?: number;
  promoCode?: string;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  age: number;
  gender: typeof GENDER[keyof typeof GENDER];
  nationality: string;
  berthPreference: typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES];
  selectedClassId: string;
  type: PassengerType;
  identificationType?: IdentificationType;
  identificationNumber?: string;
  seatNumber?: string;
  seat?: string;
  phone?: string;
}

export interface BookingFormState {
  passengers: Passenger[];
  selectedClass: string;
  has20PercentOffer: boolean;
  has50PercentOffer: boolean;
  totalFare: number;
  promoCode?: string;
}

export interface BookingState extends BookingFormState {
  scheduleDetails?: any; // Replace with proper Schedule type if needed
  currentDefaultClassId?: string;
}

export interface BookingDocument {
  _id: string;
  userId: string;
  scheduleId: string;
  passengers: Passenger[];
  selectedClass: string;
  totalFare: number;
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
  paymentStatus: typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingResponse {
  success: boolean;
  data?: BookingDocument;
  error?: string;
}

export interface BookingStatus {
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
  message: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  status: typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
  method: string;
  transactionId?: string;
}

export interface BookingSummary {
  bookingId: string;
  scheduleDetails: any; // Replace with proper Schedule type if needed
  passengers: Passenger[];
  totalFare: number;
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
  paymentStatus: typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
  createdAt: Date;
} 