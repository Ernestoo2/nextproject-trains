import { Types } from "mongoose";
import { BaseApiResponse, PaginatedApiResponse } from "./api";
import { ScheduleStatus } from "./trains";
import { ITrainClass } from "@/types/shared/trains";
import { ScheduleWithDetails } from "./trains";
 
 
export interface ClassAvailability {
  classId: Types.ObjectId;
  totalSeats: number;
  availableSeats: number;
  currentFare: number;
  waitingList?: number;
  status: 'AVAILABLE' | 'WAITING_LIST' | 'FULL';
}

export interface ScheduleCreateRequest {
  trainId: Types.ObjectId;
  routeId: Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: string;
  classAvailability: Record<string, number>;
  baseFare: Record<string, number>;
  platform?: string;
  specialNotes?: string[];
}

export interface ScheduleUpdateRequest {
  status?: ScheduleStatus;
  delay?: number;
  platform?: string;
  classAvailability?: Record<string, number>;
  currentFare?: Record<string, number>;
  specialNotes?: string[];
}

export interface ScheduleResponse {
  id: string;
  train: {
    id: Types.ObjectId;
    number: string;
    name: string;
  };
  route: {
    id: Types.ObjectId;
    fromStation: {
      code: string;
      name: string;
      city: string;
    };
    toStation: {
      code: string;
      name: string;
      city: string;
    };
    distance: number;
    duration: string;
  };
  departureTime: string;
  arrivalTime: string;
  date: string;
  status: ScheduleStatus;
  delay?: number;
  platform?: string;
  classes: Array<ClassAvailability & {
    details: ITrainClass;
  }>;
  specialNotes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleListResponse = PaginatedApiResponse<ScheduleWithDetails[]>;

export interface ScheduleSearchParams {
  trainId?: Types.ObjectId;
  fromStation?: Types.ObjectId;
  toStation?: Types.ObjectId;
  date?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: ScheduleStatus[];
  classId?: Types.ObjectId;
  minFare?: number;
  maxFare?: number;
  hasAvailability?: boolean;
  page?: number;
  limit?: number;
}

export interface ScheduleAvailabilityResponse extends BaseApiResponse {
  data: {
    schedule: Pick<ScheduleResponse, 'id' | 'train' | 'departureTime' | 'arrivalTime' | 'date' | 'status'>;
    classes: ClassAvailability[];
    pricingFactors?: {
      demandMultiplier?: number;
      seasonalMultiplier?: number;
      specialDiscounts?: Array<{
        type: string;
        value: number;
      }>;
    };
  };
}

export interface ScheduleCalendarResponse extends BaseApiResponse {
  data: Array<{
    date: string;
    schedules: Array<{
      id: Types.ObjectId;
      trainNumber: string;
      departureTime: string;
      lowestFare: number;
      highestFare: number;
      availability: 'HIGH' | 'MEDIUM' | 'LOW' | 'FULL';
    }>;
  }>;
}