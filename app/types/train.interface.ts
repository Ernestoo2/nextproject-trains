import { Types } from "mongoose";
import { RouteDocument, StationDocument, TrainClassDocument } from "./route.types";
import {  PaginatedApiResponse } from "./shared/api";
import { ITrain , ITrainRoute } from "@/types/shared/trains";


//app/types/train.interface.ts

export interface TrainCreateRequest {
  trainName: string;
  trainNumber: string;
  classes: Types.ObjectId[];
  routes: ITrainRoute[];
}

export interface TrainUpdateRequest {
  trainName?: string;
  classes?: Types.ObjectId[];
  routes?: ITrainRoute[];
  isActive?: boolean;
}

export interface TrainWithDetails extends Omit<ITrain, 'classes' | 'routes'> {
  classes: Array<TrainClassDocument>;
  routes: Array<
    ITrainRoute & {
      route: RouteDocument & {
        fromStation: StationDocument;
        toStation: StationDocument;
      };
    }
  >;
}

export interface TrainSearchParams {
  trainNumber?: string;
  trainName?: string;
  classId?: Types.ObjectId;
  routeId?: Types.ObjectId;
  fromStationId?: Types.ObjectId;
  toStationId?: Types.ObjectId;
  page?: number;
  limit?: number;
}

export type TrainListResponse = PaginatedApiResponse<TrainWithDetails[]>;

// Additional train types
export interface TrainClassAvailability {
  classId: Types.ObjectId;
  totalSeats: number;
  availableSeats: number;
  currentFare: number;
  waitingList?: number;
  status: "AVAILABLE" | "WAITING_LIST" | "FULL";
}

export interface TrainStats {
  totalBookings: number;
  averageOccupancy: number;
  revenueGenerated: number;
  onTimePerformance: number;
}

export interface TrainResponse extends Omit<ITrain, 'classes'> {
  classes: Array<
    TrainClassDocument & {
      availableSeats?: number;
      currentFare?: number;
    }
  >;
  routes: Array<
    ITrainRoute & {
      route: RouteDocument & {
        fromStation: {
          name: string;
          code: string;
        };
        toStation: {
          name: string;
          code: string;
        };
      };
    }
  >;
  stats?: TrainStats;
}
