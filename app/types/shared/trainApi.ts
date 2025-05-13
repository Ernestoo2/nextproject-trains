import { Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./api";
import { ITrain, ITrainClass, Route, TrainDetails } from "@/types/shared/trains";

//app/types/shared/trainApi.ts

export interface TrainRoute {
  route: Types.ObjectId | Route;
  station: {
    _id: string;
    name: string;
    code: string;
  };
  arrivalTime: string;
  departureTime: string;
  day: number;
  stoppages?: Array<{
    station: Types.ObjectId;
    arrivalTime: string;
    departureTime: string;
    distance: number;
    platform?: string;
  }>;
}

export interface TrainCreateRequest {
  trainName: string;
  trainNumber: string;
  classes: Types.ObjectId[];
  routes: TrainRoute[];
  features?: string[];
  amenities?: string[];
  description?: string;
}

export interface TrainUpdateRequest {
  trainName?: string;
  classes?: Types.ObjectId[];
  routes?: Partial<TrainRoute>[];
  features?: string[];
  amenities?: string[];
  description?: string;
  isActive?: boolean;
}

export interface TrainResponse extends Omit<ITrain, '_id'> {
  id: string;
  classes: Array<ITrainClass & {
    availableSeats?: number;
    currentFare?: number;
  }>;
  routes: Array<TrainRoute & {
    route: Route & {
      fromStation: {
        name: string;
        code: string;
      };
      toStation: {
        name: string;
        code: string;
      };
    };
  }>;
  stats?: {
    totalBookings: number;
    averageOccupancy: number;
    revenueGenerated: number;
    onTimePerformance: number;
  };
}

export type TrainListResponse = PaginatedApiResponse<TrainDetails[]>;

export interface TrainSearchParams {
  trainNumber?: string;
  trainName?: string;
  fromStation?: Types.ObjectId;
  toStation?: Types.ObjectId;
  class?: Types.ObjectId;
  date?: string;
  features?: string[];
  minFare?: number;
  maxFare?: number;
  page?: number;
  limit?: number;
}

export interface TrainAvailability {
  date: string;
  classes: Array<{
    class: ITrainClass;
    availableSeats: number;
    fare: number;
    status: 'AVAILABLE' | 'WAITING_LIST' | 'NOT_AVAILABLE';
  }>;
}

export interface TrainScheduleUpdate {
  trainId: Types.ObjectId;
  date: string;
  updates: Array<{
    routeId: Types.ObjectId;
    delay?: number;
    platform?: string;
    status?: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
    reason?: string;
  }>;
}