export interface BookingDetails {
  trainId: string;
  trainNumber: string;
  trainName: string;
  class: string;
  quota: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalAmount: number;
  travelers: {
    name: string;
    age: string;
    gender: string;
    nationality: string;
    berthPreference: string;
  }[];
}

export interface PaystackPopupConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  metadata: {
    booking_details: BookingDetails;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface PaymentContextType {
  bookingDetails: BookingDetails | null;
  setBookingDetails: (details: BookingDetails) => void;
} 