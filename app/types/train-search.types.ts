import {
  TrainClassType,
  ScheduleWithDetails,
  PassengerDetails,
} from "./shared/trains";

// Component Props Types
export interface StationRouteCardProps {
  schedule: ScheduleWithDetails;
}

export interface PassengerClassSelectorProps {
  availableClasses: ClassDetails[];
  selectedClass: TrainClassType;
  passengerCounts: PassengerDetails;
  onClassSelect: (classCode: TrainClassType) => void;
  onPassengerCountChange: (details: Partial<PassengerDetails>) => void;
}

// Data Types
export interface ClassDetails {
  _id?: string;
  name: string;
  code: TrainClassType;
  baseFare: number;
  availableSeats: number;
  fare: number;
  capacity?: number;
  description?: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discount: number;
  maxDiscount?: number;
  type: "PERCENTAGE" | "FIXED";
}

// Search Types
export interface TrainSearchFilters {
  fromStation?: string;
  toStation?: string;
  date?: string;
  classType?: TrainClassType;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
}

export interface TrainSearchResults {
  schedules: ScheduleWithDetails[];
  totalResults: number;
  page: number;
  limit: number;
}

// Context Types
export interface TrainSearchState {
  filters: TrainSearchFilters;
  results: TrainSearchResults | null;
  loading: boolean;
  error: string | null;
}

export interface TrainSearchContextType {
  state: TrainSearchState;
  updateFilters: (filters: Partial<TrainSearchFilters>) => void;
  searchTrains: () => Promise<void>;
  resetSearch: () => void;
}
