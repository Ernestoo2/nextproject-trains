import { Document } from 'mongoose';

export interface StationType extends Document {
  _id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  isActive: boolean;
}

export interface TrainClass extends Document {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  description?: string;
  isActive: boolean;
}

export interface Route extends Document {
  _id: string;
  fromStation: StationType;
  toStation: StationType;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: TrainClass[];
  isActive: boolean;
}

export interface Train extends Document {
  _id: string;
  trainName: string;
  trainNumber: string;
  routes: Array<{
    route: Route;
    arrivalTime: string;
    departureTime: string;
  }>;
  classes: TrainClass[];
  isActive: boolean;
}

export interface Schedule extends Document {
  _id: string;
  train: Train;
  route: Route;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Record<string, number>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  platform?: string;
  isActive: boolean;
  fare?: Record<string, number>;
}

export interface ScheduleWithDetails {
  _id: string;
  trainNumber: string;
  trainName: string;
  departureStation: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
  arrivalStation: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableClasses: Array<{
    _id: string;
    name: string;
    code: string;
    baseFare: number;
    availableSeats: number;
  }>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  platform?: string;
}

export interface SearchParams {
  fromStationId?: string;
  toStationId?: string;
  date?: string;
  classType?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
}

export interface Trip {
  id: string;
  routeId: string;
  trainId: string;
  departureTime: string;
  date: string;
  arrivalTime: string;
  availableSeats: {
    [className: string]: number;
  };
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  route: {
    id: string;
    fromStation: string;
    toStation: string;
    distance: number;
    baseFare: number;
    estimatedDuration: string;
    availableClasses: string;
  } | undefined;
  train: {
    id: string;
    trainName: string;
    trainNumber: string;
} | undefined
}

export interface PassengerDetails {
  classType: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

export interface RouteSearchParams {
  fromStationId: string;
  toStationId: string;
  date: string;
  passengers: number;
  classType?: string;
}

export interface PricingDetails {
  baseFare: number;
  tax: number;
  total: number;
}

export interface RouteSearchResponse {
  availableRoutes: Route[];
  pricing: {
    routeId: string;
    classPricing: {
      [className: string]: PricingDetails;
    };
  }[];
}

export interface RouteState {
  selectedRoute: Route | null;
  selectedTrip: Trip | null;
  passengerDetails: PassengerDetails;
  bookingStage: 'ROUTE_SELECTION' | 'PASSENGER_DETAILS' | 'SEAT_SELECTION' | 'PAYMENT';
} 