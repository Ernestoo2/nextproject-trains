import { Types, Document } from "mongoose";
import { ScheduleStatus } from "../shared/trains";

// Core Schedule Interface
export interface ISchedule {
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

  delayReason?: string;
  actualDepartureTime?: string;   
  actualArrivalTime?: string;
}

// MongoDB Document Interface
export interface IScheduleDocument extends ISchedule, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Populated Schedule Interface
export interface IPopulatedSchedule extends Omit<ISchedule, "route" | "train"> {
  _id: Types.ObjectId;
  route: {
    _id: Types.ObjectId;
    routeName: string;
    routeCode: string;
    fromStation: {
      isActive: boolean;
      _id: Types.ObjectId;
      name: string;
      code: string;
      city: string | undefined;
      state: string | undefined;
    };
    toStation: {
      isActive: boolean;
      _id: Types.ObjectId;
      name: string;
      code: string;
      city: string | undefined;
      state: string | undefined
    };
    distance: number;
    baseFare: number;
    estimatedDuration: string;
    availableClasses: Array<{
      _id: Types.ObjectId;
      name: string;
      code: string;
      baseFare: number;
    }>;
  } | null;
  train: {
    _id: Types.ObjectId;
    trainName: string;
    trainNumber: string;
  } | null;
  __v: number;
}

