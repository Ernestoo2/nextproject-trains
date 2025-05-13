 


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
