import { TRIP_TYPES } from "@/(dashboard)/trains/train-search/_constants/train.constants";
import { Station } from "./station.types";

export interface BookingFormData {
  departure: string;
  arrival: string;
  date: string;
}

export interface BookingInterfaceProps {
  onSubmit?: (data: BookingFormData) => void;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  tripType: keyof typeof TRIP_TYPES;
  class?: string;
}

export interface BookingFormState {
  departureStation: Station | null;
  arrivalStation: Station | null;
  date: string;
  tripType: keyof typeof TRIP_TYPES;
}

export interface SearchURLParams {
  from?: string;
  to?: string;
  date?: string;
  tripType?: string;
  class?: string;
}
