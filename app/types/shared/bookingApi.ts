import { Types } from "mongoose";
import { PaginatedApiResponse } from "./api";
import { Booking } from "./database";  
import { BookingDetails } from "./trains";
import { PaymentStatus } from "./payments";


export interface PassengerRequest {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  seatPreference?: string;
  berthPreference?: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE';
  specialRequirements?: string[];
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