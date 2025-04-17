export interface Station {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface TrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  isActive: boolean;
}

export interface Route {
  id: string;
  fromStation: Station;
  toStation: Station;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: TrainClass[];
}

export interface Trip {
  id: string;
  routeId: string;
  trainId: string;
  departureTime: string;
  date: string;
  arrivalTime: string;
  availableSeats: {
    [className: string]: number;
  };
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  route: {
    id: string;
    fromStation: string;
    toStation: string;
    distance: number;
    baseFare: number;
    estimatedDuration: string;
    availableClasses: string;
  } | undefined;
  train: {
    id: string;
    trainName: string;
    trainNumber: string;
} | undefined
}

export interface PassengerDetails {
  classType: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

export interface RouteSearchParams {
  fromStationId: string;
  toStationId: string;
  date: string;
  passengers: number;
  classType?: string;
}

export interface PricingDetails {
  baseFare: number;
  tax: number;
  total: number;
}

export interface RouteSearchResponse {
  availableRoutes: Route[];
  pricing: {
    routeId: string;
    classPricing: {
      [className: string]: PricingDetails;
    };
  }[];
}

export interface RouteState {
  selectedRoute: Route | null;
  selectedTrip: Trip | null;
  passengerDetails: PassengerDetails;
  bookingStage: 'ROUTE_SELECTION' | 'PASSENGER_DETAILS' | 'SEAT_SELECTION' | 'PAYMENT';
} 