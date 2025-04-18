export interface BookingDetails {
  scheduleId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  departureStation: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
  arrivalStation: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
  departureTime: string;
  arrivalTime: string;
  class: string;
  baseFare: number;
  taxAndGST: number;
  promoDiscount: number;
  totalPrice: number;
  date: string;
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