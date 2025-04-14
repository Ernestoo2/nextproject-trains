import { Document } from "mongoose";

export interface IStation extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

export interface ITrainClass extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

export interface ITrainRoute {
  station: IStation;
  arrivalTime: string;
  departureTime: string;
  day: number;
}

export interface ITrain extends Document {
  trainName: string;
  trainNumber: string;
  routes: ITrainRoute[];
  classes: ITrainClass[];
  isActive: boolean;
}
