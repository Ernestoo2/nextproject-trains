export interface TrainDetails {
  id: number;
  trainName: string;
  runsOn: string;
  startDate: string;
  endDate: string;
  departureTime: string;
  arrivalTime: string;
  departureStation: string;
  arrivalStation: string;
  duration: string;
  baseFare?: number;
  tatkalCharges?: number;
  gst?: number;
}

export interface TravelRoute {
  id: number;
  source: string;
  destination: string;
  date: string;
}

export const initialTravelData: TravelRoute[] = [
  {
    id: 1,
    source: "Port Harcourt",
    destination: "Enugu",
    date: "2024-04-08",
  },
];


export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ITrainRoute {
  station: {
    _id: string;
    name: string;
    code: string;
  };
  arrivalTime: string;
  departureTime: string;
  day: number;
}

export interface ITrainClass {
  _id: string;
  name: string;
  code: string;
}

export interface ITrain {
  _id: string;
  trainName: string;
  trainNumber: string;
  routes: ITrainRoute[];
  classes: ITrainClass[];
  isActive: boolean;
}