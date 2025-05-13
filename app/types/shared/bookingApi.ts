import { Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./api";
import { Booking } from "./database";
import { NotificationType } from "./notificationApi";
import { PaymentStatus } from "./paymentApi";
import { BookingDetails } from "./trains";


export interface PassengerRequest {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  seatPreference?: string;
  berthPreference?: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE';
  specialRequirements?: string[];
}

export interface BookingCreateRequest {
  scheduleId: Types.ObjectId;
  passengers: PassengerRequest[];
  class: string;
  promoCode?: string;
  notificationPreferences?: {
    channels: ('EMAIL' | 'SMS' | 'PUSH')[];
    types: NotificationType[];
  };
}

export interface BookingUpdateRequest {
  status?: 'CONFIRMED' | 'CANCELLED';
  paymentStatus?: PaymentStatus;
  passengers?: Partial<PassengerRequest>[];
  seatAssignments?: Record<string, string>;
}

export interface BookingResponse extends Omit<Booking, '_id'> {
  id: string;
  schedule: {
    trainNumber: string;
    trainName: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    platform?: string;
  };
  fare: {
    base: number;
    taxes: number;
    total: number;
    discount?: number;
    promoCode?: string;
    breakdown: {
      serviceFee?: number;
      gst?: number;
      insurance?: number;
    };
  };
}

export type BookingListResponse = PaginatedApiResponse<BookingDetails[]>;

export interface BookingSearchParams {
  userId?: Types.ObjectId;
  pnr?: string;
  status?: string;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  trainNumber?: string;
  page?: number;
  limit?: number;
}

export interface BookingSeatMap {
  coach: string;
  seats: Array<{
    number: string;
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'MAINTENANCE';
    passenger?: {
      pnr: string;
      name: string;
    };
  }>;
  layout: {
    rows: number;
    columns: number;
    aislePositions: number[];
  };
}

export interface CancellationRequest {
  bookingId: Types.ObjectId;
  reason?: string;
  refundAccount?: {
    type: 'BANK' | 'WALLET';
    details: Record<string, any>;
  };
}