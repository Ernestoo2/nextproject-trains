import { Route } from "@/types/route.types";
import type { Station } from "@/utils/mongodb/models/Station"; 
import type { Train } from "@/utils/mongodb/models/Train";

export interface TrainDetails {
  _id: string;
  trainName: string;
  trainNumber: string;
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
  classes: Array<{
    _id: string;
    name: string;
    code: string;
  }>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TrainCardProps {
  train: TrainDetails;
}

export interface TrainSearchFormData {
  departure: string;
  arrival: string;
  date: string;
}

export interface TravelRoute {
  id: number;
  from: string;
  to: string;
  trip: string;
  Depart: string;
  Return: string;
  passenger: string;
  Class: string;
}

export interface RouteComponentProps {
  route: TravelRoute;
  onUpdate: (updatedRoute: Partial<TravelRoute>) => void;
}

export const initialTravelData: TravelRoute[] = [
  {
    id: 1,
    from: "Lahore",
    to: "Karachi",
    trip: "Return",
    Depart: "07 Nov 22",
    Return: "13 Nov 22",
    passenger: "1 Passenger",
    Class: "Economy",
  },
  {
    id: 2,
    from: "Islamabad",
    to: "Peshawar",
    trip: "One-way",
    Depart: "15 Dec 22",
    Return: "20 Dec 22",
    passenger: "2 Passengers",
    Class: "Business",
  },
  {
    id: 3,
    from: "Isman",
    to: "Ihie",
    trip: "One-way",
    Depart: "17 Aug 24",
    Return: "30 Dec 24",
    passenger: "2 Passengers",
    Class: "Business",
  },
  {
    id: 4,
    from: "Festac",
    to: "Patapa",
    trip: "One-way",
    Depart: "7 March 22",
    Return: "4 Nov 24",
    passenger: "2 Passengers",
    Class: "Business",
  },
];

export interface TrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  availableSeats: number;
}

export interface StationInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export interface SearchParams {
  fromStationId?: string;
  toStationId?: string;
  date?: string;
  classType?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
}

export interface StationRouteCardProps {
  id: string;
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  status: string;
  platform?: string;
  availableSeats: {
    [key: string]: number;
  };
  fare?: {
    [key: string]: number;
  };
}

export interface SearchResponse {
  success: boolean;
  data?: ScheduleWithDetails[];
  error?: string;
}

export interface Schedule {
  _id: string;
  train: Train;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  platform?: string;
  status: ScheduleStatus;
  availableClasses: TrainClass[];
}

export type ScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// This is the type that includes flattened train details
export interface ScheduleWithDetails extends Omit<Schedule, 'train'> {
  trainNumber: string;
  trainName: string;
  trainId: string;
}

export interface BookingDetails {
  scheduleId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string;
  arrivalTime: string;
  class: string;
  baseFare: number;
  taxAndGST: number;
  promoDiscount: number;
  totalPrice: number;
  date: string;
}

export interface PromoCode {
  code: string;
  discount: number;
  maxDiscount?: number;
  type: 'PERCENTAGE' | 'FIXED';
}

export interface Station {
  _id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export interface Train {
  _id: string;
  name: string;
  number: string;
  trainName: string;
  trainNumber: string;
  routes: Array<{
    route: Route;
    arrivalTime: string;
    departureTime: string;
  }>;
  classes: Array<{
    _id: string;
    name: string;
    code: string;
  }>;
  isActive: boolean;
}
