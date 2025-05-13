import { Document, Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./shared/api";

// MongoDB document types (extending shared types with Document)
export interface StationDocument extends Document {
  name: string;
  code: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainClassDocument extends Document {
  name: string;
  code: string;
  baseFare: number;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteDocument extends Document {
  fromStation: Types.ObjectId;
  toStation: Types.ObjectId;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainDocument extends Document {
  trainName: string;
  trainNumber: string;
  classes: Types.ObjectId[];
  routes: Array<{
    route: Types.ObjectId;
    arrivalTime: string;
    departureTime: string;
    day: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleDocument extends Document {
  train: Types.ObjectId;
  route: Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Map<string, number>;
  status: string;
  platform?: string;
  fare: Map<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  duration: string; // Virtual
}

// Passenger related types
export interface PassengerDetails {
  classType: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

// Component props that need Document types
export interface TrainScheduleCardProps {
  schedule: ScheduleDocument & {
    duration: string;
    availableClasses: Array<
      TrainClassDocument & {
      availableSeats: number;
      }
    >;
  };
  selectedClass: string;
  date: string;
}

// Route related types
export interface RouteCreateRequest {
  fromStationId: Types.ObjectId;
  toStationId: Types.ObjectId;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClassIds: Types.ObjectId[];
}

export interface RouteUpdateRequest {
  distance?: number;
  baseFare?: number;
  estimatedDuration?: string;
  availableClassIds?: Types.ObjectId[];
  isActive?: boolean;
}

export interface RouteWithDetails {
  _id: Types.ObjectId;
  fromStation: StationDocument;
  toStation: StationDocument;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: TrainClassDocument[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteSearchParams {
  fromStationId?: Types.ObjectId;
  toStationId?: Types.ObjectId;
  availableClassId?: Types.ObjectId;
  maxDistance?: number;
  maxFare?: number;
  page?: number;
  limit?: number;
}

export type RouteListResponse = PaginatedApiResponse<RouteWithDetails[]>;
