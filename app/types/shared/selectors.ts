import type { Station, TrainClass, TripType, PassengerDetails } from "./trains";

export interface FromToSelectorProps {
  stations: Station[];
  selectedFrom: string | null;
  selectedTo: string | null;
  onFromChange: (stationId: string) => void;
  onToChange: (stationId: string) => void;
  date?: string;
  classType?: string;
}

export interface PassengerClassSelectorProps {
  availableClasses: TrainClass[];
  selectedClass: string;
  passengerCounts: PassengerDetails;
  onClassSelect: (classType: string) => void;
  onPassengerCountChange: (details: Partial<PassengerDetails>) => void;
  maxPassengersPerBooking?: number;
}

export interface TripSelectorProps {
  value: TripType;
  onChange: (value: TripType) => void;
}

export interface DateSelectorProps {
  onDatesChange: (date: string) => void;
  defaultDate?: string;
}
