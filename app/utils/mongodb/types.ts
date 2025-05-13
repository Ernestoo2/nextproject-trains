import { ISchedule } from "@/types/schedule/scheduleBase.types";

import { 
  Station, 
  TrainClass, 
  Route, 
  Train 
} from '@/types/shared/trains';

// Only keep MongoDB specific types or extensions
export type IStation = Station;
export type ITrainClass = TrainClass;
export type IRoute = Route;
export type ITrain = Train;

// Keep only the search result type as it's specific to MongoDB
export interface ITrainSearchResult {
  _id: string;
  trainNumber: string;
  trainName: string;
  departureStation: Pick<Station, '_id' | 'name' | 'code'>;
  arrivalStation: Pick<Station, '_id' | 'name' | 'code'>;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableClasses: Array<TrainClass & { availableSeats: number }>;
  status: ISchedule['status'];
}
