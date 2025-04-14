// Auth Types
export interface AuthFormData {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token?: string;
  message: string;
  success: boolean;
}

// Common types used across the application
export type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

export type Theme = {
  primary: string;
  secondary: string;
  background: string;
};

// Utility types
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

// Api Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message: string;
}

// Utility type for passenger count
export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
  total: number;
}

// Props types for components
export interface SelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Travel Route Types
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

// Train Details Types
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
}

export interface TrainCardProps {
  train: TrainDetails;
}

// Route Component Types
export interface RouteComponentProps {
  route: TravelRoute;
  onUpdate: (updatedRoute: Partial<TravelRoute>) => void;
}

// Constants for type safety
export const TripTypes = {
  ONE_WAY: "One-way",
  RETURN: "Return",
  MULTI_CITY: "Multi-city",
  ROUND_TRIP: "Round-trip",
} as const;

export interface ClassTypes {
  [key: string]: number;
  Economy: number;
  Business: number;
  FirstClass: number;
  Total: number;
}

export const ClassTypess = {
  ECONOMY: "Economy",
  BUSINESS: "Business",
  FIRST: "First Class",
  TOTAL: "Total",
} as const;

// Form state type
export interface TravelFormState extends Omit<TravelRoute, "id"> {
  passengerCount: PassengerCount;
}

// Initial/mock data
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

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  image?: string;
  role: "user" | "admin";
}

// Ticket Types
export interface Ticket {
  id: string;
  trainNumber: string;
  departure: string;
  arrival: string;
  time: string;
  date: string;
  gate?: string;
  seat?: string;
  status: "confirmed" | "pending" | "cancelled";
  trainDetails?: TrainDetails;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isSelected: boolean;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
  ticketId?: string;
}
