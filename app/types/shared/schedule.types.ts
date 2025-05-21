import { Types } from "mongoose";
import type { Station, TrainClass, ScheduleStatus } from "./trains";
import type { MongoDocument } from "./database";

// Base Schedule Interface
export interface ISchedule extends MongoDocument {
  train: Types.ObjectId;
  route: Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Map<string, number>;
  status: ScheduleStatus;
  platform?: string;
  fare: Map<string, number>;
  duration?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend Schedule Interface with Details
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
  delay?: number;
  specialNotes?: string[];
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

// Schedule Time Helper Types
export interface ScheduleTime {
  hours: number;
  minutes: number;
}

// Class Availability Types
export interface ClassAvailability {
  classId: Types.ObjectId;
  totalSeats: number;
  availableSeats: number;
  currentFare: number;
  waitingList?: number;
  status: "AVAILABLE" | "WAITING_LIST" | "FULL";
}

// Schedule Response with Class Details
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
  classes: Array<
    ClassAvailability & {
      details: TrainClass;
    }
  >;
  specialNotes?: string[];
  createdAt: Date;
  updatedAt: Date;
}
