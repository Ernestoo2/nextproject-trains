import { Types } from "mongoose";
import { ScheduleStatus } from "../shared/trains";
import { Station, TrainClass } from "../shared/trains";

// API Request Types
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

export interface ScheduleUpdateRequest {
  status?: ScheduleStatus;
  platform?: string;
  availableSeats?: Record<string, number>;
  fare?: Record<string, number>;
}

export interface ScheduleSearchParams {
  fromStationId?: string;
  toStationId?: string;
  date?: string;
  returnDate?: string;
  classType?: string;
  trainId?: Types.ObjectId;
  status?: ScheduleStatus[];
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  page?: number;
  limit?: number;
}

// API Response Types
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
  availableClasses: TrainClass[];
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