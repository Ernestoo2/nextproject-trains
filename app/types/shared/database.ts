import { Types } from "mongoose";
import type { BookingStatus } from "./booking";
import type { PaymentStatus } from "./payments";
import type { Passenger, ScheduleStatus, Station, TrainClass } from "./trains";

// Base MongoDB Document Type
export interface MongoDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Database Schema Types
export interface Schedule extends MongoDocument {
  train: Types.ObjectId;
  route: Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Record<string, number>;
  status: ScheduleStatus;
  platform?: string;
  fare: Partial<Record<"ECONOMY" | "BUSINESS" | "FIRST_CLASS", number>>;
  duration?: string;
}

export interface Booking extends MongoDocument {
  userId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  pnr: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  passengers: Array<Passenger>;
  selectedClass: string;
  availableSeats: Record<string, number>;
  schedule: Schedule | null;
  
  // Fare related fields
  totalPrice: number;
  baseFare: number;
  taxes: number;
  promoDiscount?: number;
  promoCode?: string;
  
  // Offer flags
  has20PercentOffer: boolean;
  has50PercentOffer: boolean;
  
  // Detailed fare breakdown
  fareDetails: {
    perPersonFare: number;
    baseTicketFare: number;
    taxes: number;
    totalFare: number;
  };
  
  // Payment related
  transactionId?: string;
}

export interface Payment extends MongoDocument {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  transactionId: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasMore: boolean;
  };
}

// Frontend Types
export interface ScheduleWithDetails {
  _id: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  platform?: string;
  status: ScheduleStatus;
  availableClasses: Array<
    TrainClass & { availableSeats: number; fare: number }
  >;
  route?: {
    _id: string;
    fromStation: Station;
    toStation: Station;
    distance: number;
    baseFare: number;
    estimatedDuration: string;
    availableClasses: string[];
  };
}

// API Response interfaces
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends DatabaseResponse<T> {
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ScheduleSearchResponse {
  success: boolean;
  data?: ScheduleWithDetails[];
  message?: string;
  error?: string;
}

export interface DailySchedulesResponse {
  success: boolean;
  schedules: ScheduleWithDetails[];
  message?: string;
}
