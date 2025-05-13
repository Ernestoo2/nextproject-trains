import type { MongoDocument } from "./database";

// Base Types
export type TripType = "ONE_WAY" | "ROUND_TRIP";
export type ScheduleStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DELAYED";
export type TrainClassType = "ECONOMY" | "BUSINESS" | "FIRST_CLASS" | "SLEEPER" | "STANDARD";

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
  SLEEPER: "SLEEPER",
  STANDARD: "STANDARD",
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
  createdAt: string;
  updatedAt: string;
}

export interface ValidStation extends Station {
  _id: string;
  id?: string;
}

export interface TrainClass {
  className: string;
  classCode: string;
  classType: TrainClassType;
  basePrice: number;
  capacity?: number;
  amenities?: string[];
  description?: string;
  isActive: boolean;
}

export interface TrainClassDocument extends MongoDocument {
  className: string;
  classCode: string;
  classType: TrainClassType;
  basePrice: number;
  capacity?: number;
  amenities?: string[];
  description?: string;
  isActive: boolean;
} 