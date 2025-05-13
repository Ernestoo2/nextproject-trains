import { Types } from "mongoose";
import { TrainClass } from "@/types/shared";
import { PaginatedApiResponse } from "@/types/shared/apiResponse";
import { ClassAvailability } from "@/types/shared/scheduleApi";

 
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
  status: string;
  delay?: number;
  platform?: string;
  classes: Array<ClassAvailability & {
    details: TrainClass;
  }>;
  specialNotes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleListResponse extends PaginatedApiResponse<ScheduleResponse[]> {}