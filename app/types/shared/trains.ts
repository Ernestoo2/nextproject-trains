import { Gender} from "./users";
import { Types } from "mongoose";
import type { MongoDocument } from "./database";
import { PassengerType } from "./booking";
import { PaymentStatus } from "./paymentApi";
import { BERTH_PREFERENCES, BerthPreference } from "../booking.types";

// Base Types
export type TripType = "ONE_WAY" | "ROUND_TRIP";
export type ScheduleStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED";
export type TrainClassType = "ECONOMY" | "BUSINESS" | "FIRST_CLASS" | "SLEEPER" | "STANDARD";
export type IdentificationType = "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE";

// Constants
export const TRIP_TYPES = {
  ONE_WAY: "ONE_WAY",
  ROUND_TRIP: "ROUND_TRIP",
} as const;

export const SCHEDULE_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DELAYED: "DELAYED",
} as const;

export const TRAIN_CLASSES = {
  ECONOMY: "ECONOMY",
  BUSINESS: "BUSINESS",
  FIRST_CLASS: "FIRST_CLASS",
} as const;

// Core Entity Types
export interface Station {
  _id: string;
  stationName: string;
  stationCode: string;
  city: string;
  state: string;
  region: string;
  address: string;
  facilities: string[];
  platforms: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidStation extends Station {
  _id: string;
  id?: string;
}

export interface TrainClass {
  fare?: number;
  baseFare?: number;
  _id: string;
  className: string;
  classCode: string;
  classType: string;
  basePrice: number;
  isActive: boolean;
  capacity?: number;
  amenities?: string[];
  description?: string;
}

export interface TrainClassResponse {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  isActive: boolean;
}

export interface Route {
  _id: string;
  routeCode: string;
  routeName: string;
  fromStation: Station;
  toStation: Station;
  distance: number;
  estimatedDuration: string;
  baseFare: number;
  availableClasses: TrainClass[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Passenger Related Types
export interface PassengerDetails {
  classType: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  age: number;
  type: PassengerType;
  nationality: string;
  gender: Gender;
  selectedClassId: string;
  identificationType?: IdentificationType;
  identificationNumber?: string;
  seatNumber?: string;
  berthPreference?: BerthPreference;
  seat?: string;
  phone?: string;
}

// Schedule Related Types
export interface Schedule extends MongoDocument {
  train:
    | string
    | {
        _id: string;
        trainNumber: string;
        trainName: string;
      };
  route: string | Route;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string;
  arrivalTime: string;
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  delayReason?: string;
  date: string;
  duration: string;
  platform?: string;
  status: ScheduleStatus;
  availableClasses: Array<{
    className: string;
    classCode: string;
    availableSeats: number;
    fare: number;
    name: string;
    code: string;
    baseFare: number;
  }>;
  distance?: number;
  isActive: boolean;
}

// Search Related Types
export interface SearchParams {
  fromStationId: string;
  toStationId: string;
  date: string;
  tripType: TripType;
  classType: string;
  passengers: PassengerDetails;
}

// Booking Related Types
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
  trainClass: string | TrainClass;
  travelers: Passenger[];
  totalFare: number;
  totalPrice?: number;
  baseFare?: number;
  taxes?: number;
  promoDiscount?: number;
  status: ScheduleStatus;
  pnr: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  promoCode?: string;
}

// Additional constants and types for bookings

 
export const TAX_RATE = 0.18; // 18% tax rate
export const PROMO_CODES = {
  WELCOME20: 0.2, // 20% discount
  WELCOME10: 0.1, // 10% discount
  SEASONAL50: 0.5, // 50% seasonal discount
} as const;

export type PromoCode = keyof typeof PROMO_CODES;

// Booking state related types
export interface BookingState {
  passengers: Passenger[];
  selectedClass: TrainClassType;
  promoCode?: PromoCode;
  has20PercentOffer: boolean;
  has50PercentOffer: boolean;
  totalFare?: number;
  totalPrice?: number;
  baseFare?: number;
  taxes?: number;
  promoDiscount?: number;
  availableSeats?: Record<string, number>;
  schedule?: Schedule;
  fareDetails?: FareDetails;
  bookingDetails?: Partial<Booking>;
}
export interface FareDetails {
  perPersonFare: number;
  baseTicketFare: number;
  taxes: number;
  totalFare: number;
}
export type BookingAction =
  | { type: "ADD_PASSENGER"; payload: Passenger }
  | { type: "REMOVE_PASSENGER"; payload: number }
  | { type: "UPDATE_CLASS"; payload: TrainClassType }
  | { type: "APPLY_PROMO"; payload: PromoCode }
  | { type: "TOGGLE_20_PERCENT_OFFER" }
  | { type: "TOGGLE_50_PERCENT_OFFER" }
  | { type: "CALCULATE_TOTAL"; payload: number }
  | { type: "SET_BOOKING_DETAILS"; payload: Partial<Booking> };

// Component Props Types
export interface TrainScheduleCardProps {
  schedule: Schedule & {
    duration: string;
    availableClasses: Array<
      TrainClass & {
        availableSeats: number;
      }
    >;
  };
  selectedClass: string;
  date: string;
}

export interface RouteSearchParams
  extends Required<
    Pick<SearchParams, "fromStationId" | "toStationId" | "date">
  > {
  passengers: number;
  classType?: string;
}

// Pricing Types
export interface PricingDetails {
  baseFare: number;
  tax: number;
  total: number;
}

export interface RouteSearchResponse {
  availableRoutes: Route[];
  pricing: {
    routeId: string;
    classPricing: Record<string, PricingDetails>;
  }[];
}

// Booking Flow State
export type BookingStage =
  | "ROUTE_SELECTION"
  | "PASSENGER_DETAILS"
  | "SEAT_SELECTION"
  | "PAYMENT";

export interface RouteState {
  selectedRoute: Route | null;
  selectedTrip: string | null;
  passengerDetails: PassengerDetails;
  bookingStage: 'ROUTE_SELECTION' | 'PASSENGER_DETAILS' | 'PAYMENT' | 'CONFIRMATION';
}

// Unified train details type that works for both API and frontend
export interface UnifiedTrainDetails {
  _id: string;
  trainName: string;
  trainNumber: string;
  classes: Array<{
    _id: string;
    name: string;
    code: string;
    baseFare?: number;
  }>;
  routes: Array<{
    station: {
      _id: string;
      name: string;
      code: string;
    };
    arrivalTime: string;
    departureTime: string;
    day: number;
  }>;
  isActive: boolean;
}

export interface TrainDetails {
  _id: string;
  trainName: string;
  trainNumber: string;
  classes: Array<{
    _id: string;
    name: string;
    code: string;
    baseFare: number;
  }>;
  routes: Array<{
    station: {
      _id: string;
      name: string;
      code: string;
    };
    arrivalTime: string;
    departureTime: string;
    day: number;
  }>;
  isActive: boolean;
}

// Legacy train details type for backward compatibility
export interface LegacyTrainDetails {
  id: number;
  trainName: string;
  runsOn: string;
  startDate: string;
  endDate: string;
  departureTime: string;
  arrivalTime: string;
  departureStation: string;
  arrivalStation: string;
  duration: string;
}

// Component props using the unified type
export interface TrainCardProps {
  train: UnifiedTrainDetails;
}

export interface BookingRightProps {
  bookingId: string;
  schedule: Schedule;
}

export interface ScheduleWithDetails {
  _id: string;
  trainNumber: string;
  trainName: string;
  train: {
    id: string;
    name: string;
    number: string;
    classes: {
      id: string;
      name: string;
      code: string;
      baseFare: number;
      capacity: number;
    }[];
  };
  route: {
    id: string;
    name: string;
    distance: number;
    duration: string;
    baseFare: number;
    fromStation: Station;
    toStation: Station;
  };
  availableClasses: {
    className: string;
    classCode: string;
    name: string;
    code: string;
    baseFare: number;
    availableSeats: number;
    fare: number;
  }[];
  date: string;
  departureTime: string;
  arrivalTime: string;
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  delayReason?: string;
  duration: string;
  distance: number;
  platform: string;
  status: ScheduleStatus;
  isActive: boolean;
  departureStation: Station;
  arrivalStation: Station;
}

// Centralized shared type definitions for trains

export interface ITrainRoute {
  station: {
    _id: string;
    name: string;
    code: string;
  };
  arrivalTime: string;
  departureTime: string;
  day: number;
}

export interface ITrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: string;
}

export interface ITrain {
  _id: string;
  trainName: string;
  trainNumber: string;
  routes: ITrainRoute[];
  classes: ITrainClass[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  capacity: number;
  facilities: string[];
  status: string;
}
