import { Types } from "mongoose";

import { Document } from "mongoose";
import {
  ScheduleStatus,
  Schedule as SharedSchedule,
  Route as SharedRoute,
  ITrain,
  ScheduleWithDetails,
} from "@/types/shared/trains";

// Base schedule interface extending shared schedule
export interface ISchedule extends Omit<SharedSchedule, "train" | "route"> {
  train: Types.ObjectId;
  route: Types.ObjectId;
  availableSeats: Map<string, number>;
  fare: Map<string, number>;
  isActive: boolean;
  date: string;
}

// Document interface for MongoDB
export interface ScheduleDocument extends Omit<ISchedule, "_id">, Document {
  _id: Types.ObjectId;
}

// API Response types
export interface ScheduleSearchResponse {
  success: boolean;
  data?: ScheduleWithDetails[];
  message?: string;
  error?: string;
}

export interface DailySchedulesResponse {
  success: boolean;
  data?: ScheduleWithDetails[];
  message?: string;
  error?: string;
}

// Request types
export interface ScheduleCreateRequest {
  trainId: Types.ObjectId;
  routeId: Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: string;
  availableSeats: Record<string, number>;
  status: ScheduleStatus;
  platform?: string;
  fare: Record<string, number>;
  duration?: string;
}

export interface ScheduleSearchParams {
  trainId?: Types.ObjectId;
  routeId?: Types.ObjectId;
  fromStationId?: Types.ObjectId;
  toStationId?: Types.ObjectId;
  date?: string;
  status?: ScheduleStatus;
  page?: number;
  limit?: number;
}

// Populated schedule type
export interface PopulatedSchedule
  extends Omit<ISchedule, "route" | "train" | "_id"> {
  _id: Types.ObjectId;
  route:
    | (Omit<SharedRoute, "fromStation" | "toStation" | "availableClasses"> & {
        _id: Types.ObjectId;
        fromStation: {
          _id: Types.ObjectId;
          name: string;
          code: string;
        };
        toStation: {
          _id: Types.ObjectId;
          name: string;
          code: string;
        };
        availableClasses: Array<{
          _id: Types.ObjectId;
          name: string;
          code: string;
          baseFare: number;
        }>;
      })
    | null;
  train: Pick<ITrain, "_id" | "trainName" | "trainNumber"> | null;
  __v: number;
}
