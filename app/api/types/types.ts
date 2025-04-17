export interface Station {
  name: string;
  code: string;
}

export interface Route {
  station: Station;
  arrivalTime: string;
  departureTime: string;
}

export interface TrainDetails {
  _id?: string;
  trainNumber: string;
  trainName: string;
  routes?: {
    station: {
      name: string;
    };
    departureTime: string;
    arrivalTime: string;
  }[];
  class: string;
  quota: string;
  departureStation?: string;
  arrivalStation?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  baseFare?: number;
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
  baseFare: string;
}

export interface ITrain {
  _id: string;
  trainName: string;
  trainNumber: string;
  routes: ITrainRoute[];
  classes: ITrainClass[];
  isActive: boolean;
}