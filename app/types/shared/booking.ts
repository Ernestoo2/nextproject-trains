import { PaymentStatus } from "./payments";
import { Schedule, ScheduleStatus, TrainClass, Station } from "./trains";
import { UserProfile } from "./users";

export interface BookingFormData {
  departure: string;
  arrival: string;
  date: string;
  tripType: TripType;
  classType: TrainClassType;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
}

export interface TravelFormState {
  id?: string;
  fromStation: string;
  toStation: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  classType: string;
}

export interface BookingFormState {
  departureStation: string | null;
  arrivalStation: string | null;
  date: string;
  tripType: TripType;
  classType: TrainClassType;
  passengers: Passenger[];
  totalFare?: number | undefined;
  schedule?: Schedule | undefined;
  status?: BookingStatus | undefined;
}

export type BookingStatus =
  | "DRAFT"
  | "INITIATED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface BookingResponse {
  success: boolean;
  data?: {
    bookingId: string;
    pnr: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    schedule: Schedule;
    passengers: Passenger[];
    fare: {
      base: number;
      taxes: number;
      total: number;
      discount?: number;
      promoCode?: string;
    };
  };
  message?: string;
  error?: string;
}

// Stage management
export type BookingStage =
  | "ROUTE_SELECTION"
  | "PASSENGER_DETAILS"
  | "SEAT_SELECTION"
  | "PAYMENT"
  | "CONFIRMATION";

export interface BookingState {
  form: BookingFormState;
  stage: BookingStage;
  isValid: boolean;
  error?: string;
}

export interface BookingInterfaceProps {
  onSubmit: (data: SearchParams) => void;
  isLoading?: boolean;
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

export interface SearchURLParams extends Required<SearchParams> {}

export interface BookingFormState {
  departureStation: string | null;
  arrivalStation: string | null;
  date: string;
  tripType: TripType;
  classType: TrainClassType;
  passengers: Passenger[];
  totalFare?: number;
  schedule?: Schedule;
  status?: BookingStatus;
}

export type TripType = "ONE_WAY" | "RETURN" | "MULTI_CITY" | "ROUND_TRIP";

export type TrainClassType = "ECONOMY" | "BUSINESS" | "FIRST_CLASS";
 

export interface Passenger {
  firstName: string;
  lastName: string;
  age: number;
  type: "ADULT" | "CHILD" | "INFANT";
  nationality: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  identificationType?: "passport" | "nationalId" | "driverLicense";
  identificationNumber?: string;
  seatNumber?: string;
  berthPreference?: "LOWER" | "MIDDLE" | "UPPER";
  seat?: string;
  phone?: string;
}

export interface BookingDetails {
  user: UserProfile;
  schedule: Schedule;
  trainClass: TrainClass;
  passengers: Passenger[];
  totalFare: number;
  status: BookingStatus;
  pnr: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  transactionId?: string;
  promoCode?: string;
  promoDiscount?: number;
  taxes?: number;
  baseFare?: number;
  has20PercentOffer?: boolean;
}

export type BookingAction =
  | { type: "SET_FORM_DATA"; payload: Partial<BookingFormState> }
  | { type: "SET_STAGE"; payload: BookingStage }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET_FORM" }
  | { type: "ADD_PASSENGER"; payload: Passenger }
  | { type: "REMOVE_PASSENGER"; payload: number };
