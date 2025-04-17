import { Document } from "mongoose";

export interface IStation {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface ITrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoute {
  _id: string;
  fromStation: IStation;
  toStation: IStation;
  distance: number;
  estimatedDuration: string;
  isActive: boolean;
}

export interface ITrainRoute {
  station: IStation;
  arrivalTime: string;
  departureTime: string;
  day: number;
}

export interface ITrain {
  _id: string;
  trainName: string;
  trainNumber: string;
  isActive: boolean;
}

export interface ISchedule {
  _id: string;
  train: ITrain;
  route: IRoute;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
  availableSeats: {
    FC: number;
    BC: number;
    SC: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Search result types (for train search, different from dashboard)
export interface ITrainSearchResult {
  _id: string;
  trainNumber: string;
  trainName: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableClasses: string[];
  baseFare: number;
}
