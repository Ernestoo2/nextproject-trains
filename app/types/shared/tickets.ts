import { TrainDetails } from "@/utils/type";
import { BookingStatus } from "./booking";
import { PaymentStatus } from "./payments";
import { MongoDocument } from "./trains";

//app/types/shared/tickets.ts

// Ticket information types
export interface DateInfo {
  departure: string;
  arrival: string;
}

export interface TimeInfo {
  departure: string;
  arrival: string;
}

export interface LocationInfo {
  departure: string;
  arrival: string;
}

export interface TravellerInfo {
  name: string;
  age: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  status: 'CONFIRMED' | 'WAITLISTED' | 'RAC';
  seat: string;
  berth?: 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE';
}

// Basic ticket type for database
export interface Ticket extends MongoDocument {
  trainNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  platform?: string;
  seat?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  trainDetails?: TrainDetails;
  pnr: string;
  userId: string;
  bookingId: string;
  fare: {
    base: number;
    taxes: number;
    total: number;
    discount?: number;
    promoCode?: string;
  };
  travellers: TravellerInfo[];
}

// Extended ticket details for display
export interface TicketDetails {
  pnr: string;
  transactionId: string;
  train: string;
  date: DateInfo;
  time: TimeInfo;
  locations: LocationInfo;
  email: string;
  traveller: TravellerInfo;
  fare: string;
}

// Ticket response types
export interface TicketResponse {
  success: boolean;
  data: TicketDetails;
  message: string;
}

export interface TicketsListResponse {
  success: boolean;
  data: Ticket[];
  message: string;
}