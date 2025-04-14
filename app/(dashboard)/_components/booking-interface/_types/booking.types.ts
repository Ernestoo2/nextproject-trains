export interface BookingFormData {
  departure: string;
  arrival: string;
  date: string;
}

export interface BookingInterfaceProps {
  onSubmit?: (data: BookingFormData) => void;
}
