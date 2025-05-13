import mongoose from "mongoose";
import { ITrain, Route, ScheduleStatus, Station, TrainClass } from "@/types/shared/trains";

// Define a more specific type for the populated schedule
export interface PopulatedSchedule {
  _id: mongoose.Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Record<string, number>;
  status: ScheduleStatus;
  platform?: string;
  fare: Record<string, number>;
  duration?: string;
  route:
    | (Omit<Route, "fromStation" | "toStation" | "availableClasses"> & {
        _id: mongoose.Types.ObjectId;
        fromStation: Pick<Station, "_id" | "stationName" | "stationCode">;
        toStation: Pick<Station, "_id" | "stationName" | "stationCode">;
        availableClasses: Pick<
          TrainClass,
          "_id" | "className" | "classCode" | "baseFare"
        >[];
      })
    | null;
  train: Pick<ITrain, "_id" | "trainName" | "trainNumber"> | null;
  __v: number;
}

export type cls = {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  baseFare: number;
};
