import type { TrainClass } from "../shared/base.types";
import type { TrainClassResponse } from "../shared/api.types";
import { Schedule } from "../shared/database";

export interface TrainClassSelectorProps {
  availableClasses: TrainClassResponse[];
  selectedClass: string;
  onClassSelect: (classType: string) => void;
}

export interface TrainScheduleCardProps {
  schedule: Schedule & {
    duration: string;
    availableClasses: Array<
      TrainClass & {
        availableSeats: number;
      }
    >;
  };
  selectedClass: string;
  date: string;
}

export interface TrainCardProps {
  train: UnifiedTrainDetails;
}

export interface BookingRightProps {
  bookingId: string;
  schedule: Schedule;
}

export interface UnifiedTrainDetails {
  _id: string;
  trainName: string;
  trainNumber: string;
  classes: Array<{
    _id: string;
    name: string;
    code: string;
    baseFare?: number;
  }>;
  routes: Array<{
    station: {
      _id: string;
      name: string;
      code: string;
    };
    arrivalTime: string;
    departureTime: string;
    day: number;
  }>;
  isActive: boolean;
} 