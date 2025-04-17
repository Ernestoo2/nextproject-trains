import { IRoute, IStation } from "@/utils/mongodb/types";
import { ITrain, ITrainClass } from "@/api/types/types";
import { Schedule, ISchedule } from "@/utils/mongodb/models/Schedule";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation

// Define a more specific type for the populated schedule
export interface PopulatedSchedule extends Omit<ISchedule, 'route' | 'train'> {
    _id: mongoose.Types.ObjectId;
    
    route: (Omit<IRoute, 'fromStation' | 'toStation' | 'availableClasses'> & {
      _id: mongoose.Types.ObjectId;
      fromStation: Pick<IStation, '_id' | 'name' | 'code'>;
      toStation: Pick<IStation, '_id' | 'name' | 'code'>;
      availableClasses: Pick<ITrainClass, '_id' | 'name' | 'code' | 'baseFare'>[];
    }) | null;
    train: (Pick<ITrain, '_id' | 'trainName' | 'trainNumber'>) | null;
    __v: number; // Change from optional (__v?: number) to required (__v: number)
  }

  export type cls = {
    _id: mongoose.Types.ObjectId;
    name: string;
    code: string;
    baseFare: number;
  }

